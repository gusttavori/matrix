const express = require('express');
const { successResponse } = require('../utils/apiResponse');
const prisma = require('../utils/prisma');
const { AppError } = require('../utils/AppError');
const { verifyTeacherLink } = require('../services/teacherService');
const { getAcademicSettings, calculateAverage, calculateRecovery, calculateAttendance } = require('../utils/academicService');
const jwt = require('jsonwebtoken');

const router = express.Router();

// Extrator seguro de JWT
const getAuthData = (req) => {
  let userId = req.user?.userId || req.user?.id || req.userId;
  let institutionId = req.institutionId || req.user?.institutionId;
  
  if (!userId && req.headers.authorization) {
    const token = req.headers.authorization.split(' ')[1];
    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        userId = decoded.userId || decoded.id;
        institutionId = decoded.institutionId || institutionId;
      } catch (e) {}
    }
  }
  return { 
    userId: parseInt(userId, 10), 
    institutionId: parseInt(institutionId, 10) 
  };
};

// GET: Relatório Individual do Aluno
router.get('/student/:studentId/class/:classId/subject/:subjectId', async (req, res, next) => {
  try {
    const { userId, institutionId } = getAuthData(req);
    if (!userId || isNaN(userId)) throw new AppError('Usuário inválido', 401);

    const { studentId, classId, subjectId } = req.params;
    const { periodId } = req.query;

    const teacher = await prisma.teacher.findFirst({ where: { userId, institutionId } });
    if (!teacher) throw new AppError('Acesso restrito a professores', 403);

    await verifyTeacherLink(institutionId, teacher.id, parseInt(classId, 10), parseInt(subjectId, 10));

    const student = await prisma.student.findUnique({
      where: { id: parseInt(studentId, 10), institutionId }
    });
    if (!student) throw new AppError('Aluno não encontrado', 404);

    let periodFilter = {};
    if (periodId) {
      periodFilter.periodId = parseInt(periodId, 10);
    }

    const grades = await prisma.grade.findMany({
      where: {
        institutionId,
        studentId: parseInt(studentId, 10),
        assessment: {
          classId: parseInt(classId, 10),
          subjectId: parseInt(subjectId, 10),
          ...periodFilter
        }
      },
      include: {
        assessment: {
          include: { period: true }
        }
      }
    });

    const attendances = await prisma.attendance.findMany({
      where: {
        institutionId,
        studentId: parseInt(studentId, 10),
        classId: parseInt(classId, 10),
        subjectId: parseInt(subjectId, 10),
        lesson: periodFilter
      },
      include: {
        lesson: {
          include: { period: true }
        }
      }
    });

    // Calculate metrics
    const settings = await getAcademicSettings(institutionId, student.class?.schoolYear || new Date().getFullYear());
    
    let totalScore = 0;
    let maxPossibleScore = 0;
    
    grades.forEach(g => {
      if (g.status === 'GRADED' && g.value !== null) {
        const finalGrade = calculateRecovery(parseFloat(g.value), g.recoveryGrade ? parseFloat(g.recoveryGrade) : null);
        totalScore += finalGrade;
        maxPossibleScore += parseFloat(g.assessment.maxGrade);
      }
    });

    const average = calculateAverage(totalScore, maxPossibleScore);
    
    const presentClasses = attendances.filter(a => a.status === 'PRESENT' || a.status === 'JUSTIFIED').length;
    const attendancePerc = calculateAttendance(presentClasses, attendances.length);

    return successResponse(res, {
      student,
      metrics: {
        totalScore,
        maxPossibleScore,
        average,
        presentClasses,
        totalClasses: attendances.length,
        attendancePerc,
        status: average >= settings.minAverage && attendancePerc >= settings.minAttendance ? 'APROVADO' : 'EM RECUPERAÇÃO/REPROVADO'
      },
      grades,
      attendances
    });
  } catch (error) { next(error); }
});

// GET: Status de pendências para fechar o bimestre
router.get('/closing-status/:classId/:subjectId/:periodId', async (req, res, next) => {
  try {
    const { userId, institutionId } = getAuthData(req);
    if (!userId || isNaN(userId)) throw new AppError('Usuário inválido', 401);

    const { classId, subjectId, periodId } = req.params;

    const teacher = await prisma.teacher.findFirst({ where: { userId, institutionId } });
    if (!teacher) throw new AppError('Acesso restrito a professores', 403);

    await verifyTeacherLink(institutionId, teacher.id, parseInt(classId, 10), parseInt(subjectId, 10));

    const period = await prisma.academicPeriod.findFirst({
      where: { id: parseInt(periodId, 10), institutionId }
    });
    if (!period) throw new AppError('Período não encontrado', 404);

    const students = await prisma.student.findMany({
      where: { classId: parseInt(classId, 10), institutionId, status: 'ACTIVE' }
    });

    const lessons = await prisma.lesson.findMany({
      where: { classId: parseInt(classId, 10), subjectId: parseInt(subjectId, 10), periodId: parseInt(periodId, 10) },
      include: { attendances: true }
    });

    const assessments = await prisma.assessment.findMany({
      where: { classId: parseInt(classId, 10), subjectId: parseInt(subjectId, 10), periodId: parseInt(periodId, 10) },
      include: { grades: true }
    });

    const pendencies = [];

    // Check Lessons
    if (lessons.length === 0) {
      pendencies.push({ type: 'LESSON', message: 'Nenhuma aula registrada neste bimestre.' });
    } else {
      lessons.forEach(lesson => {
        if (!lesson.title) {
          pendencies.push({ type: 'LESSON', message: `Aula do dia ${new Date(lesson.date).toLocaleDateString('pt-BR')} não tem conteúdo registrado.` });
        }
        if (lesson.attendances.length === 0) {
          pendencies.push({ type: 'ATTENDANCE', message: `Chamada não realizada para a aula do dia ${new Date(lesson.date).toLocaleDateString('pt-BR')}.` });
        } else if (lesson.attendances.length < students.length) {
          pendencies.push({ type: 'ATTENDANCE', message: `Chamada incompleta para a aula do dia ${new Date(lesson.date).toLocaleDateString('pt-BR')} (faltam alunos).` });
        }
      });
    }

    // Check Assessments
    if (assessments.length === 0) {
      pendencies.push({ type: 'ASSESSMENT', message: 'Nenhuma avaliação cadastrada neste bimestre.' });
    } else {
      assessments.forEach(assessment => {
        if (assessment.grades.length === 0) {
          pendencies.push({ type: 'GRADE', message: `Nenhuma nota lançada para a avaliação: ${assessment.name}.` });
        } else {
          const gradedStudentIds = assessment.grades.map(g => g.studentId);
          const missingStudents = students.filter(s => !gradedStudentIds.includes(s.id));
          if (missingStudents.length > 0) {
            pendencies.push({ type: 'GRADE', message: `Faltam notas para ${missingStudents.length} aluno(s) na avaliação: ${assessment.name}.` });
          }
        }
      });
    }

    const settings = await getAcademicSettings(institutionId, period.schoolYear);
    const totalPoints = assessments.reduce((acc, curr) => acc + parseFloat(curr.maxGrade), 0);
    
    if (totalPoints !== parseFloat(settings.pointsPerPeriod)) {
      pendencies.push({ type: 'WARNING', message: `A soma das notas (${totalPoints} pts) é diferente do configurado para o bimestre (${settings.pointsPerPeriod} pts).` });
    }

    return successResponse(res, {
      period,
      isReady: pendencies.filter(p => p.type !== 'WARNING').length === 0,
      pendencies,
      stats: {
        totalStudents: students.length,
        totalLessons: lessons.length,
        totalAssessments: assessments.length,
        totalPoints
      }
    });
  } catch (error) { next(error); }
});

module.exports = router;
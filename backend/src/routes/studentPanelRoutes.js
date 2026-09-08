const express = require('express');
const { successResponse } = require('../utils/apiResponse');
const prisma = require('../utils/prisma');
const { AppError } = require('../utils/AppError');
const { authMiddleware } = require('../middlewares/authMiddleware');
const { requireRole } = require('../middlewares/requireRole');
const { tenantMiddleware } = require('../middlewares/tenantMiddleware');
const jwt = require('jsonwebtoken');

const router = express.Router();

router.use(authMiddleware);
router.use(tenantMiddleware);
router.use(requireRole('STUDENT'));

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

const getStudent = async (userId, institutionId) => {
  const student = await prisma.student.findFirst({
    where: { userId, institutionId },
    include: { class: true }
  });
  if (!student) throw new AppError('Aluno não encontrado', 404);
  return student;
};

router.get('/dashboard', async (req, res, next) => {
  try {
    const { userId, institutionId } = getAuthData(req);
    if (!userId || isNaN(userId)) throw new AppError('Sessão inválida. Faça login novamente.', 401);

    const student = await getStudent(userId, institutionId);
    
    const absences = await prisma.attendance.count({
      where: { studentId: student.id, status: 'ABSENT' }
    });

    return successResponse(res, {
      student,
      absencesTotal: absences
    });
  } catch (error) { next(error); }
});

router.get('/report-card', async (req, res, next) => {
  try {
    const { userId, institutionId } = getAuthData(req);
    if (!userId || isNaN(userId)) throw new AppError('Sessão inválida. Faça login novamente.', 401);

    const student = await getStudent(userId, institutionId);

    const subjectsLinks = await prisma.teacherClassSubject.findMany({
      where: { classId: student.classId },
      include: { subject: true }
    });

    const reportCard = [];

    for (let link of subjectsLinks) {
      const subject = link.subject;
      
      const assessments = await prisma.assessment.findMany({
        where: { classId: student.classId, subjectId: subject.id },
        include: {
          period: true,
          grades: {
            where: { studentId: student.id }
          }
        }
      });

      const gradesMap = {};
      
      assessments.forEach(ass => {
        const grade = ass.grades[0];
        const periodName = ass.period?.name || '1º Bimestre';
        
        if (grade && grade.value !== null) {
          if (!gradesMap[periodName]) gradesMap[periodName] = 0;
          gradesMap[periodName] += parseFloat(grade.value);
        }
      });

      const totalClasses = await prisma.attendance.count({
        where: { classId: student.classId, subjectId: subject.id }
      });
      
      const totalAbsences = await prisma.attendance.count({
        where: { classId: student.classId, subjectId: subject.id, studentId: student.id, status: 'ABSENT' }
      });

      reportCard.push({
        subject: subject.name,
        grades: gradesMap,
        totalClasses,
        totalAbsences,
        attendancePercentage: totalClasses > 0 ? Math.round(((totalClasses - totalAbsences) / totalClasses) * 100) : 100
      });
    }

    return successResponse(res, reportCard);
  } catch (error) { next(error); }
});

router.get('/grades', async (req, res, next) => {
  try {
    const { userId, institutionId } = getAuthData(req);
    if (!userId || isNaN(userId)) throw new AppError('Sessão inválida', 401);
    const student = await getStudent(userId, institutionId);

    const grades = await prisma.grade.findMany({
      where: { studentId: student.id, institutionId },
      include: {
        assessment: {
          include: { 
            subject: true, 
            period: true 
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return successResponse(res, grades);
  } catch (error) { next(error); }
});

// NOVO: Histórico completo de frequência
router.get('/attendance', async (req, res, next) => {
  try {
    const { userId, institutionId } = getAuthData(req);
    if (!userId || isNaN(userId)) throw new AppError('Sessão inválida', 401);
    const student = await getStudent(userId, institutionId);

    const attendances = await prisma.attendance.findMany({
      where: { studentId: student.id, institutionId },
      include: {
        lesson: { include: { subject: true, teacher: true } }
      },
      orderBy: { lesson: { date: 'desc' } }
    });

    return successResponse(res, attendances);
  } catch (error) { next(error); }
});

// NOVO: Disciplinas e Professores da Turma
router.get('/subjects', async (req, res, next) => {
  try {
    const { userId, institutionId } = getAuthData(req);
    if (!userId || isNaN(userId)) throw new AppError('Sessão inválida', 401);
    const student = await getStudent(userId, institutionId);

    const links = await prisma.teacherClassSubject.findMany({
      where: { classId: student.classId, institutionId },
      include: {
        subject: true,
        teacher: true
      }
    });

    return successResponse(res, links);
  } catch (error) { next(error); }
});

module.exports = router;
const express = require('express');
const { successResponse } = require('../utils/apiResponse');
const prisma = require('../utils/prisma');
const { AppError } = require('../utils/AppError');
const { verifyTeacherLink } = require('../services/teacherService');
const { checkPeriodClosed } = require('../utils/academicService');
const jwt = require('jsonwebtoken');

const router = express.Router();

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

// Get assessments for a class/subject
router.get('/class/:classId/subject/:subjectId', async (req, res, next) => {
  try {
    const { userId, institutionId } = getAuthData(req);
    if (!userId || isNaN(userId)) throw new AppError('Usuário inválido', 401);

    const { classId, subjectId } = req.params;
    const { periodId } = req.query;

    const teacher = await prisma.teacher.findFirst({ where: { userId, institutionId } });
    if (!teacher) throw new AppError('Acesso restrito a professores', 403);

    await verifyTeacherLink(institutionId, teacher.id, parseInt(classId, 10), parseInt(subjectId, 10));

    const assessments = await prisma.assessment.findMany({
      where: { 
        institutionId, 
        classId: parseInt(classId, 10), 
        subjectId: parseInt(subjectId, 10),
        periodId: periodId ? parseInt(periodId, 10) : undefined
      },
      include: {
        grades: true,
        period: true
      },
      orderBy: { date: 'desc' }
    });

    return successResponse(res, assessments);
  } catch (error) { next(error); }
});

// Create assessment
router.post('/assessment', async (req, res, next) => {
  try {
    const { userId, institutionId } = getAuthData(req);
    if (!userId || isNaN(userId)) throw new AppError('Usuário inválido', 401);

    const { classId, subjectId, name, date, maxGrade, periodId, isRecovery } = req.body;

    const teacher = await prisma.teacher.findFirst({ where: { userId, institutionId } });
    if (!teacher) throw new AppError('Acesso restrito a professores', 403);

    await verifyTeacherLink(institutionId, teacher.id, parseInt(classId, 10), parseInt(subjectId, 10));
    await checkPeriodClosed(parseInt(periodId, 10), institutionId);

    const assessment = await prisma.assessment.create({
      data: {
        institutionId,
        teacherId: teacher.id,
        classId: parseInt(classId, 10),
        subjectId: parseInt(subjectId, 10),
        periodId: parseInt(periodId, 10),
        name,
        date: new Date(date),
        maxGrade: maxGrade ? parseFloat(maxGrade) : 10,
        isRecovery: isRecovery || false
      }
    });

    return successResponse(res, assessment, 'Avaliação criada com sucesso', 201);
  } catch (error) { next(error); }
});

// Update/Save Grades for an assessment
router.post('/grades', async (req, res, next) => {
  try {
    const { userId, institutionId } = getAuthData(req);
    if (!userId || isNaN(userId)) throw new AppError('Usuário inválido', 401);

    const { assessmentId, grades } = req.body;

    const teacher = await prisma.teacher.findFirst({ where: { userId, institutionId } });
    if (!teacher) throw new AppError('Acesso restrito a professores', 403);

    const assessment = await prisma.assessment.findFirst({
      where: { id: parseInt(assessmentId, 10), institutionId }
    });
    
    if (!assessment) throw new AppError('Avaliação não encontrada', 404);

    await verifyTeacherLink(institutionId, teacher.id, assessment.classId, assessment.subjectId);
    await checkPeriodClosed(assessment.periodId, institutionId);

    const result = await prisma.$transaction(async (tx) => {
      await tx.grade.deleteMany({
        where: { assessmentId: parseInt(assessmentId, 10) }
      });

      const toInsert = grades.map(g => ({
        institutionId,
        studentId: parseInt(g.studentId, 10),
        assessmentId: parseInt(assessmentId, 10),
        teacherId: teacher.id,
        value: parseFloat(g.value),
        recoveryGrade: g.recoveryGrade ? parseFloat(g.recoveryGrade) : null,
        status: g.status || 'GRADED'
      }));

      if (toInsert.length > 0) {
        await tx.grade.createMany({ data: toInsert });
      }

      return toInsert.length;
    });

    return successResponse(res, { records: result }, 'Notas salvas com sucesso');
  } catch (error) { next(error); }
});

module.exports = router;
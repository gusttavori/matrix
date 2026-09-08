const express = require('express');
const { successResponse } = require('../utils/apiResponse');
const prisma = require('../utils/prisma');
const jwt = require('jsonwebtoken');

const router = express.Router();

// Extrator seguro de IDs blindado contra falhas do middleware
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

// 1. Dashboard: Turmas do Professor
router.get('/classes', async (req, res, next) => {
  try {
    const { userId, institutionId } = getAuthData(req);
    if (!userId || isNaN(userId)) return successResponse(res, []);

    const teacher = await prisma.teacher.findFirst({ where: { userId, institutionId } });
    if (!teacher) return successResponse(res, []);

    const classes = await prisma.teacherClassSubject.findMany({
      where: { teacherId: teacher.id, institutionId },
      include: { class: true, subject: true }
    });
    return successResponse(res, classes);
  } catch (error) { next(error); }
});

// 2. Caderneta: Lista de Alunos
router.get('/class/:classId/students', async (req, res, next) => {
  try {
    const { institutionId } = getAuthData(req);
    const students = await prisma.student.findMany({
      where: { 
        classId: parseInt(req.params.classId, 10),
        institutionId,
        status: 'ACTIVE' 
      },
      orderBy: { name: 'asc' }
    });
    return successResponse(res, students);
  } catch (error) { next(error); }
});

// 3. Caderneta: Bimestres (Correção do Erro 404 de Redirecionamento)
router.get('/periods', async (req, res, next) => {
  try {
    const { institutionId } = getAuthData(req);
    const { schoolYear } = req.query;
    const periods = await prisma.academicPeriod.findMany({
      where: {
        institutionId,
        schoolYear: schoolYear ? parseInt(schoolYear, 10) : undefined
      },
      orderBy: { number: 'asc' }
    });
    return successResponse(res, periods);
  } catch (error) { next(error); }
});

// 4. Caderneta (Aba Aulas): Aulas registradas
router.get('/class/:classId/subject/:subjectId/lessons', async (req, res, next) => {
  try {
    const { institutionId } = getAuthData(req);
    const lessons = await prisma.lesson.findMany({
      where: {
        institutionId,
        classId: parseInt(req.params.classId, 10),
        subjectId: parseInt(req.params.subjectId, 10),
        periodId: req.query.periodId ? parseInt(req.query.periodId, 10) : undefined
      },
      orderBy: { date: 'desc' }
    });
    return successResponse(res, lessons);
  } catch (error) { next(error); }
});

// 5. Caderneta (Aba Notas): Avaliações cadastradas
router.get('/class/:classId/subject/:subjectId/assessments', async (req, res, next) => {
  try {
    const { institutionId } = getAuthData(req);
    const assessments = await prisma.assessment.findMany({
      where: {
        institutionId,
        classId: parseInt(req.params.classId, 10),
        subjectId: parseInt(req.params.subjectId, 10),
        periodId: req.query.periodId ? parseInt(req.query.periodId, 10) : undefined
      },
      include: { grades: true },
      orderBy: { date: 'asc' }
    });
    return successResponse(res, assessments);
  } catch (error) { next(error); }
});

module.exports = router;
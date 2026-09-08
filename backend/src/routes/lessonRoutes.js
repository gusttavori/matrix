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

// Get lessons for a class/subject
router.get('/:classId/:subjectId', async (req, res, next) => {
  try {
    const { userId, institutionId } = getAuthData(req);
    if (!userId || isNaN(userId)) throw new AppError('Usuário inválido', 401);

    const { classId, subjectId } = req.params;
    const { periodId } = req.query;

    const teacher = await prisma.teacher.findFirst({ where: { userId, institutionId } });
    if (!teacher) throw new AppError('Acesso restrito a professores', 403);

    await verifyTeacherLink(institutionId, teacher.id, parseInt(classId, 10), parseInt(subjectId, 10));

    const whereClause = {
      institutionId, 
      classId: parseInt(classId, 10), 
      subjectId: parseInt(subjectId, 10)
    };

    if (periodId) {
      whereClause.periodId = parseInt(periodId, 10);
    }

    const lessons = await prisma.lesson.findMany({
      where: whereClause,
      include: {
        attendances: true
      },
      orderBy: { date: 'desc' }
    });

    return successResponse(res, lessons);
  } catch (error) { next(error); }
});

// Create/Update a lesson
router.post('/', async (req, res, next) => {
  try {
    const { userId, institutionId } = getAuthData(req);
    if (!userId || isNaN(userId)) throw new AppError('Usuário inválido', 401);

    const { id, classId, subjectId, periodId, title, description, date, notes } = req.body;

    const teacher = await prisma.teacher.findFirst({ where: { userId, institutionId } });
    if (!teacher) throw new AppError('Acesso restrito a professores', 403);

    await verifyTeacherLink(institutionId, teacher.id, parseInt(classId, 10), parseInt(subjectId, 10));
    await checkPeriodClosed(parseInt(periodId, 10), institutionId);

    let lesson;

    if (id) {
      lesson = await prisma.lesson.update({
        where: { id: parseInt(id, 10), institutionId },
        data: {
          title,
          description,
          date: new Date(date),
          notes
        }
      });
    } else {
      lesson = await prisma.lesson.create({
        data: {
          institutionId,
          teacherId: teacher.id,
          classId: parseInt(classId, 10),
          subjectId: parseInt(subjectId, 10),
          periodId: parseInt(periodId, 10),
          title,
          description,
          date: new Date(date),
          notes
        }
      });
    }

    return successResponse(res, lesson, 'Aula registrada com sucesso', 201);
  } catch (error) { next(error); }
});

// Delete a lesson
router.delete('/:id', async (req, res, next) => {
  try {
    const { userId, institutionId } = getAuthData(req);
    if (!userId || isNaN(userId)) throw new AppError('Usuário inválido', 401);

    const { id } = req.params;
    
    const teacher = await prisma.teacher.findFirst({ where: { userId, institutionId } });
    if (!teacher) throw new AppError('Acesso restrito a professores', 403);

    const lesson = await prisma.lesson.findUnique({
      where: { id: parseInt(id, 10), institutionId }
    });

    if (!lesson) throw new AppError('Aula não encontrada', 404);
    
    await verifyTeacherLink(institutionId, teacher.id, lesson.classId, lesson.subjectId);
    await checkPeriodClosed(lesson.periodId, institutionId);

    await prisma.lesson.delete({
      where: { id: parseInt(id, 10) }
    });

    return successResponse(res, null, 'Aula removida com sucesso');
  } catch (error) { next(error); }
});

module.exports = router;
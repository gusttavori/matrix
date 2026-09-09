const express = require('express');
const { successResponse } = require('../utils/apiResponse');
const prisma = require('../utils/prisma');
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

router.get('/day/:classId/:subjectId/:periodId', async (req, res, next) => {
  try {
    const { userId, institutionId } = getAuthData(req);
    if (!userId || isNaN(userId)) {
      return res.status(401).json({ success: false, message: 'Usuário inválido' });
    }

    const teacher = await prisma.teacher.findFirst({ where: { userId, institutionId } });
    if (!teacher) return res.status(403).json({ success: false, message: 'Professor não encontrado' });

    const classId = parseInt(req.params.classId, 10);
    const subjectId = parseInt(req.params.subjectId, 10);
    const periodId = parseInt(req.params.periodId, 10);
    
    const targetDate = req.query.date ? new Date(req.query.date) : new Date();
    targetDate.setUTCHours(0, 0, 0, 0);
    const nextDay = new Date(targetDate);
    nextDay.setUTCDate(targetDate.getUTCDate() + 1);

    const lesson = await prisma.lesson.findFirst({
      where: {
        institutionId, classId, subjectId, periodId,
        date: { gte: targetDate, lt: nextDay }
      }
    });

    if (!lesson) {
      return successResponse(res, { lesson: null, attendances: [] });
    }

    const attendances = await prisma.attendance.findMany({
      where: { lessonId: lesson.id },
      include: { student: true }
    });

    return successResponse(res, { lesson, attendances });
  } catch (error) {
    next(error);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const { userId, institutionId } = getAuthData(req);
    const teacher = await prisma.teacher.findFirst({ where: { userId, institutionId } });
    
    const { classId, subjectId, periodId, date, attendances, title, description } = req.body;
    
    const cId = parseInt(classId, 10);
    const sId = parseInt(subjectId, 10);
    const pId = parseInt(periodId, 10);

    const targetDate = date ? new Date(date) : new Date();
    targetDate.setUTCHours(0,0,0,0);
    const nextDay = new Date(targetDate);
    nextDay.setUTCDate(targetDate.getUTCDate() + 1);

    const result = await prisma.$transaction(async (tx) => {
      let lesson = await tx.lesson.findFirst({
        where: { institutionId, classId: cId, subjectId: sId, periodId: pId, date: { gte: targetDate, lt: nextDay } }
      });

      if (lesson) {
        lesson = await tx.lesson.update({
          where: { id: lesson.id },
          data: { title: title || 'Aula Registrada', description: description || '' }
        });
      } else {
        lesson = await tx.lesson.create({
          data: {
            institutionId, classId: cId, subjectId: sId, periodId: pId, teacherId: teacher.id,
            date: targetDate,
            title: title || 'Aula Registrada', description: description || ''
          }
        });
      }

      for (const att of attendances) {
        const existingAtt = await tx.attendance.findFirst({
          where: { lessonId: lesson.id, studentId: att.studentId }
        });

        if (existingAtt) {
          await tx.attendance.update({
            where: { id: existingAtt.id },
            data: { 
              status: att.status,
              observation: att.observation || null // Novo campo
            }
          });
        } else {
          await tx.attendance.create({
            data: {
              institutionId, classId: cId, subjectId: sId, teacherId: teacher.id,
              lessonId: lesson.id,
              studentId: att.studentId,
              status: att.status,
              observation: att.observation || null // Novo campo
            }
          });
        }
      }
      return lesson;
    });

    return successResponse(res, { message: 'Chamada salva com sucesso!', lesson: result });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
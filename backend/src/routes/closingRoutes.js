const express = require('express');
const { successResponse } = require('../utils/apiResponse');
const prisma = require('../utils/prisma');
const { AppError } = require('../utils/AppError');
const jwt = require('jsonwebtoken');

const router = express.Router();

// Middleware de autenticação inline para garantir o preenchimento de req.user
const authMiddleware = (req, res, next) => {
  try {
    let token = req.headers.authorization;
    if (!token || !token.startsWith('Bearer ')) {
      throw new AppError('Token não fornecido', 401);
    }
    token = token.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    req.institutionId = decoded.institutionId || decoded.institutionId;
    next();
  } catch (error) {
    next(new AppError('Sessão expirada ou inválida', 401));
  }
};

const requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return next(new AppError('Acesso negado: permissão insuficiente.', 403));
    }
    next();
  };
};

// Aplica o middleware em todas as rotas do fechamento
router.use(authMiddleware);

// 1. Listar períodos acadêmicos da instituição
router.get('/periods', async (req, res, next) => {
  try {
    const institutionId = req.institutionId || req.user?.institutionId;
    const { schoolYear } = req.query;
    const year = schoolYear ? parseInt(schoolYear, 10) : new Date().getFullYear();

    const periods = await prisma.academicPeriod.findMany({
      where: { 
        institutionId: parseInt(institutionId, 10), 
        schoolYear: year 
      },
      orderBy: { number: 'asc' }
    });

    return successResponse(res, periods);
  } catch (error) { 
    next(error); 
  }
});

router.post('/submit-diary', requireRole(['TEACHER', 'ADMIN', 'SECRETARY']), async (req, res, next) => {
  try {
    const institutionId = req.institutionId || req.user?.institutionId;
    const userId = req.user?.id || req.user?.userId;
    const { classId, subjectId, periodId } = req.body;

    if (!classId || !subjectId || !periodId) {
      throw new AppError('Informações incompletas para entrega do diário.', 400);
    }

    const teacher = await prisma.teacher.findFirst({
      where: { userId: parseInt(userId, 10), institutionId: parseInt(institutionId, 10) }
    });

    const teacherId = teacher ? teacher.id : null;

    if (teacherId) {
      const existing = await prisma.teacherDiarySubmission.findFirst({
        where: { teacherId, classId: parseInt(classId, 10), subjectId: parseInt(subjectId, 10), periodId: parseInt(periodId, 10) }
      });

      if (!existing) {
        await prisma.teacherDiarySubmission.create({
          data: {
            institutionId: parseInt(institutionId, 10),
            teacherId,
            classId: parseInt(classId, 10),
            subjectId: parseInt(subjectId, 10),
            periodId: parseInt(periodId, 10)
          }
        });
      }
    }

    return successResponse(res, { 
      submitted: true, 
      submittedAt: new Date(),
      submittedBy: userId 
    }, 'Diário entregue com sucesso à secretaria!');
  } catch (error) {
    next(error);
  }
});

// 3. Ação da Secretaria / Admin: Fechar ou Reabrir a Unidade Globalmente
router.post('/periods/:id/toggle-status', requireRole(['ADMIN', 'SECRETARY']), async (req, res, next) => {
  try {
    const institutionId = req.institutionId || req.user?.institutionId;
    const { id } = req.params;
    let { isClosed } = req.body;

    if (typeof isClosed === 'string') {
      isClosed = isClosed === 'true';
    }

    if (typeof isClosed !== 'boolean') {
      throw new AppError('O status isClosed deve ser um booleano (true ou false)', 400);
    }

    const period = await prisma.academicPeriod.findFirst({
      where: { 
        id: parseInt(id, 10), 
        institutionId: parseInt(institutionId, 10) 
      }
    });

    if (!period) throw new AppError('Período acadêmico não encontrado', 404);

    const userId = req.user?.id || req.user?.userId || req.userId;

    const updatedPeriod = await prisma.academicPeriod.update({
      where: { id: period.id },
      data: {
        isClosed,
        closedAt: isClosed ? new Date() : null,
        closedBy: isClosed ? parseInt(userId, 10) : null
      }
    });

    const statusMsg = isClosed ? 'fechada globalmente' : 'reaberta';
    return successResponse(res, updatedPeriod, `Unidade ${statusMsg} com sucesso!`);
  } catch (error) { 
    next(error); 
  }
});

module.exports = router;
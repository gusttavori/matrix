const express = require('express');
const { successResponse } = require('../utils/apiResponse');
const prisma = require('../utils/prisma');
const { AppError } = require('../utils/AppError');

// Middleware definido localmente para garantir o funcionamento e corrigir a importação
const requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return next(new AppError('Acesso negado: permissão insuficiente.', 403));
    }
    next();
  };
};

const router = express.Router();

// Get all periods for the institution
router.get('/periods', async (req, res, next) => {
  try {
    const { schoolYear } = req.query;
    const year = schoolYear ? parseInt(schoolYear) : new Date().getFullYear();

    const periods = await prisma.academicPeriod.findMany({
      where: { institutionId: req.institutionId, schoolYear: year },
      orderBy: { number: 'asc' }
    });

    return successResponse(res, periods);
  } catch (error) { next(error); }
});

// Close or Open a period (Admin/Secretary only)
router.post('/periods/:id/toggle-status', requireRole(['ADMIN', 'SECRETARY']), async (req, res, next) => {
  try {
    const { id } = req.params;
    const { isClosed } = req.body;

    if (typeof isClosed !== 'boolean') {
      throw new AppError('O status isClosed deve ser um booleano', 400);
    }

    const period = await prisma.academicPeriod.findFirst({
      where: { id: parseInt(id), institutionId: req.institutionId }
    });

    if (!period) throw new AppError('Período acadêmico não encontrado', 404);

    const updatedPeriod = await prisma.academicPeriod.update({
      where: { id: period.id },
      data: {
        isClosed,
        closedAt: isClosed ? new Date() : null,
        closedBy: isClosed ? req.user.id : null
      }
    });

    const statusMsg = isClosed ? 'fechado' : 'reaberto';
    return successResponse(res, updatedPeriod, `Bimestre ${statusMsg} com sucesso!`);
  } catch (error) { next(error); }
});

module.exports = router;
const prisma = require('../utils/prisma');
const { AppError } = require('../utils/AppError');

const getMyInstitution = async (institutionId) => {
  const institution = await prisma.institution.findUnique({
    where: { id: parseInt(institutionId, 10) }
  });

  if (!institution) throw new AppError('Instituição não encontrada.', 404);

  const subscription = await prisma.subscription.findFirst({
    where: { institutionId: parseInt(institutionId, 10) },
    orderBy: { createdAt: 'desc' },
    include: { plan: true }
  });

  return { institution, subscription };
};

const updateInstitution = async (institutionId, data) => {
  const { name, tradeName, phone, address, city, state } = data;
  
  const updated = await prisma.institution.update({
    where: { id: parseInt(institutionId, 10) },
    data: { name, tradeName, phone, address, city, state }
  });

  return updated;
};

const getAcademicSettings = async (req, res, next) => {
  try {
    const institutionId = req.institutionId || req.user?.institutionId;
    const currentYear = new Date().getFullYear();
    
    let settings = await prisma.academicSetting.findFirst({
      where: { institutionId: parseInt(institutionId, 10), schoolYear: currentYear }
    });

    if (!settings) {
      settings = { minAverage: 6.0, minAttendance: 75, pointsPerPeriod: 25, unitsCount: 4 };
    }

    res.json({ success: true, data: settings });
  } catch (error) { 
    next(error); 
  }
};

const updateAcademicSettings = async (req, res, next) => {
  try {
    const institutionId = req.institutionId || req.user?.institutionId;
    const currentYear = new Date().getFullYear();
    const { minAverage, minAttendance, pointsPerPeriod, unitsCount } = req.body;

    const parsedUnits = parseInt(unitsCount, 10) || 4;

    const existing = await prisma.academicSetting.findFirst({
      where: { institutionId: parseInt(institutionId, 10), schoolYear: currentYear }
    });

    const dataToSave = {
      minAverage: parseFloat(minAverage),
      minAttendance: parseFloat(minAttendance),
      pointsPerPeriod: parseFloat(pointsPerPeriod),
      unitsCount: parsedUnits
    };

    let settings;
    if (existing) {
      settings = await prisma.academicSetting.update({
        where: { id: existing.id },
        data: dataToSave
      });
    } else {
      settings = await prisma.academicSetting.create({
        data: {
          institutionId: parseInt(institutionId, 10),
          schoolYear: currentYear,
          ...dataToSave
        }
      });
    }

    // GERAÇÃO AUTOMÁTICA DOS PERÍODOS LETIVOS
    for (let i = 1; i <= parsedUnits; i++) {
      const periodExists = await prisma.academicPeriod.findFirst({
        where: {
          institutionId: parseInt(institutionId, 10),
          schoolYear: currentYear,
          number: i
        }
      });

      if (!periodExists) {
        const startDate = new Date(currentYear, (i - 1) * 3, 1);
        const endDate = new Date(currentYear, i * 3, 0);

        await prisma.academicPeriod.create({
          data: {
            institutionId: parseInt(institutionId, 10),
            schoolYear: currentYear,
            name: `${i}º Período`,
            number: i,
            startDate,
            endDate,
            isClosed: false
          }
        });
      }
    }

    res.json({ success: true, data: settings, message: 'Regras e períodos atualizados com sucesso!' });
  } catch (error) { 
    next(error); 
  }
};

// --- NOVAS FUNÇÕES PARA GERENCIAR PERÍODOS ---

const getAcademicPeriods = async (req, res, next) => {
  try {
    const institutionId = req.institutionId || req.user?.institutionId;
    const currentYear = new Date().getFullYear();
    
    const periods = await prisma.academicPeriod.findMany({
      where: { 
        institutionId: parseInt(institutionId, 10),
        schoolYear: currentYear
      },
      orderBy: { number: 'asc' }
    });

    res.json({ success: true, data: periods });
  } catch (error) {
    next(error);
  }
};

const togglePeriodStatus = async (req, res, next) => {
  try {
    const institutionId = req.institutionId || req.user?.institutionId;
    const { periodId } = req.params;
    const { isClosed } = req.body;

    const period = await prisma.academicPeriod.findUnique({
      where: { id: parseInt(periodId, 10) }
    });

    if (!period || period.institutionId !== parseInt(institutionId, 10)) {
      throw new AppError('Período não encontrado ou não pertence a esta instituição.', 404);
    }

    // Atualiza apenas o status booleano
    const updatedPeriod = await prisma.academicPeriod.update({
      where: { id: parseInt(periodId, 10) },
      data: { 
        isClosed 
      }
    });

    res.json({ success: true, data: updatedPeriod, message: `Período ${isClosed ? 'fechado' : 'reaberto'} com sucesso.` });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getMyInstitution,
  updateInstitution,
  getAcademicSettings,
  updateAcademicSettings,
  getAcademicPeriods,
  togglePeriodStatus
};
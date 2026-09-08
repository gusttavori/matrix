const prisma = require('../utils/prisma');
const { AppError } = require('../utils/AppError');

const getMyInstitution = async (institutionId) => {
  const institution = await prisma.institution.findUnique({
    where: { id: institutionId }
  });

  if (!institution) throw new AppError('Instituição não encontrada.', 404);

  const subscription = await prisma.subscription.findFirst({
    where: { institutionId },
    orderBy: { createdAt: 'desc' },
    include: { plan: true }
  });

  return { institution, subscription };
};

const updateInstitution = async (institutionId, data) => {
  const { name, tradeName, phone, address, city, state } = data;
  
  const updated = await prisma.institution.update({
    where: { id: institutionId },
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

    // Valores padrão caso a escola ainda não tenha configurado
    if (!settings) {
      settings = { minAverage: 6.0, minAttendance: 75, pointsPerPeriod: 25 };
    }

    res.json({ success: true, data: settings });
  } catch (error) { next(error); }
};

const updateAcademicSettings = async (req, res, next) => {
  try {
    const institutionId = req.institutionId || req.user?.institutionId;
    const currentYear = new Date().getFullYear();
    const { minAverage, minAttendance, pointsPerPeriod } = req.body;

    const existing = await prisma.academicSetting.findFirst({
      where: { institutionId: parseInt(institutionId, 10), schoolYear: currentYear }
    });

    let settings;
    if (existing) {
      settings = await prisma.academicSetting.update({
        where: { id: existing.id },
        data: {
          minAverage: parseFloat(minAverage),
          minAttendance: parseFloat(minAttendance),
          pointsPerPeriod: parseFloat(pointsPerPeriod)
        }
      });
    } else {
      settings = await prisma.academicSetting.create({
        data: {
          institutionId: parseInt(institutionId, 10),
          schoolYear: currentYear,
          minAverage: parseFloat(minAverage),
          minAttendance: parseFloat(minAttendance),
          pointsPerPeriod: parseFloat(pointsPerPeriod)
        }
      });
    }

    res.json({ success: true, data: settings });
  } catch (error) { next(error); }
};

// CORREÇÃO: As funções agora estão devidamente exportadas
module.exports = {
  getMyInstitution,
  updateInstitution,
  getAcademicSettings,
  updateAcademicSettings
};
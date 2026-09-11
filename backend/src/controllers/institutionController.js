const prisma = require('../utils/prisma');
const { AppError } = require('../utils/AppError');

const getMyInstitution = async (req, res, next) => {
  try {
    const institutionId = req.institutionId || req.user?.institutionId;
    const institution = await prisma.institution.findUnique({
      where: { id: parseInt(institutionId, 10) }
    });

    if (!institution) throw new AppError('Instituição não encontrada.', 404);

    const subscription = await prisma.subscription.findFirst({
      where: { institutionId: parseInt(institutionId, 10) },
      orderBy: { createdAt: 'desc' },
      include: { plan: true }
    });

    res.json({ success: true, data: { institution, subscription } });
  } catch (error) { next(error); }
};

const updateInstitution = async (req, res, next) => {
  try {
    const institutionId = req.institutionId || req.user?.institutionId;
    const { name, tradeName, phone, address, city, state } = req.body;
    
    const updated = await prisma.institution.update({
      where: { id: parseInt(institutionId, 10) },
      data: { name, tradeName, phone, address, city, state }
    });

    res.json({ success: true, data: updated, message: 'Configurações atualizadas' });
  } catch (error) { next(error); }
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
  } catch (error) { next(error); }
};

const updateAcademicSettings = async (req, res, next) => {
  try {
    const institutionId = req.institutionId || req.user?.institutionId;
    const currentYear = new Date().getFullYear();
    const { minAverage, minAttendance, pointsPerPeriod, unitsCount } = req.body;

    const existing = await prisma.academicSetting.findFirst({
      where: { institutionId: parseInt(institutionId, 10), schoolYear: currentYear }
    });

    const dataToSave = {
      minAverage: parseFloat(minAverage),
      minAttendance: parseFloat(minAttendance),
      pointsPerPeriod: parseFloat(pointsPerPeriod),
      unitsCount: parseInt(unitsCount, 10) || 4
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

    res.json({ success: true, data: settings });
  } catch (error) { next(error); }
};

module.exports = {
  getMyInstitution,
  updateInstitution,
  getAcademicSettings,
  updateAcademicSettings
};
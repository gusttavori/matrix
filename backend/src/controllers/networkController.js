const prisma = require('../utils/prisma');
const { successResponse } = require('../utils/apiResponse');
const { hashPassword } = require('../services/authService');
const { AppError } = require('../utils/AppError');

const getDashboardData = async (req, res, next) => {
  try {
    const networkId = req.networkId;

    const totalInstitutions = await prisma.institution.count({
      where: { networkId, active: true }
    });

    const institutions = await prisma.institution.findMany({
      where: { networkId, active: true },
      select: { id: true }
    });
    
    const instIds = institutions.map(i => i.id);

    const totalStudents = await prisma.student.count({
      where: { institutionId: { in: instIds }, status: 'ACTIVE' }
    });

    const totalTeachers = await prisma.teacher.count({
      where: { institutionId: { in: instIds }, active: true }
    });

    const schoolsList = await prisma.institution.findMany({
      where: { networkId, active: true },
      include: {
        _count: {
          select: { 
            students: { where: { status: 'ACTIVE' } }, 
            teachers: { where: { active: true } } 
          }
        }
      },
      orderBy: { name: 'asc' }
    });

    const mappedSchools = schoolsList.map(school => ({
      id: school.id,
      name: school.name,
      city: school.city,
      state: school.state,
      type: school.type,
      totalStudents: school._count.students,
      totalTeachers: school._count.teachers,
    }));

    return successResponse(res, {
      overview: { totalInstitutions, totalStudents, totalTeachers },
      schools: mappedSchools
    });
  } catch (error) {
    next(error);
  }
};

const getInstitutionDeepDetails = async (req, res, next) => {
  try {
    const networkId = req.networkId;
    const { institutionId } = req.params;

    if (!networkId) {
      throw new AppError('Rede de ensino não identificada.', 403);
    }

    const institution = await prisma.institution.findFirst({
      where: { 
        id: parseInt(institutionId, 10),
        networkId: parseInt(networkId, 10)
      },
      include: {
        students: {
          include: { class: true },
          orderBy: { name: 'asc' }
        },
        teachers: {
          include: { 
            teacherClassSubjects: { 
              include: { subject: true, class: true } 
            } 
          }
        },
        classes: {
          include: { 
            _count: { select: { students: true } } 
          }
        },
        academicPeriods: {
          orderBy: { number: 'asc' }
        },
        subscriptions: {
          include: { plan: true }
        }
      }
    });

    if (!institution) {
      throw new AppError('Instituição não encontrada ou não pertence à sua rede.', 404);
    }

    return successResponse(res, institution);
  } catch (error) {
    next(error);
  }
};

const createNetworkSchool = async (req, res, next) => {
  try {
    const networkId = req.networkId;
    const {
      name, tradeName, document, email, phone, city, state, type,
      adminName, adminEmail, adminPassword
    } = req.body;

    const network = await prisma.network.findUnique({
      where: { id: networkId },
      include: {
        _count: { select: { institutions: true } }
      }
    });

    if (!network) {
      return res.status(404).json({ success: false, message: 'Rede de Ensino não encontrada.' });
    }

    if (network._count.institutions >= network.maxInstitutions) {
      return res.status(403).json({ 
        success: false, 
        message: `Limite de unidades excedido. Sua rede atingiu o máximo de ${network.maxInstitutions} escolas contratadas.` 
      });
    }

    const existingUser = await prisma.user.findUnique({ where: { email: adminEmail } });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'O e-mail do gestor/diretor já está em uso.' });
    }

    const hashedPassword = await hashPassword(adminPassword);

    const defaultPlan = await prisma.plan.findFirst({ where: { active: true } });
    if (!defaultPlan) {
      return res.status(400).json({ success: false, message: 'Nenhum plano ativo configurado no sistema.' });
    }

    const result = await prisma.$transaction(async (tx) => {
      const school = await tx.institution.create({
        data: {
          networkId, 
          name,
          tradeName,
          document,
          email,
          phone,
          city,
          state,
          type: type || 'PUBLIC',
          active: true
        }
      });

      await tx.user.create({
        data: {
          institutionId: school.id,
          name: adminName,
          email: adminEmail,
          password: hashedPassword,
          role: 'ADMIN',
          forcePasswordChange: true 
        }
      });

      await tx.subscription.create({
        data: {
          institutionId: school.id,
          planId: defaultPlan.id,
          status: 'ACTIVE'
        }
      });

      return school;
    });

    return res.status(201).json({ success: true, data: result, message: 'Unidade Escolar e Gestor criados com sucesso!' });
  } catch (error) {
    next(error);
  }
};

module.exports = { 
  getDashboardData, 
  getInstitutionDeepDetails, 
  createNetworkSchool 
};
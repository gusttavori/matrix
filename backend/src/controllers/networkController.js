const prisma = require('../utils/prisma');
const { successResponse } = require('../utils/apiResponse');
const { hashPassword } = require('../services/authService'); // Importação do hash de senha

const getDashboardData = async (req, res, next) => {
  try {
    const networkId = req.networkId;

    // 1. Contagem macro da rede
    const totalInstitutions = await prisma.institution.count({
      where: { networkId, active: true }
    });

    const institutions = await prisma.institution.findMany({
      where: { networkId, active: true },
      select: { id: true }
    });
    
    const instIds = institutions.map(i => i.id);

    // 2. Soma total de alunos e professores de TODAS as escolas da rede
    const totalStudents = await prisma.student.count({
      where: { institutionId: { in: instIds }, status: 'ACTIVE' }
    });

    const totalTeachers = await prisma.teacher.count({
      where: { institutionId: { in: instIds }, active: true }
    });

    // 3. Lista detalhada de escolas para a tabela de gestão da Secretaria
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

const createNetworkSchool = async (req, res, next) => {
  try {
    const networkId = req.networkId;
    const {
      name, tradeName, document, email, phone, city, state,
      adminName, adminEmail, adminPassword
    } = req.body;

    // 1. Verifica se o e-mail do diretor já existe
    const existingUser = await prisma.user.findUnique({ where: { email: adminEmail } });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'O e-mail do gestor/diretor já está em uso.' });
    }

    const hashedPassword = await hashPassword(adminPassword);

    // 2. Busca um plano ativo padrão para vincular à nova escola (Plano Base)
    const defaultPlan = await prisma.plan.findFirst({ where: { active: true } });
    if (!defaultPlan) {
      return res.status(400).json({ success: false, message: 'Nenhum plano ativo configurado no sistema. A Diretoria Matrix precisa criar um plano primeiro.' });
    }

    const result = await prisma.$transaction(async (tx) => {
      // Cria a instituição forçando o vínculo com a rede do Secretário
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
          active: true
        }
      });

      // Cria o Diretor da escola (Admin)
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

      // Ativa a escola no sistema gerando a assinatura
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

module.exports = { getDashboardData, createNetworkSchool };
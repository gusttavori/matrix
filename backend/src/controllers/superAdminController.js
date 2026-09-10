const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { hashPassword } = require('../services/authService');

exports.getMetrics = async (req, res, next) => {
  try {
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({ success: false, message: 'Usuário não autenticado.' });
    }

    const currentUser = await prisma.user.findUnique({
      where: { id: Number(userId) }
    });

    if (!currentUser || currentUser.email !== 'mestre@educacaomatrix.com.br') {
      return res.status(403).json({ success: false, message: 'Acesso negado. Apenas Diretoria Matrix.' });
    }

    const masterInstitutionId = currentUser.institutionId;

    const institutionsCount = await prisma.institution.count({
      where: { id: { not: masterInstitutionId }, active: true }
    });

    const studentsCount = await prisma.student.count();
    const teachersCount = await prisma.teacher.count();

    const activeSubscriptions = await prisma.subscription.findMany({
      where: { status: 'ACTIVE', institutionId: { not: masterInstitutionId } },
      include: { plan: true }
    });

    const mrr = activeSubscriptions.reduce((acc, sub) => acc + Number(sub.plan.price), 0);

    res.json({
      success: true,
      data: {
        totalInstitutions: institutionsCount,
        totalStudents: studentsCount,
        totalTeachers: teachersCount,
        mrr: mrr
      }
    });
  } catch (error) {
    next(error);
  }
};

exports.createNetwork = async (req, res, next) => {
  try {
    const userId = req.userId;

    const currentUser = await prisma.user.findUnique({
      where: { id: Number(userId) }
    });

    if (!currentUser || currentUser.email !== 'mestre@educacaomatrix.com.br') {
      return res.status(403).json({ success: false, message: 'Acesso negado. Apenas Diretoria Matrix.' });
    }

    const { networkName, city, state, adminName, adminEmail, adminPassword } = req.body;

    // TRAVA DE SEGURANÇA: Garante que os campos não estão vazios
    if (!adminEmail || adminEmail.trim() === '') {
      return res.status(400).json({ success: false, message: 'O e-mail de acesso é obrigatório.' });
    }

    const existingUser = await prisma.user.findUnique({ where: { email: adminEmail } });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Este e-mail já está em uso.' });
    }

    const hashedPassword = await hashPassword(adminPassword);

    const result = await prisma.$transaction(async (tx) => {
      const network = await tx.network.create({
        data: {
          name: networkName,
          city,
          state,
          active: true
        }
      });

      await tx.user.create({
        data: {
          name: adminName,
          email: adminEmail,
          password: hashedPassword,
          role: 'NETWORK_ADMIN',
          networkId: network.id,
          forcePasswordChange: true,
          active: true,
        }
      });

      return network;
    });

    return res.status(201).json({ success: true, data: result, message: 'Rede e gestor criados com sucesso!' });
  } catch (error) {
    next(error);
  }
};
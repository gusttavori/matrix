const prisma = require('../utils/prisma');
const { AppError } = require('../utils/AppError');
const { verifyPassword, generateToken, hashPassword } = require('../services/authService');

const login = async (email, password) => {
  if (!email || !password) {
    throw new AppError('Informe a identificação e a senha.', 400);
  }

  let searchIdentifier = String(email).trim();
  
  if (!searchIdentifier.includes('@')) {
    searchIdentifier = `${searchIdentifier.toLowerCase()}@aluno.matrix`;
  } else {
    searchIdentifier = searchIdentifier.toLowerCase();
  }

  const user = await prisma.user.findFirst({
    where: { email: searchIdentifier },
    include: {
      institution: {
        include: {
          subscriptions: {
            orderBy: { createdAt: 'desc' },
            take: 1,
            include: { plan: true }
          }
        }
      },
      network: true
    }
  });

  if (!user || !user.active) {
    throw new AppError('Credenciais inválidas ou usuário inativo.', 401);
  }

  const isMatch = await verifyPassword(password, user.password);
  if (!isMatch) {
    throw new AppError('Credenciais inválidas ou usuário inativo.', 401);
  }

  if (user.institution && !user.institution.active) {
    throw new AppError('Instituição inativa. Entre em contato com o suporte.', 403);
  }

  const token = generateToken(user);
  const subscription = user.institution?.subscriptions[0];

  return {
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      forcePasswordChange: user.forcePasswordChange,
      permissions: user.permissions
    },
    institution: user.institution ? {
      id: user.institution.id,
      name: user.institution.name,
      tradeName: user.institution.tradeName,
      logo: user.institution.logo
    } : null,
    subscription: subscription ? {
      status: subscription.status,
      plan: subscription.plan.name
    } : null,
    network: user.network ? {
      id: user.network.id,
      name: user.network.name
    } : null
  };
};

const register = async (data) => {
  const { 
    institutionName, tradeName, document, phone, state, city,
    adminName, email, password, planId 
  } = data;

  const plan = await prisma.plan.findUnique({ where: { id: planId } });
  if (!plan) throw new AppError('Plano não encontrado.', 404);

  const existingUser = await prisma.user.findFirst({ where: { email } });
  if (existingUser) throw new AppError('E-mail já está em uso.', 409);

  const hashedPassword = await hashPassword(password);

  const result = await prisma.$transaction(async (tx) => {
    const institution = await tx.institution.create({
      data: {
        name: institutionName,
        tradeName: tradeName || institutionName,
        document,
        phone,
        state,
        city,
        email 
      }
    });

    const subscription = await tx.subscription.create({
      data: {
        institutionId: institution.id,
        planId: plan.id,
        status: 'TRIAL', 
        startDate: new Date(),
        endDate: new Date(new Date().setDate(new Date().getDate() + 14)) 
      },
      include: { plan: true }
    });

    const user = await tx.user.create({
      data: {
        institutionId: institution.id,
        name: adminName,
        email,
        password: hashedPassword,
        role: 'ADMIN',
        forcePasswordChange: false
      }
    });

    return { institution, subscription, user };
  });

  const token = generateToken(result.user);

  return {
    token,
    user: {
      id: result.user.id,
      name: result.user.name,
      email: result.user.email,
      role: result.user.role
    },
    institution: {
      id: result.institution.id,
      name: result.institution.name,
      tradeName: result.institution.tradeName,
      logo: result.institution.logo
    },
    subscription: {
      status: result.subscription.status,
      plan: result.subscription.plan.name
    }
  };
};

const changeFirstPassword = async (userId, newPassword) => {
  if (!newPassword || newPassword.length < 6) {
    throw new AppError('A nova senha deve ter no mínimo 6 caracteres.', 400);
  }

  const hashedPassword = await hashPassword(newPassword);

  await prisma.user.update({
    where: { id: parseInt(userId, 10) },
    data: {
      password: hashedPassword,
      forcePasswordChange: false
    }
  });

  return true;
};

module.exports = {
  login,
  register,
  changeFirstPassword
};
const prisma = require('../utils/prisma');
const { AppError } = require('../utils/AppError');
const { verifyPassword, generateToken, hashPassword } = require('../services/authService');

const login = async (email, password) => {
  const user = await prisma.user.findFirst({
    where: { email },
    include: {
      institution: {
        include: {
          subscriptions: {
            orderBy: { createdAt: 'desc' },
            take: 1,
            include: { plan: true }
          }
        }
      }
    }
  });

  if (!user || !user.active) {
    throw new AppError('Credenciais inválidas ou usuário inativo.', 401);
  }

  const isMatch = await verifyPassword(password, user.password);
  if (!isMatch) {
    throw new AppError('Credenciais inválidas ou usuário inativo.', 401);
  }

  if (!user.institution.active) {
    throw new AppError('Instituição inativa. Entre em contato com o suporte.', 403);
  }

  const token = generateToken(user);
  const subscription = user.institution.subscriptions[0];

  return {
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role
    },
    institution: {
      id: user.institution.id,
      name: user.institution.name,
      tradeName: user.institution.tradeName,
      logo: user.institution.logo
    },
    subscription: subscription ? {
      status: subscription.status,
      plan: subscription.plan.name
    } : null
  };
};

const register = async (data) => {
  const { 
    institutionName, tradeName, document, phone, state, city,
    adminName, email, password, planId 
  } = data;

  // Verifica se o plano existe
  const plan = await prisma.plan.findUnique({ where: { id: planId } });
  if (!plan) throw new AppError('Plano não encontrado.', 404);

  // Verifica se email já existe globalmente (para admin é bom)
  const existingUser = await prisma.user.findFirst({ where: { email } });
  if (existingUser) throw new AppError('E-mail já está em uso.', 409);

  const hashedPassword = await hashPassword(password);

  // Transação para criar Instituição, Assinatura e Usuário
  const result = await prisma.$transaction(async (tx) => {
    const institution = await tx.institution.create({
      data: {
        name: institutionName,
        tradeName: tradeName || institutionName,
        document,
        phone,
        state,
        city,
        email // email da escola
      }
    });

    const subscription = await tx.subscription.create({
      data: {
        institutionId: institution.id,
        planId: plan.id,
        status: 'TRIAL', // Inicia como trial
        startDate: new Date(),
        endDate: new Date(new Date().setDate(new Date().getDate() + 14)) // 14 dias trial
      },
      include: { plan: true }
    });

    const user = await tx.user.create({
      data: {
        institutionId: institution.id,
        name: adminName,
        email,
        password: hashedPassword,
        role: 'ADMIN'
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

module.exports = {
  login,
  register
};

const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const { AppError } = require('../utils/AppError');

const prisma = new PrismaClient();

async function authMiddleware(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AppError('Token não fornecido.', 401);
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Buscar usuário no banco para garantir que ainda existe e está ativo
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId }
    });

    if (!user) {
      throw new AppError('Usuário não encontrado.', 401);
    }

    if (!user.active) {
      throw new AppError('Usuário desativado.', 403);
    }

    // Injetar dados do usuário na requisição
    // institutionId SEMPRE vem do banco, nunca do client
    req.userId = user.id;
    req.institutionId = user.institutionId;
    req.userRole = user.role;
    req.userName = user.name;

    next();
  } catch (error) {
    if (error.isOperational) {
      return next(error);
    }
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return next(error);
    }
    next(new AppError('Erro na autenticação.', 401));
  }
}

module.exports = { authMiddleware };

const { AppError } = require('../utils/AppError');

function errorHandler(err, req, res, next) {
  // Log detalhado no servidor
  console.error('Error:', {
    message: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    path: req.path,
    method: req.method
  });

  // Erro operacional (AppError)
  if (err.isOperational) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message
    });
  }

  // Erro do Prisma: unique constraint
  if (err.code === 'P2002') {
    const field = err.meta?.target?.join(', ') || 'campo';
    return res.status(409).json({
      success: false,
      message: `Já existe um registro com este ${field}.`
    });
  }

  // Erro do Prisma: registro não encontrado
  if (err.code === 'P2025') {
    return res.status(404).json({
      success: false,
      message: 'Registro não encontrado.'
    });
  }

  // Erro de validação Zod
  if (err.name === 'ZodError') {
    const messages = err.errors.map(e => e.message).join(', ');
    return res.status(422).json({
      success: false,
      message: 'Dados inválidos.',
      error: messages
    });
  }

  // Erro do JWT
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      message: 'Token inválido.'
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      message: 'Token expirado.'
    });
  }

  // Erro genérico (nunca expor stack trace)
  return res.status(500).json({
    success: false,
    message: 'Erro interno do servidor.'
  });
}

module.exports = { errorHandler };

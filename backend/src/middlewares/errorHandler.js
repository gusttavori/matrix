const { AppError } = require('../utils/AppError');

function errorHandler(err, req, res, next) {
  console.error('Error caught in errorHandler:', {
    name: err.name,
    message: err.message,
    code: err.code,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    path: req.path,
    method: req.method
  });

  if (err.isOperational) {
    return res.status(err.statusCode || 400).json({
      success: false,
      message: err.message
    });
  }

  // Tratamento seguro para erros do Zod (evita TypeError de map em undefined)
  if (err.name === 'ZodError' || (err.errors && Array.isArray(err.errors)) || (err.issues && Array.isArray(err.issues))) {
    const errorList = err.errors || err.issues || [];
    const messages = errorList.map(e => e.message || 'Erro de validação').join(', ');
    return res.status(422).json({
      success: false,
      message: messages || 'Dados inválidos.',
      error: messages
    });
  }

  if (typeof err.message === 'string' && err.message.trim().startsWith('[')) {
    try {
      const parsed = JSON.parse(err.message);
      if (Array.isArray(parsed)) {
        const messages = parsed.map(e => e.message || 'Erro').join(', ');
        return res.status(422).json({
          success: false,
          message: messages,
          error: messages
        });
      }
    } catch (parseErr) {
      // Ignora se não for JSON válido
    }
  }

  if (err.code === 'P2002') {
    const field = err.meta?.target?.join(', ') || 'campo';
    return res.status(409).json({
      success: false,
      message: `Já existe um registro com este ${field}.`
    });
  }

  if (err.code === 'P2025') {
    return res.status(404).json({
      success: false,
      message: 'Registro não encontrado.'
    });
  }

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

  return res.status(500).json({
    success: false,
    message: err.message || 'Erro interno do servidor.'
  });
}

module.exports = { errorHandler };
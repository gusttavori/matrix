const { AppError } = require('../utils/AppError');

/**
 * Middleware factory que verifica se o usuário tem uma das roles permitidas.
 * Uso: requireRole('ADMIN', 'SECRETARY')
 */
function requireRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.userRole) {
      return next(new AppError('Usuário não autenticado.', 401));
    }

    if (!allowedRoles.includes(req.userRole)) {
      return next(new AppError('Você não tem permissão para acessar este recurso.', 403));
    }

    next();
  };
}

module.exports = { requireRole };

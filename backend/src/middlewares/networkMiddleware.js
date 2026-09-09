const { AppError } = require('../utils/AppError');

const networkMiddleware = (req, res, next) => {
  // authMiddleware já deve ter populado req.user antes deste ponto
  if (!req.user || req.user.role !== 'NETWORK_ADMIN') {
    return next(new AppError('Acesso restrito à Secretaria de Educação (Rede)', 403));
  }
  
  if (!req.user.networkId) {
    return next(new AppError('Usuário não vinculado a nenhuma rede de ensino', 403));
  }

  // Repassa o ID da Rede para o Controller
  req.networkId = req.user.networkId;
  next();
};

module.exports = { networkMiddleware };
const prisma = require('../utils/prisma');

const networkMiddleware = async (req, res, next) => {
  try {
    // O authMiddleware anterior deve ter populado o req.userId (ou req.user.id)
    const userId = req.userId || (req.user && req.user.id);

    if (!userId) {
      return res.status(401).json({ success: false, message: 'Usuário não autenticado.' });
    }

    const user = await prisma.user.findUnique({
      where: { id: Number(userId) }
    });

    if (!user || user.role !== 'NETWORK_ADMIN' || !user.networkId) {
      return res.status(403).json({ success: false, message: 'Acesso restrito à Secretaria de Educação (Rede).' });
    }

    // Repassa o ID da Rede para o Controller
    req.networkId = user.networkId;
    next();
  } catch (error) {
    console.error('Erro no networkMiddleware:', error);
    return res.status(500).json({ success: false, message: 'Erro interno ao validar permissões.' });
  }
};

module.exports = { networkMiddleware };
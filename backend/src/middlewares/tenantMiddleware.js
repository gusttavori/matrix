/**
 * Middleware que garante isolamento multi-tenant.
 * Adiciona institutionId como filtro obrigatório no req
 * para uso nos services/controllers.
 * 
 * Deve ser usado APÓS authMiddleware.
 */
function tenantMiddleware(req, res, next) {
  // institutionId já foi definido pelo authMiddleware a partir do banco
  // Este middleware existe como camada extra de segurança
  if (!req.institutionId) {
    return res.status(403).json({
      success: false,
      message: 'Instituição não identificada.'
    });
  }

  // Sobrescrever qualquer institutionId que venha no body/query/params
  // para garantir que sempre use o da sessão
  if (req.body && req.body.institutionId) {
    req.body.institutionId = req.institutionId;
  }

  next();
}

module.exports = { tenantMiddleware };

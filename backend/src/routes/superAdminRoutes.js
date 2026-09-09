const express = require('express');
const router = express.Router();
const { getMetrics, createNetwork } = require('../controllers/superAdminController');
const { authMiddleware } = require('../middlewares/authMiddleware'); 

// Todas as rotas aqui precisam de autenticação
router.use(authMiddleware);

router.get('/metrics', getMetrics);
router.post('/networks', createNetwork);

// AQUI ESTÁ A CORREÇÃO: Deve ser exportado diretamente, sem chaves {}
module.exports = router;
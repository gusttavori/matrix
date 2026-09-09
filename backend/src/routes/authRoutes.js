const express = require('express');
const { successResponse } = require('../utils/apiResponse');
const { loginSchema, registerSchema } = require('../schemas/authSchemas');
const authController = require('../controllers/authController');
const { authMiddleware } = require('../middlewares/authMiddleware'); // Necessário para pegar o userId

const router = express.Router();

router.post('/login', async (req, res, next) => {
  try {
    const validated = loginSchema.parse(req.body);
    const data = await authController.login(validated.email, validated.password);
    return successResponse(res, data, 'Login realizado com sucesso.');
  } catch (error) {
    next(error);
  }
});

router.post('/register', async (req, res, next) => {
  try {
    const validated = registerSchema.parse(req.body);
    const data = await authController.register(validated);
    return successResponse(res, data, 'Instituição criada com sucesso.', 201);
  } catch (error) {
    next(error);
  }
});

// Nova Rota: Exige o token temporário para trocar a senha
router.post('/change-first-password', authMiddleware, async (req, res, next) => {
  try {
    // Busca o ID do usuário injetado pelo middleware
    const userId = req.user?.userId || req.user?.id || req.userId;
    const { newPassword } = req.body;
    
    await authController.changeFirstPassword(userId, newPassword);
    
    return successResponse(res, null, 'Senha atualizada com sucesso. Refaça o login.');
  } catch (error) {
    next(error);
  }
});

module.exports = router;
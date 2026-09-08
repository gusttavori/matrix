const express = require('express');
const { successResponse } = require('../utils/apiResponse');
const { loginSchema, registerSchema } = require('../schemas/authSchemas');
const authController = require('../controllers/authController');

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

module.exports = router;

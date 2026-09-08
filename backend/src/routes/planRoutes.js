const express = require('express');
const { successResponse } = require('../utils/apiResponse');
const planController = require('../controllers/planController');

const router = express.Router();

router.get('/', async (req, res, next) => {
  try {
    const data = await planController.getPlans();
    return successResponse(res, data, 'Planos recuperados com sucesso.');
  } catch (error) {
    next(error);
  }
});

module.exports = router;

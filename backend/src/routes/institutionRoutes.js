const express = require('express');
const { successResponse } = require('../utils/apiResponse');
const institutionController = require('../controllers/institutionController');
const { authMiddleware } = require('../middlewares/authMiddleware');
const { requireRole } = require('../middlewares/requireRole');
const { tenantMiddleware } = require('../middlewares/tenantMiddleware');
const { z } = require('zod');

const router = express.Router();

// Todas as rotas de instituição requerem autenticação
router.use(authMiddleware);
router.use(tenantMiddleware);

const updateSchema = z.object({
  name: z.string().min(3).optional(),
  tradeName: z.string().min(3).optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().max(2).optional()
});

// Qualquer usuário pode ver os dados da sua instituição
router.get('/me', async (req, res, next) => {
  try {
    const data = await institutionController.getMyInstitution(req.institutionId);
    return successResponse(res, data, 'Instituição recuperada com sucesso.');
  } catch (error) {
    next(error);
  }
});

router.get('/academic-settings', institutionController.getAcademicSettings);
router.put('/academic-settings', institutionController.updateAcademicSettings);

// Apenas ADMIN pode atualizar dados da instituição
router.put('/', requireRole('ADMIN'), async (req, res, next) => {
  try {
    const validated = updateSchema.parse(req.body);
    const data = await institutionController.updateInstitution(req.institutionId, validated);
    return successResponse(res, data, 'Instituição atualizada com sucesso.');
  } catch (error) {
    next(error);
  }
});

module.exports = router;

const express = require('express');
const { successResponse } = require('../utils/apiResponse');
const classController = require('../controllers/classController');
const { createClassSchema, updateClassSchema } = require('../schemas/adminSchemas');
const { authMiddleware } = require('../middlewares/authMiddleware');
const { requireRole } = require('../middlewares/requireRole');
const { tenantMiddleware } = require('../middlewares/tenantMiddleware');

const router = express.Router();

router.use(authMiddleware);
router.use(tenantMiddleware);
router.use(requireRole('ADMIN', 'SECRETARY'));

router.get('/', async (req, res, next) => {
  try {
    const data = await classController.getAll(req.institutionId);
    return successResponse(res, data);
  } catch (error) { next(error); }
});

router.post('/', async (req, res, next) => {
  try {
    const validated = createClassSchema.parse(req.body);
    const data = await classController.create(req.institutionId, validated);
    return successResponse(res, data, 'Turma criada com sucesso', 201);
  } catch (error) { next(error); }
});

router.put('/:id', async (req, res, next) => {
  try {
    const validated = updateClassSchema.parse(req.body);
    const data = await classController.update(req.institutionId, req.params.id, validated);
    return successResponse(res, data, 'Turma atualizada com sucesso');
  } catch (error) { next(error); }
});

router.delete('/:id', async (req, res, next) => {
  try {
    await classController.remove(req.institutionId, req.params.id);
    return successResponse(res, null, 'Turma excluída com sucesso');
  } catch (error) { next(error); }
});

module.exports = router;

const express = require('express');
const { successResponse } = require('../utils/apiResponse');
const subjectController = require('../controllers/subjectController');
const { createSubjectSchema, updateSubjectSchema } = require('../schemas/adminSchemas');
const { authMiddleware } = require('../middlewares/authMiddleware');
const { requireRole } = require('../middlewares/requireRole');
const { tenantMiddleware } = require('../middlewares/tenantMiddleware');

const router = express.Router();

router.use(authMiddleware);
router.use(tenantMiddleware);
router.use(requireRole('ADMIN', 'SECRETARY'));

router.get('/', async (req, res, next) => {
  try {
    const data = await subjectController.getAll(req.institutionId);
    return successResponse(res, data);
  } catch (error) { next(error); }
});

router.post('/', async (req, res, next) => {
  try {
    const validated = createSubjectSchema.parse(req.body);
    const data = await subjectController.create(req.institutionId, validated);
    return successResponse(res, data, 'Disciplina criada com sucesso', 201);
  } catch (error) { next(error); }
});

router.put('/:id', async (req, res, next) => {
  try {
    const validated = updateSubjectSchema.parse(req.body);
    const data = await subjectController.update(req.institutionId, req.params.id, validated);
    return successResponse(res, data, 'Disciplina atualizada com sucesso');
  } catch (error) { next(error); }
});

router.delete('/:id', async (req, res, next) => {
  try {
    await subjectController.remove(req.institutionId, req.params.id);
    return successResponse(res, null, 'Disciplina excluída com sucesso');
  } catch (error) { next(error); }
});

module.exports = router;

const express = require('express');
const { successResponse } = require('../utils/apiResponse');
const teacherController = require('../controllers/teacherController');
const { createTeacherSchema, updateTeacherSchema } = require('../schemas/adminSchemas');
const { authMiddleware } = require('../middlewares/authMiddleware');
const { requireRole } = require('../middlewares/requireRole');
const { tenantMiddleware } = require('../middlewares/tenantMiddleware');

const router = express.Router();

router.use(authMiddleware);
router.use(tenantMiddleware);
router.use(requireRole('ADMIN', 'SECRETARY'));

router.get('/', async (req, res, next) => {
  try {
    const data = await teacherController.getAll(req.institutionId);
    return successResponse(res, data);
  } catch (error) { next(error); }
});

router.post('/', async (req, res, next) => {
  try {
    const validated = createTeacherSchema.parse(req.body);
    const data = await teacherController.create(req.institutionId, validated);
    return successResponse(res, data, 'Professor criado com sucesso', 201);
  } catch (error) { next(error); }
});

router.put('/:id', async (req, res, next) => {
  try {
    const validated = updateTeacherSchema.parse(req.body);
    const data = await teacherController.update(req.institutionId, req.params.id, validated);
    return successResponse(res, data, 'Professor atualizado com sucesso');
  } catch (error) { next(error); }
});

router.delete('/:id', async (req, res, next) => {
  try {
    await teacherController.remove(req.institutionId, req.params.id);
    return successResponse(res, null, 'Professor excluído com sucesso');
  } catch (error) { next(error); }
});

module.exports = router;

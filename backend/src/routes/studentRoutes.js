const express = require('express');
const { successResponse } = require('../utils/apiResponse');
const studentController = require('../controllers/studentController');
const { createStudentSchema, updateStudentSchema } = require('../schemas/adminSchemas');
const { authMiddleware } = require('../middlewares/authMiddleware');
const { requireRole } = require('../middlewares/requireRole');
const { tenantMiddleware } = require('../middlewares/tenantMiddleware');

const router = express.Router();

router.use(authMiddleware);
router.use(tenantMiddleware);
router.use(requireRole('ADMIN', 'SECRETARY'));

router.get('/', async (req, res, next) => {
  try {
    const data = await studentController.getAll(req.institutionId);
    return successResponse(res, data);
  } catch (error) { next(error); }
});

router.post('/', async (req, res, next) => {
  try {
    const validated = createStudentSchema.parse(req.body);
    const data = await studentController.create(req.institutionId, validated);
    return successResponse(res, data, 'Aluno criado com sucesso', 201);
  } catch (error) { next(error); }
});

router.put('/:id', async (req, res, next) => {
  try {
    const validated = updateStudentSchema.parse(req.body);
    const data = await studentController.update(req.institutionId, req.params.id, validated);
    return successResponse(res, data, 'Aluno atualizado com sucesso');
  } catch (error) { next(error); }
});

router.delete('/:id', async (req, res, next) => {
  try {
    await studentController.remove(req.institutionId, req.params.id);
    return successResponse(res, null, 'Aluno excluído com sucesso');
  } catch (error) { next(error); }
});

module.exports = router;

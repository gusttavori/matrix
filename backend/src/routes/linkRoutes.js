const express = require('express');
const { successResponse } = require('../utils/apiResponse');
const linkController = require('../controllers/linkController');
const { createLinkSchema } = require('../schemas/linkSchemas');
const { authMiddleware } = require('../middlewares/authMiddleware');
const { requireRole } = require('../middlewares/requireRole');
const { tenantMiddleware } = require('../middlewares/tenantMiddleware');

const router = express.Router();

router.use(authMiddleware);
router.use(tenantMiddleware);
router.use(requireRole('ADMIN', 'SECRETARY'));

router.get('/', async (req, res, next) => {
  try {
    const data = await linkController.getAll(req.institutionId);
    return successResponse(res, data);
  } catch (error) { next(error); }
});

router.post('/', async (req, res, next) => {
  try {
    const validated = createLinkSchema.parse(req.body);
    const data = await linkController.create(req.institutionId, validated);
    return successResponse(res, data, 'Vínculo criado com sucesso', 201);
  } catch (error) { next(error); }
});

router.delete('/:id', async (req, res, next) => {
  try {
    await linkController.remove(req.institutionId, req.params.id);
    return successResponse(res, null, 'Vínculo excluído com sucesso');
  } catch (error) { next(error); }
});

module.exports = router;

const express = require('express');
const multer = require('multer');
const { successResponse } = require('../utils/apiResponse');
const studentController = require('../controllers/studentController');
const occurrenceController = require('../controllers/occurrenceController');
const { createStudentSchema, updateStudentSchema } = require('../schemas/adminSchemas');
const { authMiddleware } = require('../middlewares/authMiddleware');
const { requireRole } = require('../middlewares/requireRole');
const { tenantMiddleware } = require('../middlewares/tenantMiddleware');

const router = express.Router();

// Configuração do Multer (Armazena temporariamente na memória RAM)
const upload = multer({ storage: multer.memoryStorage() });

router.use(authMiddleware);
router.use(tenantMiddleware);
router.use(requireRole('ADMIN', 'SECRETARY'));

// ROTA DE IMPORTAÇÃO (Precisa vir antes de /:id para não ser confundida com um ID)
router.post('/import', upload.single('file'), studentController.importStudents);
router.post('/:studentId/occurrences', occurrenceController.createOccurrence);
router.get('/:studentId/occurrences', occurrenceController.getStudentOccurrences);

// Rotas Padrões
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
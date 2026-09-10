const prisma = require('../utils/prisma');
const { AppError } = require('../utils/AppError');

const createOccurrence = async (req, res) => {
  const { studentId } = req.params;
  const { type, title, description, date } = req.body;
  const institutionId = req.institutionId; 
  const registeredById = req.userId; // Quem está logado (Diretor/Professor)

  // Verifica se o aluno existe e pertence à instituição
  const student = await prisma.student.findFirst({
    where: { id: parseInt(studentId), institutionId }
  });

  if (!student) {
    throw new AppError('Aluno não encontrado.', 404);
  }

  const occurrence = await prisma.occurrence.create({
    data: {
      institutionId,
      studentId: parseInt(studentId),
      registeredById,
      type,
      title,
      description,
      date: new Date(date)
    }
  });

  return res.status(201).json({ success: true, data: occurrence, message: 'Ocorrência registrada.' });
};

const getStudentOccurrences = async (req, res) => {
  const { studentId } = req.params;
  const institutionId = req.institutionId;

  const occurrences = await prisma.occurrence.findMany({
    where: { studentId: parseInt(studentId), institutionId },
    include: {
      registeredBy: { select: { name: true, role: true } }
    },
    orderBy: { date: 'desc' }
  });

  return res.status(200).json({ success: true, data: occurrences });
};

module.exports = {
  createOccurrence,
  getStudentOccurrences
};
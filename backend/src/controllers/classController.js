const prisma = require('../utils/prisma');
const { AppError } = require('../utils/AppError');
const { checkClassLimit } = require('../services/planLimitService');

const getAll = async (institutionId) => {
  return await prisma.class.findMany({
    where: { institutionId },
    // Adicionado o _count para a tabela saber a quantidade de alunos da turma
    include: {
      _count: {
        select: { students: true }
      }
    },
    orderBy: [{ schoolYear: 'desc' }, { grade: 'asc' }, { name: 'asc' }]
  });
};

const getById = async (institutionId, id) => {
  const c = await prisma.class.findFirst({
    where: { id: parseInt(id), institutionId }
  });
  if (!c) throw new AppError('Turma não encontrada', 404);
  return c;
};

const create = async (institutionId, data) => {
  await checkClassLimit(institutionId);

  // Check unique name per institution and year
  const exists = await prisma.class.findFirst({
    where: { 
      institutionId, 
      name: data.name, 
      schoolYear: data.schoolYear 
    }
  });

  if (exists) {
    throw new AppError('Já existe uma turma com este nome neste ano letivo', 400);
  }

  return await prisma.class.create({
    data: {
      institutionId,
      ...data
    }
  });
};

const update = async (institutionId, id, data) => {
  await getById(institutionId, id); // check exists & ownership

  if (data.name && data.schoolYear) {
    const exists = await prisma.class.findFirst({
      where: { 
        institutionId, 
        name: data.name, 
        schoolYear: data.schoolYear,
        id: { not: parseInt(id) }
      }
    });
    if (exists) throw new AppError('Já existe outra turma com este nome neste ano letivo', 400);
  }

  return await prisma.class.update({
    where: { id: parseInt(id) },
    data
  });
};

const remove = async (institutionId, id) => {
  await getById(institutionId, id);
  
  // Checks se tem alunos matriculados
  const studentsCount = await prisma.student.count({
    where: { classId: parseInt(id) }
  });

  if (studentsCount > 0) {
    throw new AppError('Não é possível excluir uma turma que possui alunos matriculados', 400);
  }

  return await prisma.class.delete({
    where: { id: parseInt(id) }
  });
};

module.exports = {
  getAll, getById, create, update, remove
};
const prisma = require('../utils/prisma');
const { AppError } = require('../utils/AppError');

const getAll = async (institutionId) => {
  return await prisma.subject.findMany({
    where: { institutionId },
    orderBy: [{ grade: 'asc' }, { name: 'asc' }]
  });
};

const getById = async (institutionId, id) => {
  const s = await prisma.subject.findFirst({
    where: { id: parseInt(id), institutionId }
  });
  if (!s) throw new AppError('Disciplina não encontrada', 404);
  return s;
};

const create = async (institutionId, data) => {
  const exists = await prisma.subject.findFirst({
    where: { institutionId, name: data.name, grade: data.grade }
  });

  if (exists) {
    throw new AppError('Já existe uma disciplina com este nome nesta série', 400);
  }

  return await prisma.subject.create({
    data: { institutionId, ...data }
  });
};

// Nova Função: Criação em Massa
const createBulk = async (institutionId, data) => {
  const { name, grades } = data;
  
  if (!grades || grades.length === 0) {
    throw new AppError('Selecione ao menos uma série.', 400);
  }

  const existing = await prisma.subject.findMany({
    where: { institutionId, name, grade: { in: grades } }
  });
  
  const existingGrades = existing.map(e => e.grade);
  const toCreate = grades
    .filter(g => !existingGrades.includes(g))
    .map(g => ({ institutionId, name, grade: g, active: true }));

  if (toCreate.length === 0) {
    throw new AppError('Esta disciplina já está cadastrada para todas as séries selecionadas.', 400);
  }

  return await prisma.subject.createMany({ data: toCreate });
};

const update = async (institutionId, id, data) => {
  await getById(institutionId, id); 

  if (data.name && data.grade) {
    const exists = await prisma.subject.findFirst({
      where: { 
        institutionId, name: data.name, grade: data.grade, id: { not: parseInt(id) }
      }
    });
    if (exists) throw new AppError('Já existe outra disciplina com este nome nesta série', 400);
  }

  return await prisma.subject.update({
    where: { id: parseInt(id) },
    data
  });
};

const remove = async (institutionId, id) => {
  await getById(institutionId, id);
  
  const linksCount = await prisma.teacherClassSubject.count({
    where: { subjectId: parseInt(id) }
  });

  if (linksCount > 0) {
    throw new AppError('Não é possível excluir uma disciplina que possui professores vinculados', 400);
  }

  return await prisma.subject.delete({
    where: { id: parseInt(id) }
  });
};

module.exports = {
  getAll, getById, create, createBulk, update, remove
};
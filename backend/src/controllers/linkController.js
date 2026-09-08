const prisma = require('../utils/prisma');
const { AppError } = require('../utils/AppError');

const getAll = async (institutionId) => {
  return await prisma.teacherClassSubject.findMany({
    where: { institutionId },
    include: {
      teacher: true,
      class: true,
      subject: true
    }
  });
};

const create = async (institutionId, data) => {
  const { teacherId, classId, subjectId } = data;

  // Verificações
  const teacher = await prisma.teacher.findFirst({ where: { id: teacherId, institutionId } });
  if (!teacher) throw new AppError('Professor não encontrado', 404);

  const cls = await prisma.class.findFirst({ where: { id: classId, institutionId } });
  if (!cls) throw new AppError('Turma não encontrada', 404);

  const subject = await prisma.subject.findFirst({ where: { id: subjectId, institutionId } });
  if (!subject) throw new AppError('Disciplina não encontrada', 404);

  // Unicidade
  const exists = await prisma.teacherClassSubject.findFirst({
    where: { institutionId, classId, subjectId }
  });

  if (exists) {
    if (exists.teacherId === teacherId) {
      throw new AppError('Este professor já está vinculado a esta turma e disciplina', 400);
    } else {
      throw new AppError('Outro professor já está vinculado a esta turma e disciplina', 400);
    }
  }

  return await prisma.teacherClassSubject.create({
    data: {
      institutionId,
      teacherId,
      classId,
      subjectId
    },
    include: {
      teacher: true,
      class: true,
      subject: true
    }
  });
};

const remove = async (institutionId, id) => {
  const link = await prisma.teacherClassSubject.findFirst({
    where: { id: parseInt(id), institutionId }
  });

  if (!link) throw new AppError('Vínculo não encontrado', 404);

  // Aqui deveria verificar se já existem conteúdos/notas lançados (MVP simplificado)
  
  return await prisma.teacherClassSubject.delete({
    where: { id: parseInt(id) }
  });
};

module.exports = {
  getAll, create, remove
};

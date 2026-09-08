const prisma = require('../utils/prisma');
const { AppError } = require('../utils/AppError');

// Garante que o professor logado realmente dá aula nessa turma/disciplina
const verifyTeacherLink = async (institutionId, teacherId, classId, subjectId) => {
  const link = await prisma.teacherClassSubject.findFirst({
    where: { institutionId, teacherId, classId, subjectId }
  });
  if (!link) {
    throw new AppError('Você não tem permissão para esta turma e disciplina', 403);
  }
  return link;
};

// Pega os alunos de uma turma específica
const getClassStudents = async (institutionId, classId) => {
  return await prisma.student.findMany({
    where: { institutionId, classId, status: 'ACTIVE' },
    orderBy: { name: 'asc' }
  });
};

const getTeacherClasses = async (institutionId, teacherId) => {
  const links = await prisma.teacherClassSubject.findMany({
    where: { institutionId, teacherId },
    include: {
      class: true,
      subject: true
    }
  });

  // Agrupa as turmas para o frontend não ter links duplicados caso ele dê mais de uma matéria na mesma turma
  const classesMap = new Map();
  links.forEach(l => {
    if (!classesMap.has(l.classId)) {
      classesMap.set(l.classId, {
        ...l.class,
        subjects: []
      });
    }
    classesMap.get(l.classId).subjects.push(l.subject);
  });

  return Array.from(classesMap.values());
};

module.exports = {
  verifyTeacherLink,
  getClassStudents,
  getTeacherClasses
};

const prisma = require('../utils/prisma');
const { AppError } = require('../utils/AppError');
const { checkTeacherLimit } = require('../services/planLimitService');
const { hashPassword } = require('../services/authService');

const getAll = async (institutionId) => {
  return await prisma.teacher.findMany({
    where: { institutionId: parseInt(institutionId, 10) },
    include: {
      user: { select: { email: true, role: true, active: true } },
      teacherClassSubjects: {
        include: {
          class: true,
          subject: true
        }
      }
    },
    orderBy: { name: 'asc' }
  });
};

const getById = async (institutionId, id) => {
  const t = await prisma.teacher.findFirst({
    where: { id: parseInt(id, 10), institutionId: parseInt(institutionId, 10) },
    include: {
      user: { select: { email: true, active: true } }
    }
  });
  if (!t) throw new AppError('Professor não encontrado', 404);
  return t;
};

const create = async (institutionId, data) => {
  const instId = parseInt(institutionId, 10);
  await checkTeacherLimit(instId);

  const existingUser = await prisma.user.findFirst({
    where: { email: data.email }
  });
  if (existingUser) throw new AppError('E-mail já está em uso', 400);

  // Gera uma senha aleatória de 6 dígitos (ex: "482910")
  const generatedPassword = Math.floor(100000 + Math.random() * 900000).toString();
  const hashedPassword = await hashPassword(generatedPassword);

  return await prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: {
        institutionId: instId,
        name: data.name,
        email: data.email,
        password: hashedPassword,
        role: 'TEACHER',
        active: true,
        forcePasswordChange: true // Obriga o professor a trocar no primeiro login
      }
    });

    const newTeacher = await tx.teacher.create({
      data: {
        institutionId: instId,
        userId: user.id,
        name: data.name,
        identification: data.identification,
        active: true
      },
      include: {
        user: { select: { email: true } }
      }
    });

    // Retorna o professor criado com a senha gerada para exibir no Front-end
    return { ...newTeacher, generatedPassword };
  });
};

const update = async (institutionId, id, data) => {
  const teacher = await getById(institutionId, id);

  return await prisma.$transaction(async (tx) => {
    if (data.name !== undefined || data.active !== undefined) {
      await tx.user.update({
        where: { id: teacher.userId },
        data: {
          name: data.name !== undefined ? data.name : undefined,
          active: data.active !== undefined ? data.active : undefined
        }
      });
    }

    return await tx.teacher.update({
      where: { id: parseInt(id, 10) },
      data: {
        name: data.name,
        identification: data.identification,
        active: data.active
      },
      include: {
        user: { select: { email: true, active: true } }
      }
    });
  });
};

const remove = async (institutionId, id) => {
  const teacher = await getById(institutionId, id);
  
  const linksCount = await prisma.teacherClassSubject.count({
    where: { teacherId: parseInt(id, 10) }
  });

  if (linksCount > 0) {
    throw new AppError('Não é possível excluir um professor que possui disciplinas vinculadas', 400);
  }

  return await prisma.$transaction(async (tx) => {
    await tx.teacher.delete({ where: { id: parseInt(id, 10) } });
    await tx.user.delete({ where: { id: teacher.userId } });
  });
};

module.exports = {
  getAll, getById, create, update, remove
};
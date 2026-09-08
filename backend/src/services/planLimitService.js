const prisma = require('../utils/prisma');
const { AppError } = require('../utils/AppError');

async function checkStudentLimit(institutionId) {
  const sub = await prisma.subscription.findFirst({
    where: { institutionId },
    orderBy: { createdAt: 'desc' },
    include: { plan: true }
  });

  if (!sub) throw new AppError('Assinatura não encontrada.', 404);

  const count = await prisma.student.count({ where: { institutionId, status: 'ACTIVE' } });
  
  if (count >= sub.plan.studentLimit) {
    throw new AppError(`Limite de alunos atingido (${sub.plan.studentLimit}). Sugerimos um upgrade de plano.`, 403);
  }
}

async function checkTeacherLimit(institutionId) {
  const sub = await prisma.subscription.findFirst({
    where: { institutionId },
    orderBy: { createdAt: 'desc' },
    include: { plan: true }
  });

  if (!sub) throw new AppError('Assinatura não encontrada.', 404);

  const count = await prisma.teacher.count({ where: { institutionId, active: true } });
  
  if (count >= sub.plan.teacherLimit) {
    throw new AppError(`Limite de professores atingido (${sub.plan.teacherLimit}). Sugerimos um upgrade de plano.`, 403);
  }
}

async function checkClassLimit(institutionId) {
  const sub = await prisma.subscription.findFirst({
    where: { institutionId },
    orderBy: { createdAt: 'desc' },
    include: { plan: true }
  });

  if (!sub) throw new AppError('Assinatura não encontrada.', 404);

  const count = await prisma.class.count({ where: { institutionId, active: true } });
  
  if (count >= sub.plan.classLimit) {
    throw new AppError(`Limite de turmas atingido (${sub.plan.classLimit}). Sugerimos um upgrade de plano.`, 403);
  }
}

module.exports = {
  checkStudentLimit,
  checkTeacherLimit,
  checkClassLimit
};

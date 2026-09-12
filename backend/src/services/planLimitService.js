const prisma = require('../utils/prisma');
const { AppError } = require('../utils/AppError');

// Função auxiliar para verificar se a instituição é pública
async function checkInstitutionPublic(institutionId) {
  const institution = await prisma.institution.findUnique({
    where: { id: parseInt(institutionId, 10) },
    select: { type: true }
  });
  return institution?.type === 'PUBLIC';
}

async function checkStudentLimit(institutionId) {
  const isPublic = await checkInstitutionPublic(institutionId);
  if (isPublic) return; // Escolas públicas não passam por restrições de planos comerciais

  const sub = await prisma.subscription.findFirst({
    where: { institutionId: parseInt(institutionId, 10) },
    orderBy: { createdAt: 'desc' },
    include: { plan: true }
  });

  if (!sub) throw new AppError('Assinatura não encontrada.', 404);

  const count = await prisma.student.count({ where: { institutionId: parseInt(institutionId, 10), status: 'ACTIVE' } });
  
  if (count >= sub.plan.studentLimit) {
    throw new AppError(`Limite de alunos atingido (${sub.plan.studentLimit}). Sugerimos um upgrade de plano.`, 403);
  }
}

async function checkTeacherLimit(institutionId) {
  const isPublic = await checkInstitutionPublic(institutionId);
  if (isPublic) return;

  const sub = await prisma.subscription.findFirst({
    where: { institutionId: parseInt(institutionId, 10) },
    orderBy: { createdAt: 'desc' },
    include: { plan: true }
  });

  if (!sub) throw new AppError('Assinatura não encontrada.', 404);

  const count = await prisma.teacher.count({ where: { institutionId: parseInt(institutionId, 10), active: true } });
  
  if (count >= sub.plan.teacherLimit) {
    throw new AppError(`Limite de professores atingido (${sub.plan.teacherLimit}). Sugerimos um upgrade de plano.`, 403);
  }
}

async function checkClassLimit(institutionId) {
  const isPublic = await checkInstitutionPublic(institutionId);
  if (isPublic) return;

  const sub = await prisma.subscription.findFirst({
    where: { institutionId: parseInt(institutionId, 10) },
    orderBy: { createdAt: 'desc' },
    include: { plan: true }
  });

  if (!sub) throw new AppError('Assinatura não encontrada.', 404);

  const count = await prisma.class.count({ where: { institutionId: parseInt(institutionId, 10), active: true } });
  
  if (count >= sub.plan.classLimit) {
    throw new AppError(`Limite de turmas atingido (${sub.plan.classLimit}). Sugerimos um upgrade de plano.`, 403);
  }
}

module.exports = {
  checkStudentLimit,
  checkTeacherLimit,
  checkClassLimit
};
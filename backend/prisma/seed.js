const { PrismaClient } = require('@prisma/client');
const { hashPassword } = require('../src/services/authService'); // Puxa seu serviço de senha
const prisma = new PrismaClient();

async function main() {
  console.log('🔄 Iniciando reset completo do banco de dados Matrix...');

  // 1. Apagar tudo na ordem correta (de baixo para cima nas relações)
  console.log('🧹 Limpando dados antigos (Isso pode levar alguns segundos)...');
  
  await prisma.occurrence.deleteMany();
  await prisma.attendance.deleteMany();
  await prisma.grade.deleteMany();
  await prisma.assessment.deleteMany();
  await prisma.lesson.deleteMany();
  await prisma.teacherClassSubject.deleteMany();
  await prisma.studentObservation.deleteMany();
  await prisma.academicPeriod.deleteMany();
  await prisma.academicSetting.deleteMany();
  
  await prisma.student.deleteMany();
  await prisma.teacher.deleteMany();
  
  await prisma.subject.deleteMany();
  await prisma.class.deleteMany();
  
  await prisma.subscription.deleteMany();
  await prisma.user.deleteMany();
  await prisma.institution.deleteMany();
  await prisma.network.deleteMany();
  await prisma.plan.deleteMany();

  // 2. Recriar a conta da Diretoria (Super Admin)
  console.log('👑 Recriando conta da Diretoria (SuperAdmin)...');
  const hashedPassword = await hashPassword('123456'); // A senha inicial será 123456
  
  await prisma.user.create({
    data: {
      name: 'Diretoria Educação Matrix',
      email: 'mestre@educacaomatrix.com.br', // O e-mail que você definiu no AppRoutes
      password: hashedPassword,
      role: 'ADMIN',
      active: true,
      forcePasswordChange: false
    }
  });

  // 3. Recriar o Plano Padrão (Obrigatório para o fluxo B2G funcionar)
  console.log('📦 Criando Plano Base Ilimitado...');
  await prisma.plan.create({
    data: {
      name: 'Plano B2G Ilimitado',
      price: 0,
      studentLimit: 99999,
      teacherLimit: 9999,
      classLimit: 9999,
      active: true
    }
  });

  console.log('✅ SUCESSO! Banco de dados zerado e pronto para o teste final em produção.');
}

main()
  .catch((e) => {
    console.error('❌ Erro ao resetar o banco:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
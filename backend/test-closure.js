const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { checkPeriodClosed } = require('./src/utils/academicService');

async function runTest() {
  try {
    console.log('--- TESTE DE ISOLAMENTO E BLOQUEIO ---');
    // 1. Achar o período A1 (Instituição A, Fechado)
    const periodA1 = await prisma.academicPeriod.findFirst({ where: { institutionId: 1, number: 1 } });
    console.log('Período A1 (Fechado):', periodA1.name, '| isClosed:', periodA1.isClosed);
    
    // Tentar acessar com instituição errada
    try {
      await checkPeriodClosed(periodA1.id, 999);
      console.log('FALHA: Acesso permitido para instituição incorreta!');
    } catch(err) {
      console.log('SUCESSO: Acesso bloqueado por instituição incorreta (Multi-tenant) ->', err.message);
    }
    
    // Tentar acessar com instituição certa, mas período fechado
    try {
      await checkPeriodClosed(periodA1.id, 1);
      console.log('FALHA: Acesso permitido em período fechado!');
    } catch(err) {
      console.log('SUCESSO: Acesso bloqueado por período fechado ->', err.message);
    }

    // 2. Achar o período A2 (Instituição A, Aberto)
    const periodA2 = await prisma.academicPeriod.findFirst({ where: { institutionId: 1, number: 2 } });
    console.log('\nPeríodo A2 (Aberto):', periodA2.name, '| isClosed:', periodA2.isClosed);
    
    // Acessar período aberto
    try {
      await checkPeriodClosed(periodA2.id, 1);
      console.log('SUCESSO: Acesso liberado para edição em período aberto.');
    } catch(err) {
      console.log('FALHA: Acesso bloqueado incorretamente!', err);
    }

  } catch(e) { console.error(e); }
  finally { await prisma.$disconnect(); }
}
runTest();

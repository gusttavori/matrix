const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed do Educação Matrix...\n');

  // ==================== PLANOS ====================
  console.log('📋 Criando planos...');

  const planBasico = await prisma.plan.upsert({
    where: { id: 1 },
    update: {},
    create: {
      name: 'Básico',
      description: 'Ideal para escolas pequenas. Inclui caderneta digital, gestão de alunos e frequência.',
      price: 99.90,
      studentLimit: 50,
      teacherLimit: 10,
      classLimit: 5,
      active: true
    }
  });

  const planProfissional = await prisma.plan.upsert({
    where: { id: 2 },
    update: {},
    create: {
      name: 'Profissional',
      description: 'Para escolas em crescimento. Inclui relatórios avançados, boletins e acompanhamento acadêmico.',
      price: 199.90,
      studentLimit: 200,
      teacherLimit: 30,
      classLimit: 20,
      active: true
    }
  });

  const planEnterprise = await prisma.plan.upsert({
    where: { id: 3 },
    update: {},
    create: {
      name: 'Enterprise',
      description: 'Para grandes instituições. Limites ampliados, configurações avançadas e suporte prioritário.',
      price: 399.90,
      studentLimit: 500,
      teacherLimit: 100,
      classLimit: 50,
      active: true
    }
  });

  console.log('   ✅ Planos criados\n');

  // ==================== SUPER ADMIN (MASTER) ====================
  console.log('👑 Criando Super Administrador (Master)...');

  const masterInstitution = await prisma.institution.upsert({
    where: { id: 999 },
    update: {},
    create: {
      name: 'Educação Matrix - Gestão do Sistema',
      tradeName: 'Matrix Admin',
      document: '00.000.000/0000-00',
      email: 'contato@educacaomatrix.com.br',
      active: true
    }
  });

  const masterPassword = await bcrypt.hash('Matrix@Admin2026', 10);

  const masterAdmin = await prisma.user.upsert({
    where: { id: 999 },
    update: {},
    create: {
      id: 999,
      institutionId: masterInstitution.id,
      name: 'Diretoria Matrix',
      email: 'mestre@educacaomatrix.com.br',
      password: masterPassword,
      role: 'ADMIN',
      active: true
    }
  });

  console.log('   ✅ Super Admin criado\n');

  // ==================== INSTITUIÇÃO A ====================
  console.log('🏫 Criando Instituição A - Escola Exemplo...');

  const institutionA = await prisma.institution.upsert({
    where: { id: 1 },
    update: {},
    create: {
      name: 'Escola Exemplo LTDA',
      tradeName: 'Escola Exemplo',
      document: '12.345.678/0001-90',
      email: 'contato@escolaexemplo.com.br',
      phone: '(11) 98765-4321',
      address: 'Rua das Flores, 123',
      city: 'São Paulo',
      state: 'SP',
      active: true
    }
  });

  // Assinatura Instituição A
  await prisma.subscription.upsert({
    where: { id: 1 },
    update: {},
    create: {
      institutionId: institutionA.id,
      planId: planProfissional.id,
      status: 'ACTIVE',
      startDate: new Date('2026-01-01'),
      endDate: new Date('2027-01-01')
    }
  });

  // Configurações Acadêmicas Instituição A
  await prisma.academicSetting.upsert({
    where: { id: 1 },
    update: {},
    create: {
      institutionId: institutionA.id,
      schoolYear: 2026,
      bimestersCount: 4,
      pointsPerPeriod: 25,
      minAverage: 6,
      minAttendance: 75
    }
  });

  // Períodos Letivos Instituição A (2026)
  const periodA1 = await prisma.academicPeriod.upsert({
    where: { id: 1 },
    update: {},
    create: {
      institutionId: institutionA.id,
      schoolYear: 2026,
      name: '1º Bimestre',
      number: 1,
      startDate: new Date('2026-02-01'),
      endDate: new Date('2026-04-15'),
      isClosed: true,
      closedAt: new Date('2026-04-20'),
      closedBy: 1
    }
  });

  const periodA2 = await prisma.academicPeriod.upsert({
    where: { id: 2 },
    update: {},
    create: {
      institutionId: institutionA.id,
      schoolYear: 2026,
      name: '2º Bimestre',
      number: 2,
      startDate: new Date('2026-04-16'),
      endDate: new Date('2026-06-30'),
      isClosed: false
    }
  });

  const passwordHash = await bcrypt.hash('123456', 10);

  // Admin da Instituição A
  const adminA = await prisma.user.upsert({
    where: { id: 1 },
    update: {},
    create: {
      institutionId: institutionA.id,
      name: 'Carlos Administrador',
      email: 'admin@escolaexemplo.com.br',
      password: passwordHash,
      role: 'ADMIN',
      active: true
    }
  });

  // Secretaria da Instituição A
  const secretaryA = await prisma.user.upsert({
    where: { id: 2 },
    update: {},
    create: {
      institutionId: institutionA.id,
      name: 'Maria Secretária',
      email: 'secretaria@escolaexemplo.com.br',
      password: passwordHash,
      role: 'SECRETARY',
      active: true
    }
  });

  // Professores da Instituição A
  const teacherUserA1 = await prisma.user.upsert({
    where: { id: 3 },
    update: {},
    create: {
      institutionId: institutionA.id,
      name: 'Prof. João Silva',
      email: 'joao@escolaexemplo.com.br',
      password: passwordHash,
      role: 'TEACHER',
      active: true
    }
  });

  const teacherUserA2 = await prisma.user.upsert({
    where: { id: 4 },
    update: {},
    create: {
      institutionId: institutionA.id,
      name: 'Prof. Ana Oliveira',
      email: 'ana@escolaexemplo.com.br',
      password: passwordHash,
      role: 'TEACHER',
      active: true
    }
  });

  const teacherA1 = await prisma.teacher.upsert({
    where: { id: 1 },
    update: {},
    create: {
      institutionId: institutionA.id,
      userId: teacherUserA1.id,
      name: 'Prof. João Silva',
      identification: 'PROF-001',
      active: true
    }
  });

  const teacherA2 = await prisma.teacher.upsert({
    where: { id: 2 },
    update: {},
    create: {
      institutionId: institutionA.id,
      userId: teacherUserA2.id,
      name: 'Prof. Ana Oliveira',
      identification: 'PROF-002',
      active: true
    }
  });

  // Turmas da Instituição A
  const classA1 = await prisma.class.upsert({
    where: { id: 1 },
    update: {},
    create: {
      institutionId: institutionA.id,
      name: '6º Ano A',
      grade: '6º Ano',
      shift: 'Manhã',
      schoolYear: 2026,
      active: true
    }
  });

  const classA2 = await prisma.class.upsert({
    where: { id: 2 },
    update: {},
    create: {
      institutionId: institutionA.id,
      name: '7º Ano A',
      grade: '7º Ano',
      shift: 'Manhã',
      schoolYear: 2026,
      active: true
    }
  });

  // Disciplinas da Instituição A
  const subjectA1 = await prisma.subject.upsert({
    where: { id: 1 },
    update: {},
    create: {
      institutionId: institutionA.id,
      name: 'Matemática',
      grade: '6º Ano',
      active: true
    }
  });

  const subjectA2 = await prisma.subject.upsert({
    where: { id: 2 },
    update: {},
    create: {
      institutionId: institutionA.id,
      name: 'Português',
      grade: '6º Ano',
      active: true
    }
  });

  const subjectA3 = await prisma.subject.upsert({
    where: { id: 3 },
    update: {},
    create: {
      institutionId: institutionA.id,
      name: 'Ciências',
      grade: '7º Ano',
      active: true
    }
  });

  const subjectA4 = await prisma.subject.upsert({
    where: { id: 4 },
    update: {},
    create: {
      institutionId: institutionA.id,
      name: 'História',
      grade: '7º Ano',
      active: true
    }
  });

  // Vínculos Professor-Turma-Disciplina (Instituição A)
  await prisma.teacherClassSubject.upsert({
    where: { id: 1 },
    update: {},
    create: {
      institutionId: institutionA.id,
      teacherId: teacherA1.id,
      classId: classA1.id,
      subjectId: subjectA1.id
    }
  });

  await prisma.teacherClassSubject.upsert({
    where: { id: 2 },
    update: {},
    create: {
      institutionId: institutionA.id,
      teacherId: teacherA1.id,
      classId: classA2.id,
      subjectId: subjectA3.id
    }
  });

  await prisma.teacherClassSubject.upsert({
    where: { id: 3 },
    update: {},
    create: {
      institutionId: institutionA.id,
      teacherId: teacherA2.id,
      classId: classA1.id,
      subjectId: subjectA2.id
    }
  });

  await prisma.teacherClassSubject.upsert({
    where: { id: 4 },
    update: {},
    create: {
      institutionId: institutionA.id,
      teacherId: teacherA2.id,
      classId: classA2.id,
      subjectId: subjectA4.id
    }
  });

  // Alunos da Instituição A (6º Ano A)
  const studentsA_class1 = [];
  const studentNamesA1 = [
    'Lucas Mendes', 'Beatriz Santos', 'Pedro Almeida', 'Julia Costa',
    'Gabriel Ferreira', 'Mariana Lima', 'Rafael Souza', 'Camila Rodrigues'
  ];

  for (let i = 0; i < studentNamesA1.length; i++) {
    const studentUser = await prisma.user.upsert({
      where: { id: 10 + i },
      update: {},
      create: {
        institutionId: institutionA.id,
        name: studentNamesA1[i],
        email: `aluno${i + 1}@escolaexemplo.com.br`,
        password: passwordHash,
        role: 'STUDENT',
        active: true
      }
    });

    const student = await prisma.student.upsert({
      where: { id: i + 1 },
      update: {},
      create: {
        institutionId: institutionA.id,
        userId: studentUser.id,
        name: studentNamesA1[i],
        enrollment: `2026${String(i + 1).padStart(4, '0')}`,
        birthDate: new Date(2014, i % 12, (i + 1) * 2),
        classId: classA1.id,
        shift: 'Manhã',
        status: 'ACTIVE'
      }
    });
    studentsA_class1.push(student);
  }

  // Alunos da Instituição A (7º Ano A)
  const studentsA_class2 = [];
  const studentNamesA2 = [
    'Fernando Martins', 'Isabela Ribeiro', 'Thiago Pereira', 'Larissa Gomes',
    'Matheus Nascimento', 'Amanda Barbosa'
  ];

  for (let i = 0; i < studentNamesA2.length; i++) {
    const idx = studentNamesA1.length + i;
    const studentUser = await prisma.user.upsert({
      where: { id: 10 + idx },
      update: {},
      create: {
        institutionId: institutionA.id,
        name: studentNamesA2[i],
        email: `aluno${idx + 1}@escolaexemplo.com.br`,
        password: passwordHash,
        role: 'STUDENT',
        active: true
      }
    });

    const student = await prisma.student.upsert({
      where: { id: idx + 1 },
      update: {},
      create: {
        institutionId: institutionA.id,
        userId: studentUser.id,
        name: studentNamesA2[i],
        enrollment: `2026${String(idx + 1).padStart(4, '0')}`,
        birthDate: new Date(2013, i % 12, (i + 1) * 3),
        classId: classA2.id,
        shift: 'Manhã',
        status: 'ACTIVE'
      }
    });
    studentsA_class2.push(student);
  }

  // Avaliações da Instituição A
  const assessmentA1 = await prisma.assessment.upsert({
    where: { id: 1 },
    update: {},
    create: {
      institutionId: institutionA.id,
      name: 'Prova 1 - Matemática',
      description: 'Primeira avaliação bimestral de Matemática',
      periodId: periodA1.id,
      classId: classA1.id,
      subjectId: subjectA1.id,
      teacherId: teacherA1.id,
      date: new Date('2026-03-15'),
      maxGrade: 10
    }
  });

  const assessmentA2 = await prisma.assessment.upsert({
    where: { id: 2 },
    update: {},
    create: {
      institutionId: institutionA.id,
      name: 'Trabalho 1 - Matemática',
      description: 'Primeiro trabalho de Matemática',
      periodId: periodA1.id,
      classId: classA1.id,
      subjectId: subjectA1.id,
      teacherId: teacherA1.id,
      date: new Date('2026-03-20'),
      maxGrade: 10
    }
  });

  const assessmentA3 = await prisma.assessment.upsert({
    where: { id: 3 },
    update: {},
    create: {
      institutionId: institutionA.id,
      name: 'Prova 1 - Português',
      description: 'Primeira avaliação bimestral de Português',
      periodId: periodA1.id,
      classId: classA1.id,
      subjectId: subjectA2.id,
      teacherId: teacherA2.id,
      date: new Date('2026-03-18'),
      maxGrade: 10
    }
  });

  // Notas dos alunos do 6º Ano A
  const gradeValues = [8.5, 7.0, 9.0, 6.5, 7.5, 8.0, 5.5, 9.5];

  for (let i = 0; i < studentsA_class1.length; i++) {
    await prisma.grade.upsert({
      where: { id: i * 3 + 1 },
      update: {},
      create: {
        institutionId: institutionA.id,
        studentId: studentsA_class1[i].id,
        assessmentId: assessmentA1.id,
        teacherId: teacherA1.id,
        value: gradeValues[i]
      }
    });

    await prisma.grade.upsert({
      where: { id: i * 3 + 2 },
      update: {},
      create: {
        institutionId: institutionA.id,
        studentId: studentsA_class1[i].id,
        assessmentId: assessmentA2.id,
        teacherId: teacherA1.id,
        value: gradeValues[(i + 2) % gradeValues.length]
      }
    });

    await prisma.grade.upsert({
      where: { id: i * 3 + 3 },
      update: {},
      create: {
        institutionId: institutionA.id,
        studentId: studentsA_class1[i].id,
        assessmentId: assessmentA3.id,
        teacherId: teacherA2.id,
        value: gradeValues[(i + 4) % gradeValues.length]
      }
    });
  }

  // Aulas (Lessons) e Frequências do 6º Ano A
  const lessonDates = [
    new Date('2026-08-25'),
    new Date('2026-08-26'),
    new Date('2026-08-27'),
    new Date('2026-08-28'),
    new Date('2026-08-29')
  ];

  let lessonIdCount = 1;
  let attendanceId = 1;

  for (const date of lessonDates) {
    // Matemática
    const lessonMath = await prisma.lesson.upsert({
      where: { id: lessonIdCount },
      update: {},
      create: {
        institutionId: institutionA.id,
        teacherId: teacherA1.id,
        classId: classA1.id,
        subjectId: subjectA1.id,
        periodId: periodA2.id,
        date: date,
        title: 'Aula de Matemática',
        description: 'Conteúdo programático de Matemática.',
      }
    });
    lessonIdCount++;

    for (let i = 0; i < studentsA_class1.length; i++) {
      let status = 'PRESENT';
      if (i === 2 && date.getDate() === 26) status = 'ABSENT';
      if (i === 5 && date.getDate() === 28) status = 'JUSTIFIED';
      if (i === 6 && date.getDate() === 25) status = 'ABSENT';
      if (i === 6 && date.getDate() === 27) status = 'ABSENT';

      await prisma.attendance.upsert({
        where: { id: attendanceId },
        update: {},
        create: {
          institutionId: institutionA.id,
          studentId: studentsA_class1[i].id,
          lessonId: lessonMath.id,
          classId: classA1.id,
          subjectId: subjectA1.id,
          teacherId: teacherA1.id,
          status: status
        }
      });
      attendanceId++;
    }
  }

  // Observações de alunos
  await prisma.studentObservation.upsert({
    where: { id: 1 },
    update: {},
    create: {
      institutionId: institutionA.id,
      studentId: studentsA_class1[6].id,
      teacherId: teacherA1.id,
      content: 'Aluno apresenta dificuldade em manter atenção durante as aulas. Sugerir acompanhamento pedagógico.',
      date: new Date('2026-08-27')
    }
  });

  await prisma.studentObservation.upsert({
    where: { id: 2 },
    update: {},
    create: {
      institutionId: institutionA.id,
      studentId: studentsA_class1[0].id,
      teacherId: teacherA1.id,
      content: 'Excelente desempenho. Participação ativa e ajuda os colegas com dificuldade.',
      date: new Date('2026-08-28')
    }
  });

  console.log('   ✅ Instituição A criada com todos os dados\n');

  // ==================== INSTITUIÇÃO B ====================
  console.log('🏫 Criando Instituição B - Colégio Progresso...');

  const institutionB = await prisma.institution.upsert({
    where: { id: 2 },
    update: {},
    create: {
      name: 'Colégio Progresso EIRELI',
      tradeName: 'Colégio Progresso',
      document: '98.765.432/0001-10',
      email: 'contato@colegioprogresso.com.br',
      phone: '(21) 91234-5678',
      address: 'Av. Brasil, 456',
      city: 'Rio de Janeiro',
      state: 'RJ',
      active: true
    }
  });

  // Assinatura Instituição B
  await prisma.subscription.upsert({
    where: { id: 2 },
    update: {},
    create: {
      institutionId: institutionB.id,
      planId: planBasico.id,
      status: 'ACTIVE',
      startDate: new Date('2026-03-01'),
      endDate: new Date('2027-03-01')
    }
  });

  // Admin da Instituição B
  await prisma.user.upsert({
    where: { id: 50 },
    update: {},
    create: {
      institutionId: institutionB.id,
      name: 'Roberto Diretor',
      email: 'admin@colegioprogresso.com.br',
      password: passwordHash,
      role: 'ADMIN',
      active: true
    }
  });

  // Secretaria da Instituição B
  await prisma.user.upsert({
    where: { id: 51 },
    update: {},
    create: {
      institutionId: institutionB.id,
      name: 'Fernanda Secretária',
      email: 'secretaria@colegioprogresso.com.br',
      password: passwordHash,
      role: 'SECRETARY',
      active: true
    }
  });

  // Professor da Instituição B
  const teacherUserB1 = await prisma.user.upsert({
    where: { id: 52 },
    update: {},
    create: {
      institutionId: institutionB.id,
      name: 'Prof. Clara Nascimento',
      email: 'clara@colegioprogresso.com.br',
      password: passwordHash,
      role: 'TEACHER',
      active: true
    }
  });

  const teacherB1 = await prisma.teacher.upsert({
    where: { id: 10 },
    update: {},
    create: {
      institutionId: institutionB.id,
      userId: teacherUserB1.id,
      name: 'Prof. Clara Nascimento',
      identification: 'PROF-001',
      active: true
    }
  });

  // Turma da Instituição B
  const classB1 = await prisma.class.upsert({
    where: { id: 10 },
    update: {},
    create: {
      institutionId: institutionB.id,
      name: '1º Ano A',
      grade: '1º Ano EM',
      shift: 'Manhã',
      schoolYear: 2026,
      active: true
    }
  });

  // Disciplina da Instituição B
  const subjectB1 = await prisma.subject.upsert({
    where: { id: 10 },
    update: {},
    create: {
      institutionId: institutionB.id,
      name: 'Biologia',
      grade: '1º Ano EM',
      active: true
    }
  });

  // Vínculo da Instituição B
  await prisma.teacherClassSubject.upsert({
    where: { id: 10 },
    update: {},
    create: {
      institutionId: institutionB.id,
      teacherId: teacherB1.id,
      classId: classB1.id,
      subjectId: subjectB1.id
    }
  });

  // Alunos da Instituição B
  const studentNamesB = [
    'Diego Alves', 'Patrícia Silva', 'Vinícius Costa', 'Bruna Fernandes'
  ];

  for (let i = 0; i < studentNamesB.length; i++) {
    const studentUser = await prisma.user.upsert({
      where: { id: 60 + i },
      update: {},
      create: {
        institutionId: institutionB.id,
        name: studentNamesB[i],
        email: `aluno${i + 1}@colegioprogresso.com.br`,
        password: passwordHash,
        role: 'STUDENT',
        active: true
      }
    });

    await prisma.student.upsert({
      where: { id: 20 + i },
      update: {},
      create: {
        institutionId: institutionB.id,
        userId: studentUser.id,
        name: studentNamesB[i],
        enrollment: `CP2026${String(i + 1).padStart(4, '0')}`,
        birthDate: new Date(2010, i + 2, (i + 1) * 5),
        classId: classB1.id,
        shift: 'Manhã',
        status: 'ACTIVE'
      }
    });
  }

  console.log('   ✅ Instituição B criada com todos os dados\n');

  // ==================== RESUMO ====================
  console.log('========================================');
  console.log('✅ Seed concluído com sucesso!');
  console.log('========================================\n');
  console.log('📊 Resumo:');
  console.log('   Planos: 3 (Básico, Profissional, Enterprise)');
  console.log('   Instituições: 2');
  console.log('');
  console.log('👑 Super Administrador Matrix:');
  console.log('   Login: mestre@educacaomatrix.com.br');
  console.log('   Senha: Matrix@Admin2026');
  console.log('');
  console.log('🏫 Escola Exemplo (Instituição A):');
  console.log('   Admin: admin@escolaexemplo.com.br');
  console.log('   Secretaria: secretaria@escolaexemplo.com.br');
  console.log('   Professor: joao@escolaexemplo.com.br');
  console.log('   Professor: ana@escolaexemplo.com.br');
  console.log('   Aluno: aluno1@escolaexemplo.com.br');
  console.log('   Turmas: 2 | Disciplinas: 4 | Alunos: 14');
  console.log('');
  console.log('🏫 Colégio Progresso (Instituição B):');
  console.log('   Admin: admin@colegioprogresso.com.br');
  console.log('   Secretaria: secretaria@colegioprogresso.com.br');
  console.log('   Professor: clara@colegioprogresso.com.br');
  console.log('   Aluno: aluno1@colegioprogresso.com.br');
  console.log('   Turmas: 1 | Disciplinas: 1 | Alunos: 4');
  console.log('');
  console.log('🔑 Senha padrão (exceto Super Admin): 123456');
}

main()
  .catch((e) => {
    console.error('❌ Erro no seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
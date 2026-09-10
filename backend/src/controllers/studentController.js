const prisma = require('../utils/prisma');
const xlsx = require('xlsx');
const { AppError } = require('../utils/AppError');
const { checkStudentLimit } = require('../services/planLimitService');
const { hashPassword } = require('../services/authService');

const getAll = async (institutionId) => {
  return await prisma.student.findMany({
    where: { institutionId },
    include: {
      user: { select: { email: true, active: true } },
      class: { select: { name: true, grade: true } }
    },
    orderBy: { name: 'asc' }
  });
};

const getById = async (institutionId, id) => {
  const s = await prisma.student.findFirst({
    where: { id: parseInt(id), institutionId },
    include: {
      user: { select: { email: true, active: true } },
      class: true
    }
  });
  if (!s) throw new AppError('Aluno não encontrado', 404);
  return s;
};

const create = async (institutionId, data) => {
  await checkStudentLimit(institutionId);

  if (data.classId) {
    const classExists = await prisma.class.findFirst({
      where: { id: data.classId, institutionId }
    });
    if (!classExists) throw new AppError('Turma não encontrada', 404);
  }

  const existingUser = await prisma.user.findFirst({
    where: { email: data.email }
  });
  if (existingUser) throw new AppError('E-mail já está em uso', 400);

  const hashedPassword = await hashPassword('123456');

  return await prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: {
        institutionId,
        name: data.name,
        email: data.email,
        password: hashedPassword,
        role: 'STUDENT',
        active: true
      }
    });

    return await tx.student.create({
      data: {
        institutionId,
        userId: user.id,
        name: data.name,
        enrollment: data.enrollment,
        birthDate: data.birthDate,
        classId: data.classId,
        shift: data.shift,
        status: 'ACTIVE'
      },
      include: {
        user: { select: { email: true } },
        class: { select: { name: true } }
      }
    });
  });
};

const update = async (institutionId, id, data) => {
  const student = await getById(institutionId, id);

  if (data.classId) {
    const classExists = await prisma.class.findFirst({
      where: { id: data.classId, institutionId }
    });
    if (!classExists) throw new AppError('Turma não encontrada', 404);
  }

  return await prisma.$transaction(async (tx) => {
    if (data.name !== undefined || data.status !== undefined) {
      const activeStatus = data.status ? data.status === 'ACTIVE' : undefined;
      await tx.user.update({
        where: { id: student.userId },
        data: {
          name: data.name !== undefined ? data.name : undefined,
          active: activeStatus !== undefined ? activeStatus : undefined
        }
      });
    }

    return await tx.student.update({
      where: { id: parseInt(id) },
      data: {
        name: data.name,
        enrollment: data.enrollment,
        birthDate: data.birthDate,
        classId: data.classId,
        shift: data.shift,
        status: data.status
      },
      include: {
        user: { select: { email: true, active: true } },
        class: { select: { name: true } }
      }
    });
  });
};

const remove = async (institutionId, id) => {
  const student = await getById(institutionId, id);
  
  const attendanceCount = await prisma.attendance.count({ where: { studentId: parseInt(id) } });
  const gradesCount = await prisma.grade.count({ where: { studentId: parseInt(id) } });

  if (attendanceCount > 0 || gradesCount > 0) {
    throw new AppError('Não é possível excluir um aluno que possui registros de notas ou faltas', 400);
  }

  return await prisma.$transaction(async (tx) => {
    await tx.student.delete({ where: { id: parseInt(id) } });
    await tx.user.delete({ where: { id: student.userId } });
  });
};

// NOVA FUNÇÃO: Importação em lote via Excel (Upload direto para a memória)
const importStudents = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Nenhum arquivo de planilha foi enviado.' });
    }

    // A instituição logada é passada pelo tenantMiddleware
    const institutionId = req.institutionId; 
    
    // Processamento do buffer usando XLSX
    const workbook = xlsx.read(req.file.buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0]; // Lê a primeira aba da planilha
    const rawData = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);

    if (!rawData || rawData.length === 0) {
      return res.status(400).json({ success: false, message: 'A planilha está vazia ou os dados são inválidos.' });
    }

    // Conversão das linhas para o modelo do banco de dados (ignorando duplicações)
    const studentsToInsert = rawData.map(row => ({
      institutionId: institutionId,
      // Suporta flexibilidade no cabeçalho (NOME, Nome, nome)
      name: row['NOME'] || row['Nome'] || row['nome'] || 'Aluno Sem Nome',
      enrollment: String(row['MATRICULA'] || row['Matrícula'] || row['matricula'] || Math.floor(Math.random() * 1000000)),
      shift: row['TURNO'] || row['Turno'] || 'Matutino',
      status: 'ACTIVE'
    }));

    // Inserção Otimizada
    const result = await prisma.student.createMany({
      data: studentsToInsert,
      skipDuplicates: true, // Crucial: Evita travamento se houver matrículas iguais
    });

    return res.status(200).json({
      success: true,
      message: `${result.count} alunos foram importados com sucesso!`,
    });
  } catch (error) {
    console.error('Erro na importação de alunos:', error);
    return res.status(500).json({ success: false, message: 'Falha ao processar a planilha. Verifique o formato do arquivo.' });
  }
};

module.exports = {
  getAll, getById, create, update, remove, importStudents
};
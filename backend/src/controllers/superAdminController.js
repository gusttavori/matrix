const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.getMetrics = async (req, res, next) => {
  try {
    // Busca os dados injetados pelo authMiddleware
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({ success: false, message: 'Usuário não autenticado.' });
    }

    // Busca o usuário no banco para validação definitiva de segurança
    const currentUser = await prisma.user.findUnique({
      where: { id: Number(userId) }
    });

    // Trava de segurança: Checa o e-mail do dono da plataforma (igual ao Front-end)
    if (!currentUser || currentUser.email !== 'mestre@educacaomatrix.com.br') {
      return res.status(403).json({ success: false, message: 'Acesso negado. Apenas Diretoria Matrix.' });
    }

    const masterInstitutionId = currentUser.institutionId;

    // 1. Conta escolas ativas (excluindo a própria Diretoria Matrix)
    const institutionsCount = await prisma.institution.count({
      where: { id: { not: masterInstitutionId }, active: true }
    });

    // 2. Conta volume total de usuários na plataforma
    const studentsCount = await prisma.student.count();
    const teachersCount = await prisma.teacher.count();

    // 3. Calcula o MRR (Receita Recorrente Mensal)
    const activeSubscriptions = await prisma.subscription.findMany({
      where: { status: 'ACTIVE', institutionId: { not: masterInstitutionId } },
      include: { plan: true }
    });

    const mrr = activeSubscriptions.reduce((acc, sub) => acc + Number(sub.plan.price), 0);

    res.json({
      success: true,
      data: {
        totalInstitutions: institutionsCount,
        totalStudents: studentsCount,
        totalTeachers: teachersCount,
        mrr: mrr
      }
    });
  } catch (error) {
    next(error);
  }
};
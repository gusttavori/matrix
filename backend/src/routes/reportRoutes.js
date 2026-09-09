const express = require('express');
const { successResponse } = require('../utils/apiResponse');
const prisma = require('../utils/prisma');
const { authMiddleware } = require('../middlewares/authMiddleware');
const { requireRole } = require('../middlewares/requireRole');
const { tenantMiddleware } = require('../middlewares/tenantMiddleware');

const router = express.Router();

router.use(authMiddleware);
router.use(tenantMiddleware);
router.use(requireRole('ADMIN', 'SECRETARY'));

router.get('/academic', async (req, res, next) => {
  try {
    const { classId, periodId, schoolYear } = req.query;
    
    let studentsQuery = { institutionId: req.institutionId, status: 'ACTIVE' };
    
    if (classId) {
      studentsQuery.classId = parseInt(classId, 10);
    } else if (schoolYear) {
      studentsQuery.class = { schoolYear: parseInt(schoolYear, 10) };
    }

    const students = await prisma.student.findMany({
      where: studentsQuery,
      include: {
        class: true,
        grades: {
          where: periodId ? { assessment: { periodId: parseInt(periodId, 10) } } : undefined,
          include: { assessment: true }
        },
        attendances: {
          where: periodId ? { lesson: { periodId: parseInt(periodId, 10) } } : undefined,
          include: { lesson: true }
        }
      },
      orderBy: [{ classId: 'asc' }, { name: 'asc' }]
    });

    const reportData = students.map(student => {
      let totalScore = 0;
      let possibleScore = 0;
      
      student.grades.forEach(grade => {
        if (grade.value !== null && grade.value !== undefined) {
          totalScore += Number(grade.value) || 0;
          possibleScore += Number(grade.assessment.maxGrade) || 0;
        }
      });

      const average = possibleScore > 0 ? ((totalScore / possibleScore) * 10).toFixed(1) : 0;
      
      const totalClasses = student.attendances.length;
      const presentClasses = student.attendances.filter(a => a.status === 'PRESENT').length;
      const attendancePerc = totalClasses > 0 ? ((presentClasses / totalClasses) * 100).toFixed(0) : 100;

      let status = 'Em Andamento';
      if (totalClasses > 0 || possibleScore > 0) {
        if (Number(average) < 6 || Number(attendancePerc) < 75) status = 'Em Risco';
        else if (Number(average) >= 6 && Number(attendancePerc) >= 75) status = 'Bom Desempenho';
      }

      return {
        id: student.id,
        name: student.name,
        enrollment: student.enrollment,
        className: student.class ? `${student.class.name} (${student.class.grade})` : 'Sem Turma',
        average: Number(average),
        attendancePerc: Number(attendancePerc),
        status
      };
    });

    return successResponse(res, reportData);
  } catch (error) { next(error); }
});

module.exports = router;
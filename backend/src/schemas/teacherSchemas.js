const { z } = require('zod');

// --- Assessments (Avaliações) ---
const createAssessmentSchema = z.object({
  name: z.string().min(2, 'Nome deve ter no mínimo 2 caracteres'),
  date: z.string().transform(str => new Date(str)),
  maxScore: z.number().positive('A nota máxima deve ser maior que zero'),
  term: z.enum(['1B', '2B', '3B', '4B', '1T', '2T', '3T', 'S1', 'S2']),
  classId: z.number().int().positive(),
  subjectId: z.number().int().positive()
});

const updateAssessmentSchema = z.object({
  name: z.string().min(2).optional(),
  date: z.string().transform(str => new Date(str)).optional(),
  maxScore: z.number().positive().optional(),
  term: z.enum(['1B', '2B', '3B', '4B', '1T', '2T', '3T', 'S1', 'S2']).optional()
});

// --- Grades (Notas) ---
const saveGradesSchema = z.object({
  assessmentId: z.number().int().positive(),
  grades: z.array(z.object({
    studentId: z.number().int().positive(),
    score: z.number().min(0)
  }))
});

// --- Attendance (Frequência) ---
const saveAttendanceSchema = z.object({
  date: z.string().transform(str => new Date(str)),
  classId: z.number().int().positive(),
  subjectId: z.number().int().positive(),
  attendances: z.array(z.object({
    studentId: z.number().int().positive(),
    present: z.boolean(),
    justified: z.boolean().optional(),
    notes: z.string().optional()
  }))
});

// --- Lesson Contents (Conteúdos) ---
const createContentSchema = z.object({
  date: z.string().transform(str => new Date(str)),
  title: z.string().min(2, 'Título obrigatório'),
  description: z.string().optional(),
  classId: z.number().int().positive(),
  subjectId: z.number().int().positive()
});

module.exports = {
  createAssessmentSchema,
  updateAssessmentSchema,
  saveGradesSchema,
  saveAttendanceSchema,
  createContentSchema
};

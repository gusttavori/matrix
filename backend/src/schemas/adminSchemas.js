const { z } = require('zod');

// --- Classes ---
const createClassSchema = z.object({
  name: z.string().min(2, 'Nome deve ter no mínimo 2 caracteres'),
  grade: z.string().min(2, 'Série deve ter no mínimo 2 caracteres'),
  shift: z.enum(['Manhã', 'Tarde', 'Noite', 'Integral']),
  schoolYear: z.number().int().min(2000).max(2100)
});

const updateClassSchema = createClassSchema.partial().extend({
  active: z.boolean().optional()
});

// --- Subjects ---
const createSubjectSchema = z.object({
  name: z.string().min(2, 'Nome deve ter no mínimo 2 caracteres'),
  grade: z.string().min(2, 'Série deve ter no mínimo 2 caracteres')
});

const updateSubjectSchema = createSubjectSchema.partial().extend({
  active: z.boolean().optional()
});

// --- Teachers ---
const createTeacherSchema = z.object({
  name: z.string().min(3, 'Nome deve ter no mínimo 3 caracteres'),
  email: z.string().email('E-mail inválido'),
  identification: z.string().optional()
});

const updateTeacherSchema = z.object({
  name: z.string().min(3).optional(),
  identification: z.string().optional(),
  active: z.boolean().optional()
});

// --- Students ---
const createStudentSchema = z.object({
  name: z.string().min(3, 'Nome deve ter no mínimo 3 caracteres'),
  email: z.string().email('E-mail inválido'),
  enrollment: z.string().min(1, 'Matrícula é obrigatória'),
  birthDate: z.string().transform(str => new Date(str)),
  classId: z.number().int().positive('Turma é obrigatória'),
  shift: z.enum(['Manhã', 'Tarde', 'Noite', 'Integral'])
});

const updateStudentSchema = z.object({
  name: z.string().min(3).optional(),
  enrollment: z.string().optional(),
  birthDate: z.string().transform(str => new Date(str)).optional(),
  classId: z.number().int().positive().optional(),
  shift: z.enum(['Manhã', 'Tarde', 'Noite', 'Integral']).optional(),
  status: z.enum(['ACTIVE', 'INACTIVE', 'TRANSFERRED', 'GRADUATED']).optional()
});

module.exports = {
  createClassSchema,
  updateClassSchema,
  createSubjectSchema,
  updateSubjectSchema,
  createTeacherSchema,
  updateTeacherSchema,
  createStudentSchema,
  updateStudentSchema
};

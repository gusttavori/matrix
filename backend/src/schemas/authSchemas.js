const { z } = require('zod');

const loginSchema = z.object({
  email: z.string().min(1, 'Informe o e-mail ou a matrícula'),
  password: z.string().min(1, 'Informe a senha')
});

const registerSchema = z.object({
  institutionName: z.string().min(3, 'O nome da instituição deve ter no mínimo 3 caracteres'),
  tradeName: z.string().min(3, 'O nome fantasia deve ter no mínimo 3 caracteres').optional(),
  document: z.string().optional(),
  phone: z.string().optional(),
  state: z.string().optional(),
  city: z.string().optional(),
  adminName: z.string().min(3, 'O nome do administrador deve ter no mínimo 3 caracteres'),
  email: z.string().email('E-mail inválido'),
  password: z.string().min(6, 'A senha deve ter no mínimo 6 caracteres'),
  planId: z.number().int().positive('Selecione um plano válido')
});

module.exports = {
  loginSchema,
  registerSchema
};
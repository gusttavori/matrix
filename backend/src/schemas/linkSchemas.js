const { z } = require('zod');

const createLinkSchema = z.object({
  teacherId: z.number().int().positive(),
  classId: z.number().int().positive(),
  subjectId: z.number().int().positive()
});

module.exports = {
  createLinkSchema
};

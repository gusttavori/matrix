const prisma = require('../utils/prisma');

const getPlans = async () => {
  return await prisma.plan.findMany({
    where: { active: true },
    orderBy: { price: 'asc' }
  });
};

module.exports = {
  getPlans
};

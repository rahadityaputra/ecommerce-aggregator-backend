const { prisma } = require('../../config/database');

async function findMany() {
  return prisma.marketplace.findMany({ orderBy: { id: 'asc' } });
}

async function toggle(id) {
  const row = await prisma.marketplace.findUnique({ where: { id } });

  return prisma.marketplace.update({
    where: { id },
    data: { isActive: !row.isActive }
  });
}

module.exports = {
  findMany,
  toggle
};

/* eslint-disable no-console */
const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  const hashed = await bcrypt.hash('admin123', 10);

  await prisma.user.upsert({
    where: { email: 'admin@aggregator.local' },
    update: {},
    create: {
      name: 'Admin',
      email: 'admin@aggregator.local',
      password: hashed
    }
  });

  const marketplaceNames = ['Shopee', 'Tokopedia', 'Lazada'];

  for (const name of marketplaceNames) {
    await prisma.marketplace.upsert({
      where: { name },
      update: {},
      create: { name, isActive: true }
    });
  }

  console.log('Seed complete');
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

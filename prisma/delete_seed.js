const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function clearDatabase() {
  // Order matters due to foreign key constraints
  await prisma.audit_log.deleteMany();
  await prisma.invoice_items.deleteMany();
  await prisma.invoices.deleteMany();
  await prisma.diesel_consumption.deleteMany();
  await prisma.diesel_receiving.deleteMany();
  await prisma.tanks.deleteMany();
  await prisma.jobs_projects.deleteMany();
  await prisma.vehicles_equipment.deleteMany();
  await prisma.suppliers.deleteMany();
  await prisma.users.deleteMany();
  await prisma.sites.deleteMany();
  await prisma.divisions.deleteMany();
  await prisma.roles.deleteMany();
}

async function main() {
  await clearDatabase();
  console.log('Database cleared.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
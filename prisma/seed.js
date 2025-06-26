const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function main() {
  // Seed roles
  const roles = await prisma.roles.createMany({
    data: [
      { role_name: 'admin', description: 'Administrator' },
      { role_name: 'site-incharge', description: 'Site Incharge' },
      { role_name: 'diesel-manager', description: 'Diesel Manager' },
      { role_name: 'operator', description: 'Operator' },
      { role_name: 'driver', description: 'Driver' },
    ],
    skipDuplicates: true
  });

  // Seed sites
  const siteData = [
    { site_name: 'Alpha Site', location: 'Karachi' },
    { site_name: 'Beta Site', location: 'Lahore' },
    { site_name: 'Gamma Site', location: 'Islamabad' }
  ];
  await prisma.sites.createMany({ data: siteData, skipDuplicates: true });
  const sites = await prisma.sites.findMany();

  // Seed users (add a Tank In-charge and Site Manager)
  const roleRecords = await prisma.roles.findMany();
  const adminPassword = await bcrypt.hash('admin123', 10);
  const usersData = [
    {
      employee_number: 'EMP001',
      password_hash: adminPassword,
      employee_name: 'Alice Admin',
      mobile_number: '03001234567',
      role_id: roleRecords.find(r => r.role_name === 'admin').role_id,
      site_id: sites[0].site_id
    },
    {
      employee_number: 'EMP002',
      password_hash: await bcrypt.hash('manager123', 10),
      employee_name: 'Bob Manager',
      mobile_number: '03007654321',
      role_id: roleRecords.find(r => r.role_name === 'site-incharge').role_id,
      site_id: sites[1].site_id
    },
    {
      employee_number: 'EMP003',
      password_hash: await bcrypt.hash('keeper123', 10),
      employee_name: 'Charlie Keeper',
      mobile_number: '03009876543',
      role_id: roleRecords.find(r => r.role_name === 'diesel-manager').role_id,
      site_id: sites[2].site_id
    },
    // operator
    {
      employee_number: 'EMP004',
      password_hash: await bcrypt.hash('tank123', 10),
      employee_name: 'Tina Operator',
      mobile_number: '03009998888',
      role_id: roleRecords.find(r => r.role_name === 'operator').role_id,
      site_id: sites[0].site_id
    },
    // driver
    {
      employee_number: 'EMP005',
      password_hash: await bcrypt.hash('site123', 10),
      employee_name: 'Sam Driver',
      mobile_number: '03007776666',
      role_id: roleRecords.find(r => r.role_name === 'driver').role_id,
      site_id: sites[1].site_id
    }
  ];
  await prisma.users.createMany({ data: usersData, skipDuplicates: true });
  const users = await prisma.users.findMany();

  // Seed tanks
  const tanksData = [
    { tank_name: 'Tank A', capacity_liters: 10000, site_id: sites[0].site_id },
    { tank_name: 'Tank B', capacity_liters: 8000, site_id: sites[1].site_id },
    { tank_name: 'Tank C', capacity_liters: 12000, site_id: sites[2].site_id }
  ];
  await prisma.tanks.createMany({ data: tanksData, skipDuplicates: true });
  const tanks = await prisma.tanks.findMany();

  // Seed suppliers
  const suppliersData = [
    { supplier_name: 'FuelCo', contact_person_name: 'Zara', contact_number: '03111222333', address: 'Karachi' },
    { supplier_name: 'DieselMart', contact_person_name: 'Ahmed', contact_number: '03212345678', address: 'Lahore' },
    { supplier_name: 'PetroMax', contact_person_name: 'Sara', contact_number: '03319876543', address: 'Islamabad' }
  ];
  await prisma.suppliers.createMany({ data: suppliersData, skipDuplicates: true });
  const suppliers = await prisma.suppliers.findMany();

  // Seed vehicles_equipment
  const vehiclesData = [
    {
      plate_number_machine_id: 'ABC-123',
      type: 'Truck',
      make_model: 'Hino 500',
      current_odometer_hours: 1000,
      current_odometer_kilometer: 50000,
      daily_usage_limit: 300
    },
    {
      plate_number_machine_id: 'XYZ-789',
      type: 'Excavator',
      make_model: 'CAT 320',
      current_odometer_hours: 2000,
      current_odometer_kilometer: 15000,
      daily_usage_limit: 200
    }
  ];
  await prisma.vehicles_equipment.createMany({ data: vehiclesData, skipDuplicates: true });
  const vehicles = await prisma.vehicles_equipment.findMany();

  // Seed jobs_projects
  const jobsData = [
    {
      job_number: 'JOB001',
      job_description: 'Excavation Project',
      start_date: new Date('2025-06-01'),
      end_date: new Date('2025-06-10')
    },
    {
      job_number: 'JOB002',
      job_description: 'Transport Project',
      start_date: new Date('2025-06-05'),
      end_date: new Date('2025-06-15')
    }
  ];
  await prisma.jobs_projects.createMany({ data: jobsData, skipDuplicates: true });
  const jobs = await prisma.jobs_projects.findMany();

  // Seed diesel_receiving
  const dieselReceivingData = [
    {
      receipt_number: 'RCPT001',
      received_datetime: new Date(),
      quantity_liters: 5000,
      site_id: sites[0].site_id,
      tank_id: tanks[0].tank_id,
      received_by_user_id: users[0].employee_number,
      supplier_id: suppliers[0].supplier_id,
      signature_image_path: '/signatures/rcpt1.png',
      created_at: new Date(),
      updated_at: new Date(),
      created_by_user_id: users[0].employee_number,
      updated_by_user_id: users[0].employee_number
    }
  ];
  await prisma.diesel_receiving.createMany({ data: dieselReceivingData, skipDuplicates: true });
  const dieselReceiving = await prisma.diesel_receiving.findMany();

  // Seed diesel_consumption
  const dieselConsumptionData = [
    {
      consumption_datetime: new Date(),
      quantity_liters: 100,
      site_id: sites[0].site_id,
      vehicle_equipment_id: vehicles[0].vehicle_equipment_id,
      job_id: jobs[0].job_id,
      operator_driver_user_id: users[1].employee_number,
      odometer_km_hours: 1000,
      signature_image_path: '/signatures/cons1.png',
      created_at: new Date(),
      updated_at: new Date(),
      created_by_user_id: users[1].employee_number,
      updated_by_user_id: users[1].employee_number
    }
  ];
  await prisma.diesel_consumption.createMany({ data: dieselConsumptionData, skipDuplicates: true });
  const dieselConsumption = await prisma.diesel_consumption.findMany();

  // Seed invoices
  const invoicesData = [
    {
      invoice_number: 'INV001',
      invoice_date: new Date(),
      start_date: new Date('2025-06-01'),
      end_date: new Date('2025-06-10'),
      total_amount: 10000,
      generated_by_user_id: users[0].employee_number,
      site_id: sites[0].site_id
    }
  ];
  await prisma.invoices.createMany({ data: invoicesData, skipDuplicates: true });
  const invoices = await prisma.invoices.findMany();

  // Seed invoice_items
  const invoiceItemsData = [
    {
      invoice_id: invoices[0].invoice_id,
      consumption_id: dieselConsumption[0].consumption_id,
      quantity_liters: 100,
      rate_per_liter: 100,
      amount: 10000,
      job_id: jobs[0].job_id
    }
  ];
  await prisma.invoice_items.createMany({ data: invoiceItemsData, skipDuplicates: true });

  // Seed audit_log
  const auditLogData = [
    {
      table_name: 'users',
      record_id: users[0].employee_id,
      action_type: 'CREATE',
      old_value: '',
      new_value: JSON.stringify(users[0]),
      changed_by_user_id: users[0].employee_number,
      change_timestamp: new Date()
    }
  ];
  await prisma.audit_log.createMany({ data: auditLogData, skipDuplicates: true });

  console.log('Seed data inserted for all tables.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

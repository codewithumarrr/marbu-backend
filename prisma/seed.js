const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function main() {
  // Seed divisions
  const divisionsData = [
    { division_name: 'H4', description: 'H4 Division' },
    { division_name: 'RD', description: 'RD Division' },
    { division_name: 'HHG', description: 'HHG Division' },
    { division_name: 'AP', description: 'AP Division' },
    { division_name: 'ABOUDI', description: 'ABOUDI Division' }
  ];
  for (const division of divisionsData) {
    await prisma.divisions.upsert({
      where: { division_name: division.division_name },
      update: {},
      create: division,
    });
  }
  const divisions = await prisma.divisions.findMany();

  // Seed roles
  const rolesData = [
    { role_name: 'admin', description: 'Administrator' },
    { role_name: 'site-incharge', description: 'Site Incharge' },
    { role_name: 'diesel-manager', description: 'Diesel Manager' },
    { role_name: 'operator', description: 'Operator' },
    { role_name: 'driver', description: 'Driver' },
  ];
  for (const role of rolesData) {
    await prisma.roles.upsert({
      where: { role_name: role.role_name },
      update: {},
      create: role,
    });
  }
  const roleRecords = await prisma.roles.findMany();

  // Seed sites
  const siteData = [
    { site_name: 'GRAGE-43', location: 'GRAGE-43', division_id: divisions.find(d => d.division_name === 'H4')?.division_id },
    { site_name: 'SELIYA', location: 'SELIYA (MRJ-134)', division_id: divisions.find(d => d.division_name === 'RD')?.division_id },
    { site_name: 'UM SALAL', location: 'UM SALAL (MRJ-150)', division_id: divisions.find(d => d.division_name === 'HHG')?.division_id }
  ];
  for (const site of siteData) {
    await prisma.sites.upsert({
      where: { site_name: site.site_name },
      update: {},
      create: site,
    });
  }
  const sites = await prisma.sites.findMany();

  // Seed users
  const adminPassword = await bcrypt.hash('pmv01', 10);
  const usersData = [
    {
      
      employee_number: 'EMP001',
      qatar_id_number: 'QID1234567890',
      profession: 'Software Engineer',
      user_picture: 'https://example.com/alice.jpg',
      password_hash: adminPassword,
      employee_name: 'Alice Admin',
      mobile_number: '03001234567',
      role_id: roleRecords.find(r => r.role_name === 'admin').role_id,
      site_id: sites[0].site_id
    },
    {
      employee_number: '33445',
      qatar_id_number: '29435629459',
      profession: 'Diesel Manager',
      user_picture: null,
      password_hash: await bcrypt.hash('saleem123', 10),
      employee_name: 'SALEEM AYAZ',
      mobile_number: '97455691571',
      role_id: roleRecords.find(r => r.role_name === 'diesel-manager').role_id,
      site_id: sites.find(s => s.site_name === 'GRAGE-43')?.site_id,
      division_id: divisions.find(d => d.division_name === 'H4')?.division_id
    },
    {
      employee_number: '6122',
      qatar_id_number: '27405004410',
      profession: 'Diesel Incharge',
      user_picture: null,
      password_hash: await bcrypt.hash('momin123', 10),
      employee_name: 'MOMIN',
      mobile_number: '97477792692',
      role_id: roleRecords.find(r => r.role_name === 'site-incharge').role_id,
      site_id: sites.find(s => s.site_name === 'GRAGE-43')?.site_id,
      division_id: divisions.find(d => d.division_name === 'H4')?.division_id
    },
    {
      employee_number: '6608',
      qatar_id_number: '29605006928',
      profession: 'Diesel Incharge',
      user_picture: null,
      password_hash: await bcrypt.hash('taijul123', 10),
      employee_name: 'TAIJUL',
      mobile_number: '97466259651',
      role_id: roleRecords.find(r => r.role_name === 'site-incharge').role_id,
      site_id: sites.find(s => s.site_name === 'SELIYA')?.site_id,
      division_id: divisions.find(d => d.division_name === 'RD')?.division_id
    },
    {
      employee_number: '22376',
      qatar_id_number: '29758605280',
      profession: 'Diesel Incharge',
      user_picture: null,
      password_hash: await bcrypt.hash('abdullah123', 10),
      employee_name: 'ABDULLAH',
      mobile_number: '97474755135',
      role_id: roleRecords.find(r => r.role_name === 'site-incharge').role_id,
      site_id: sites.find(s => s.site_name === 'UM SALAL')?.site_id,
      division_id: divisions.find(d => d.division_name === 'HHG')?.division_id
    },
    {
      employee_number: 'EMP004',
      qatar_id_number: 'QID6677889900',
      profession: 'Heavy Equipment Operator',
      user_picture: 'https://example.com/tina.jpg',
      password_hash: await bcrypt.hash('operator123', 10),
      employee_name: 'Tina Operator',
      mobile_number: '03009998888',
      role_id: roleRecords.find(r => r.role_name === 'operator').role_id,
      site_id: sites[0].site_id,
      division_id: divisions.find(d => d.division_name === 'AP')?.division_id
    },
    {
      employee_number: 'EMP005',
      qatar_id_number: 'QID2233445566',
      profession: 'Truck Driver',
      user_picture: 'https://example.com/sam.jpg',
      password_hash: await bcrypt.hash('driver123', 10),
      employee_name: 'Sam Driver',
      mobile_number: '03007776666',
      role_id: roleRecords.find(r => r.role_name === 'driver').role_id,
      site_id: sites[1].site_id,
      division_id: divisions.find(d => d.division_name === 'ABOUDI')?.division_id
    }
  ];
  for (const user of usersData) {
    await prisma.users.upsert({
      where: { employee_number: user.employee_number },
      update: {},
      create: user,
    });
  }
  const users = await prisma.users.findMany();

  // Seed tanks
  const tanksData = [
    { tank_name: 'Tank A', capacity_liters: 10000, site_id: sites[0].site_id },
    { tank_name: 'Tank B', capacity_liters: 8000, site_id: sites[1].site_id },
    { tank_name: 'Tank C', capacity_liters: 12000, site_id: sites[2].site_id },
    { tank_name: 'GRAGE-43 Office', capacity_liters: 20000, site_id: sites.find(s => s.site_name === 'GRAGE-43')?.site_id },
    { tank_name: 'GRAGE-43 Tank 2', capacity_liters: 20000, site_id: sites.find(s => s.site_name === 'GRAGE-43')?.site_id },
    { tank_name: 'SELIYA Tank (MRJ-134)', capacity_liters: 20000, site_id: sites.find(s => s.site_name === 'SELIYA')?.site_id },
    { tank_name: 'UM SALAL Tank (MRJ-150)', capacity_liters: 100000, site_id: sites.find(s => s.site_name === 'UM SALAL')?.site_id }
  ];
  for (const tank of tanksData) {
    await prisma.tanks.upsert({
      where: { tank_name: tank.tank_name },
      update: {},
      create: tank,
    });
  }
  const tanks = await prisma.tanks.findMany();

  // Seed suppliers
  const suppliersData = [
    {
      supplier_name: 'Qatar Fuel (Woqod)',
      contact_person_name: 'Default',
      contact_number: '0000000000',
      address: 'Qatar'
    }
  ];
  for (const supplier of suppliersData) {
    await prisma.suppliers.upsert({
      where: { supplier_name: supplier.supplier_name },
      update: {},
      create: supplier,
    });
  }
  const suppliers = await prisma.suppliers.findMany();

  // Seed vehicles_equipment
  const vehiclesData = [
    {
      plate_number_machine_id: 'ABC-123',
      type: 'Truck',
      make_model: 'Hino 500',
      current_odometer_hours: 1000,
      current_odometer_kilometer: 50000,
      daily_usage_limit: 300,
      division_id: divisions.find(d => d.division_name === 'H4')?.division_id
    },
    {
      plate_number_machine_id: 'XYZ-789',
      type: 'Excavator',
      make_model: 'CAT 320',
      current_odometer_hours: 2000,
      current_odometer_kilometer: 15000,
      daily_usage_limit: 200,
      division_id: divisions.find(d => d.division_name === 'RD')?.division_id
    },
    {
      plate_number_machine_id: 'DEF-456',
      type: 'Bulldozer',
      make_model: 'CAT D6T',
      current_odometer_hours: 1500,
      current_odometer_kilometer: 8000,
      daily_usage_limit: 250,
      division_id: divisions.find(d => d.division_name === 'HHG')?.division_id
    },
    {
      plate_number_machine_id: 'GHI-789',
      type: 'Loader',
      make_model: 'CAT 950M',
      current_odometer_hours: 800,
      current_odometer_kilometer: 12000,
      daily_usage_limit: 180,
      division_id: divisions.find(d => d.division_name === 'AP')?.division_id
    },
    {
      plate_number_machine_id: 'JKL-012',
      type: 'Crane',
      make_model: 'Liebherr LTM 1060',
      current_odometer_hours: 600,
      current_odometer_kilometer: 25000,
      daily_usage_limit: 120,
      division_id: divisions.find(d => d.division_name === 'ABOUDI')?.division_id
    }
  ];
  for (const vehicle of vehiclesData) {
    await prisma.vehicles_equipment.upsert({
      where: { plate_number_machine_id: vehicle.plate_number_machine_id },
      update: {},
      create: vehicle,
    });
  }
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
  for (const job of jobsData) {
    await prisma.jobs_projects.upsert({
      where: { job_number: job.job_number },
      update: {},
      create: job,
    });
  }
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
      updated_by_user_id: users[0].employee_number,
      diesel_rate: 2.25,
      custom_supplier_name: null,
      notes: 'Seeded record with diesel rate'
    }
  ];
  for (const dr of dieselReceivingData) {
    await prisma.diesel_receiving.upsert({
      where: { receipt_number: dr.receipt_number },
      update: {},
      create: dr,
    });
  }
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
  for (const dc of dieselConsumptionData) {
    await prisma.diesel_consumption.upsert({
      where: { signature_image_path: dc.signature_image_path },
      update: {},
      create: dc,
    });
  }
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
  for (const invoice of invoicesData) {
    await prisma.invoices.upsert({
      where: { invoice_number: invoice.invoice_number },
      update: {},
      create: invoice,
    });
  }
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
  // No unique field for upsert, so fallback to createMany with skipDuplicates
  await prisma.invoice_items.createMany({ data: invoiceItemsData, skipDuplicates: true });

  // Seed audit_log
  const auditLogData = [
    {
      table_name: 'diesel_receiving',
      record_id: dieselReceiving[0].receiving_id,
      action_type: 'CREATE',
      old_value: '',
      new_value: JSON.stringify({
        receipt_number: 'RCP-2025-001234',
        quantity_liters: 500,
        received_datetime: '2025-06-21 10:30:15',
        received_by_user_id: 'EMP001'
      }),
      changed_by_user_id: users[0].employee_number,
      change_timestamp: new Date('2025-06-21 10:30:15')
    },
    {
      table_name: 'diesel_consumption',
      record_id: dieselConsumption[0].consumption_id,
      action_type: 'UPDATE',
      old_value: JSON.stringify({
        quantity_liters: 95,
        odometer_km_hours: 950
      }),
      new_value: JSON.stringify({
        quantity_liters: 100,
        odometer_km_hours: 1000
      }),
      changed_by_user_id: users[1].employee_number,
      change_timestamp: new Date('2025-06-21 09:15:42')
    },
    {
      table_name: 'reports',
      record_id: 123,
      action_type: 'VIEW',
      old_value: '',
      new_value: JSON.stringify({
        report_type: 'monthly_fuel_report',
        generated_at: '2025-06-21 08:45:30'
      }),
      changed_by_user_id: users[2].employee_number,
      change_timestamp: new Date('2025-06-21 08:45:30')
    },
    {
      table_name: 'users',
      record_id: users.find(u => u.employee_number === 'EMP004').user_id,
      action_type: 'CREATE',
      old_value: '',
      new_value: JSON.stringify({
        employee_name: 'Tina Operator',
        employee_number: 'EMP004',
        qatar_id_number: 'QID6677889900',
        profession: 'Heavy Equipment Operator',
        role_id: roleRecords.find(r => r.role_name === 'operator').role_id,
      }),
      changed_by_user_id: users[0].employee_number,
      change_timestamp: new Date('2025-06-20 14:22:10')
    },
    {
      table_name: 'vehicles_equipment',
      record_id: vehicles[0].vehicle_equipment_id,
      action_type: 'UPDATE',
      old_value: JSON.stringify({
        current_odometer_kilometer: 48000,
        daily_usage_limit: 250
      }),
      new_value: JSON.stringify({
        current_odometer_kilometer: 50000,
        daily_usage_limit: 300
      }),
      changed_by_user_id: users[1].employee_number,
      change_timestamp: new Date('2025-06-20 11:15:30')
    },
    {
      table_name: 'invoices',
      record_id: invoices[0].invoice_id,
      action_type: 'CREATE',
      old_value: '',
      new_value: JSON.stringify({
        invoice_number: 'INV-2025-001',
        total_amount: 10000,
        invoice_date: '2025-06-19'
      }),
      changed_by_user_id: users[0].employee_number,
      change_timestamp: new Date('2025-06-19 16:30:45')
    },
    {
      table_name: 'diesel_receiving',
      record_id: 999,
      action_type: 'DELETE',
      old_value: JSON.stringify({
        receipt_number: 'RCP-2025-001200',
        quantity_liters: 200,
        received_datetime: '2025-06-18'
      }),
      new_value: '',
      changed_by_user_id: users[0].employee_number,
      change_timestamp: new Date('2025-06-18 13:45:20')
    }
  ];
  // No unique field for upsert, so fallback to createMany with skipDuplicates
  await prisma.audit_log.createMany({ data: auditLogData, skipDuplicates: true });

  console.log('Seed data inserted for all tables using upsert where possible.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

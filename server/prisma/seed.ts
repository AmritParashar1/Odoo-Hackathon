import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...\n');

  // ============================================================
  // 1. Create Departments
  // ============================================================
  console.log('📁 Creating departments...');

  const departments = await Promise.all([
    prisma.department.upsert({
      where: { code: 'ENG' },
      update: {},
      create: { name: 'Engineering', code: 'ENG', description: 'Software Engineering & Development' },
    }),
    prisma.department.upsert({
      where: { code: 'HR' },
      update: {},
      create: { name: 'Human Resources', code: 'HR', description: 'People & Culture' },
    }),
    prisma.department.upsert({
      where: { code: 'FIN' },
      update: {},
      create: { name: 'Finance', code: 'FIN', description: 'Financial Operations & Accounting' },
    }),
    prisma.department.upsert({
      where: { code: 'MKT' },
      update: {},
      create: { name: 'Marketing', code: 'MKT', description: 'Brand & Growth Marketing' },
    }),
    prisma.department.upsert({
      where: { code: 'OPS' },
      update: {},
      create: { name: 'Operations', code: 'OPS', description: 'Business Operations & Facilities' },
    }),
  ]);

  console.log(`  ✅ ${departments.length} departments created`);

  // ============================================================
  // 2. Create Asset Categories
  // ============================================================
  console.log('📋 Creating asset categories...');

  const categories = await Promise.all([
    prisma.assetCategory.upsert({
      where: { code: 'LAPTOP' },
      update: {},
      create: { name: 'Laptops', code: 'LAPTOP', description: 'Portable computers', isBookable: false },
    }),
    prisma.assetCategory.upsert({
      where: { code: 'MONITOR' },
      update: {},
      create: { name: 'Monitors', code: 'MONITOR', description: 'External displays', isBookable: false },
    }),
    prisma.assetCategory.upsert({
      where: { code: 'PHONE' },
      update: {},
      create: { name: 'Mobile Phones', code: 'PHONE', description: 'Corporate mobile devices', isBookable: false },
    }),
    prisma.assetCategory.upsert({
      where: { code: 'CONFROOM' },
      update: {},
      create: { name: 'Conference Rooms', code: 'CONFROOM', description: 'Meeting & conference spaces', isBookable: true },
    }),
    prisma.assetCategory.upsert({
      where: { code: 'PROJECTOR' },
      update: {},
      create: { name: 'Projectors', code: 'PROJECTOR', description: 'Presentation projectors', isBookable: true },
    }),
    prisma.assetCategory.upsert({
      where: { code: 'VEHICLE' },
      update: {},
      create: { name: 'Vehicles', code: 'VEHICLE', description: 'Company vehicles', isBookable: true },
    }),
    prisma.assetCategory.upsert({
      where: { code: 'FURN' },
      update: {},
      create: { name: 'Furniture', code: 'FURN', description: 'Office furniture', isBookable: false },
    }),
    prisma.assetCategory.upsert({
      where: { code: 'SERVER' },
      update: {},
      create: { name: 'Servers', code: 'SERVER', description: 'Physical servers & network equipment', isBookable: false },
    }),
  ]);

  console.log(`  ✅ ${categories.length} categories created`);

  // ============================================================
  // 3. Create Users
  // ============================================================
  console.log('👤 Creating users...');

  const passwordHash = await bcrypt.hash('Password@123', 12);

  const users = await Promise.all([
    prisma.user.upsert({
      where: { email: 'admin@assetflow.com' },
      update: {},
      create: {
        email: 'admin@assetflow.com',
        passwordHash,
        firstName: 'System',
        lastName: 'Administrator',
        role: 'ADMIN',
        phone: '+1-555-0100',
      },
    }),
    prisma.user.upsert({
      where: { email: 'manager@assetflow.com' },
      update: {},
      create: {
        email: 'manager@assetflow.com',
        passwordHash,
        firstName: 'Asset',
        lastName: 'Manager',
        role: 'ASSET_MANAGER',
        departmentId: departments[4].id, // Operations
        phone: '+1-555-0101',
      },
    }),
    prisma.user.upsert({
      where: { email: 'head.eng@assetflow.com' },
      update: {},
      create: {
        email: 'head.eng@assetflow.com',
        passwordHash,
        firstName: 'Engineering',
        lastName: 'Head',
        role: 'DEPARTMENT_HEAD',
        departmentId: departments[0].id, // Engineering
        phone: '+1-555-0102',
      },
    }),
    prisma.user.upsert({
      where: { email: 'head.hr@assetflow.com' },
      update: {},
      create: {
        email: 'head.hr@assetflow.com',
        passwordHash,
        firstName: 'HR',
        lastName: 'Head',
        role: 'DEPARTMENT_HEAD',
        departmentId: departments[1].id, // HR
        phone: '+1-555-0103',
      },
    }),
    prisma.user.upsert({
      where: { email: 'john.doe@assetflow.com' },
      update: {},
      create: {
        email: 'john.doe@assetflow.com',
        passwordHash,
        firstName: 'John',
        lastName: 'Doe',
        role: 'EMPLOYEE',
        departmentId: departments[0].id, // Engineering
        phone: '+1-555-0104',
      },
    }),
    prisma.user.upsert({
      where: { email: 'jane.smith@assetflow.com' },
      update: {},
      create: {
        email: 'jane.smith@assetflow.com',
        passwordHash,
        firstName: 'Jane',
        lastName: 'Smith',
        role: 'EMPLOYEE',
        departmentId: departments[0].id, // Engineering
        phone: '+1-555-0105',
      },
    }),
    prisma.user.upsert({
      where: { email: 'bob.wilson@assetflow.com' },
      update: {},
      create: {
        email: 'bob.wilson@assetflow.com',
        passwordHash,
        firstName: 'Bob',
        lastName: 'Wilson',
        role: 'EMPLOYEE',
        departmentId: departments[1].id, // HR
        phone: '+1-555-0106',
      },
    }),
  ]);

  console.log(`  ✅ ${users.length} users created`);

  // Set department heads
  await prisma.department.update({
    where: { id: departments[0].id },
    data: { headId: users[2].id }, // Engineering Head
  });
  await prisma.department.update({
    where: { id: departments[1].id },
    data: { headId: users[3].id }, // HR Head
  });

  // ============================================================
  // 4. Create Assets
  // ============================================================
  console.log('💻 Creating assets...');

  const assets = await Promise.all([
    // Laptops
    prisma.asset.create({
      data: {
        assetTag: 'AST-000001',
        name: 'MacBook Pro 16" M3',
        description: 'Apple MacBook Pro 16-inch with M3 Pro chip, 36GB RAM',
        categoryId: categories[0].id,
        departmentId: departments[0].id,
        serialNumber: 'FVFH12345678',
        purchaseDate: new Date('2024-01-15'),
        purchaseCost: 2499.00,
        warrantyExpiry: new Date('2027-01-15'),
        location: 'Office A, Desk 12',
        status: 'AVAILABLE',
        condition: 'NEW',
      },
    }),
    prisma.asset.create({
      data: {
        assetTag: 'AST-000002',
        name: 'MacBook Pro 14" M3',
        description: 'Apple MacBook Pro 14-inch with M3 chip, 24GB RAM',
        categoryId: categories[0].id,
        departmentId: departments[0].id,
        serialNumber: 'FVFH12345679',
        purchaseDate: new Date('2024-02-01'),
        purchaseCost: 1999.00,
        warrantyExpiry: new Date('2027-02-01'),
        location: 'Office A, Desk 14',
        status: 'AVAILABLE',
        condition: 'NEW',
      },
    }),
    prisma.asset.create({
      data: {
        assetTag: 'AST-000003',
        name: 'ThinkPad X1 Carbon Gen 11',
        description: 'Lenovo ThinkPad X1 Carbon, i7, 32GB RAM',
        categoryId: categories[0].id,
        departmentId: departments[1].id,
        serialNumber: 'PF3ABC1234',
        purchaseDate: new Date('2024-03-10'),
        purchaseCost: 1749.00,
        warrantyExpiry: new Date('2027-03-10'),
        location: 'Office B, Desk 5',
        status: 'AVAILABLE',
        condition: 'GOOD',
      },
    }),
    // Monitors
    prisma.asset.create({
      data: {
        assetTag: 'AST-000004',
        name: 'Dell UltraSharp 27" 4K',
        description: 'Dell U2723QE 27-inch 4K USB-C Monitor',
        categoryId: categories[1].id,
        departmentId: departments[0].id,
        serialNumber: 'DELL27K001',
        purchaseDate: new Date('2024-01-20'),
        purchaseCost: 619.00,
        warrantyExpiry: new Date('2027-01-20'),
        location: 'Office A, Desk 12',
        status: 'AVAILABLE',
        condition: 'NEW',
      },
    }),
    prisma.asset.create({
      data: {
        assetTag: 'AST-000005',
        name: 'LG 32" UltraFine 4K',
        description: 'LG 32UN880-B Ergo 4K UHD Monitor',
        categoryId: categories[1].id,
        departmentId: departments[0].id,
        serialNumber: 'LG32UF002',
        purchaseDate: new Date('2024-02-15'),
        purchaseCost: 549.00,
        warrantyExpiry: new Date('2027-02-15'),
        location: 'Office A, Storage',
        status: 'AVAILABLE',
        condition: 'GOOD',
      },
    }),
    // Conference Rooms (bookable)
    prisma.asset.create({
      data: {
        assetTag: 'AST-000006',
        name: 'Conference Room Alpha',
        description: 'Large conference room, capacity 20, with AV setup',
        categoryId: categories[3].id,
        location: 'Floor 3, Room 301',
        status: 'AVAILABLE',
        condition: 'GOOD',
      },
    }),
    prisma.asset.create({
      data: {
        assetTag: 'AST-000007',
        name: 'Conference Room Beta',
        description: 'Medium meeting room, capacity 10',
        categoryId: categories[3].id,
        location: 'Floor 3, Room 305',
        status: 'AVAILABLE',
        condition: 'GOOD',
      },
    }),
    // Projector (bookable)
    prisma.asset.create({
      data: {
        assetTag: 'AST-000008',
        name: 'Epson PowerLite Projector',
        description: 'Epson PowerLite 1795F wireless projector',
        categoryId: categories[4].id,
        serialNumber: 'EPSON1795F001',
        purchaseDate: new Date('2023-06-01'),
        purchaseCost: 899.00,
        warrantyExpiry: new Date('2026-06-01'),
        location: 'Floor 3, AV Cabinet',
        status: 'AVAILABLE',
        condition: 'GOOD',
      },
    }),
    // Server
    prisma.asset.create({
      data: {
        assetTag: 'AST-000009',
        name: 'Dell PowerEdge R750',
        description: 'Dell PowerEdge R750 rack server, dual Xeon, 256GB RAM',
        categoryId: categories[7].id,
        departmentId: departments[0].id,
        serialNumber: 'DELLR750001',
        purchaseDate: new Date('2023-09-01'),
        purchaseCost: 12499.00,
        warrantyExpiry: new Date('2026-09-01'),
        location: 'Server Room, Rack A3',
        status: 'ALLOCATED',
        condition: 'GOOD',
      },
    }),
    // Under maintenance
    prisma.asset.create({
      data: {
        assetTag: 'AST-000010',
        name: 'MacBook Air M2',
        description: 'Apple MacBook Air 13-inch M2, 16GB RAM — screen replacement',
        categoryId: categories[0].id,
        departmentId: departments[2].id,
        serialNumber: 'FVFAIR2M2001',
        purchaseDate: new Date('2023-04-15'),
        purchaseCost: 1299.00,
        warrantyExpiry: new Date('2026-04-15'),
        location: 'IT Service Desk',
        status: 'UNDER_MAINTENANCE',
        condition: 'DAMAGED',
      },
    }),
  ]);

  console.log(`  ✅ ${assets.length} assets created`);

  // ============================================================
  // 5. Create sample allocation
  // ============================================================
  console.log('🔗 Creating sample allocations...');

  await prisma.allocation.create({
    data: {
      assetId: assets[8].id, // Dell Server
      allocatedToId: users[2].id, // Eng Head
      allocatedById: users[1].id, // Asset Manager
      status: 'ACTIVE',
      notes: 'Primary development server allocation',
    },
  });

  console.log('  ✅ 1 allocation created');

  // ============================================================
  // Done
  // ============================================================
  console.log('\n✨ Seed completed successfully!');
  console.log('\n📝 Login credentials for all users:');
  console.log('   Password: Password@123');
  console.log('\n   Accounts:');
  console.log('   • admin@assetflow.com (Admin)');
  console.log('   • manager@assetflow.com (Asset Manager)');
  console.log('   • head.eng@assetflow.com (Department Head)');
  console.log('   • head.hr@assetflow.com (Department Head)');
  console.log('   • john.doe@assetflow.com (Employee)');
  console.log('   • jane.smith@assetflow.com (Employee)');
  console.log('   • bob.wilson@assetflow.com (Employee)');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

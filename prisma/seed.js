import { PrismaClient, AdminRole } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting Clean Puja Award database seeding...');

  // Default Application Settings
  const defaultSettings = [
    {
      key: 'registration_open',
      value: 'true',
      description: 'রেজিস্ট্রেশন খোলা আছে কিনা (Whether registration is currently open)',
    },
    {
      key: 'during_upload_open',
      value: 'true',
      description: 'পূজা চলাকালীন ফটো আপলোড খোলা আছে কিনা (Whether during-puja photo uploads are active)',
    },
    {
      key: 'after_upload_open',
      value: 'true',
      description: 'পূজা পরবর্তী ফটো আপলোড খোলা আছে কিনা (Whether post-puja photo uploads are active)',
    },
    {
      key: 'during_upload_max_limit',
      value: '10',
      description: 'পূজা চলাকালীন সর্বোচ্চ ছবির সংখ্যা (Max photos during puja)',
    },
    {
      key: 'after_upload_max_limit',
      value: '10',
      description: 'পূজা পরবর্তী সর্বোচ্চ ছবির সংখ্যা (Max photos after puja)',
    },
    {
      key: 'after_upload_deadline',
      value: '2026-10-31T23:59:59+05:30',
      description: 'পূজা পরবর্তী ফটো আপলোডের শেষ সময় (Deadline for post-puja photo uploads)',
    },
    {
      key: 'announcement_banner_text',
      value: 'ক্লিন পূজা অ্যাওয়ার্ড ২০২৬ - রেজিস্ট্রেশন চলছে!',
      description: 'শীর্ষ ব্যানার ঘোষণা (Top announcement banner text)',
    },
  ];

  for (const setting of defaultSettings) {
    await prisma.setting.upsert({
      where: { key: setting.key },
      update: { value: setting.value },
      create: setting,
    });
  }

  // Seed Default Super Admin
  const bcrypt = await import('bcryptjs');
  const adminPasswordHash = await bcrypt.default.hash('Admin@2026#Clean', 10);
  
  await prisma.admin.upsert({
    where: { email: 'admin@eisamay.com' },
    update: {
      passwordHash: adminPasswordHash,
      name: 'Ei Samay Admin',
      role: AdminRole.SUPER_ADMIN,
    },
    create: {
      email: 'admin@eisamay.com',
      passwordHash: adminPasswordHash,
      name: 'Ei Samay Admin',
      role: AdminRole.SUPER_ADMIN,
    },
  });

  console.log('✅ Settings & Admin seeded successfully.');
  console.log('👤 Admin Email: admin@eisamay.com');
  console.log('🔑 Admin Pass:  Admin@2026#Clean');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

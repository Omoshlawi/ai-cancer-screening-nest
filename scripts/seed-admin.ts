/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { auth } from '../src/auth/auth.cli.config';
import prisma from './prisma-instance';

async function seedAdmin() {
  console.log('👤 Seeding admin user...');

  const adminEmail = 'admin@screenit.app';
  const adminPassword = 'Password123!';
  const adminName = 'System Administrator';

  try {
    // Check if admin already exists
    const existingAdmin = await prisma.user.findUnique({
      where: { email: adminEmail },
    });

    if (existingAdmin) {
      console.log('ℹ️ Admin user already exists. Updating role to admin...');
      await prisma.user.update({
        where: { id: existingAdmin.id },
        data: { role: 'admin' },
      });
      return;
    }

    // Create admin user using better-auth to ensure correct hashing
    const user = await auth.api.signUpEmail({
      body: {
        email: adminEmail,
        password: adminPassword,
        name: adminName,
      },
    });

    if (user) {
      // Set role to admin
      await prisma.user.update({
        where: { email: adminEmail },
        data: { role: 'admin' },
      });
      console.log('✅ Admin user created successfully:');
      console.log(`   Email: ${adminEmail}`);
      console.log(`   Password: ${adminPassword}`);
    }
  } catch (error: any) {
    console.error('❌ Failed to seed admin:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

seedAdmin();

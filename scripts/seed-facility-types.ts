/* eslint-disable @typescript-eslint/no-require-imports */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import path from 'path';
import prisma from './prisma-instance';

interface FacilityTypeData {
  id: string;
  facility_type: string;
}

async function seedFacilityTypes(): Promise<void> {
  try {
    console.log('🏥 Seeding Facility Types...');

    // Verify the model is available
    if (!prisma.healthFacilityType) {
      throw new Error(
        'healthFacilityType model is not available on Prisma client. Make sure Prisma client is generated.',
      );
    }

    // Test database connection
    await prisma.$connect();
    console.log('✅ Database connection established');

    const facilityTypesPath = path.join(
      process.cwd(),
      'assets',
      'facility-types.json',
    );
    const facilityTypes: FacilityTypeData[] = require(facilityTypesPath);

    let created = 0;
    let skipped = 0;

    for (const facilityType of facilityTypes) {
      // Strip leading and trailing spaces
      const trimmedName = facilityType.facility_type.trim();

      // Skip if name is empty after trimming
      if (!trimmedName) {
        console.warn(
          `⚠️  Skipping facility type with empty name (id: ${facilityType.id})`,
        );
        skipped++;
        continue;
      }

      try {
        // Check if facility type with this name already exists
        const existing = await prisma.healthFacilityType.findFirst({
          where: { name: trimmedName },
        });

        if (existing) {
          // Skip if duplicate found
          skipped++;
          continue;
        }

        // Create new facility type
        await prisma.healthFacilityType.create({
          data: {
            name: trimmedName,
          },
        });

        created++;
      } catch (error: unknown) {
        const errorMessage =
          error instanceof Error ? error.message : String(error);
        console.error(
          `❌ Error processing facility type "${trimmedName}":`,
          errorMessage,
        );
        throw error;
      }
    }

    console.log(`\n📊 Summary:`);
    console.log(`   ✅ Created/Updated: ${created}`);
    console.log(`   ⏭️  Skipped (duplicates/empty): ${skipped}`);
    console.log(`   📦 Total processed: ${facilityTypes.length}`);
    console.log('\n🎉 Facility Types Seed Completed!');
  } catch (error) {
    console.error('❌ Error seeding facility types:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

seedFacilityTypes().catch((err) => {
  console.error('💥 Failed seeding facility types', err);
  process.exitCode = 1;
});

/* eslint-disable @typescript-eslint/no-require-imports */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import path from 'path';
import prisma from './prisma-instance';

interface HealthFacilityData {
  id: string;
  kmfl_code: string;
  facility_name: string;
  longitude: string;
  latitude: string;
  county: string;
  sub_county: string;
  ward: string;
  facility_type: string;
  facility_o: string;
}

// Helper function to strip all extra spaces from a string
function stripSpaces(value: string | null | undefined): string {
  if (!value) return '';
  return value.trim().replace(/\s+/g, ' ');
}

async function seedHealthFacilities(): Promise<void> {
  try {
    console.log('🏥 Seeding Health Facilities...');

    // Verify the model is available
    if (!prisma.healthFacility) {
      throw new Error(
        'healthFacility model is not available on Prisma client. Make sure Prisma client is generated.',
      );
    }

    // Test database connection
    await prisma.$connect();
    console.log('✅ Database connection established');

    const healthFacilitiesPath = path.join(process.cwd(), 'assets', 'mfl.json');
    const healthFacilities: HealthFacilityData[] =
      require(healthFacilitiesPath);

    // First, fetch all facility types and create a map by name for quick lookup
    const facilityTypes = await prisma.healthFacilityType.findMany();
    const facilityTypeMap = new Map<string, string>();

    for (const type of facilityTypes) {
      // Normalize the name (trim) for matching
      const normalizedName = type.name.trim();
      facilityTypeMap.set(normalizedName, type.id);
    }

    console.log(`📋 Loaded ${facilityTypeMap.size} facility types for lookup`);

    let created = 0;
    let updated = 0;
    let skipped = 0;
    let errors = 0;

    for (const facility of healthFacilities) {
      try {
        // Strip all string values of extra spaces
        const kmflCode = stripSpaces(facility.kmfl_code);
        const name = stripSpaces(facility.facility_name);
        const county = stripSpaces(facility.county);
        const subcounty = stripSpaces(facility.sub_county);
        const ward = stripSpaces(facility.ward);
        const owner = stripSpaces(facility.facility_o);
        const facilityTypeName = stripSpaces(facility.facility_type);

        // Skip if kmfl_code is empty (required field)
        if (!kmflCode) {
          console.warn(
            `⚠️  Skipping facility with empty kmfl_code (id: ${facility.id})`,
          );
          skipped++;
          continue;
        }

        // Find facility type by name
        const typeId = facilityTypeMap.get(facilityTypeName);

        if (!typeId) {
          console.warn(
            `⚠️  Facility type "${facilityTypeName}" not found for facility "${name}" (kmfl_code: ${kmflCode}). Skipping...`,
          );
          skipped++;
          continue;
        }

        // Parse coordinates
        let coordinates: { latitude: number; longitude: number } | undefined =
          undefined;
        const longitude = stripSpaces(facility.longitude);
        const latitude = stripSpaces(facility.latitude);

        if (longitude && latitude) {
          const lon = parseFloat(longitude);
          const lat = parseFloat(latitude);

          if (!isNaN(lon) && !isNaN(lat)) {
            coordinates = {
              latitude: lat,
              longitude: lon,
            };
          }
        }

        // Check if facility already exists
        const existing = await prisma.healthFacility.findUnique({
          where: { kmflCode },
        });

        if (existing) {
          // Update existing facility
          await prisma.healthFacility.update({
            where: { kmflCode },
            data: {
              name,
              county,
              subcounty,
              ward: ward || undefined,
              owner: owner || undefined,
              coordinates: coordinates,
              typeId,
              updatedAt: new Date(),
            },
          });
          updated++;
        } else {
          // Create new facility
          await prisma.healthFacility.create({
            data: {
              kmflCode,
              name,
              county,
              subcounty,
              ward: ward || undefined,
              owner: owner || undefined,
              coordinates: coordinates,
              typeId,
            },
          });
          created++;
        }
      } catch (error: any) {
        errors++;
        console.error(
          `❌ Error processing facility "${facility.facility_name}" (kmfl_code: ${facility.kmfl_code}):`,
          error.message,
        );
        // Continue processing other facilities even if one fails
      }
    }

    console.log(`\n📊 Summary:`);
    console.log(`   ✅ Created: ${created}`);
    console.log(`   🔄 Updated: ${updated}`);
    console.log(`   ⏭️  Skipped: ${skipped}`);
    console.log(`   ❌ Errors: ${errors}`);
    console.log(`   📦 Total processed: ${healthFacilities.length}`);
    console.log('\n🎉 Health Facilities Seed Completed!');
  } catch (error) {
    console.error('❌ Error seeding health facilities:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

seedHealthFacilities().catch((err) => {
  console.error('💥 Failed seeding health facilities', err);
  process.exitCode = 1;
});

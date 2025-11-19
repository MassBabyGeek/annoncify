import { PrismaClient } from '@prisma/client'
import { FORM_FIELDS_REGISTRY } from '../shared/src/form-fields'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding form field configurations...')

  for (const config of FORM_FIELDS_REGISTRY) {
    const existing = await prisma.formFieldConfig.findUnique({
      where: {
        categoryId_platform: {
          categoryId: config.categoryId,
          platform: config.platform,
        },
      },
    })

    if (existing) {
      console.log(`  ⏭️  Skipping ${config.platform}/${config.categoryId} (already exists)`)
      continue
    }

    await prisma.formFieldConfig.create({
      data: {
        categoryId: config.categoryId,
        platform: config.platform,
        fields: config.fields as any,
        name: `${config.platform} - ${config.categoryId}`,
        description: `Form fields for ${config.categoryId} on ${config.platform}`,
        active: true,
      },
    })

    console.log(`  ✓ Created ${config.platform}/${config.categoryId}`)
  }

  console.log('✅ Seeding complete!')
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

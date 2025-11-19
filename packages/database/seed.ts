import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding database...')

  // Create a test user (you'll need to replace the clerkId with your actual Clerk user ID)
  const user = await prisma.user.upsert({
    where: { email: 'test@annoncify.com' },
    update: {},
    create: {
      clerkId: 'user_test_123', // This should match your Clerk user ID
      email: 'test@annoncify.com',
      firstName: 'Test',
      lastName: 'User',
      role: 'FREE',
    },
  })

  console.log('Created user:', user)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

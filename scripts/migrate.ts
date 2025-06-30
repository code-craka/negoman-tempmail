import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

async function main() {
  console.log("Running database migrations...")

  // Create indexes for better performance
  try {
    await prisma.$executeRaw`CREATE INDEX CONCURRENTLY IF NOT EXISTS "idx_temp_emails_expires_at" ON "temp_emails" ("expiresAt")`
    await prisma.$executeRaw`CREATE INDEX CONCURRENTLY IF NOT EXISTS "idx_messages_received_at" ON "messages" ("receivedAt")`
    await prisma.$executeRaw`CREATE INDEX CONCURRENTLY IF NOT EXISTS "idx_user_analytics_timestamp" ON "user_analytics" ("timestamp")`
    await prisma.$executeRaw`CREATE INDEX CONCURRENTLY IF NOT EXISTS "idx_payments_status" ON "payments" ("status")`

    console.log("Database indexes created successfully")
  } catch (error) {
    console.error("Error creating indexes:", error)
  }

  // Clean up expired emails
  const expiredEmails = await prisma.tempEmail.deleteMany({
    where: {
      expiresAt: {
        lt: new Date(),
      },
    },
  })

  console.log(`Cleaned up ${expiredEmails.count} expired emails`)

  // Initialize system analytics
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  await prisma.systemAnalytics.upsert({
    where: {
      metric_date: {
        metric: "daily_users",
        date: today,
      },
    },
    update: {},
    create: {
      metric: "daily_users",
      value: 0,
      date: today,
    },
  })

  console.log("System analytics initialized")
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

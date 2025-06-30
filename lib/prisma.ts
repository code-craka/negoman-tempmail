import { PrismaClient } from "@prisma/client"
import { withAccelerate } from "@prisma/extension-accelerate"

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Check if we're using Prisma Accelerate (production) or direct connection (development)
const isUsingAccelerate = process.env.DATABASE_URL?.startsWith("prisma://")

export const prisma =
  globalForPrisma.prisma ??
  (isUsingAccelerate
    ? new PrismaClient({
        log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
      }).$extends(withAccelerate())
    : new PrismaClient({
        log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
      }))

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma

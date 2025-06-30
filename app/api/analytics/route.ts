import { type NextRequest, NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth()

    // Check if user is admin (you can implement your own admin check)
    if (!userId) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    // Import Prisma dynamically to avoid build issues
    const { prisma } = await import("@/lib/prisma")
    const { redis, CACHE_KEYS } = await import("@/lib/redis")

    // Check cache first
    const today = new Date().toISOString().split("T")[0]
    const cacheKey = CACHE_KEYS.ANALYTICS("dashboard", today)

    let cachedData
    try {
      cachedData = await redis.get(cacheKey)
    } catch (error) {
      console.warn("Redis cache unavailable:", error)
    }

    if (cachedData) {
      return NextResponse.json(JSON.parse(cachedData as string))
    }

    // Fetch analytics data with error handling
    const [totalUsers, activeUsers, totalRevenue, todayRevenue, emailsGenerated, conversionRate] =
      await Promise.allSettled([
        prisma.user.count().catch(() => 0),
        prisma.user
          .count({
            where: {
              lastActiveAt: {
                gte: new Date(Date.now() - 24 * 60 * 60 * 1000), // Last 24 hours
              },
            },
          })
          .catch(() => 0),
        prisma.payment
          .aggregate({
            where: { status: "COMPLETED" },
            _sum: { amount: true },
          })
          .catch(() => ({ _sum: { amount: 0 } })),
        prisma.payment
          .aggregate({
            where: {
              status: "COMPLETED",
              createdAt: {
                gte: new Date(today),
              },
            },
            _sum: { amount: true },
          })
          .catch(() => ({ _sum: { amount: 0 } })),
        prisma.tempEmail
          .count({
            where: {
              createdAt: {
                gte: new Date(Date.now() - 24 * 60 * 60 * 1000),
              },
            },
          })
          .catch(() => 0),
        prisma.user
          .count({
            where: { plan: { not: "FREE" } },
          })
          .catch(() => 0),
      ])

    const analytics = {
      totalUsers: totalUsers.status === "fulfilled" ? totalUsers.value : 0,
      activeUsers: activeUsers.status === "fulfilled" ? activeUsers.value : 0,
      totalRevenue: totalRevenue.status === "fulfilled" ? totalRevenue.value._sum.amount || 0 : 0,
      todayRevenue: todayRevenue.status === "fulfilled" ? todayRevenue.value._sum.amount || 0 : 0,
      emailsGenerated: emailsGenerated.status === "fulfilled" ? emailsGenerated.value : 0,
      conversionRate:
        totalUsers.status === "fulfilled" && conversionRate.status === "fulfilled" && totalUsers.value > 0
          ? (conversionRate.value / totalUsers.value) * 100
          : 0,
      upgradesLast24h: await prisma.payment
        .count({
          where: {
            status: "COMPLETED",
            createdAt: {
              gte: new Date(Date.now() - 24 * 60 * 60 * 1000),
            },
          },
        })
        .catch(() => 0),
    }

    // Cache for 5 minutes if Redis is available
    try {
      await redis.setex(cacheKey, 300, JSON.stringify(analytics))
    } catch (error) {
      console.warn("Failed to cache analytics:", error)
    }

    return NextResponse.json(analytics)
  } catch (error) {
    console.error("Analytics error:", error)

    // Return fallback data if database is unavailable
    const fallbackAnalytics = {
      totalUsers: 0,
      activeUsers: 0,
      totalRevenue: 0,
      todayRevenue: 0,
      emailsGenerated: 0,
      conversionRate: 0,
      upgradesLast24h: 0,
    }

    return NextResponse.json(fallbackAnalytics)
  }
}

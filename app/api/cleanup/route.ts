import { NextResponse } from "next/server"

export async function GET() {
  try {
    const { prisma } = await import("@/lib/prisma")

    // Clean up expired emails
    const expiredEmails = await prisma.tempEmail.deleteMany({
      where: {
        expiresAt: {
          lt: new Date(),
        },
      },
    })

    // Clean up old analytics data (older than 30 days)
    const oldAnalytics = await prisma.userAnalytics.deleteMany({
      where: {
        timestamp: {
          lt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        },
      },
    })

    return NextResponse.json({
      success: true,
      cleaned: {
        emails: expiredEmails.count,
        analytics: oldAnalytics.count,
      },
    })
  } catch (error) {
    console.error("Cleanup error:", error)
    return NextResponse.json({ error: "Cleanup failed" }, { status: 500 })
  }
}

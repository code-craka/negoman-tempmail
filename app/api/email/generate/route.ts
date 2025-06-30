import { type NextRequest, NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"

// Helper function to generate session ID
function generateSessionId(): string {
  return `session_${Date.now()}_${Math.random().toString(36).substring(7)}`
}

// Helper function to generate referral code
function generateReferralCode(): string {
  return `REF_${Math.random().toString(36).substring(7).toUpperCase()}`
}

// Helper function to get or create user
async function getOrCreateUser(userId: string, prisma: any) {
  try {
    let user = await prisma.user.findUnique({
      where: { clerkId: userId },
    })

    if (!user) {
      user = await prisma.user.create({
        data: {
          clerkId: userId,
          referralCode: generateReferralCode(),
        },
      })
    }

    return user
  } catch (error) {
    console.warn("Database unavailable, proceeding without user data:", error)
    return null
  }
}

// Helper function to validate custom domain access
function validateCustomDomainAccess(customDomain: string | undefined, user: any) {
  return customDomain && (!user || user.plan === "FREE")
}

// Helper function to track analytics
async function trackEmailGeneration(prisma: any, data: {
  userId?: string
  sessionId: string
  emailResponse: any
  customDomain?: string
  ip: string
  userAgent: string | null
}) {
  try {
    await prisma.userAnalytics.create({
      data: {
        userId: data.userId,
        sessionId: data.sessionId,
        event: "email_generated",
        properties: {
          provider: data.emailResponse.provider,
          domain: data.emailResponse.domain,
          hasCustomDomain: !!data.customDomain,
        },
        ipAddress: data.ip,
        userAgent: data.userAgent,
      },
    })
  } catch (error) {
    console.warn("Failed to track analytics:", error)
  }
}

export async function POST(request: NextRequest) {
  try {
    // Import modules dynamically to avoid build issues
    const { emailProviderManager } = await import("@/lib/email-providers/manager")
    const { prisma } = await import("@/lib/prisma")
    const { rateLimit } = await import("@/lib/rate-limit")

    // Rate limiting
    const ip = request.ip || "unknown"
    const rateLimitResult = await rateLimit(ip, "email-generate", 10, 3600)

    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: "Rate limit exceeded", resetTime: rateLimitResult.resetTime },
        { status: 429 }
      )
    }

    // Get user and request data
    const { userId } = await auth()
    const body = await request.json()
    const { domain, prefix, customDomain } = body

    // Generate session ID for anonymous users
    const sessionId = userId || generateSessionId()

    // Get or create user if authenticated
    const user = userId ? await getOrCreateUser(userId, prisma) : null

    // Validate custom domain access
    if (validateCustomDomainAccess(customDomain, user)) {
      return NextResponse.json(
        { error: "Custom domains require premium plan" },
        { status: 403 }
      )
    }

    // Generate email
    const emailResponse = await emailProviderManager.generateEmail(
      customDomain || domain,
      prefix,
      user?.id,
      sessionId
    )

    // Track analytics (non-blocking)
    await trackEmailGeneration(prisma, {
      userId: user?.id,
      sessionId,
      emailResponse,
      customDomain,
      ip,
      userAgent: request.headers.get("user-agent"),
    })

    return NextResponse.json({
      success: true,
      email: emailResponse,
      sessionId,
    })
  } catch (error) {
    console.error("Email generation error:", error)
    return NextResponse.json({ error: "Failed to generate email" }, { status: 500 })
  }
}

import { type NextRequest, NextResponse } from "next/server"
import { emailProviderManager } from "@/lib/email-providers/manager"
import { rateLimit } from "@/lib/rate-limit"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const email = searchParams.get("email")

    if (!email) {
      return NextResponse.json({ error: "Email address is required" }, { status: 400 })
    }

    // Rate limiting
    const ip = request.ip || "unknown"
    const rateLimitResult = await rateLimit(ip, "messages", 30, 3600) // 30 per hour

    if (!rateLimitResult.success) {
      return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 })
    }

    const messages = await emailProviderManager.getMessages(email)

    return NextResponse.json({
      success: true,
      messages,
    })
  } catch (error) {
    console.error("Messages fetch error:", error)
    return NextResponse.json({ error: "Failed to fetch messages" }, { status: 500 })
  }
}

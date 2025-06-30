import { type NextRequest, NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { paymentProcessor } from "@/lib/payment-processor"
import { prisma } from "@/lib/prisma"

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    const body = await request.json()
    const { plan } = body

    if (!["QUICK", "EXTENDED", "PRO", "ENTERPRISE"].includes(plan)) {
      return NextResponse.json({ error: "Invalid plan" }, { status: 400 })
    }

    // Ensure user exists in database
    let user = await prisma.user.findUnique({
      where: { clerkId: userId },
    })

    if (!user) {
      user = await prisma.user.create({
        data: {
          clerkId: userId,
          referralCode: `REF_${Math.random().toString(36).substring(7).toUpperCase()}`,
        },
      })
    }

    const session = await paymentProcessor.createCheckoutSession(
      user.id,
      plan,
      `${process.env.NEXT_PUBLIC_APP_URL}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      `${process.env.NEXT_PUBLIC_APP_URL}/payment/cancel`,
    )

    return NextResponse.json({
      success: true,
      sessionId: session.id,
      url: session.url,
    })
  } catch (error) {
    console.error("Checkout creation error:", error)
    return NextResponse.json({ error: "Failed to create checkout session" }, { status: 500 })
  }
}

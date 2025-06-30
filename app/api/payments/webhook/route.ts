import { type NextRequest, NextResponse } from "next/server"
import { stripe } from "@/lib/stripe"
import { paymentProcessor } from "@/lib/payment-processor"

export async function POST(request: NextRequest) {
  const body = await request.text()
  const signature = request.headers.get("stripe-signature")!

  try {
    const event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET!)

    switch (event.type) {
      case "checkout.session.completed":
        const session = event.data.object
        await paymentProcessor.handleSuccessfulPayment(session.id)
        break

      case "payment_intent.payment_failed":
        // Handle failed payment
        console.log("Payment failed:", event.data.object)
        break

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error("Webhook error:", error)
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 400 })
  }
}

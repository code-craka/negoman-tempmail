import { stripe, PRICING_CONFIG, calculateDynamicPrice } from "./stripe"
import { prisma } from "./prisma"
import { clerkClient } from "@clerk/nextjs/server"

export class PaymentProcessor {
  async createCheckoutSession(
    userId: string,
    plan: keyof typeof PRICING_CONFIG,
    successUrl: string,
    cancelUrl: string,
  ) {
    const config = PRICING_CONFIG[plan]
    const dynamicAmount = calculateDynamicPrice(config.amount)

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: `TempMail ${plan} Plan`,
              description: this.getPlanDescription(plan),
            },
            unit_amount: dynamicAmount,
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        userId,
        plan,
        originalAmount: config.amount.toString(),
        dynamicAmount: dynamicAmount.toString(),
      },
    })

    // Store payment record
    await prisma.payment.create({
      data: {
        userId,
        stripeSessionId: session.id,
        plan: plan as any,
        amount: dynamicAmount / 100, // Convert to dollars
        status: "PENDING",
        metadata: {
          originalAmount: config.amount,
          dynamicAmount,
          duration: config.duration,
        },
      },
    })

    return session
  }

  async handleSuccessfulPayment(sessionId: string) {
    const session = await stripe.checkout.sessions.retrieve(sessionId)

    if (session.payment_status === "paid") {
      const payment = await prisma.payment.findUnique({
        where: { stripeSessionId: sessionId },
        include: { user: true },
      })

      if (!payment) {
        throw new Error("Payment record not found")
      }

      // Update payment status
      await prisma.payment.update({
        where: { id: payment.id },
        data: {
          status: "COMPLETED",
          stripePaymentId: session.payment_intent as string,
        },
      })

      // Update user plan
      const planDuration = PRICING_CONFIG[payment.plan as keyof typeof PRICING_CONFIG].duration
      const expiresAt = new Date(Date.now() + planDuration * 1000)

      await prisma.user.update({
        where: { id: payment.userId },
        data: {
          plan: payment.plan,
          planExpiresAt: expiresAt,
          totalSpent: { increment: payment.amount },
        },
      })

      // Update Clerk metadata
      await clerkClient.users.updateUserMetadata(payment.user.clerkId, {
        publicMetadata: {
          plan: payment.plan,
          planExpiresAt: expiresAt.toISOString(),
        },
      })

      // Track analytics
      await this.trackPaymentSuccess(payment.userId, payment.plan, payment.amount)

      // Process referral rewards if applicable
      if (payment.user.referredBy) {
        await this.processReferralReward(payment.user.referredBy, payment.amount)
      }

      return payment
    }

    throw new Error("Payment not completed")
  }

  private async trackPaymentSuccess(userId: string, plan: string, amount: number) {
    await prisma.userAnalytics.create({
      data: {
        userId,
        event: "payment_completed",
        properties: {
          plan,
          amount,
          timestamp: new Date(),
        },
      },
    })

    // Update system analytics
    const today = new Date().toISOString().split("T")[0]
    await prisma.systemAnalytics.upsert({
      where: {
        metric_date: {
          metric: "daily_revenue",
          date: new Date(today),
        },
      },
      update: {
        value: { increment: amount },
      },
      create: {
        metric: "daily_revenue",
        value: amount,
        date: new Date(today),
      },
    })
  }

  private async processReferralReward(referrerId: string, amount: number) {
    const commission = amount * 0.3 // 30% commission

    await prisma.user.update({
      where: { id: referrerId },
      data: {
        credits: { increment: Math.round(commission * 100) }, // Store as cents
      },
    })

    await prisma.userAnalytics.create({
      data: {
        userId: referrerId,
        event: "referral_commission",
        properties: {
          amount: commission,
          originalAmount: amount,
        },
      },
    })
  }

  private getPlanDescription(plan: keyof typeof PRICING_CONFIG): string {
    switch (plan) {
      case "QUICK":
        return "1 hour email validity with custom domains"
      case "EXTENDED":
        return "24 hour validity + no ads + email forwarding"
      case "PRO":
        return "1 week validity + API access + bulk creation"
      case "ENTERPRISE":
        return "Unlimited features + team management + priority support"
      default:
        return "Premium email features"
    }
  }
}

export const paymentProcessor = new PaymentProcessor()

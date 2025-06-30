import Stripe from "stripe"

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-06-20",
})

export const PRICING_CONFIG = {
  QUICK: {
    priceId: process.env.STRIPE_QUICK_PRICE_ID!,
    amount: 99, // $0.99
    duration: 3600, // 1 hour
  },
  EXTENDED: {
    priceId: process.env.STRIPE_EXTENDED_PRICE_ID!,
    amount: 299, // $2.99
    duration: 86400, // 24 hours
  },
  PRO: {
    priceId: process.env.STRIPE_PRO_PRICE_ID!,
    amount: 999, // $9.99
    duration: 604800, // 1 week
  },
  ENTERPRISE: {
    priceId: process.env.STRIPE_ENTERPRISE_PRICE_ID!,
    amount: 2999, // $29.99
    duration: 2592000, // 30 days
  },
} as const

export function calculateDynamicPrice(baseAmount: number): number {
  const now = new Date()
  const hour = now.getHours()
  const day = now.getDay()

  let multiplier = 1

  // Peak hours (9 AM - 5 PM)
  if (hour >= 9 && hour <= 17) {
    multiplier += 0.1 // +10%
  }

  // Weekend pricing
  if (day === 0 || day === 6) {
    multiplier += 0.2 // +20%
  }

  // Holiday season (December)
  if (now.getMonth() === 11) {
    multiplier += 0.3 // +30%
  }

  // High demand simulation (random)
  if (Math.random() > 0.7) {
    multiplier += 0.15 // +15%
  }

  return Math.round(baseAmount * multiplier)
}

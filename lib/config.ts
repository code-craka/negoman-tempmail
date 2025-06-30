import type { PricingTier } from "./types" // Assuming PricingTier is defined in a separate file

export const EMAIL_PROVIDERS = [
  { name: "mail.tm", endpoint: "/api/providers/mailtm", active: true },
  { name: "guerrillamail", endpoint: "/api/providers/guerrilla", active: true },
  { name: "tempmail.lol", endpoint: "/api/providers/tempmail", active: true },
]

export const PRICING_TIERS: PricingTier[] = [
  {
    id: "quick",
    name: "Quick Plan",
    price: 0.99,
    duration: "1 hour",
    features: ["1 hour validity", "Custom domain email", "Basic support"],
    color: "blue",
  },
  {
    id: "extended",
    name: "Extended Plan",
    price: 2.99,
    duration: "24 hours",
    features: ["24 hour validity", "Custom domain", "Email forwarding", "No ads"],
    popular: true,
    color: "purple",
  },
  {
    id: "pro",
    name: "Pro Plan",
    price: 9.99,
    duration: "1 week",
    features: ["1 week validity", "Multiple domains", "API access", "Bulk creation"],
    color: "green",
  },
  {
    id: "enterprise",
    name: "Enterprise Plan",
    price: 29.99,
    duration: "monthly",
    features: ["Custom retention", "Team management", "24/7 support", "Unlimited features"],
    color: "gold",
  },
]

export const SURGE_PRICING = {
  peakHours: 0.1, // +10%
  weekend: 0.2, // +20%
  holiday: 0.3, // +30%
  highDemand: 0.15, // +15%
}

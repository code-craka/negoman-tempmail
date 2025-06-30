export interface EmailMessage {
  id: string
  from: string
  subject: string
  content: string
  timestamp: Date
  isRead: boolean
}

export interface TempEmail {
  address: string
  expiresAt: Date
  provider: string
  messages: EmailMessage[]
}

export interface PricingTier {
  id: string
  name: string
  price: number
  originalPrice?: number
  duration: string
  features: string[]
  popular?: boolean
  color: string
}

export interface User {
  id: string
  email?: string
  plan: "free" | "quick" | "extended" | "pro" | "enterprise"
  expiresAt?: Date
  referralCode: string
  apiKey?: string
}

export interface AnalyticsData {
  totalUsers: number
  activeUsers: number
  revenue: number
  conversions: number
  upgradesLast24h: number
}

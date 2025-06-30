import { Redis } from "@upstash/redis"

// Configure Redis using standard Upstash configuration
// Fallback to manual configuration if env vars not properly set
export const redis = process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
  ? Redis.fromEnv()
  : new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL || "https://champion-maggot-53653.upstash.io",
      token: process.env.UPSTASH_REDIS_REST_TOKEN || "AdGVAAIjcDE0NThjNTcyZDQ0ZGE0MjA1OWIzNmY1N2I4NjIyZTJjYXAxMA",
    })

// Cache keys
export const CACHE_KEYS = {
  EMAIL: (address: string) => `email:${address}`,
  MESSAGES: (emailId: string) => `messages:${emailId}`,
  USER_SESSION: (sessionId: string) => `session:${sessionId}`,
  PROVIDER_HEALTH: (provider: string) => `health:${provider}`,
  ANALYTICS: (metric: string, date: string) => `analytics:${metric}:${date}`,
  RATE_LIMIT: (ip: string, endpoint: string) => `rate:${ip}:${endpoint}`,
} as const

// Cache TTL in seconds
export const CACHE_TTL = {
  EMAIL: 3600, // 1 hour
  MESSAGES: 300, // 5 minutes
  USER_SESSION: 86400, // 24 hours
  PROVIDER_HEALTH: 60, // 1 minute
  ANALYTICS: 3600, // 1 hour
  RATE_LIMIT: 3600, // 1 hour
} as const

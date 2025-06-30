import { redis } from "./redis"

export interface RateLimitResult {
  success: boolean
  limit: number
  remaining: number
  resetTime: number
}

export async function rateLimit(
  identifier: string,
  action: string,
  limit: number,
  windowMs: number,
): Promise<RateLimitResult> {
  const key = `rate_limit:${identifier}:${action}`
  const window = Math.floor(Date.now() / windowMs)
  const windowKey = `${key}:${window}`

  try {
    const current = await redis.incr(windowKey)

    if (current === 1) {
      await redis.expire(windowKey, Math.ceil(windowMs / 1000))
    }

    const resetTime = (window + 1) * windowMs

    return {
      success: current <= limit,
      limit,
      remaining: Math.max(0, limit - current),
      resetTime,
    }
  } catch (error) {
    console.error("Rate limiting error:", error)
    // Fail open - allow the request if Redis is down
    return {
      success: true,
      limit,
      remaining: limit - 1,
      resetTime: Date.now() + windowMs,
    }
  }
}

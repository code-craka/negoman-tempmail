import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function generateRandomEmail(domain = "tempmail.dev"): string {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789"
  const length = Math.floor(Math.random() * 8) + 8
  let result = ""
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return `${result}@${domain}`
}

export function formatTimeRemaining(seconds: number): string {
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  return `${minutes.toString().padStart(2, "0")}:${remainingSeconds.toString().padStart(2, "0")}`
}

const SURGE_PRICING = {
  peakHours: 0.5,
  weekend: 0.3,
  highDemand: 0.2,
}

export function calculateSurgePrice(basePrice: number): number {
  const now = new Date()
  const hour = now.getHours()
  const day = now.getDay()

  let multiplier = 1

  // Peak hours (9-17)
  if (hour >= 9 && hour <= 17) {
    multiplier += SURGE_PRICING.peakHours
  }

  // Weekend
  if (day === 0 || day === 6) {
    multiplier += SURGE_PRICING.weekend
  }

  // Simulate high demand (random)
  if (Math.random() > 0.7) {
    multiplier += SURGE_PRICING.highDemand
  }

  return Math.round(basePrice * multiplier * 100) / 100
}

export function generateReferralCode(): string {
  return Math.random().toString(36).substring(2, 8).toUpperCase()
}

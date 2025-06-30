import type { EmailProvider, EmailResponse, MessageResponse } from "./base"
import { MailTmProvider } from "./mailtm"
import { OneSecMailProvider } from "./onesecmail"
import { GuerrillaMailProvider } from "./guerrillamail"
import { TempMailProvider } from "./tempmail"
import { prisma } from "@/lib/prisma"
import { redis, CACHE_KEYS, CACHE_TTL } from "@/lib/redis"

export class EmailProviderManager {
  private providers: EmailProvider[] = [new OneSecMailProvider(), new MailTmProvider(), new GuerrillaMailProvider(), new TempMailProvider()]

  async generateEmail(domain?: string, prefix?: string, userId?: string, sessionId?: string): Promise<EmailResponse> {
    const healthyProviders = await this.getHealthyProviders()

    if (healthyProviders.length === 0) {
      throw new Error("No healthy email providers available")
    }

    let lastError: Error | null = null

    for (const provider of healthyProviders) {
      try {
        const emailResponse = await provider.generateEmail(domain, prefix)

        // Store in database (with error handling)
        let tempEmailId: string | undefined
        try {
          const tempEmail = await prisma.tempEmail.create({
            data: {
              address: emailResponse.address,
              domain: emailResponse.domain,
              provider: this.getProviderEnum(provider.name),
              userId,
              sessionId,
              expiresAt: emailResponse.expiresAt,
            },
          })
          tempEmailId = tempEmail.id
        } catch (dbError) {
          console.warn("Failed to store email in database:", dbError)
        }

        // Cache the email (with error handling)
        try {
          await redis.setex(
            CACHE_KEYS.EMAIL(emailResponse.address),
            CACHE_TTL.EMAIL,
            JSON.stringify({
              ...emailResponse,
              id: tempEmailId,
            }),
          )
        } catch (cacheError) {
          console.warn("Failed to cache email:", cacheError)
        }

        // Track analytics (non-blocking)
        try {
          await this.trackEmailGeneration(provider.name, userId, sessionId)
        } catch (analyticsError) {
          console.warn("Failed to track analytics:", analyticsError)
        }

        return emailResponse
      } catch (error) {
        lastError = error as Error
        console.error(`Provider ${provider.name} failed:`, error)

        // Mark provider as unhealthy
        await this.updateProviderHealth(provider.name, false)
        continue
      }
    }

    throw lastError || new Error("All email providers failed")
  }

  async getMessages(emailAddress: string): Promise<MessageResponse[]> {
    // Check cache first
    const cachedMessages = await redis.get(CACHE_KEYS.MESSAGES(emailAddress))
    if (cachedMessages) {
      return JSON.parse(cachedMessages as string)
    }

    // Get email from database
    const tempEmail = await prisma.tempEmail.findUnique({
      where: { address: emailAddress },
      include: { messages: true },
    })

    if (!tempEmail) {
      throw new Error("Email not found")
    }

    // Get provider
    const provider = this.providers.find((p) => this.getProviderEnum(p.name) === tempEmail.provider)

    if (!provider) {
      throw new Error("Provider not available")
    }

    try {
      const messages = await provider.getMessages(emailAddress)

      // Store new messages in database
      for (const message of messages) {
        const existingMessage = await prisma.message.findUnique({
          where: { messageId: message.id },
        })

        if (!existingMessage) {
          await prisma.message.create({
            data: {
              tempEmailId: tempEmail.id,
              messageId: message.id,
              from: message.from,
              to: message.to,
              subject: message.subject,
              content: message.content,
              htmlContent: message.htmlContent,
              receivedAt: message.receivedAt,
              attachments: message.attachments,
            },
          })
        }
      }

      // Cache messages
      await redis.setex(CACHE_KEYS.MESSAGES(emailAddress), CACHE_TTL.MESSAGES, JSON.stringify(messages))

      return messages
    } catch (error) {
      console.error(`Failed to get messages for ${emailAddress}:`, error)

      // Return cached messages from database
      return tempEmail.messages.map((msg) => ({
        id: msg.messageId,
        from: msg.from,
        to: msg.to,
        subject: msg.subject,
        content: msg.content,
        htmlContent: msg.htmlContent,
        receivedAt: msg.receivedAt,
        attachments: msg.attachments as any[],
      }))
    }
  }

  private async getHealthyProviders(): Promise<EmailProvider[]> {
    const healthyProviders: EmailProvider[] = []

    for (const provider of this.providers) {
      let isHealthy = true
      
      try {
        const cacheKey = CACHE_KEYS.PROVIDER_HEALTH(provider.name)
        const cachedHealth = await redis.get(cacheKey)

        if (cachedHealth === null) {
          isHealthy = await provider.isHealthy()
          await redis.setex(cacheKey, CACHE_TTL.PROVIDER_HEALTH, isHealthy ? "1" : "0")
        } else {
          isHealthy = cachedHealth === "1"
        }
      } catch (error) {
        console.warn(`Health check failed for ${provider.name}, assuming healthy:`, error)
        isHealthy = true
      }

      if (isHealthy) {
        healthyProviders.push(provider)
      }
    }

    return healthyProviders
  }

  private async updateProviderHealth(providerName: string, isHealthy: boolean) {
    const providerEnum = this.getProviderEnum(providerName)

    await prisma.providerHealth.upsert({
      where: { provider: providerEnum },
      update: {
        isHealthy,
        lastChecked: new Date(),
        errorRate: isHealthy ? 0 : { increment: 1 },
      },
      create: {
        provider: providerEnum,
        isHealthy,
        errorRate: isHealthy ? 0 : 1,
      },
    })

    // Update cache
    await redis.setex(CACHE_KEYS.PROVIDER_HEALTH(providerName), CACHE_TTL.PROVIDER_HEALTH, isHealthy ? "1" : "0")
  }

  private async trackEmailGeneration(provider: string, userId?: string, sessionId?: string) {
    await prisma.userAnalytics.create({
      data: {
        userId,
        sessionId,
        event: "email_generated",
        properties: { provider },
        timestamp: new Date(),
      },
    })
  }

  private getProviderEnum(providerName: string) {
    switch (providerName) {
      case "mail.tm":
        return "MAILTM" as const
      case "1secmail":
        return "ONESECMAIL" as const
      case "guerrillamail":
        return "GUERRILLAMAIL" as const
      default:
        return "TEMPMAIL" as const
    }
  }
}

export const emailProviderManager = new EmailProviderManager()

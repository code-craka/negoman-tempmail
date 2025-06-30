import { type EmailProvider, type EmailResponse, type MessageResponse, ProviderError } from "./base"

export class MailTmProvider implements EmailProvider {
  name = "mail.tm"
  private baseUrl = process.env.MAIL_TM_BASE_URL || "https://api.mail.tm"
  private token: string | null = process.env.MAIL_TM_API_TOKEN || null
  private tokenExpiry: number = 0

  async generateEmail(domain?: string, prefix?: string): Promise<EmailResponse> {
    try {
      // Use a fallback approach - try to get domains, but use defaults if it fails
      let selectedDomain = domain || "1secmail.com"
      
      try {
        const domainsResponse = await fetch(`${this.baseUrl}/domains`, { timeout: 5000 })
        if (domainsResponse.ok) {
          const domainsData = await domainsResponse.json()
          const availableDomains = domainsData['hydra:member'] || domainsData.domains || domainsData
          if (availableDomains && availableDomains.length > 0) {
            selectedDomain = availableDomains[0]?.domain || selectedDomain
          }
        }
      } catch (domainError) {
        console.warn("Failed to fetch domains, using fallback:", domainError)
      }

      // Generate random email if no prefix provided
      const emailPrefix = prefix || this.generateRandomString(12)
      const emailAddress = `${emailPrefix}@${selectedDomain}`
      const password = this.generateRandomString(16)

      // Create account
      const accountResponse = await fetch(`${this.baseUrl}/accounts`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          address: emailAddress,
          password: password,
        }),
      })

      if (!accountResponse.ok) {
        const errorText = await accountResponse.text().catch(() => "Unknown error")
        console.warn(`MailTM account creation failed (${accountResponse.status}):`, errorText)
        throw new ProviderError(`Failed to create account: ${errorText}`, this.name, accountResponse.status)
      }

      const account = await accountResponse.json()

      // Get auth token
      const authResponse = await fetch(`${this.baseUrl}/token`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          address: emailAddress,
          password: account.password,
        }),
      })

      if (authResponse.ok) {
        const auth = await authResponse.json()
        this.token = auth.token
      }

      return {
        address: emailAddress,
        domain: selectedDomain,
        expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
        provider: this.name,
      }
    } catch (error) {
      if (error instanceof ProviderError) throw error
      throw new ProviderError(`Mail.tm error: ${error}`, this.name)
    }
  }

  async getMessages(email: string): Promise<MessageResponse[]> {
    try {
      // Ensure we have a valid token
      await this.ensureValidToken(email)
      
      if (!this.token) {
        return []
      }

      const response = await fetch(`${this.baseUrl}/messages`, {
        headers: {
          Authorization: `Bearer ${this.token}`,
        },
      })

      if (!response.ok) {
        throw new ProviderError("Failed to fetch messages", this.name, response.status)
      }

      const data = await response.json()

      return data.map((msg: any) => ({
        id: msg.id,
        from: msg.from.address,
        to: msg.to[0]?.address || email,
        subject: msg.subject,
        content: msg.text || msg.html || "",
        htmlContent: msg.html,
        receivedAt: new Date(msg.createdAt),
        attachments: msg.attachments || [],
      }))
    } catch (error) {
      if (error instanceof ProviderError) throw error
      throw new ProviderError(`Mail.tm messages error: ${error}`, this.name)
    }
  }

  async isHealthy(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/domains`, {
        method: "HEAD",
      })
      return response.ok
    } catch {
      return false
    }
  }

  private async ensureValidToken(email?: string): Promise<void> {
    // If we have a token from environment and it's not expired, use it
    if (this.token && Date.now() < this.tokenExpiry) {
      return
    }

    // If we have environment credentials, try to authenticate
    if (process.env.MAIL_TM_EMAIL && process.env.MAIL_TM_PASSWORD) {
      try {
        const authResponse = await fetch(`${this.baseUrl}/token`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            address: process.env.MAIL_TM_EMAIL,
            password: process.env.MAIL_TM_PASSWORD,
          }),
        })

        if (authResponse.ok) {
          const auth = await authResponse.json()
          this.token = auth.token
          // Tokens typically expire after 1 hour
          this.tokenExpiry = Date.now() + 55 * 60 * 1000 // 55 minutes to be safe
        }
      } catch (error) {
        console.warn("Failed to refresh Mail.tm token:", error)
      }
    }
  }

  private generateRandomString(length: number): string {
    const chars = "abcdefghijklmnopqrstuvwxyz0123456789"
    let result = ""
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return result
  }
}

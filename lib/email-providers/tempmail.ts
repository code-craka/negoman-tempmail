import { type EmailProvider, type EmailResponse, type MessageResponse, ProviderError } from "./base"

interface TempMailInbox {
  address: string
  token: string
}

interface TempMailEmail {
  from: string
  to: string
  subject: string
  body: string
  html?: string
  date: number
}

export class TempMailProvider implements EmailProvider {
  name = "tempmail"
  private baseUrl = process.env.TEMPMAIL_LOL_BASE_URL || "https://api.tempmail.lol"
  private apiKey = process.env.TEMPMAIL_LOL_API_KEY
  private inboxTokens = new Map<string, string>() // Store tokens for created emails

  async generateEmail(domain?: string, prefix?: string): Promise<EmailResponse> {
    try {
      // Use TempMail.lol v2 API to create inbox
      const createInboxUrl = `${this.baseUrl}/v2/inbox/create`
      
      const requestBody: any = {}
      if (domain) requestBody.domain = domain
      if (prefix) requestBody.prefix = prefix

      const headers: any = {
        'Content-Type': 'application/json'
      }
      
      // Add API key to headers if available
      if (this.apiKey) {
        headers['Authorization'] = `Bearer ${this.apiKey}`
      }

      const response = await fetch(createInboxUrl, {
        method: 'POST',
        headers,
        body: JSON.stringify(requestBody)
      })

      if (!response.ok) {
        throw new ProviderError(`Failed to create inbox: ${response.status}`, this.name, response.status)
      }

      const inbox: TempMailInbox = await response.json()
      
      // Store the token for later use (both in memory and database)
      this.inboxTokens.set(inbox.address, inbox.token)
      
      // Calculate expiration based on subscription tier
      const expirationMs = this.apiKey ? 10 * 60 * 60 * 1000 : 60 * 60 * 1000 // 10 hours with API key, 1 hour without
      
      const emailResponse = {
        address: inbox.address,
        domain: inbox.address.split('@')[1],
        expiresAt: new Date(Date.now() + expirationMs),
        provider: this.name,
      }

      // Store token in database for persistence (non-blocking)
      this.storeTokenInDatabase(inbox.address, inbox.token).catch(console.warn)
      
      return emailResponse
    } catch (error) {
      if (error instanceof ProviderError) throw error
      throw new ProviderError(`TempMail error: ${error}`, this.name)
    }
  }

  async getMessages(email: string): Promise<MessageResponse[]> {
    try {
      // Get the token for this email address (try memory first, then database)
      let token = this.inboxTokens.get(email)
      if (!token) {
        token = await this.getTokenFromDatabase(email)
        if (token) {
          // Store in memory for future use
          this.inboxTokens.set(email, token)
        }
      }
      
      if (!token) {
        // No token available - inbox might not exist or be expired
        return []
      }

      // Use TempMail.lol v2 API to fetch emails
      const fetchUrl = `${this.baseUrl}/v2/inbox?token=${encodeURIComponent(token)}`
      
      const headers: any = {
        'Content-Type': 'application/json'
      }
      
      if (this.apiKey) {
        headers['Authorization'] = `Bearer ${this.apiKey}`
      }

      const response = await fetch(fetchUrl, {
        method: 'GET',
        headers
      })

      if (!response.ok) {
        if (response.status === 404) {
          // Inbox expired or doesn't exist
          this.inboxTokens.delete(email)
          return []
        }
        throw new ProviderError(`Failed to fetch messages: ${response.status}`, this.name, response.status)
      }

      const data = await response.json()
      
      // Check if inbox is expired
      if (data.expired) {
        this.inboxTokens.delete(email)
        return []
      }

      const emails: TempMailEmail[] = data.emails || []

      return emails.map((msg: TempMailEmail, index: number) => ({
        id: `tempmail-${msg.date}-${index}`,
        from: msg.from,
        to: msg.to || email,
        subject: msg.subject,
        content: msg.body || "",
        htmlContent: msg.html,
        receivedAt: new Date(msg.date * 1000), // Convert Unix timestamp to Date
        attachments: [],
      }))
    } catch (error) {
      if (error instanceof ProviderError) throw error
      
      // For TempMail, if we can't fetch messages, return empty array
      return []
    }
  }

  async isHealthy(): Promise<boolean> {
    try {
      // Test API health by attempting to create a temporary inbox
      const headers: any = {
        'Content-Type': 'application/json'
      }
      
      if (this.apiKey) {
        headers['Authorization'] = `Bearer ${this.apiKey}`
      }

      const response = await fetch(`${this.baseUrl}/v2/inbox/create`, {
        method: "POST",
        headers,
        body: JSON.stringify({}),
      })
      
      // Accept both success and rate limit responses as healthy
      return response.ok || response.status === 429
    } catch {
      return false
    }
  }

  // Method to store token in database for persistence across restarts
  async storeTokenInDatabase(email: string, token: string): Promise<void> {
    try {
      const { prisma } = await import("../prisma")
      
      // Update the temp email record with the token
      await prisma.tempEmail.update({
        where: { address: email },
        data: {
          // Store token in customDomain field temporarily (we can add a proper token field later)
          customDomain: token
        }
      })
    } catch (error) {
      console.warn("Failed to store TempMail token in database:", error)
    }
  }

  // Method to retrieve token from database
  async getTokenFromDatabase(email: string): Promise<string | null> {
    try {
      const { prisma } = await import("../prisma")
      
      const tempEmail = await prisma.tempEmail.findUnique({
        where: { address: email }
      })
      
      return tempEmail?.customDomain || null
    } catch (error) {
      console.warn("Failed to retrieve TempMail token from database:", error)
      return null
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
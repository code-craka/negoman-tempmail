import { type EmailProvider, type EmailResponse, type MessageResponse, ProviderError } from "./base"

export class OneSecMailProvider implements EmailProvider {
  name = "1secmail"
  private baseUrl = "https://www.1secmail.com/api/v1/"

  async generateEmail(domain?: string, prefix?: string): Promise<EmailResponse> {
    try {
      // Get available domains
      const domainsResponse = await fetch(`${this.baseUrl}?action=getDomainList`)
      if (!domainsResponse.ok) {
        throw new ProviderError("Failed to fetch domains", this.name, domainsResponse.status)
      }

      const domains = await domainsResponse.json()
      const selectedDomain = domain || domains[0] || "1secmail.com"

      // Generate random email if no prefix provided
      const emailPrefix = prefix || this.generateRandomString(10)
      const emailAddress = `${emailPrefix}@${selectedDomain}`

      return {
        address: emailAddress,
        domain: selectedDomain,
        expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
        provider: this.name,
      }
    } catch (error) {
      if (error instanceof ProviderError) throw error
      throw new ProviderError(`1SecMail error: ${error}`, this.name)
    }
  }

  async getMessages(email: string): Promise<MessageResponse[]> {
    try {
      const [login, domain] = email.split("@")

      const response = await fetch(`${this.baseUrl}?action=getMessages&login=${login}&domain=${domain}`)

      if (!response.ok) {
        throw new ProviderError("Failed to fetch messages", this.name, response.status)
      }

      const messages = await response.json()

      const detailedMessages = await Promise.all(
        messages.map(async (msg: any) => {
          const detailResponse = await fetch(
            `${this.baseUrl}?action=readMessage&login=${login}&domain=${domain}&id=${msg.id}`,
          )

          if (detailResponse.ok) {
            const detail = await detailResponse.json()
            return {
              id: msg.id.toString(),
              from: msg.from,
              to: email,
              subject: msg.subject,
              content: detail.textBody || detail.htmlBody || "",
              htmlContent: detail.htmlBody,
              receivedAt: new Date(msg.date),
              attachments: detail.attachments || [],
            }
          }

          return {
            id: msg.id.toString(),
            from: msg.from,
            to: email,
            subject: msg.subject,
            content: "",
            receivedAt: new Date(msg.date),
          }
        }),
      )

      return detailedMessages
    } catch (error) {
      if (error instanceof ProviderError) throw error
      throw new ProviderError(`1SecMail messages error: ${error}`, this.name)
    }
  }

  async isHealthy(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}?action=getDomainList`, {
        method: "HEAD",
      })
      return response.ok
    } catch {
      return false
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

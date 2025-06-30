import { type EmailProvider, type EmailResponse, type MessageResponse, ProviderError } from "./base"

export class GuerrillaMailProvider implements EmailProvider {
  name = "guerrillamail"
  private baseUrl = "https://api.guerrillamail.com/ajax.php"

  async generateEmail(domain?: string, prefix?: string): Promise<EmailResponse> {
    try {
      const params = new URLSearchParams({
        f: "get_email_address",
        lang: "en",
        ...(prefix && { email_user: prefix }),
      })

      const response = await fetch(`${this.baseUrl}?${params}`)
      if (!response.ok) {
        throw new ProviderError("Failed to generate email", this.name, response.status)
      }

      const data = await response.json()

      return {
        address: data.email_addr,
        domain: data.email_addr.split("@")[1],
        expiresAt: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
        provider: this.name,
      }
    } catch (error) {
      if (error instanceof ProviderError) throw error
      throw new ProviderError(`GuerrillaMail error: ${error}`, this.name)
    }
  }

  async getMessages(email: string): Promise<MessageResponse[]> {
    try {
      const params = new URLSearchParams({
        f: "get_email_list",
        offset: "0",
      })

      const response = await fetch(`${this.baseUrl}?${params}`)
      if (!response.ok) {
        throw new ProviderError("Failed to fetch messages", this.name, response.status)
      }

      const data = await response.json()
      const messageList = data.list || []

      // Fetch full content for each message
      const messagesWithContent = await Promise.all(
        messageList.map(async (msg: any) => {
          try {
            const fullMessage = await this.getFullMessage(msg.mail_id)
            return {
              id: msg.mail_id,
              from: msg.mail_from,
              to: email,
              subject: msg.mail_subject,
              content: fullMessage.content || msg.mail_excerpt || "",
              htmlContent: fullMessage.htmlContent,
              receivedAt: new Date(msg.mail_timestamp * 1000),
              attachments: fullMessage.attachments || [],
            }
          } catch (error) {
            // If fetching full content fails, fallback to excerpt
            return {
              id: msg.mail_id,
              from: msg.mail_from,
              to: email,
              subject: msg.mail_subject,
              content: msg.mail_excerpt || "",
              receivedAt: new Date(msg.mail_timestamp * 1000),
              attachments: [],
            }
          }
        })
      )

      return messagesWithContent
    } catch (error) {
      if (error instanceof ProviderError) throw error
      throw new ProviderError(`GuerrillaMail messages error: ${error}`, this.name)
    }
  }

  async isHealthy(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}?f=get_email_address`, {
        method: "HEAD",
      })
      return response.ok
    } catch {
      return false
    }
  }

  private async getFullMessage(messageId: string): Promise<{
    content: string
    htmlContent?: string
    attachments?: any[]
  }> {
    try {
      const params = new URLSearchParams({
        f: "fetch_email",
        email_id: messageId,
      })

      const response = await fetch(`${this.baseUrl}?${params}`)
      if (!response.ok) {
        throw new Error("Failed to fetch full message")
      }

      const data = await response.json()

      return {
        content: data.mail_body || "",
        htmlContent: data.mail_body_html || data.mail_body,
        attachments: data.att_list || [],
      }
    } catch (error) {
      // Return empty content if we can't fetch the full message
      return {
        content: "",
        htmlContent: "",
        attachments: [],
      }
    }
  }
}

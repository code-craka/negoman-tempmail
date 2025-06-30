export interface EmailProvider {
  name: string
  generateEmail(domain?: string, prefix?: string): Promise<EmailResponse>
  getMessages(email: string): Promise<MessageResponse[]>
  isHealthy(): Promise<boolean>
}

export interface EmailResponse {
  address: string
  domain: string
  expiresAt: Date
  provider: string
}

export interface MessageResponse {
  id: string
  from: string
  to: string
  subject: string
  content: string
  htmlContent?: string
  receivedAt: Date
  attachments?: any[]
}

export class ProviderError extends Error {
  constructor(
    message: string,
    public provider: string,
    public statusCode?: number,
  ) {
    super(message)
    this.name = "ProviderError"
  }
}

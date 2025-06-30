import type { NextRequest } from "next/server"
import { emailProviderManager } from "@/lib/email-providers/manager"

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const email = searchParams.get("email")

  if (!email) {
    return new Response("Email address required", { status: 400 })
  }

  const encoder = new TextEncoder()

  const stream = new ReadableStream({
    start(controller) {
      const sendMessage = (data: any) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`))
      }

      // Send initial connection message
      sendMessage({ type: "connected", timestamp: Date.now() })

      // Poll for messages every 3 seconds
      const interval = setInterval(async () => {
        try {
          const messages = await emailProviderManager.getMessages(email)
          sendMessage({
            type: "messages",
            data: messages,
            timestamp: Date.now(),
          })
        } catch (error) {
          sendMessage({
            type: "error",
            error: "Failed to fetch messages",
            timestamp: Date.now(),
          })
        }
      }, 3000)

      // Cleanup on close
      request.signal.addEventListener("abort", () => {
        clearInterval(interval)
        controller.close()
      })
    },
  })

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  })
}

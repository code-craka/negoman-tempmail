import { type NextRequest, NextResponse } from "next/server"
import { Webhook } from "svix"
import { prisma } from "@/lib/prisma"

export async function POST(request: NextRequest) {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET

  if (!WEBHOOK_SECRET) {
    throw new Error("Please add CLERK_WEBHOOK_SECRET from Clerk Dashboard to .env or .env.local")
  }

  // Get the headers
  const headerPayload = request.headers
  const svix_id = headerPayload.get("svix-id")
  const svix_timestamp = headerPayload.get("svix-timestamp")
  const svix_signature = headerPayload.get("svix-signature")

  // If there are no headers, error out
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response("Error occured -- no svix headers", {
      status: 400,
    })
  }

  // Get the body
  const payload = await request.json()
  const body = JSON.stringify(payload)

  // Create a new Svix instance with your secret.
  const wh = new Webhook(WEBHOOK_SECRET)

  let evt: any

  // Verify the payload with the headers
  try {
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    })
  } catch (err) {
    console.error("Error verifying webhook:", err)
    return new Response("Error occured", {
      status: 400,
    })
  }

  // Handle the webhook
  const eventType = evt.type

  if (eventType === "user.created") {
    const { id, email_addresses, first_name, last_name } = evt.data

    try {
      await prisma.user.create({
        data: {
          clerkId: id,
          email: email_addresses[0]?.email_address,
          referralCode: `REF_${Math.random().toString(36).substring(7).toUpperCase()}`,
        },
      })

      console.log("User created in database:", id)
    } catch (error) {
      console.error("Error creating user:", error)
    }
  }

  if (eventType === "user.updated") {
    const { id, email_addresses } = evt.data

    try {
      await prisma.user.update({
        where: { clerkId: id },
        data: {
          email: email_addresses[0]?.email_address,
          lastActiveAt: new Date(),
        },
      })

      console.log("User updated in database:", id)
    } catch (error) {
      console.error("Error updating user:", error)
    }
  }

  if (eventType === "user.deleted") {
    const { id } = evt.data

    try {
      await prisma.user.delete({
        where: { clerkId: id },
      })

      console.log("User deleted from database:", id)
    } catch (error) {
      console.error("Error deleting user:", error)
    }
  }

  return NextResponse.json({ message: "Webhook processed successfully" })
}

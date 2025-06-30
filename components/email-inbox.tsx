"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Mail, Trash2, Forward, Clock, AlertCircle } from "lucide-react"
import { formatDistanceToNow } from "date-fns"

interface EmailMessage {
  id: string
  from: string
  to: string
  subject: string
  content: string
  receivedAt: string
  isRead: boolean
}

interface EmailInboxProps {
  messages: EmailMessage[]
  newMessageCount: number
  onMessageRead: () => void
  userPlan: string
}

// Component for individual message item
function MessageItem({ 
  message, 
  onClick 
}: { 
  message: EmailMessage
  onClick: () => void 
}) {
  return (
    <div
      className={`p-4 border rounded-lg cursor-pointer transition-colors hover:bg-gray-50 ${
        !message.isRead ? "border-blue-200 bg-blue-50" : "border-gray-200"
      }`}
      onClick={onClick}
    >
      <div className="flex justify-between items-start mb-2">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900 truncate">{message.from}</p>
          <p className="text-sm text-gray-600 truncate">{message.subject}</p>
        </div>
        <div className="flex items-center space-x-2 ml-4">
          {!message.isRead && <div className="w-2 h-2 bg-blue-600 rounded-full"></div>}
          <span className="text-xs text-gray-500">
            {formatDistanceToNow(new Date(message.receivedAt), { addSuffix: true })}
          </span>
        </div>
      </div>
      <p className="text-sm text-gray-700 line-clamp-2">{message.content}</p>
    </div>
  )
}

// Component for empty inbox state
function EmptyInbox() {
  return (
    <div className="text-center py-12">
      <Mail className="mx-auto h-12 w-12 text-gray-400 mb-4" />
      <h3 className="text-lg font-medium text-gray-900 mb-2">No messages yet</h3>
      <p className="text-gray-500">Messages will appear here when they arrive</p>
    </div>
  )
}

// Component for free user limitation notice
function FreeLimitNotice() {
  return (
    <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
      <div className="flex items-center">
        <AlertCircle className="h-4 w-4 text-yellow-600 mr-2" />
        <p className="text-sm text-yellow-800">
          Free users can only view the latest 5 messages.
          <Button variant="link" className="p-0 h-auto text-yellow-800 underline ml-1">
            Upgrade for unlimited storage
          </Button>
        </p>
      </div>
    </div>
  )
}

// Component for message modal
function MessageModal({
  message,
  isOpen,
  onClose,
  onDelete,
  onForward,
  userPlan
}: {
  message: EmailMessage | null
  isOpen: boolean
  onClose: () => void
  onDelete: (id: string) => void
  onForward: (message: EmailMessage) => void
  userPlan: string
}) {
  if (!message) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Email Message</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="border-b pb-4">
            <div className="grid grid-cols-1 gap-2">
              <div>
                <span className="font-medium text-gray-700">From: </span>
                <span className="text-gray-900">{message.from}</span>
              </div>
              <div>
                <span className="font-medium text-gray-700">Subject: </span>
                <span className="text-gray-900">{message.subject}</span>
              </div>
              <div>
                <span className="font-medium text-gray-700">Date: </span>
                <span className="text-gray-900">{new Date(message.receivedAt).toLocaleString()}</span>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-gray-900 whitespace-pre-wrap">{message.content}</p>
          </div>

          <div className="flex justify-between pt-4">
            <div className="flex space-x-2">
              <Button variant="outline" size="sm" onClick={() => onDelete(message.id)}>
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onForward(message)}
                disabled={userPlan === "FREE"}
              >
                <Forward className="mr-2 h-4 w-4" />
                Forward {userPlan === "FREE" && "(Premium)"}
              </Button>
            </div>
            <Button onClick={onClose}>Close</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default function EmailInbox({ messages, newMessageCount, onMessageRead, userPlan }: EmailInboxProps) {
  const [selectedMessage, setSelectedMessage] = useState<EmailMessage | null>(null)
  const [showMessageModal, setShowMessageModal] = useState(false)

  const handleMessageClick = (message: EmailMessage) => {
    setSelectedMessage(message)
    setShowMessageModal(true)
    if (!message.isRead) {
      onMessageRead()
    }
  }

  const handleDeleteMessage = (messageId: string) => {
    console.log("Delete message:", messageId)
  }

  const handleForwardMessage = (message: EmailMessage) => {
    if (userPlan === "FREE") {
      return
    }
    console.log("Forward message:", message.id)
  }

  const displayedMessages = userPlan === "FREE" ? messages.slice(0, 5) : messages
  const showFreeLimitNotice = userPlan === "FREE" && messages.length >= 5

  return (
    <>
      <Card className="shadow-lg">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center">
            <Mail className="mr-2 h-5 w-5" />
            Inbox
            {newMessageCount > 0 && <Badge className="ml-2 bg-red-500 text-white">{newMessageCount} new</Badge>}
          </CardTitle>
          <div className="flex items-center text-sm text-gray-500">
            <Clock className="mr-1 h-4 w-4" />
            Auto-refresh every 3s
          </div>
        </CardHeader>
        <CardContent>
          {messages.length === 0 ? (
            <EmptyInbox />
          ) : (
            <div className="space-y-3">
              {displayedMessages.map((message) => (
                <MessageItem 
                  key={message.id}
                  message={message}
                  onClick={() => handleMessageClick(message)}
                />
              ))}
            </div>
          )}

          {showFreeLimitNotice && <FreeLimitNotice />}
        </CardContent>
      </Card>

      <MessageModal
        message={selectedMessage}
        isOpen={showMessageModal}
        onClose={() => setShowMessageModal(false)}
        onDelete={handleDeleteMessage}
        onForward={handleForwardMessage}
        userPlan={userPlan}
      />
    </>
  )
}

"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AlertTriangle, Clock, Mail, Zap } from "lucide-react"

interface UpgradePromptProps {
  timeRemaining: number
  messageCount: number
  onUpgrade: () => void
}

export default function UpgradePrompt({ timeRemaining, messageCount, onUpgrade }: UpgradePromptProps) {
  const getPromptContent = () => {
    if (timeRemaining < 120) {
      return {
        icon: <Clock className="h-5 w-5 text-red-500" />,
        title: "⚡ Only 2 minutes left!",
        message: "Don't lose your emails! Upgrade now to extend your time.",
        urgency: "high",
        cta: "Extend Now - $0.99",
      }
    }

    if (messageCount >= 3) {
      return {
        icon: <Mail className="h-5 w-5 text-blue-500" />,
        title: "💰 Managing lots of emails?",
        message: "You've received 3+ emails! Upgrade for better email management.",
        urgency: "medium",
        cta: "Upgrade for Better Management",
      }
    }

    return {
      icon: <Zap className="h-5 w-5 text-purple-500" />,
      title: "🚀 Unlock Premium Features",
      message: "Get extended time, custom domains, and ad-free experience.",
      urgency: "low",
      cta: "See Premium Plans",
    }
  }

  const content = getPromptContent()

  const getCardClasses = () => {
    switch (content.urgency) {
      case "high":
        return "border-red-200 bg-gradient-to-r from-red-50 to-orange-50 animate-pulse"
      case "medium":
        return "border-blue-200 bg-gradient-to-r from-blue-50 to-purple-50"
      default:
        return "border-purple-200 bg-gradient-to-r from-purple-50 to-pink-50"
    }
  }

  const getButtonClasses = () => {
    switch (content.urgency) {
      case "high":
        return "bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 animate-bounce"
      case "medium":
        return "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
      default:
        return "bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
    }
  }

  return (
    <Card className={`border-2 ${getCardClasses()}`}>
      <CardContent className="p-4">
        <div className="flex items-center space-x-3">
          {content.icon}
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900">{content.title}</h3>
            <p className="text-sm text-gray-700">{content.message}</p>
          </div>
          <Button onClick={onUpgrade} className={`${getButtonClasses()} text-white font-medium px-4 py-2`}>
            {content.cta}
          </Button>
        </div>

        {content.urgency === "high" && (
          <div className="mt-3 flex items-center justify-center">
            <div className="flex items-center space-x-1 text-xs text-red-600">
              <AlertTriangle className="h-3 w-3" />
              <span>Limited time offer - Act now!</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

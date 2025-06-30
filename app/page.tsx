"use client"

import { useState, useEffect, useCallback } from "react"
import { useUser } from "@clerk/nextjs"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Copy, Clock, Mail, Zap, Users, TrendingUp, Crown } from "lucide-react"
import { toast } from "@/hooks/use-toast"
import EmailInbox from "@/components/email-inbox"
import UpgradePrompt from "@/components/upgrade-prompt"
import AdBanner from "@/components/ad-banner"
import SocialProof from "@/components/social-proof"
import PricingModal from "@/components/pricing-modal"

interface TempEmail {
  address: string
  domain: string
  expiresAt: string
  provider: string
}

interface EmailMessage {
  id: string
  from: string
  to: string
  subject: string
  content: string
  receivedAt: string
  isRead: boolean
}

interface Analytics {
  totalUsers: number
  activeUsers: number
  totalRevenue: number
  upgradesLast24h: number
}

export default function TempEmailPlatform() {
  const { user, isLoaded } = useUser()
  const [currentEmail, setCurrentEmail] = useState<TempEmail | null>(null)
  const [timeRemaining, setTimeRemaining] = useState(600) // 10 minutes
  const [messages, setMessages] = useState<EmailMessage[]>([])
  const [showPricing, setShowPricing] = useState(false)
  const [analytics, setAnalytics] = useState<Analytics>({
    totalUsers: 0,
    activeUsers: 0,
    totalRevenue: 0,
    upgradesLast24h: 0,
  })
  const [newMessageCount, setNewMessageCount] = useState(0)
  const [isGenerating, setIsGenerating] = useState(false)
  const [sessionId, setSessionId] = useState<string>("")

  // Get user plan from Clerk metadata
  const userPlan = (user?.publicMetadata?.plan as string) || "FREE"
  const planExpiresAt = user?.publicMetadata?.planExpiresAt as string

  // Generate initial email on mount
  useEffect(() => {
    generateNewEmail()
    fetchAnalytics()
  }, [])

  // Timer countdown
  useEffect(() => {
    if (timeRemaining > 0 && userPlan === "FREE") {
      const timer = setInterval(() => {
        setTimeRemaining((prev) => prev - 1)
      }, 1000)
      return () => clearInterval(timer)
    }
  }, [timeRemaining, userPlan])

  // Real-time message polling with SSE
  useEffect(() => {
    if (!currentEmail) return

    const eventSource = new EventSource(`/api/email/stream?email=${currentEmail.address}`)

    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data)

      if (data.type === "messages") {
        const newMessages = data.data as EmailMessage[]
        setMessages((prev) => {
          const existingIds = new Set(prev.map((m) => m.id))
          const uniqueNew = newMessages.filter((m) => !existingIds.has(m.id))

          if (uniqueNew.length > 0) {
            setNewMessageCount((count) => count + uniqueNew.length)
            toast({
              title: `${uniqueNew.length} New Message${uniqueNew.length > 1 ? "s" : ""}!`,
              description: `From: ${uniqueNew[0].from}`,
            })
          }

          return [...uniqueNew, ...prev]
        })
      }
    }

    eventSource.onerror = () => {
      console.error("SSE connection error")
      eventSource.close()
    }

    return () => {
      eventSource.close()
    }
  }, [currentEmail])

  const generateNewEmail = useCallback(async () => {
    setIsGenerating(true)
    try {
      const response = await fetch("/api/email/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({}),
      })

      if (!response.ok) {
        throw new Error("Failed to generate email")
      }

      const data = await response.json()
      setCurrentEmail(data.email)
      setSessionId(data.sessionId)
      setMessages([])
      
      // Calculate actual time remaining from email expiration
      const expiresAt = new Date(data.email.expiresAt)
      const timeRemainingSeconds = Math.max(0, Math.floor((expiresAt.getTime() - Date.now()) / 1000))
      setTimeRemaining(timeRemainingSeconds)
      setNewMessageCount(0)

      toast({
        title: "New Email Generated!",
        description: "Your temporary email is ready to receive messages.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate email. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsGenerating(false)
    }
  }, [userPlan])

  const extendTimer = useCallback(async () => {
    if (userPlan === "FREE") {
      setShowPricing(true)
    } else {
      setTimeRemaining((prev) => prev + 600)
      toast({
        title: "Timer Extended!",
        description: "Added 10 more minutes to your email.",
      })
    }
  }, [userPlan])

  const copyToClipboard = useCallback(async () => {
    if (currentEmail) {
      await navigator.clipboard.writeText(currentEmail.address)
      toast({
        title: "Email Copied!",
        description: "Email address copied to clipboard.",
      })
    }
  }, [currentEmail])

  const fetchAnalytics = async () => {
    try {
      const response = await fetch("/api/analytics")
      if (response.ok) {
        const data = await response.json()
        setAnalytics(data)
      }
    } catch (error) {
      console.error("Failed to fetch analytics:", error)
    }
  }

  const getTimeForPlan = (plan: string): number => {
    switch (plan) {
      case "QUICK":
        return 3600 // 1 hour
      case "EXTENDED":
        return 86400 // 24 hours
      case "PRO":
        return 604800 // 1 week
      case "ENTERPRISE":
        return 2592000 // 30 days
      default:
        return 600 // 10 minutes
    }
  }

  const formatTimeRemaining = (seconds: number): string => {
    // Handle expired or negative time
    if (seconds <= 0) {
      return "EXPIRED"
    }
    
    if (seconds >= 86400) {
      const days = Math.floor(seconds / 86400)
      const hours = Math.floor((seconds % 86400) / 3600)
      return `${days}d ${hours}h`
    } else if (seconds >= 3600) {
      const hours = Math.floor(seconds / 3600)
      const minutes = Math.floor((seconds % 3600) / 60)
      return `${hours}:${minutes.toString().padStart(2, "0")}`
    } else {
      const minutes = Math.floor(seconds / 60)
      const remainingSeconds = seconds % 60
      return `${minutes.toString().padStart(2, "0")}:${remainingSeconds.toString().padStart(2, "0")}`
    }
  }

  const getTimerColor = () => {
    if (timeRemaining <= 0) return "text-red-600 animate-pulse"
    if (timeRemaining > 300) return "text-green-600"
    if (timeRemaining > 120) return "text-yellow-600"
    return "text-red-600"
  }

  const shouldShowUpgradePrompt = () => {
    return (timeRemaining < 120 && userPlan === "FREE") || (messages.length >= 3 && userPlan === "FREE")
  }

  const getPlanBadge = () => {
    if (userPlan === "FREE") return null

    const colors = {
      QUICK: "bg-blue-100 text-blue-800",
      EXTENDED: "bg-purple-100 text-purple-800",
      PRO: "bg-green-100 text-green-800",
      ENTERPRISE: "bg-yellow-100 text-yellow-800",
    }

    return (
      <Badge className={colors[userPlan as keyof typeof colors] || "bg-gray-100 text-gray-800"}>
        <Crown className="mr-1 h-3 w-3" />
        {userPlan} Plan
      </Badge>
    )
  }

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2 min-w-0 flex-shrink">
              <Mail className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600" />
              <h1 className="text-lg sm:text-2xl font-bold text-gray-900 truncate">TempMail Pro</h1>
              <div className="hidden sm:block">
                {getPlanBadge()}
              </div>
            </div>
            <div className="flex items-center space-x-2 sm:space-x-4">
              <div className="hidden md:block">
                <SocialProof analytics={analytics} />
              </div>
              {userPlan === "FREE" && (
                <Button
                  onClick={() => setShowPricing(true)}
                  className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-sm sm:text-base px-3 sm:px-4"
                  size="sm"
                >
                  <span className="hidden sm:inline">Upgrade Now</span>
                  <span className="sm:hidden">Upgrade</span>
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Google AdSense Header Banner */}
      {userPlan === "FREE" && <AdBanner position="header" />}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Email Section */}
          <div className="lg:col-span-2 space-y-6">
            {/* Email Display Card */}
            <Card className="border-2 border-blue-200 shadow-lg">
              <CardHeader className="text-center">
                <CardTitle className="text-xl sm:text-2xl text-gray-800">Your Temporary Email</CardTitle>
                <p className="text-sm sm:text-base text-gray-600">Ready to receive messages instantly</p>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Email Address */}
                <div className="text-center">
                  <div className="bg-gray-50 rounded-lg p-3 sm:p-4 border-2 border-dashed border-gray-300">
                    <p className="text-lg sm:text-2xl lg:text-3xl font-bold text-blue-600 mb-4 break-all">
                      {currentEmail?.address || "Loading..."}
                    </p>
                    <Button
                      onClick={copyToClipboard}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 sm:px-8 py-2 sm:py-3 text-sm sm:text-lg w-full sm:w-auto"
                      size="lg"
                      disabled={!currentEmail}
                    >
                      <Copy className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                      Copy Email
                    </Button>
                  </div>
                </div>

                {/* Timer */}
                <div className="text-center">
                  <div className="flex items-center justify-center space-x-2 mb-4">
                    <Clock className={`h-5 w-5 sm:h-6 sm:w-6 ${getTimerColor()}`} />
                    <span className={`text-2xl sm:text-3xl lg:text-4xl font-mono font-bold ${getTimerColor()}`}>
                      {formatTimeRemaining(timeRemaining)}
                    </span>
                  </div>
                  <p className="text-sm sm:text-base text-gray-600 mb-4">Time remaining</p>

                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Button
                      onClick={generateNewEmail}
                      variant="outline"
                      className="border-blue-300 text-blue-600 hover:bg-blue-50 bg-transparent"
                      disabled={isGenerating}
                    >
                      <Mail className="mr-2 h-4 w-4" />
                      {isGenerating ? "Generating..." : "New Email"}
                    </Button>
                    <Button onClick={extendTimer} className="bg-green-600 hover:bg-green-700">
                      <Zap className="mr-2 h-4 w-4" />
                      Extend Timer (+10 min)
                    </Button>
                  </div>
                </div>

                {/* Upgrade Prompt */}
                {shouldShowUpgradePrompt() && (
                  <UpgradePrompt
                    timeRemaining={timeRemaining}
                    messageCount={messages.length}
                    onUpgrade={() => setShowPricing(true)}
                  />
                )}
              </CardContent>
            </Card>

            {/* Inbox */}
            <EmailInbox
              messages={messages}
              newMessageCount={newMessageCount}
              onMessageRead={() => setNewMessageCount(0)}
              userPlan={userPlan}
            />
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Stats Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <TrendingUp className="mr-2 h-5 w-5" />
                  Live Stats
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Active Users</span>
                  <Badge variant="secondary" className="bg-green-100 text-green-800">
                    <Users className="mr-1 h-3 w-3" />
                    {analytics.activeUsers.toLocaleString()}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Upgrades Today</span>
                  <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                    {analytics.upgradesLast24h}
                  </Badge>
                </div>
                {analytics.upgradesLast24h > 0 && (
                  <div className="text-center pt-2">
                    <p className="text-sm text-gray-500">
                      🔥 {analytics.upgradesLast24h} users upgraded today
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Ad Space */}
            {userPlan === "FREE" && <AdBanner position="sidebar" />}

            {/* Quick Upgrade */}
            <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50">
              <CardHeader>
                <CardTitle className="text-purple-800">⚡ Quick Upgrade</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="text-sm text-purple-700">
                    <p>✨ No ads</p>
                    <p>⏰ Extended time</p>
                    <p>📧 Custom domains</p>
                    <p>🚀 Priority support</p>
                  </div>
                  <Button
                    onClick={() => setShowPricing(true)}
                    className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                  >
                    Upgrade from $0.99
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Social Sharing */}
            <Card>
              <CardHeader>
                <CardTitle>🎁 Earn Free Time</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-gray-600">Share and get bonus time!</p>
                <div className="space-y-2">
                  <Button variant="outline" size="sm" className="w-full justify-start bg-transparent">
                    📱 Share on Twitter (+15 min)
                  </Button>
                  <Button variant="outline" size="sm" className="w-full justify-start bg-transparent">
                    👥 Share on Facebook (+10 min)
                  </Button>
                  <Button variant="outline" size="sm" className="w-full justify-start bg-transparent">
                    💼 Share on LinkedIn (+20 min)
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Pricing Modal */}
      <PricingModal
        isOpen={showPricing}
        onClose={() => setShowPricing(false)}
        onUpgrade={(plan) => {
          setShowPricing(false)
          toast({
            title: "Redirecting to payment...",
            description: "Please complete your purchase to upgrade.",
          })
        }}
      />

      {/* Footer Ad */}
      {userPlan === "FREE" && <AdBanner position="footer" />}
    </div>
  )
}

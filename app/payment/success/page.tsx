"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle, Mail, Crown } from "lucide-react"
import Link from "next/link"

export default function PaymentSuccess() {
  const searchParams = useSearchParams()
  const sessionId = searchParams.get("session_id")
  const [isLoading, setIsLoading] = useState(true)
  const [paymentData, setPaymentData] = useState<any>(null)

  useEffect(() => {
    if (sessionId) {
      // In a real app, you would verify the payment with your backend
      setTimeout(() => {
        setPaymentData({
          plan: "EXTENDED",
          amount: 2.99,
          duration: "24 hours",
        })
        setIsLoading(false)
      }, 2000)
    }
  }, [sessionId])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <CardTitle className="text-2xl text-green-800">Payment Successful!</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <div className="bg-green-50 p-4 rounded-lg">
            <div className="flex items-center justify-center mb-2">
              <Crown className="h-5 w-5 text-green-600 mr-2" />
              <span className="font-semibold text-green-800">{paymentData?.plan} Plan Activated</span>
            </div>
            <p className="text-green-700 text-sm">Your premium features are now active for {paymentData?.duration}</p>
          </div>

          <div className="space-y-2 text-sm text-gray-600">
            <p>✨ Ad-free experience enabled</p>
            <p>⏰ Extended email validity</p>
            <p>📧 Custom domain access</p>
            <p>🚀 Priority support available</p>
          </div>

          <div className="pt-4">
            <Link href="/">
              <Button className="w-full bg-blue-600 hover:bg-blue-700">
                <Mail className="mr-2 h-4 w-4" />
                Start Using Premium Features
              </Button>
            </Link>
          </div>

          <p className="text-xs text-gray-500">Receipt sent to your email address</p>
        </CardContent>
      </Card>
    </div>
  )
}

"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { XCircle, ArrowLeft, Mail } from "lucide-react"
import Link from "next/link"

export default function PaymentCancel() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
            <XCircle className="h-8 w-8 text-red-600" />
          </div>
          <CardTitle className="text-2xl text-red-800">Payment Cancelled</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-gray-600">Your payment was cancelled. No charges were made to your account.</p>

          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-blue-800 font-medium mb-2">Don't miss out on premium features:</p>
            <div className="space-y-1 text-sm text-blue-700">
              <p>✨ Ad-free experience</p>
              <p>⏰ Extended email validity</p>
              <p>📧 Custom domain access</p>
              <p>🚀 Priority support</p>
            </div>
          </div>

          <div className="space-y-3">
            <Link href="/">
              <Button className="w-full bg-blue-600 hover:bg-blue-700">
                <Mail className="mr-2 h-4 w-4" />
                Continue with Free Plan
              </Button>
            </Link>

            <Button variant="outline" className="w-full bg-transparent" onClick={() => window.history.back()}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Try Again
            </Button>
          </div>

          <p className="text-xs text-gray-500">Questions? Contact our support team</p>
        </CardContent>
      </Card>
    </div>
  )
}

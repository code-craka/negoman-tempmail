"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Check, Zap, Crown, Building, X } from "lucide-react"
import { toast } from "@/hooks/use-toast"

interface PricingModalProps {
  isOpen: boolean
  onClose: () => void
  onUpgrade: (plan: string) => void
}

const PRICING_TIERS = [
  {
    id: "QUICK",
    name: "Quick Plan",
    price: 0.99,
    duration: "1 hour",
    features: ["1 hour validity", "Custom domain email", "Basic support"],
    color: "blue",
  },
  {
    id: "EXTENDED",
    name: "Extended Plan",
    price: 2.99,
    duration: "24 hours",
    features: ["24 hour validity", "Custom domain", "Email forwarding", "No ads"],
    popular: true,
    color: "purple",
  },
  {
    id: "PRO",
    name: "Pro Plan",
    price: 9.99,
    duration: "1 week",
    features: ["1 week validity", "Multiple domains", "API access", "Bulk creation"],
    color: "green",
  },
  {
    id: "ENTERPRISE",
    name: "Enterprise Plan",
    price: 29.99,
    duration: "monthly",
    features: ["Custom retention", "Team management", "24/7 support", "Unlimited features"],
    color: "gold",
  },
]

export default function PricingModal({ isOpen, onClose, onUpgrade }: PricingModalProps) {
  const [selectedPlan, setSelectedPlan] = useState<string>("EXTENDED")
  const [isLoading, setIsLoading] = useState(false)

  const handleUpgrade = async (planId: string) => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/payments/create-checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ plan: planId }),
      })

      if (!response.ok) {
        throw new Error("Failed to create checkout session")
      }

      const data = await response.json()

      if (data.url) {
        window.location.href = data.url
      } else {
        throw new Error("No checkout URL received")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to start checkout process. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const getIcon = (planId: string) => {
    switch (planId) {
      case "QUICK":
        return <Zap className="h-6 w-6" />
      case "EXTENDED":
        return <Check className="h-6 w-6" />
      case "PRO":
        return <Crown className="h-6 w-6" />
      case "ENTERPRISE":
        return <Building className="h-6 w-6" />
      default:
        return <Check className="h-6 w-6" />
    }
  }

  const getColorClasses = (tier: any, isSelected: boolean) => {
    const baseClasses = "transition-all duration-200 cursor-pointer"
    const colorMap = {
      blue: isSelected ? "border-blue-500 bg-blue-50" : "border-blue-200 hover:border-blue-300",
      purple: isSelected ? "border-purple-500 bg-purple-50" : "border-purple-200 hover:border-purple-300",
      green: isSelected ? "border-green-500 bg-green-50" : "border-green-200 hover:border-green-300",
      gold: isSelected ? "border-yellow-500 bg-yellow-50" : "border-yellow-200 hover:border-yellow-300",
    }
    return `${baseClasses} ${colorMap[tier.color as keyof typeof colorMap]}`
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="flex flex-row items-center justify-between">
          <DialogTitle className="text-2xl font-bold">🚀 Upgrade Your Experience</DialogTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </DialogHeader>

        {/* Value Proposition Banner */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-500 text-white p-3 rounded-lg mb-6">
          <div className="flex items-center justify-center space-x-2">
            <Zap className="h-5 w-5" />
            <span className="font-medium">
              ⚡ Unlock Premium Features - Extended Email Validity & More!
            </span>
          </div>
        </div>

        {/* Trust Indicators */}
        <div className="text-center mb-6">
          <div className="flex justify-center space-x-4 mt-2 text-sm text-gray-500">
            <span>🔒 Secure payments</span>
            <span>⚡ Instant activation</span>
            <span>🚀 No ads</span>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {PRICING_TIERS.map((tier) => {
            const isSelected = selectedPlan === tier.id

            return (
              <Card
                key={tier.id}
                className={`${getColorClasses(tier, isSelected)} relative`}
                onClick={() => setSelectedPlan(tier.id)}
              >
                {tier.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-purple-600 text-white">Most Popular</Badge>
                  </div>
                )}

                <CardHeader className="text-center pb-2">
                  <div className="flex justify-center mb-2">{getIcon(tier.id)}</div>
                  <CardTitle className="text-lg">{tier.name}</CardTitle>
                  <div className="space-y-1">
                    <div className="flex items-center justify-center space-x-2">
                      <span className="text-2xl font-bold text-gray-900">${tier.price}</span>
                    </div>
                    <p className="text-sm text-gray-600">{tier.duration}</p>
                  </div>
                </CardHeader>

                <CardContent className="pt-2">
                  <ul className="space-y-2 mb-4">
                    {tier.features.map((feature, index) => (
                      <li key={index} className="flex items-center text-sm">
                        <Check className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>

                  <Button
                    className={`w-full ${isSelected ? "bg-blue-600 hover:bg-blue-700" : "bg-gray-600 hover:bg-gray-700"}`}
                    onClick={() => handleUpgrade(tier.id)}
                    disabled={isLoading}
                  >
                    {isLoading && selectedPlan === tier.id ? "Processing..." : isSelected ? "Select Plan" : "Choose"}
                  </Button>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Feature Comparison */}
        <div className="bg-gray-50 p-6 rounded-lg">
          <h3 className="text-lg font-semibold mb-4">Why Upgrade?</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="space-y-2">
              <h4 className="font-medium text-gray-900">⚡ Performance</h4>
              <ul className="space-y-1 text-gray-600">
                <li>• Extended email validity</li>
                <li>• Faster message delivery</li>
                <li>• Priority server access</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium text-gray-900">🎯 Features</h4>
              <ul className="space-y-1 text-gray-600">
                <li>• Custom domain emails</li>
                <li>• Email forwarding</li>
                <li>• Bulk email generation</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium text-gray-900">💎 Experience</h4>
              <ul className="space-y-1 text-gray-600">
                <li>• Ad-free interface</li>
                <li>• Priority support</li>
                <li>• Advanced analytics</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Guarantee */}
        <div className="text-center mt-6 p-4 bg-green-50 rounded-lg">
          <p className="text-green-800 font-medium">🛡️ 30-Day Money Back Guarantee</p>
          <p className="text-green-700 text-sm mt-1">Not satisfied? Get a full refund, no questions asked.</p>
        </div>
      </DialogContent>
    </Dialog>
  )
}

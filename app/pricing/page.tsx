"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Check, Zap, Crown, Building, ArrowLeft } from "lucide-react"
import { PRICING_TIERS } from "@/lib/config"
import { calculateSurgePrice } from "@/lib/utils"
import Link from "next/link"

export default function PricingPage() {
  const [currentPrices, setCurrentPrices] = useState<Record<string, number>>({})
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly")

  useEffect(() => {
    const prices: Record<string, number> = {}
    PRICING_TIERS.forEach((tier) => {
      prices[tier.id] = calculateSurgePrice(tier.price)
    })
    setCurrentPrices(prices)
  }, [])

  const getIcon = (planId: string) => {
    switch (planId) {
      case "quick":
        return <Zap className="h-8 w-8" />
      case "extended":
        return <Check className="h-8 w-8" />
      case "pro":
        return <Crown className="h-8 w-8" />
      case "enterprise":
        return <Building className="h-8 w-8" />
      default:
        return <Check className="h-8 w-8" />
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center space-x-2 text-blue-600 hover:text-blue-700">
              <ArrowLeft className="h-5 w-5" />
              <span>Back to TempMail</span>
            </Link>
            <h1 className="text-2xl font-bold text-gray-900">Pricing Plans</h1>
            <div></div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Choose Your Perfect Plan</h1>
          <p className="text-xl text-gray-600 mb-8">Unlock premium features and boost your productivity</p>

          {/* Billing Toggle */}
          <div className="flex items-center justify-center space-x-4 mb-8">
            <span className={billingCycle === "monthly" ? "font-semibold" : "text-gray-600"}>Monthly</span>
            <button
              onClick={() => setBillingCycle(billingCycle === "monthly" ? "yearly" : "monthly")}
              className="relative inline-flex h-6 w-11 items-center rounded-full bg-gray-200 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  billingCycle === "yearly" ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
            <span className={billingCycle === "yearly" ? "font-semibold" : "text-gray-600"}>
              Yearly
              <Badge className="ml-2 bg-green-100 text-green-800">Save 20%</Badge>
            </span>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {PRICING_TIERS.map((tier) => {
            const currentPrice = currentPrices[tier.id] || tier.price
            const yearlyPrice = billingCycle === "yearly" ? currentPrice * 10 : currentPrice
            const hasDiscount = currentPrice > tier.price

            return (
              <Card
                key={tier.id}
                className={`relative transition-all duration-200 hover:shadow-lg ${
                  tier.popular ? "border-purple-300 shadow-lg scale-105" : "border-gray-200"
                }`}
              >
                {tier.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-purple-600 text-white px-4 py-1">Most Popular</Badge>
                  </div>
                )}

                <CardHeader className="text-center pb-4">
                  <div className="flex justify-center mb-4 text-blue-600">{getIcon(tier.id)}</div>
                  <CardTitle className="text-2xl font-bold">{tier.name}</CardTitle>
                  <div className="space-y-2">
                    <div className="flex items-center justify-center space-x-2">
                      {hasDiscount && (
                        <span className="text-lg text-gray-500 line-through">
                          ${billingCycle === "yearly" ? tier.price * 10 : tier.price}
                        </span>
                      )}
                      <span className="text-4xl font-bold text-gray-900">
                        ${billingCycle === "yearly" ? yearlyPrice : currentPrice}
                      </span>
                    </div>
                    <p className="text-gray-600">{billingCycle === "yearly" ? "per year" : tier.duration}</p>
                  </div>
                </CardHeader>

                <CardContent className="pt-0">
                  <ul className="space-y-3 mb-6">
                    {tier.features.map((feature, index) => (
                      <li key={index} className="flex items-start">
                        <Check className="h-5 w-5 text-green-500 mr-3 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Button
                    className={`w-full ${
                      tier.popular ? "bg-purple-600 hover:bg-purple-700" : "bg-blue-600 hover:bg-blue-700"
                    }`}
                  >
                    Get Started
                  </Button>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Feature Comparison Table */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-bold text-center mb-8">Feature Comparison</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-4 px-4">Features</th>
                  <th className="text-center py-4 px-4">Quick</th>
                  <th className="text-center py-4 px-4">Extended</th>
                  <th className="text-center py-4 px-4">Pro</th>
                  <th className="text-center py-4 px-4">Enterprise</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                <tr className="border-b">
                  <td className="py-3 px-4">Email Validity</td>
                  <td className="text-center py-3 px-4">1 hour</td>
                  <td className="text-center py-3 px-4">24 hours</td>
                  <td className="text-center py-3 px-4">1 week</td>
                  <td className="text-center py-3 px-4">Custom</td>
                </tr>
                <tr className="border-b">
                  <td className="py-3 px-4">Custom Domains</td>
                  <td className="text-center py-3 px-4">✓</td>
                  <td className="text-center py-3 px-4">✓</td>
                  <td className="text-center py-3 px-4">✓</td>
                  <td className="text-center py-3 px-4">✓</td>
                </tr>
                <tr className="border-b">
                  <td className="py-3 px-4">Ad-Free Experience</td>
                  <td className="text-center py-3 px-4">✗</td>
                  <td className="text-center py-3 px-4">✓</td>
                  <td className="text-center py-3 px-4">✓</td>
                  <td className="text-center py-3 px-4">✓</td>
                </tr>
                <tr className="border-b">
                  <td className="py-3 px-4">Email Forwarding</td>
                  <td className="text-center py-3 px-4">✗</td>
                  <td className="text-center py-3 px-4">✓</td>
                  <td className="text-center py-3 px-4">✓</td>
                  <td className="text-center py-3 px-4">✓</td>
                </tr>
                <tr className="border-b">
                  <td className="py-3 px-4">API Access</td>
                  <td className="text-center py-3 px-4">✗</td>
                  <td className="text-center py-3 px-4">✗</td>
                  <td className="text-center py-3 px-4">✓</td>
                  <td className="text-center py-3 px-4">✓</td>
                </tr>
                <tr className="border-b">
                  <td className="py-3 px-4">Bulk Creation</td>
                  <td className="text-center py-3 px-4">✗</td>
                  <td className="text-center py-3 px-4">✗</td>
                  <td className="text-center py-3 px-4">✓</td>
                  <td className="text-center py-3 px-4">✓</td>
                </tr>
                <tr>
                  <td className="py-3 px-4">Priority Support</td>
                  <td className="text-center py-3 px-4">✗</td>
                  <td className="text-center py-3 px-4">✗</td>
                  <td className="text-center py-3 px-4">✗</td>
                  <td className="text-center py-3 px-4">✓</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold text-center mb-8">Frequently Asked Questions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">How does billing work?</h3>
                <p className="text-gray-600">
                  You're charged once for the selected plan duration. No recurring charges unless you choose a
                  subscription plan.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Can I upgrade or downgrade?</h3>
                <p className="text-gray-600">
                  Yes, you can upgrade at any time. Downgrades take effect at the end of your current billing period.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">What payment methods do you accept?</h3>
                <p className="text-gray-600">
                  We accept all major credit cards, PayPal, and Apple Pay through our secure Stripe integration.
                </p>
              </div>
            </div>
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Is there a money-back guarantee?</h3>
                <p className="text-gray-600">
                  Yes, we offer a 30-day money-back guarantee. If you're not satisfied, contact us for a full refund.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">How secure are temporary emails?</h3>
                <p className="text-gray-600">
                  All emails are encrypted in transit and at rest. We automatically delete emails after expiration for
                  your privacy.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Can I use this for business?</h3>
                <p className="text-gray-600">
                  Our Pro and Enterprise plans are designed for business use with team management and API access.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

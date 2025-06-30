"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useEffect, useState } from "react"

interface AdBannerProps {
  position: "header" | "sidebar" | "footer"
}

export default function AdBanner({ position }: AdBannerProps) {
  const [adContent, setAdContent] = useState<any>(null)

  useEffect(() => {
    // Initialize AdSense ads
    try {
      if (typeof window !== 'undefined' && window.adsbygoogle) {
        (window.adsbygoogle as any[]).push({})
      }
    } catch (error) {
      console.error('AdSense initialization failed:', error)
    }

    // Simulate ad content rotation
    const ads = [
      {
        title: "🔒 Secure VPN Service",
        description: "Protect your privacy online with military-grade encryption",
        cta: "Get 70% Off Now",
        color: "from-blue-600 to-purple-600",
      },
      {
        title: "📧 Professional Email Hosting",
        description: "Custom domain emails for your business starting at $2/month",
        cta: "Start Free Trial",
        color: "from-green-600 to-blue-600",
      },
      {
        title: "🛡️ Password Manager",
        description: "Generate and store secure passwords for all your accounts",
        cta: "Try Free for 30 Days",
        color: "from-red-600 to-pink-600",
      },
      {
        title: "☁️ Cloud Storage Solution",
        description: "Secure file storage and sharing with 1TB free space",
        cta: "Sign Up Free",
        color: "from-purple-600 to-indigo-600",
      },
    ]

    setAdContent(ads[Math.floor(Math.random() * ads.length)])

    // Refresh ad every 30 seconds
    const interval = setInterval(() => {
      setAdContent(ads[Math.floor(Math.random() * ads.length)])
    }, 30000)

    return () => clearInterval(interval)
  }, [])

  const getDimensions = () => {
    switch (position) {
      case "header":
        return "h-20 max-w-4xl mx-auto"
      case "sidebar":
        return "h-64 w-full"
      case "footer":
        return "h-16 max-w-6xl mx-auto"
      default:
        return "h-20 w-full"
    }
  }

  const getAdSlot = () => {
    switch (position) {
      case "header":
        return process.env.NEXT_PUBLIC_HEADER_AD_SLOT || "1234567890"
      case "sidebar":
        return process.env.NEXT_PUBLIC_SIDEBAR_AD_SLOT || "0987654321"
      case "footer":
        return process.env.NEXT_PUBLIC_FOOTER_AD_SLOT || "1122334455"
      default:
        return "1234567890"
    }
  }

  if (!adContent) return null

  return (
    <div className={`${getDimensions()} my-4`}>
      {/* Try to show Google AdSense first, fallback to custom ad */}
      {process.env.NODE_ENV === "production" ? (
        <>
          {/* Google AdSense Integration */}
          <div className="w-full h-full">
            <ins
              className="adsbygoogle"
              style={{ display: "block", width: "100%", height: "100%" }}
              data-ad-client={`ca-${process.env.NEXT_PUBLIC_ADSENSE_PUBLISHER_ID}`}
              data-ad-slot={getAdSlot()}
              data-ad-format="auto"
              data-full-width-responsive="true"
            ></ins>
          </div>
        </>
      ) : (
        <>
          {/* Fallback Ad Content for Development */}
          <Card className="h-full border-gray-200 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="h-full p-4 flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-1">
                  <Badge variant="secondary" className="text-xs">
                    Advertisement
                  </Badge>
                </div>
                <h3 className="font-semibold text-gray-900 text-sm mb-1">{adContent.title}</h3>
                <p className="text-xs text-gray-600 line-clamp-2">{adContent.description}</p>
              </div>
              <div className="ml-4">
                <div
                  className={`bg-gradient-to-r ${adContent.color} text-white px-3 py-2 rounded-lg text-xs font-medium hover:opacity-90 transition-opacity`}
                >
                  {adContent.cta}
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}

      <div className="text-center mt-1">
        <p className="text-xs text-gray-500">💡 Ads help keep this service free</p>
      </div>
    </div>
  )
}

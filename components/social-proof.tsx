"use client"

import { Badge } from "@/components/ui/badge"
import { Users, TrendingUp } from "lucide-react"

interface Analytics {
  totalUsers: number
  activeUsers: number
  totalRevenue: number
  upgradesLast24h: number
}

interface SocialProofProps {
  analytics: Analytics
}

export default function SocialProof({ analytics }: SocialProofProps) {
  // Only show if we have meaningful data
  if (analytics.activeUsers === 0 && analytics.upgradesLast24h === 0) {
    return null
  }

  return (
    <div className="flex items-center space-x-2 sm:space-x-4">
      {analytics.activeUsers > 0 && (
        <Badge variant="secondary" className="bg-green-100 text-green-800 text-xs">
          <Users className="mr-1 h-3 w-3" />
          <span className="hidden sm:inline">{analytics.activeUsers.toLocaleString()} online</span>
          <span className="sm:hidden">{analytics.activeUsers}</span>
        </Badge>
      )}
      {analytics.upgradesLast24h > 0 && (
        <Badge variant="secondary" className="bg-blue-100 text-blue-800 text-xs">
          <TrendingUp className="mr-1 h-3 w-3" />
          <span className="hidden sm:inline">{analytics.upgradesLast24h} upgraded today</span>
          <span className="sm:hidden">{analytics.upgradesLast24h}</span>
        </Badge>
      )}
    </div>
  )
}

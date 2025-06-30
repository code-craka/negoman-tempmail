'use client'

import { useEffect } from 'react'
import { useUser } from '@clerk/nextjs'
import LogRocket from 'logrocket'
// import setupLogRocketReact from 'logrocket-react' // Temporarily disabled for React 19 compatibility

interface LogRocketProviderProps {
  children: React.ReactNode
}

export function LogRocketProvider({ children }: LogRocketProviderProps) {
  const { user, isLoaded } = useUser()

  useEffect(() => {
    try {
      // Initialize LogRocket
      LogRocket.init('9luh3k/temp-mail')
      
      // TODO: Re-enable LogRocket React plugin when React 19 compatibility is available
      // setupLogRocketReact(LogRocket)
      
      // Identify user when Clerk user data is loaded
      if (isLoaded && user) {
        LogRocket.identify(user.id, {
          name: user.fullName || user.firstName || 'Unknown',
          email: user.primaryEmailAddress?.emailAddress || 'unknown@example.com',
          clerkId: user.id,
          createdAt: user.createdAt,
          lastSignInAt: user.lastSignInAt,
          // Note: Additional user properties from Prisma User model would need
          // to be fetched from your API to include plan, credits, etc.
        })
      }
    } catch (error) {
      console.warn('LogRocket initialization failed:', error)
    }
  }, [user, isLoaded])

  return <>{children}</>
}
import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { ClerkProvider } from "@clerk/nextjs"
import { Toaster } from "@/components/ui/toaster"
import { LogRocketProvider } from "@/components/logrocket-provider"
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "TempMail Pro - Temporary Email Service",
  description:
    "Generate temporary email addresses instantly. Receive emails without revealing your real email address. Premium features available.",
  keywords: "temporary email, disposable email, fake email, email generator, privacy",
  authors: [{ name: "TempMail Pro" }],
  openGraph: {
    title: "TempMail Pro - Temporary Email Service",
    description: "Generate temporary email addresses instantly. Premium features available.",
    url: "https://dev.negoman.com",
    siteName: "TempMail Pro",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "TempMail Pro",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "TempMail Pro - Temporary Email Service",
    description: "Generate temporary email addresses instantly. Premium features available.",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ClerkProvider>
      <html lang="en">
        <head>
          {/* Google AdSense Meta Tag */}
          <meta name="google-adsense-account" content={`ca-${process.env.NEXT_PUBLIC_ADSENSE_PUBLISHER_ID}`} />
          
          {/* Google AdSense */}
          <script
            async
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-${process.env.NEXT_PUBLIC_ADSENSE_PUBLISHER_ID}`}
            crossOrigin="anonymous"
          ></script>

          {/* Google Analytics */}
          <script async src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"></script>
          <script
            dangerouslySetInnerHTML={{
              __html: `
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', 'GA_MEASUREMENT_ID');
              `,
            }}
          />
        </head>
        <body className={inter.className}>
          <LogRocketProvider>
            {children}
          </LogRocketProvider>
          <Toaster />
        </body>
      </html>
    </ClerkProvider>
  )
}

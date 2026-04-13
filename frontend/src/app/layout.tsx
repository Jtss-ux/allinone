import '@/styles/globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'AI Content Studio',
  description: 'Generate images, videos, and audio with AI',
}

import { Toaster } from 'react-hot-toast'
import Providers from '@/components/Providers'
import { CSPostHogProvider } from '@/components/PostHogProvider'
import { Analytics } from "@vercel/analytics/next"

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="bg-gray-900 text-white">
        <CSPostHogProvider>
          <Providers>
            {children}
            <Toaster position="bottom-right" toastOptions={{ style: { background: '#333', color: '#fff' } }} />
            <Analytics />
          </Providers>
        </CSPostHogProvider>
      </body>
    </html>
  )
}

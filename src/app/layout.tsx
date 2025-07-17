'use client';

import './globals.css'
import { UserProvider } from '@/contexts/UserContext'
import { AIAssistantProvider, FloatingAIButton, AIAssistantOverlay } from '@/components/ai-assistant'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <UserProvider>
          <AIAssistantProvider>
            {children}
            <FloatingAIButton />
            <AIAssistantOverlay />
          </AIAssistantProvider>
        </UserProvider>
      </body>
    </html>
  )
}

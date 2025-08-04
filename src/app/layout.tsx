'use client';

import './globals.css'
import { UserProvider, useUser } from '@/contexts/UserContext'
import { AIAssistantProvider, FloatingAIButton, AIAssistantOverlay } from '@/components/ai-assistant'
import { ThemeProvider } from 'next-themes'
// import { Gochi_Hand } from 'next/font/google'
import { usePathname } from 'next/navigation'
import React from 'react';

// const gochiHand = Gochi_Hand({
//   weight: '400',
//   subsets: ['latin'],
// })

function LayoutWithAIAssistant({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user } = useUser();
  // Hide AI assistant only for students on the dashboard
  const hideAIAssistant = user?.role === 'student' && pathname.startsWith('/management-dashboard');

  return (
    <AIAssistantProvider>
      {children}
      {!hideAIAssistant && <FloatingAIButton />}
      {!hideAIAssistant && <AIAssistantOverlay />}
    </AIAssistantProvider>
  );
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <UserProvider>
            <LayoutWithAIAssistant>{children}</LayoutWithAIAssistant>
          </UserProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}

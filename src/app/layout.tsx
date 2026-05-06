import type { Metadata, Viewport } from 'next'
import { siteConfig } from '@/lib/constants/site'

import { ThemeProvider } from '@/components/shared/ThemeProvider'
import { TooltipProvider } from '@/components/ui/tooltip'
import { DemoShell } from '@/components/dev/demo-shell'
import { NavigationProgress } from '@/components/shared/NavigationProgress'
import { GlobalLoadingOverlay } from '@/components/shared/GlobalLoadingOverlay'
import { NoiseFilter } from '@/components/graphics/ui/NoiseFilter'
import { DevModeOverlay } from '@/components/dev/dev-mode-overlay'
import './globals.css'

const isDemo = !process.env.NEXT_PUBLIC_SUPABASE_URL

export const metadata: Metadata = {
  title: {
    default: `${siteConfig.name} — Personalized LEA Review`,
    template: `%s | ${siteConfig.name}`,
  },
  description:
    'A cognitive-first review platform built for the LEA. Active recall, spaced repetition, and interactive study tools for professional licensure success.',
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000',
  ),
}

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#FFFFFF' },
    { media: '(prefers-color-scheme: dark)', color: '#000000' },
  ],
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang='en' suppressHydrationWarning>
      <body
        className='font-sans antialiased'
      >
        <ThemeProvider>
          {process.env.NODE_ENV === 'development' && <DevModeOverlay />}
          <NoiseFilter />
          <NavigationProgress />
          <TooltipProvider>
            <GlobalLoadingOverlay />
            {children}
            {isDemo && <DemoShell />}
          </TooltipProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}

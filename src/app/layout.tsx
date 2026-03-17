import type { Metadata, Viewport } from 'next'
import { Inter, Syne, DM_Mono } from 'next/font/google'
import { GeistSans } from 'geist/font/sans'
import { siteConfig } from '@/lib/constants/site'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })
const syne = Syne({
  subsets: ['latin'],
  weight: ['400', '700', '800'],
  display: 'swap',
  variable: '--font-syne',
})
const dmMono = DM_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  style: ['normal', 'italic'],
  display: 'swap',
  variable: '--font-dm-mono',
})

import { ThemeProvider } from '@/components/shared/ThemeProvider'
import { TooltipProvider } from '@/components/ui/tooltip'
import { DemoShell } from '@/components/dev/demo-shell'
import { NavigationProgress } from '@/components/shared/NavigationProgress'
import { Toaster } from '@/components/ui/toaster'
import { NoiseFilter } from '@/components/graphics/ui/NoiseFilter'
import './globals.css'

const isDemo = !process.env.NEXT_PUBLIC_SUPABASE_URL

export const metadata: Metadata = {
  title: {
    default: `${siteConfig.name} — AI-Adaptive Board Exam Prep`,
    template: `%s | ${siteConfig.name}`,
  },
  description:
    'A cognitive-first test prep platform that adapts to you. Active recall, spaced repetition, and AI-powered study tools for board exam success.',
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000',
  ),
}

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#F8F7F5' },
    { media: '(prefers-color-scheme: dark)', color: '#000000' },
  ],
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang='en' suppressHydrationWarning>
      <body
        className={`${inter.variable} ${syne.variable} ${dmMono.variable} ${GeistSans.variable} font-sans antialiased`}
      >
        <ThemeProvider>
          <NoiseFilter />
          <NavigationProgress />
          <TooltipProvider>
            {children}
            {isDemo && <DemoShell />}
          </TooltipProvider>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  )
}

import type { Metadata, Viewport } from 'next'
import { Atkinson_Hyperlegible, Boldonse, Syne, DM_Mono, Sora } from 'next/font/google'
import { siteConfig } from '@/lib/constants/site'

const atkinson = Atkinson_Hyperlegible({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-atkinson',
  display: 'swap',
})
const syne = Syne({
  subsets: ['latin'],
  weight: ['400', '700', '800'],
  variable: '--font-syne',
  display: 'swap',
})
const sora = Sora({
  subsets: ['latin'],
  weight: ['400', '600', '700'],
  variable: '--font-sora',
  display: 'swap',
})
const boldonse = Boldonse({
  subsets: ['latin'],
  weight: '400',
  display: 'swap',
  variable: '--font-boldonse',
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
import { NoiseFilter } from '@/components/graphics/ui/NoiseFilter'
import './globals.css'

const isDemo = !process.env.NEXT_PUBLIC_SUPABASE_URL

export const metadata: Metadata = {
  title: {
    default: `${siteConfig.name} — Personalized ALE Review`,
    template: `%s | ${siteConfig.name}`,
  },
  description:
    'A cognitive-first review platform built for the ALE. Active recall, spaced repetition, and interactive study tools for professional licensure success.',
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
        className={`${atkinson.variable} ${sora.variable} ${boldonse.variable} ${syne.variable} ${dmMono.variable} font-sans antialiased`}
      >
        <ThemeProvider>
          <NoiseFilter />
          <NavigationProgress />
          <TooltipProvider>
            {children}
            {isDemo && <DemoShell />}
          </TooltipProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}

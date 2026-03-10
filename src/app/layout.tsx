import type { Metadata, Viewport } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { siteConfig } from '@/lib/constants/site'
import { ThemeProvider } from '@/components/shared/ThemeProvider'
import { TooltipProvider } from '@/components/ui/tooltip'
import { DemoShell } from '@/components/dev/demo-shell'
import './globals.css'

const geistSans = Geist({
  variable: '--font-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-mono',
  subsets: ['latin'],
})

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
    { media: '(prefers-color-scheme: light)', color: '#FFFFFF' },
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
        className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased`}
      >
        <ThemeProvider>
          <TooltipProvider>
            {children}
            {isDemo && <DemoShell />}
          </TooltipProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}

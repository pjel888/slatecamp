'use client'

import { useTheme } from 'next-themes'
import { ThemeToggle } from '@/components/shared/ThemeToggle'

export const ThemeCard = () => {
  const { resolvedTheme } = useTheme()

  return (
    <div className="rounded-md border border-border bg-white p-6">
      <h2 className="text-base font-semibold text-[#1A2332] mb-1">Appearance</h2>
      <p className="text-sm text-[#4A5568] mb-4">Choose your preferred theme.</p>
      <div className="flex items-center justify-between">
        <span className="text-sm text-[#1A2332]">
          {resolvedTheme === 'dark' ? 'Dark' : 'Light'} mode
        </span>
        <ThemeToggle />
      </div>
    </div>
  )
}

'use client'

import { useTransition } from 'react'
import { switchAccountMode } from '@/lib/actions/professional-mode'
import type { AccountMode } from '@/lib/actions/professional-mode'

interface AccountModeCardProps {
  currentMode: AccountMode
}

const MODE_LABELS: Record<AccountMode, string> = {
  review_mode: 'Study Mode',
  professional_mode: 'Professional Reference',
}

const MODE_DESCRIPTIONS: Record<AccountMode, string> = {
  review_mode: 'Full exam prep features — Readiness Score, question sessions, Camp Trail, and analytics.',
  professional_mode: 'Reference tools for licensed professionals — Knowledge Wiki, Code Update Alerts, and CPD tracking.',
}

export const AccountModeCard = ({ currentMode }: AccountModeCardProps) => {
  const [isSwitching, startSwitch] = useTransition()

  const targetMode: AccountMode =
    currentMode === 'professional_mode' ? 'review_mode' : 'professional_mode'

  const handleSwitch = () => {
    startSwitch(async () => {
      await switchAccountMode(targetMode)
    })
  }

  return (
    <div className="rounded-md border border-border bg-card overflow-hidden">
      {/* Header */}
      <div className="bg-background border-b border-border px-4 py-3">
        <p className="text-sm font-semibold text-foreground">Account Mode</p>
        <p className="text-xs text-muted-foreground mt-0.5">
          Switch between exam preparation and professional reference.
        </p>
      </div>

      {/* Modes */}
      <div className="divide-y divide-border">
        {(['review_mode', 'professional_mode'] as AccountMode[]).map((mode) => {
          const isActive = currentMode === mode
          return (
            <div
              key={mode}
              className={`px-4 py-3 flex items-start gap-3 ${isActive ? 'bg-primary-50' : ''}`}
            >
              <div className="mt-0.5 shrink-0">
                <div
                  className={`h-4 w-4 rounded-full border-2 flex items-center justify-center ${
                    isActive ? 'border-primary' : 'border-border'
                  }`}
                >
                  {isActive && (
                    <div className="h-2 w-2 rounded-full bg-primary" />
                  )}
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-medium ${isActive ? 'text-primary' : 'text-foreground'}`}>
                  {MODE_LABELS[mode]}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                  {MODE_DESCRIPTIONS[mode]}
                </p>
              </div>
            </div>
          )
        })}
      </div>

      {/* Action */}
      <div className="px-4 py-3 border-t border-border flex justify-end">
        <button
          type="button"
          onClick={handleSwitch}
          disabled={isSwitching}
          className="rounded-sm bg-primary px-3 py-1.5 text-xs font-semibold text-white transition-colors duration-150 ease-out hover:bg-primary-700 disabled:opacity-60"
        >
          {isSwitching
            ? 'Switching…'
            : `Switch to ${MODE_LABELS[targetMode]}`}
        </button>
      </div>
    </div>
  )
}

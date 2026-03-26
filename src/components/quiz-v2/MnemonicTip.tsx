'use client'

import { useState, useEffect } from 'react'
import { Lightbulb, CaretDown, FloppyDisk } from '@phosphor-icons/react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { generateMnemonic } from '@/lib/actions/ai/generate-mnemonic'

// ---------------------------------------------------------------------------
// MnemonicTip — expandable section shown in FeedbackPanel when a student
// fails the same recall-level question 2+ times.
// ---------------------------------------------------------------------------

interface MnemonicTipProps {
  factToRemember: string
  topicName: string
  className?: string
}

export const MnemonicTip = ({ factToRemember, topicName, className }: MnemonicTipProps) => {
  const [expanded, setExpanded] = useState(false)
  const [mnemonic, setMnemonic] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState(false)

  // Generate mnemonic on first expand
  useEffect(() => {
    if (!expanded || mnemonic !== null) return

    let cancelled = false
    setLoading(true)

    generateMnemonic(factToRemember, topicName)
      .then((result) => {
        if (!cancelled) setMnemonic(result)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [expanded, mnemonic, factToRemember, topicName])

  const handleSave = () => {
    // Copy mnemonic to clipboard as a lightweight "save to notes" action
    if (mnemonic) {
      navigator.clipboard.writeText(`${topicName}: ${mnemonic}`).catch(() => {
        // Clipboard API may not be available in all contexts
      })
      setSaved(true)
    }
  }

  return (
    <div
      className={cn(
        'rounded-md border border-[#D4951A]/20 bg-[#FEF8ED] overflow-hidden',
        className,
      )}
    >
      {/* Header — always visible */}
      <button
        type="button"
        onClick={() => setExpanded((prev) => !prev)}
        className={cn(
          'flex items-center gap-2 w-full px-3 py-2 text-left',
          'transition-colors duration-150 ease-out',
          'hover:bg-[#D4951A]/5',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4951A]/30 focus-visible:ring-inset',
        )}
        aria-expanded={expanded}
      >
        <Lightbulb
          size={14}
          weight="fill"
          className="text-[#D4951A] shrink-0"
          aria-hidden="true"
        />
        <span className="text-xs font-semibold text-[#D4951A] flex-1">Memory Trick</span>
        <CaretDown
          size={12}
          weight="bold"
          className={cn(
            'text-[#D4951A]/60 transition-transform duration-150',
            expanded && 'rotate-180',
          )}
          aria-hidden="true"
        />
      </button>

      {/* Body — collapsible */}
      {expanded && (
        <div className="px-3 pb-3 pt-0 space-y-2 animate-in fade-in slide-in-from-top-1 duration-150">
          {loading ? (
            <div className="flex items-center gap-2 py-1">
              <div className="w-3 h-3 rounded-full border-2 border-[#D4951A]/30 border-t-[#D4951A] animate-spin" />
              <span className="text-xs text-[#4A5568]">Generating mnemonic...</span>
            </div>
          ) : (
            <>
              <p className="text-sm text-[#1A2332] leading-relaxed">{mnemonic}</p>
              <Button
                variant="ghost"
                size="xs"
                onClick={handleSave}
                disabled={saved}
                className="text-[#D4951A] hover:text-[#D4951A] hover:bg-[#D4951A]/10"
              >
                <FloppyDisk size={12} weight="bold" aria-hidden="true" />
                {saved ? 'Copied' : 'Save to Notes'}
              </Button>
            </>
          )}
        </div>
      )}
    </div>
  )
}

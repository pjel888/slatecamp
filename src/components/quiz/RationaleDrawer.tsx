'use client'

import { useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Info, ArrowSquareOut, Plus, CheckCircle, Scales, Cube } from '@phosphor-icons/react/dist/ssr'
import { SCIcon } from '@/components/graphics/icons/Icon'
import { CloseButton } from '@/components/ui/close-button'
import { resolveRationaleText, resolveRationaleTakeaway } from '@/lib/utils/question'
import type { RationaleData } from '@/lib/utils/question'

interface RationaleDrawerProps {
  rationale: RationaleData
  explanation?: string | null
  codeCitation?: string | null
  correctAnswerText?: string | null
  modelId?: string | null
  isVisible: boolean
  isCorrect: boolean
  onClose: () => void
  onWikiClick: () => void
  onAddNote: () => void
  on3DLabClick?: () => void
}

export function RationaleDrawer({
  rationale,
  explanation,
  codeCitation,
  correctAnswerText,
  modelId,
  isVisible,
  isCorrect,
  onClose,
  onWikiClick,
  onAddNote,
  on3DLabClick,
}: RationaleDrawerProps) {
  const closeRef = useRef<HTMLDivElement>(null)
  const rationaleText = resolveRationaleText(rationale) || 'No explanation is available for this question yet.'
  const takeaway = resolveRationaleTakeaway(rationale)

  // Focus close button when drawer opens for keyboard accessibility
  useEffect(() => {
    if (isVisible) {
      const t = setTimeout(() => closeRef.current?.querySelector('button')?.focus(), 350)
      return () => clearTimeout(t)
    }
  }, [isVisible])

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ type: 'spring', damping: 28, stiffness: 220 }}
          className="shrink-0 overflow-hidden border-t border-border"
          role="region"
          aria-label="Answer rationale"
        >
          <div className="bg-[#EEF2FC] border-b border-primary/20">
            <div className="max-w-[900px] mx-auto px-5 py-5 space-y-3">
              {/* Header row */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-primary">
                  <SCIcon icon={Info} size="sm" />
                  <span className="text-[11px] font-black uppercase tracking-widest">
                    {isCorrect ? 'Nice Work — Rationale' : "Let's Review — Rationale"}
                  </span>
                </div>
                <div ref={closeRef}>
                  <CloseButton onClick={onClose} aria-label="Close rationale" size="sm" />
                </div>
              </div>

              {/* Rationale body */}
              <p className="text-[14px] text-zinc-700 leading-[1.7] max-w-[65ch]">
                {rationaleText}
              </p>

              {/* Takeaway */}
              {takeaway && (
                <div className="flex items-start gap-2 bg-[#FEF8ED] border border-warning/20 rounded-md px-3 py-2.5">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-warning shrink-0 mt-0.5">Key Takeaway</span>
                  <p className="text-sm text-text-primary">{takeaway}</p>
                </div>
              )}

              {/* Correct answer highlight */}
              {correctAnswerText && (
                <div className="flex items-start gap-2 bg-[#EDFAF4] border border-emerald/20 rounded-md px-3 py-2.5">
                  <SCIcon icon={CheckCircle} size="sm" className="text-emerald shrink-0 mt-0.5" />
                  <p className="text-sm text-text-primary font-medium">{correctAnswerText}</p>
                </div>
              )}

              {/* Why This Matters — detailed explanation */}
              {explanation && (
                <div className="space-y-1.5">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-text-secondary">Why This Matters</span>
                  <p className="text-[14px] text-zinc-700 leading-[1.7] max-w-[65ch]">{explanation}</p>
                </div>
              )}

              {/* Code citation */}
              {codeCitation && (
                <div className="flex items-start gap-2 bg-white border border-border rounded-md px-3 py-2.5">
                  <SCIcon icon={Scales} size="sm" className="text-text-secondary shrink-0 mt-0.5" />
                  <p className="text-[13px] text-text-secondary font-medium">{codeCitation}</p>
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center gap-2 pt-1">
                <button
                  onClick={onWikiClick}
                  className="flex items-center gap-1.5 h-7 px-3 rounded-sm bg-white border border-primary/20 text-[#1535A8] hover:bg-[#EEF2FC] text-[11px] font-black uppercase tracking-widest transition-colors"
                >
                  <SCIcon icon={ArrowSquareOut} size="xs" />
                  Wiki Reference
                </button>
                <button
                  onClick={onAddNote}
                  className="flex items-center gap-1.5 h-7 px-3 rounded-sm bg-white border border-border text-text-secondary hover:bg-[#F5F5F5] text-[11px] font-black uppercase tracking-widest transition-colors"
                >
                  <SCIcon icon={Plus} size="xs" />
                  Add Note
                </button>
                {modelId && on3DLabClick && (
                  <button
                    onClick={on3DLabClick}
                    className="flex items-center gap-1.5 h-7 px-3 rounded-sm bg-white border border-primary/20 text-[#1535A8] hover:bg-[#EEF2FC] text-[11px] font-black uppercase tracking-widest transition-colors"
                  >
                    <SCIcon icon={Cube} size="xs" />
                    3D Model
                  </button>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

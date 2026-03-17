'use client'

import { useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Info, X, ArrowSquareOut, Plus, CheckCircle, Scales, Cube } from '@phosphor-icons/react'
import { SCIcon } from '@/components/graphics/icons/Icon'

interface RationaleDrawerProps {
  rationale: string | null
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
  const closeRef = useRef<HTMLButtonElement>(null)

  // Focus close button when drawer opens for keyboard accessibility
  useEffect(() => {
    if (isVisible) {
      const t = setTimeout(() => closeRef.current?.focus(), 350)
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
          className="shrink-0 overflow-hidden border-t border-zinc-100"
          role="region"
          aria-label="Answer rationale"
        >
          <div className="bg-[#F0F5FA] border-b border-primary/20">
            <div className="max-w-[900px] mx-auto px-5 py-5 space-y-3">
              {/* Header row */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-primary">
                  <SCIcon icon={Info} size="sm" />
                  <span className="text-[11px] font-black uppercase tracking-widest">
                    {isCorrect ? 'Nice Work — Rationale' : "Let's Review — Rationale"}
                  </span>
                </div>
                <button
                  ref={closeRef}
                  onClick={onClose}
                  aria-label="Close rationale"
                  className="h-6 w-6 flex items-center justify-center rounded-full text-primary/50 hover:text-primary hover:bg-[#E4EBF5] transition-colors"
                >
                  <SCIcon icon={X} size="xs" />
                </button>
              </div>

              {/* Rationale body */}
              <p className="text-[14px] text-zinc-700 leading-[1.7] max-w-[65ch]">
                {rationale || 'No explanation is available for this question yet.'}
              </p>

              {/* Correct answer highlight */}
              {correctAnswerText && (
                <div className="flex items-start gap-2 bg-[#EDFAF4] border border-[#2D9F6F]/20 rounded-md px-3 py-2.5">
                  <SCIcon icon={CheckCircle} size="sm" className="text-[#2D9F6F] shrink-0 mt-0.5" />
                  <p className="text-sm text-[#1A2332] font-medium">{correctAnswerText}</p>
                </div>
              )}

              {/* Why This Matters — detailed explanation */}
              {explanation && (
                <div className="space-y-1.5">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#4A5568]">Why This Matters</span>
                  <p className="text-[14px] text-zinc-700 leading-[1.7] max-w-[65ch]">{explanation}</p>
                </div>
              )}

              {/* Code citation */}
              {codeCitation && (
                <div className="flex items-start gap-2 bg-white border border-[#D4DAE3] rounded-md px-3 py-2.5">
                  <SCIcon icon={Scales} size="sm" className="text-[#4A5568] shrink-0 mt-0.5" />
                  <p className="text-[13px] text-[#4A5568] font-medium">{codeCitation}</p>
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center gap-2 pt-1">
                <button
                  onClick={onWikiClick}
                  className="flex items-center gap-1.5 h-7 px-3 rounded-sm bg-white border border-primary/20 text-[#2F5A85] hover:bg-[#F0F5FA] text-[11px] font-black uppercase tracking-widest transition-colors"
                >
                  <SCIcon icon={ArrowSquareOut} size="xs" />
                  Wiki Reference
                </button>
                <button
                  onClick={onAddNote}
                  className="flex items-center gap-1.5 h-7 px-3 rounded-sm bg-white border border-zinc-200 text-zinc-600 hover:bg-zinc-50 text-[11px] font-black uppercase tracking-widest transition-colors"
                >
                  <SCIcon icon={Plus} size="xs" />
                  Add Note
                </button>
                {modelId && on3DLabClick && (
                  <button
                    onClick={on3DLabClick}
                    className="flex items-center gap-1.5 h-7 px-3 rounded-sm bg-white border border-primary/20 text-[#2F5A85] hover:bg-[#F0F5FA] text-[11px] font-black uppercase tracking-widest transition-colors"
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

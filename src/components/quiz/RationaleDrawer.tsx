'use client'

import { useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Info, X, ExternalLink, Plus } from 'lucide-react'

interface RationaleDrawerProps {
  rationale: string | null
  isVisible: boolean
  isCorrect: boolean
  onClose: () => void
  onWikiClick: () => void
  onAddNote: () => void
}

export function RationaleDrawer({
  rationale,
  isVisible,
  isCorrect,
  onClose,
  onWikiClick,
  onAddNote,
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
          <div className="bg-[#F5F9FF] border-b border-blue-100">
            <div className="max-w-[900px] mx-auto px-5 py-5 space-y-3">
              {/* Header row */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-blue-600">
                  <Info className="h-4 w-4" aria-hidden />
                  <span className="text-[10px] font-black uppercase tracking-widest">
                    {isCorrect ? 'Correct — Rationale' : 'Incorrect — Rationale'}
                  </span>
                </div>
                <button
                  ref={closeRef}
                  onClick={onClose}
                  aria-label="Close rationale"
                  className="h-6 w-6 flex items-center justify-center rounded-full text-blue-300 hover:text-blue-600 hover:bg-blue-100 transition-colors"
                >
                  <X className="h-3.5 w-3.5" aria-hidden />
                </button>
              </div>

              {/* Rationale body */}
              <p className="text-[14px] text-zinc-700 leading-[1.7] max-w-[65ch]">
                {rationale || 'No rationale provided for this question.'}
              </p>

              {/* Actions */}
              <div className="flex items-center gap-2 pt-1">
                <button
                  onClick={onWikiClick}
                  className="flex items-center gap-1.5 h-7 px-3 rounded-sm bg-white border border-blue-100 text-blue-700 hover:bg-blue-50 text-[9px] font-black uppercase tracking-widest transition-colors"
                >
                  <ExternalLink className="h-3 w-3" aria-hidden />
                  Wiki Reference
                </button>
                <button
                  onClick={onAddNote}
                  className="flex items-center gap-1.5 h-7 px-3 rounded-sm bg-white border border-zinc-200 text-zinc-600 hover:bg-zinc-50 text-[9px] font-black uppercase tracking-widest transition-colors"
                >
                  <Plus className="h-3 w-3" aria-hidden />
                  Add Note
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

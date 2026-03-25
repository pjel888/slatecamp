'use client'

import { memo } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { XCircle, ArrowSquareOut, Brain } from '@phosphor-icons/react/dist/ssr'
import { SCIcon } from '@/components/graphics/icons/Icon'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export interface InfoContent {
  partName: string
  description: string
  wikiSlug?: string
  onQuiz?: () => void
}

interface InfoPanelProps {
  content: InfoContent | null
  onClose: () => void
}

/**
 * Bottom-anchored expandable panel for detailed educational content.
 * Shown when a hotspot is activated in Anatomy Inspector mode.
 * Animates in/out using framer-motion.
 */
export const InfoPanel = memo(function InfoPanel({
  content,
  onClose,
}: InfoPanelProps) {
  return (
    <AnimatePresence>
      {content && (
        <motion.div
          key={content.partName}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 16 }}
          transition={{ duration: 0.15, ease: 'easeOut' }}
          className='absolute bottom-4 left-1/2 -translate-x-1/2 z-10 w-full max-w-lg px-4'
        >
          <div className='bg-white/95 backdrop-blur-sm border border-border rounded-md shadow-lg p-3'>
            <div className='flex items-start justify-between gap-3 mb-2'>
              <div>
                <span className='text-[11px] font-black uppercase tracking-widest text-zinc-400 block mb-0.5'>
                  Part
                </span>
                <h3 className='text-sm font-bold text-zinc-900 leading-snug'>
                  {content.partName}
                </h3>
              </div>
              <button
                onClick={onClose}
                className='shrink-0 rounded-sm p-1 hover:bg-zinc-100 transition-colors'
              >
                <SCIcon icon={XCircle} size='xs' className='text-zinc-400' />
              </button>
            </div>

            <p className='text-xs text-zinc-500 leading-relaxed mb-3'>
              {content.description}
            </p>

            <div className='flex items-center gap-2'>
              {content.wikiSlug && (
                <Link
                  href={`/dashboard/wiki/${content.wikiSlug}`}
                  className='inline-flex items-center gap-1.5 h-7 px-2.5 text-[11px] font-bold uppercase tracking-wide rounded-sm border border-border bg-white hover:bg-zinc-50 text-zinc-700 transition-colors'
                >
                  <SCIcon icon={ArrowSquareOut} size='xs' />
                  Read Wiki Article
                </Link>
              )}
              {content.onQuiz && (
                <Button
                  size='sm'
                  className='h-7 text-[11px] font-bold uppercase tracking-wide rounded-sm bg-primary hover:bg-[#1535A8]'
                  onClick={content.onQuiz}
                >
                  <SCIcon icon={Brain} size='xs' className='mr-1.5' />
                  Quiz Mode
                </Button>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
})

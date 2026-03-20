'use client'

import { useState } from 'react'
import Link from 'next/link'

/**
 * Node Detail Sheet — UX Strategy Section 8 (Step 3)
 * Bottom sheet on mobile showing node detail:
 * - Node name, mastery weight, total attempts, last practiced
 * - "Practice this topic" CTA → Camp Mode targeting this node
 * - "Read about this" CTA → Wiki article
 */

interface NodeDetailSheetProps {
  node: {
    id: string
    name: string
    subjectArea: string
    mastery: number
    totalAttempts: number
    lastPracticed: string | null
    wikiSlug?: string
  } | null
  onClose: () => void
}

const getMasteryState = (mastery: number) => {
  if (mastery >= 70) return { label: 'Strong', color: '#2D9F6F' }
  if (mastery >= 40) return { label: 'Developing', color: '#D4951A' }
  if (mastery > 0) return { label: 'Needs work', color: '#D64545' }
  return { label: 'Not yet explored', color: '#8896A7' }
}

const formatDate = (iso: string | null) => {
  if (!iso) return 'Never'
  const d = new Date(iso)
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export const NodeDetailSheet = ({ node, onClose }: NodeDetailSheetProps) => {
  if (!node) return null

  const state = getMasteryState(node.mastery)

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/20"
        onClick={onClose}
      />

      {/* Sheet */}
      <div className="fixed inset-x-0 bottom-0 z-50 rounded-t-lg border-t border-[#D4DAE3] bg-white p-5 shadow-lg animate-in slide-in-from-bottom duration-200">
        {/* Handle */}
        <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-[#D4DAE3]" />

        {/* Node info */}
        <div className="flex items-start justify-between">
          <div>
            <p className="text-base font-semibold text-[#1A2332]">{node.name}</p>
            <p className="text-xs text-[#8896A7] mt-0.5">{node.subjectArea}</p>
          </div>
          <div className="text-right">
            <p
              className="font-[family-name:var(--font-dm-mono)] text-lg font-bold"
              style={{ color: state.color }}
            >
              {node.mastery}%
            </p>
            <p className="text-[11px] text-[#8896A7]">{state.label}</p>
          </div>
        </div>

        {/* Stats */}
        <div className="mt-4 flex gap-6 text-xs text-[#4A5568]">
          <div>
            <span className="text-[#8896A7]">Attempts:</span>{' '}
            <span className="font-medium">{node.totalAttempts}</span>
          </div>
          <div>
            <span className="text-[#8896A7]">Last practiced:</span>{' '}
            <span className="font-medium">{formatDate(node.lastPracticed)}</span>
          </div>
        </div>

        {/* CTAs */}
        <div className="mt-5 flex gap-3">
          <Link
            href={`/dashboard/review?topics=${node.id}`}
            className="flex-1 rounded-sm bg-[#1B3FC4] px-4 py-2.5 text-center text-sm font-semibold text-white transition-colors duration-150 ease-out hover:bg-[#1535A8]"
            onClick={onClose}
          >
            Practice this topic
          </Link>
          {node.wikiSlug && (
            <Link
              href={`/dashboard/wiki/${node.wikiSlug}`}
              className="flex-1 rounded-sm border border-[#D4DAE3] px-4 py-2.5 text-center text-sm font-medium text-[#1A2332] transition-colors duration-150 ease-out hover:bg-[#F8F7F5]"
              onClick={onClose}
            >
              Read about this
            </Link>
          )}
        </div>
      </div>
    </>
  )
}

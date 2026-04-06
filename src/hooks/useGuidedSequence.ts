'use client'

// src/hooks/useGuidedSequence.ts — Guided discovery progression manager
// Manages step-by-step hotspot sequencing during guided exploration mode.

import { useMemo } from 'react'
import { useLabStore } from '@/features/3d-lab/stores/useLabStore'
import type { HotspotData } from '@/types/3d-lab'

interface UseGuidedSequenceConfig {
  moduleSlug: string
  hotspots: HotspotData[]
  totalHotspots: number
}

interface UseGuidedSequenceReturn {
  currentHotspotId: string | null
  canAdvance: boolean
  advance: () => void
  isComplete: boolean
  progress: {
    current: number
    total: number
  }
}

export const useGuidedSequence = (
  config: UseGuidedSequenceConfig
): UseGuidedSequenceReturn => {
  const { hotspots, totalHotspots } = config

  const currentSequenceIndex = useLabStore((s) => s.currentSequenceIndex)
  const visitedHotspotIds = useLabStore((s) => s.visitedHotspotIds)
  const advanceSequence = useLabStore((s) => s.advanceSequence)

  // Sort hotspots by sequenceOrder once
  const sortedHotspots = useMemo(
    () => [...hotspots].sort((a, b) => a.sequenceOrder - b.sequenceOrder),
    [hotspots]
  )

  const isComplete = currentSequenceIndex >= totalHotspots

  const currentHotspot = !isComplete
    ? (sortedHotspots[currentSequenceIndex] ?? null)
    : null

  const currentHotspotId = currentHotspot?.id ?? null

  // canAdvance: the current hotspot has been visited (question answered)
  const canAdvance = !isComplete && currentHotspotId !== null
    ? visitedHotspotIds.has(currentHotspotId)
    : false

  const advance = () => {
    if (!canAdvance) return
    advanceSequence()
    // After advancing, check if the next index hits the total
    const nextIndex = currentSequenceIndex + 1
    if (nextIndex >= totalHotspots) {
      // Directly set via store — use the setExploreMode side path to trigger
      // guidedSequenceComplete. We reach into the store singleton here because
      // useLabStore exposes no dedicated setter; we apply it via set directly
      // through the Zustand store reference.
      useLabStore.setState({ guidedSequenceComplete: true })
    }
  }

  return {
    currentHotspotId,
    canAdvance,
    advance,
    isComplete,
    progress: {
      current: Math.min(currentSequenceIndex + 1, totalHotspots),
      total: totalHotspots,
    },
  }
}

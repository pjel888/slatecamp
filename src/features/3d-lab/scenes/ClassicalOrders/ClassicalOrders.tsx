'use client'

import { useState, useCallback } from 'react'
import { CanvasWrapper } from '@/features/3d-lab/components/CanvasWrapper'
import { InfoPanel, type InfoContent } from '@/features/3d-lab/components/templates/InfoPanel'
import { useLabStore } from '@/features/3d-lab/stores/legacyLabStore'
import { ClassicalOrdersScene, type PartId } from './ClassicalOrdersScene'
import { trackServerEvent } from '@/lib/analytics-server'

/* ── Educational Content ────────────────────────────────────────────────────── */

const PART_INFO: Record<string, Omit<InfoContent, 'onQuiz'>> = {
  stylobate: {
    partName: 'Stylobate',
    description:
      'The topmost step of the three-stepped platform (crepidoma) upon which columns stand. The stylobate provides a level, finished surface and visually anchors the colonnade to the landscape. Ancient builders subtly curved the stylobate upward at the centre — an optical refinement to counteract the appearance of sagging.',
    wikiSlug: 'classical-orders-stylobate',
  },
  shaft: {
    partName: 'Column Shaft',
    description:
      'The primary vertical element. Doric shafts taper from a wider base to a narrower top and exhibit entasis — a subtle convex swelling at about one-third height — to correct the optical illusion of concavity in a perfectly straight column. In the Doric order no base separates the shaft from the stylobate.',
    wikiSlug: 'classical-orders-column-shaft',
  },
  fluting: {
    partName: 'Fluting',
    description:
      '20 shallow concave grooves running the full height of the shaft. In the Doric order the arrises (sharp ridges between grooves) meet without a fillet, creating strong shadow lines that emphasise verticality. Compare to the Ionic order\'s 24 deeper, flat-bottomed flutes separated by a narrow fillet.',
    wikiSlug: 'classical-orders-fluting',
  },
  echinus: {
    partName: 'Echinus',
    description:
      'The convex cushion-like molding forming the lower element of the Doric capital. Its spreading circular profile mediates the transition from the cylindrical shaft below to the flat square abacus above, distributing load both visually and structurally. The echinus profile is a defining characteristic of the Doric order.',
    wikiSlug: 'classical-orders-capital',
  },
  abacus: {
    partName: 'Abacus',
    description:
      'The flat square slab forming the topmost element of the Doric capital. Unlike the Ionic abacus (with moldings) or the Corinthian abacus (with concave sides and corner horns), the Doric abacus is a plain, undecorated square that directly supports the entablature above — the hallmark of Doric austerity.',
    wikiSlug: 'classical-orders-capital',
  },
  entablature: {
    partName: 'Entablature',
    description:
      'The three-part horizontal structure carried by the columns. (1) Architrave: a plain, smooth stone beam spanning column-to-column. (2) Frieze: the most distinctive Doric element — alternating triglyphs (three-channelled blocks, derived from wooden beam ends) and metopes (plain or sculptured panels). (3) Cornice: the projecting crown molding.',
    wikiSlug: 'classical-orders-entablature',
  },
}

// Parts that have distinct mesh geometries and are quiz-eligible
const QUIZZABLE_PARTS: PartId[] = [
  'stylobate',
  'shaft',
  'echinus',
  'abacus',
  'entablature',
]

/* ── Component ──────────────────────────────────────────────────────────────── */

export default function ClassicalOrders() {
  const [quizFeedback, setQuizFeedback] = useState<'correct' | 'wrong' | null>(null)

  const activeHotspotId = useLabStore((s) => s.activeHotspotId) as PartId | null
  const setActiveHotspot = useLabStore((s) => s.setActiveHotspot)
  const setQuizMode = useLabStore((s) => s.setQuizMode)
  const isQuizMode = useLabStore((s) => s.isQuizMode)
  const quizTargetPartId = useLabStore((s) => s.quizTargetPartId) as PartId | null

  const startQuiz = useCallback(
    (currentPartId: PartId) => {
      const candidates = QUIZZABLE_PARTS.filter((p) => p !== currentPartId)
      const target = candidates[Math.floor(Math.random() * candidates.length)]
      setQuizMode(true, target)
      setActiveHotspot(null)
    },
    [setQuizMode, setActiveHotspot],
  )

  const handlePartClick = useCallback(
    (partId: PartId) => {
      if (isQuizMode) {
        const correct = partId === quizTargetPartId
        if (correct) {
          setQuizMode(false)
          setActiveHotspot(partId)
          setQuizFeedback('correct')
          void trackServerEvent('3d_quiz_answer', { scene: 'classical-orders', part: partId, correct: true })
        } else {
          setQuizFeedback('wrong')
          void trackServerEvent('3d_quiz_answer', { scene: 'classical-orders', part: partId, correct: false })
        }
        const duration = correct ? 2000 : 1200
        setTimeout(() => setQuizFeedback(null), duration)
      } else {
        setActiveHotspot(partId)
        void trackServerEvent('3d_part_select', { scene: 'classical-orders', part: partId })
      }
    },
    [isQuizMode, quizTargetPartId, setQuizMode, setActiveHotspot],
  )

  const infoContent: InfoContent | null =
    activeHotspotId && !isQuizMode
      ? {
          ...PART_INFO[activeHotspotId],
          onQuiz: () => startQuiz(activeHotspotId),
        }
      : null

  return (
    <div className="relative h-full w-full">
      {/* 3D Canvas */}
      <CanvasWrapper
        cameraPosition={[3.5, 1.5, 3.5]}
        cameraFov={42}
        minPolarAngle={Math.PI / 6}
        maxPolarAngle={Math.PI / 2}
        minDistance={1.5}
        maxDistance={8}
        showGround={false}
      >
        <ClassicalOrdersScene onPartClick={handlePartClick} />
      </CanvasWrapper>

      {/* Quiz answer feedback */}
      {quizFeedback && (
        <div className="absolute inset-0 pointer-events-none z-20 flex items-center justify-center">
          <div
            className={`px-4 py-2 rounded-md border text-sm font-bold shadow-lg ${
              quizFeedback === 'correct'
                ? 'bg-green-50 border-green-200 text-green-700'
                : 'bg-red-50 border-red-200 text-red-700'
            }`}
          >
            {quizFeedback === 'correct' ? 'Correct!' : 'Try again'}
          </div>
        </div>
      )}

      {/* Detailed info panel */}
      <InfoPanel content={infoContent} onClose={() => setActiveHotspot(null)} />
    </div>
  )
}

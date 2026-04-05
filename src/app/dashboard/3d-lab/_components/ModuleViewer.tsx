'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { LabTopBar } from '@/features/3d-lab/components/LabTopBar'
import { OnboardingFlow } from '@/features/3d-lab/components/OnboardingFlow'
import { ModuleContextCard } from '@/features/3d-lab/components/ModuleContextCard'
import { useLabStore } from '@/stores/useLabStore'
import { useLabTelemetry } from '@/hooks/useLabTelemetry'
import type { ModuleConfig } from '@/types/3d-lab'
import { LabViewport } from '@/features/3d-lab/components/LabViewport'
import { getModuleById } from '@/features/3d-lab/config/registry'

interface ModuleViewerProps {
  modelId: string
  basePath: string
}

/**
 * 3D Lab module viewer — new visual shell wrapping existing template renderers.
 *
 * What this provides (non-conflicting):
 *   - LabTopBar: 36px dark navy bar (in document flow, above canvas)
 *   - OnboardingFlow: modal overlay on first-ever visit
 *   - ModuleContextCard: auto-dismiss card on first visit per module
 *
 * What the TEMPLATES provide (their own UI):
 *   - GenericControlPanel / ControlPanel (parameter sliders)
 *   - ViolationBar / compliance indicators
 *   - Context scenario text (inside control panel)
 *   - Any template-specific overlays (cut depth, etc.)
 *
 * This separation prevents overlay conflicts. Templates own their canvas-level UI.
 */
export const ModuleViewer = ({ modelId, basePath }: ModuleViewerProps) => {
  const router = useRouter()
  const entry = getModuleById(modelId)
  const title = entry?.title ?? modelId.replace(/-/g, ' ')
  const codeRef = entry?.codeRef ?? ''

  const resetSession = useLabStore((s) => s.resetSession)

  const [showOnboarding, setShowOnboarding] = useState(false)
  const [showContextCard, setShowContextCard] = useState(false)

  // Build shim for ModuleContextCard
  const moduleConfigShim: ModuleConfig = useMemo(() => ({
    slug: modelId,
    title,
    codeReference: codeRef,
    subject: entry?.subject ?? '',
    learningObjective: entry?.description ?? '',
    estimatedMinutes: 5,
    modelUrl: '',
    modelSizeMB: 0,
    defaultCameraPosition: [4, 3, 4],
    defaultCameraTarget: [0, 0, 0],
    hotspots: [],
    questions: [],
    supportsCrossSection: false,
    supportsExplodedView: false,
    preTrainingTips: [],
    presetViews: {},
  }), [modelId, title, codeRef, entry])

  // Telemetry
  useLabTelemetry({ moduleSlug: modelId })

  // Init
  useEffect(() => {
    resetSession()
    if (typeof window !== 'undefined') {
      if (!localStorage.getItem('3dlab_onboarded')) {
        setShowOnboarding(true)
      } else if (!localStorage.getItem(`module_${modelId}_seen`)) {
        setShowContextCard(true)
      }
    }
    return () => { resetSession() }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [modelId])

  const handleBack = useCallback(() => router.push(basePath), [router, basePath])

  const handleOnboardingComplete = useCallback(() => {
    setShowOnboarding(false)
    if (typeof window !== 'undefined' && !localStorage.getItem(`module_${modelId}_seen`)) {
      setShowContextCard(true)
    }
  }, [modelId])

  const handleContextDismiss = useCallback(() => {
    setShowContextCard(false)
  }, [])

  return (
    <div className="flex flex-col h-full w-full">
      {/* LabTopBar — in document flow, no overlap possible */}
      <LabTopBar
        title={title}
        codeReference={codeRef}
        visitedCount={0}
        totalCount={entry?.aleQuestionCount ?? 0}
        onBack={handleBack}
      />

      {/* Canvas area — template fills this entirely and owns all its overlays */}
      <div className="flex-1 relative overflow-hidden bg-[var(--color-cream)]">
        <LabViewport
          modelId={modelId}
          model={{ model_id: modelId, name: title, slug: modelId, url: '' }}
          parameters={[]}
          hotspots={[]}
          userTier="camp"
        />

        {/* ModuleContextCard — top-left, auto-dismiss 6s, doesn't conflict with template UIs */}
        {showContextCard && !showOnboarding && (
          <ModuleContextCard config={moduleConfigShim} onDismiss={handleContextDismiss} />
        )}
      </div>

      {/* OnboardingFlow — full-screen modal, above everything */}
      {showOnboarding && (
        <OnboardingFlow onComplete={handleOnboardingComplete} />
      )}
    </div>
  )
}

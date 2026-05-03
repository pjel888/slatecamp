'use client'

import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { OnboardingFlow } from '@/features/3d-lab/components/OnboardingFlow'
import { ModuleContextCard } from '@/features/3d-lab/components/ModuleContextCard'
import { LabViewport } from '@/features/3d-lab/components/LabViewport'
import { LabViewportFrame } from '@/features/3d-lab/components/shell/LabViewportFrame'
import { ViewportShell } from '@/features/3d-lab/components/shell/ViewportShell'
import { useLabStore } from '@/features/3d-lab/stores/useLabStore'
import { useLabTelemetry } from '@/hooks/useLabTelemetry'
import { useTemplateContent } from '@/features/3d-lab/hooks/useTemplateContent'
import type { ModuleConfig } from '@/types/3d-lab'
import { getModuleById } from '@/features/3d-lab/config/registry'
import { importModuleConfig } from '@/features/3d-lab/config/module-paths'
import {
  hasSeen3DLabModule,
  record3DLabOnboardingEvent,
  resolve3DLabOnboardingOverlayForModule,
  type ThreeDLabOnboardingOverlay,
} from '@/features/3d-lab/components/onboarding/state'
import { CircleNotch } from '@phosphor-icons/react/dist/ssr'
import { SCIcon } from '@/components/graphics/icons/Icon'

interface ModuleViewerProps {
  modelId: string
  basePath: string
}

/**
 * 3D Lab module viewer — Phase 2: Real Data Binding.
 * Loads the actual module config and passes it down to the viewport and shell.
 */
export const ModuleViewer = ({ modelId, basePath }: ModuleViewerProps) => {
  const router = useRouter()
  const entry = getModuleById(modelId)

  const [config, setConfig] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const resetSession = useLabStore((s) => s.resetSession)

  // Ref-based guard: tracks the module ID that initiated the current load.
  // If modelId changes before a dynamic import resolves, the stale callback
  // checks this ref and discards the result rather than clobbering new state.
  const activeModuleIdRef = useRef<string | null>(null)

  const [activeOnboardingOverlay, setActiveOnboardingOverlay] =
    useState<ThreeDLabOnboardingOverlay>('none')

  // Telemetry
  useLabTelemetry({ moduleSlug: modelId })

  // Load config and init session
  useEffect(() => {
    let cancelled = false
    activeModuleIdRef.current = modelId
    setLoading(true)
    setError(null)
    setActiveOnboardingOverlay('none')

    resetSession()

    importModuleConfig(modelId)
      .then((cfg) => {
        // Guard 1: effect cleanup (component unmounted or dep changed)
        // Guard 2: ref check catches cases where the effect re-ran and set a
        //          new activeModuleIdRef before this promise resolved
        if (cancelled || activeModuleIdRef.current !== modelId) return

        setConfig(cfg)
        setLoading(false)

        const overlay = resolve3DLabOnboardingOverlayForModule(modelId)
        setActiveOnboardingOverlay(overlay)
        record3DLabOnboardingEvent({
          event: 'overlay-resolved',
          moduleId: modelId,
          overlay,
        })
      })
      .catch((err: unknown) => {
        if (cancelled || activeModuleIdRef.current !== modelId) return
        setError(String(err))
        setLoading(false)
      })

    return () => {
      cancelled = true
      resetSession()
    }

  }, [modelId])

  const handleBack = useCallback(() => router.push(basePath), [router, basePath])

  const handleOnboardingComplete = useCallback(() => {
    const nextOverlay = hasSeen3DLabModule(modelId) ? 'none' : 'module'
    setActiveOnboardingOverlay(nextOverlay)
    record3DLabOnboardingEvent({
      event: 'overlay-resolved',
      moduleId: modelId,
      overlay: nextOverlay,
    })
  }, [modelId])

  const handleContextDismiss = useCallback(() => {
    setActiveOnboardingOverlay('none')
    record3DLabOnboardingEvent({
      event: 'overlay-resolved',
      moduleId: modelId,
      overlay: 'none',
    })
  }, [modelId])

  // Build metadata for the shell
  const title = config?.title ?? entry?.title ?? modelId.replace(/-/g, ' ')
  const codeRef = config?.codeReference ?? entry?.codeRef ?? ''
  const description = config?.description ?? entry?.description ?? ''
  const subject = config?.subject ?? entry?.subject ?? ''

  const _hotspotCount = config?.hotspots?.length ?? 0
  const totalLEAQuestions = entry?.leaQuestionCount ?? 0

  // Construct a consistent ModuleConfig object for the context card
  const moduleMetadata: ModuleConfig = useMemo(() => ({
    slug: modelId,
    title,
    codeReference: codeRef,
    subject,
    learningObjective: description,
    estimatedMinutes: config?.estimatedMinutes ?? 5,
    modelUrl: config?.modelUrl ?? '',
    modelSizeMB: config?.modelSizeMB ?? 0,
    defaultCameraPosition: config?.camera?.position ?? [4, 3, 4],
    defaultCameraTarget: config?.camera?.target ?? [0, 0, 0],
    hotspots: config?.hotspots ?? [],
    questions: config?.questions ?? [],
    supportsCrossSection: config?.supportsCrossSection ?? false,
    supportsExplodedView: config?.supportsExplodedView ?? false,
    preTrainingTips: config?.preTrainingTips ?? [],
    presetViews: config?.presetViews ?? {},
  }), [modelId, title, codeRef, description, subject, config])

  // ── Unified Viewport Shell content ──────────────────────────────────────
  // MUST be called before any early returns to satisfy React rules of hooks.
  // When loading/error, config is null → useTemplateContent returns null safely.
  const templateContent = useTemplateContent(modelId, config)

  const showOnboarding = activeOnboardingOverlay === 'global'
  const showContextCard = activeOnboardingOverlay === 'module'

  const onboardingOverlays = (
    <>
      {showContextCard && (
        <div className="z-30 pointer-events-auto">
          <ModuleContextCard config={moduleMetadata} onDismiss={handleContextDismiss} />
        </div>
      )}
      {showOnboarding && (
        <div className="z-50 pointer-events-auto">
          <OnboardingFlow onComplete={handleOnboardingComplete} />
        </div>
      )}
    </>
  )

  if (loading) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-surface-light">
        <SCIcon icon={CircleNotch} size="lg" className="animate-spin text-muted-foreground" />
        <span className="ml-2 text-[11px] text-muted-foreground uppercase tracking-widest font-black">
          Loading Module...
        </span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center bg-surface-light gap-4">
        <p className="text-sm text-red-500 font-medium">Failed to load module: {modelId}</p>
        <button onClick={handleBack} className="text-xs text-primary hover:underline">
          Return to Lab Browser
        </button>
      </div>
    )
  }

  // ── Unified Viewport Shell path ───────────────────────────────────────────
  // Template-driven modules: ViewportShell with slot content from useTemplateContent
  if (templateContent) {
    return (
      <ViewportShell
        title={title}
        codeReference={codeRef}
        visitedCount={0}
        totalCount={totalLEAQuestions}
        onBack={handleBack}
        shellConfig={templateContent.shellConfig}
        capabilities={templateContent.capabilities}
        suppressFirstTimeTooltip={activeOnboardingOverlay !== 'none'}
        content={{
          ...templateContent.content,
          canvasContent: (
            <LabViewportFrame>
              {templateContent.content.canvasContent}
            </LabViewportFrame>
          ),
        }}
      >
        {onboardingOverlays}
      </ViewportShell>
    )
  }

  // ── Legacy fallback: shell-owned chrome with legacy scene content ─
  return (
    <ViewportShell
      title={title}
      codeReference={codeRef}
      visitedCount={0}
      totalCount={totalLEAQuestions}
      onBack={handleBack}
      shellConfig={{}}
      capabilities={{ resetCamera: true }}
      suppressFirstTimeTooltip={activeOnboardingOverlay !== 'none'}
      content={{
        canvasContent: (
          <LabViewportFrame>
            <LabViewport
              modelId={modelId}
              model={{ model_id: modelId, name: title, slug: modelId, url: '' }}
              parameters={[]}
              hotspots={[]}
              userTier="free"
              preLoadedConfig={config}
            />
          </LabViewportFrame>
        ),
      }}
    >
      {onboardingOverlays}
    </ViewportShell>
  )
}

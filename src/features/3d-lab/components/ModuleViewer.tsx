'use client'

import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { useRouter } from 'next/navigation'
import {
  LabTopBar,
  OnboardingFlow,
  ModuleContextCard,
  LabViewport,
  LabModuleShell,
  LabViewportFrame,
  ViewportShell,
} from '@/features/3d-lab/components'
import { useLabStore } from '@/features/3d-lab/stores/useLabStore'
import { useLabTelemetry } from '@/hooks/useLabTelemetry'
import { useTemplateContent } from '@/features/3d-lab/hooks/useTemplateContent'
import type { ModuleConfig } from '@/types/3d-lab'
import { getModuleById, ALL_MODULES } from '@/features/3d-lab/config/registry'
import { ASSET_TAXONOMY } from '@/features/3d-lab/config/taxonomy'
import { CircleNotch } from '@phosphor-icons/react/dist/ssr'
import { SCIcon } from '@/components/graphics/icons/Icon'

interface ModuleViewerProps {
  modelId: string
  basePath: string
}

// ─── Module Config Loader (shared with LabViewport logic) ──────────────────

const CAT_ID_MAP: Record<string, string> = {}
for (const [key, meta] of Object.entries(ASSET_TAXONOMY)) {
  CAT_ID_MAP[key] = meta.id
}

const DIR_NAMES: Record<string, string> = {
  '01': '01-building-code',
  '02': '02-accessibility',
  '03': '03-fire-code',
  '04': '04-structural',
  '05': '05-plumbing',
  '06': '06-electrical',
  '07': '07-mechanical',
  '08': '08-vertical',
  '09': '09-construction',
  '10': '10-materials',
  '11': '11-arch-history',
  '12': '12-ph-heritage',
  '13': '13-planning',
  '14': '14-prof-practice',
  '15': '15-estimating',
  '16': '16-site-dev',
}

const MODULE_PATHS: Record<string, string> = {}
for (const mod of ALL_MODULES) {
  if (mod.categoryId) {
    const catId = CAT_ID_MAP[mod.categoryId]
    const dir = catId ? DIR_NAMES[catId] : undefined
    if (dir) {
      MODULE_PATHS[mod.id] = `${dir}/${mod.id}`
    }
  }
}

const loadModuleConfig = (moduleId: string): Promise<any> => {
  const path = MODULE_PATHS[moduleId] ?? moduleId
  return import(`@/features/3d-lab/config/modules/${path}` as any).then(
    (mod: Record<string, unknown>) => Object.values(mod)[0],
  )
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

  const [showOnboarding, setShowOnboarding] = useState(false)
  const [showContextCard, setShowContextCard] = useState(false)

  // Telemetry
  useLabTelemetry({ moduleSlug: modelId })

  // Load config and init session
  useEffect(() => {
    let cancelled = false
    activeModuleIdRef.current = modelId
    setLoading(true)
    setError(null)

    resetSession()

    loadModuleConfig(modelId)
      .then((cfg) => {
        // Guard 1: effect cleanup (component unmounted or dep changed)
        // Guard 2: ref check catches cases where the effect re-ran and set a
        //          new activeModuleIdRef before this promise resolved
        if (cancelled || activeModuleIdRef.current !== modelId) return

        setConfig(cfg)
        setLoading(false)

        // Show onboarding/context card after load
        if (typeof window !== 'undefined') {
          if (!localStorage.getItem('3dlab_onboarded')) {
            setShowOnboarding(true)
          } else if (!localStorage.getItem(`module_${modelId}_seen`)) {
            setShowContextCard(true)
          }
        }
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

  // Build metadata for the shell
  const title = config?.title ?? entry?.title ?? modelId.replace(/-/g, ' ')
  const codeRef = config?.codeReference ?? entry?.codeRef ?? ''
  const description = config?.description ?? entry?.description ?? ''
  const subject = config?.subject ?? entry?.subject ?? ''

  const hotspotCount = config?.hotspots?.length ?? 0
  const totalALEQuestions = entry?.leaQuestionCount ?? 0

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

  const isBespoke = modelId === 'site-development-controls'

  if (loading) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-[#F8F7F5]">
        <SCIcon icon={CircleNotch} size="lg" className="animate-spin text-muted-foreground" />
        <span className="ml-2 text-[11px] text-muted-foreground uppercase tracking-widest font-black">
          Loading Module...
        </span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center bg-[#F8F7F5] gap-4">
        <p className="text-sm text-red-500 font-medium">Failed to load module: {modelId}</p>
        <button onClick={handleBack} className="text-xs text-primary hover:underline">
          Return to Lab Browser
        </button>
      </div>
    )
  }

  // ── Unified Viewport Shell path ───────────────────────────────────────────
  // Template-driven modules: ViewportShell with slot content from useTemplateContent
  if (templateContent && !isBespoke) {
    return (
      <ViewportShell
        title={title}
        codeReference={codeRef}
        visitedCount={0}
        totalCount={totalALEQuestions}
        onBack={handleBack}
        shellConfig={templateContent.shellConfig}
        capabilities={templateContent.capabilities}
        content={{
          ...templateContent.content,
          canvasContent: (
            <LabViewportFrame>
              {templateContent.content.canvasContent}
            </LabViewportFrame>
          ),
        }}
      >
        {showContextCard && !showOnboarding && (
          <div className="z-30 pointer-events-auto">
            <ModuleContextCard config={moduleMetadata} onDismiss={handleContextDismiss} />
          </div>
        )}
        {showOnboarding && (
          <div className="z-50 pointer-events-auto">
            <OnboardingFlow onComplete={handleOnboardingComplete} />
          </div>
        )}
      </ViewportShell>
    )
  }

  // ── Bespoke modules (DevControls): ViewportShell header + own internal layout
  if (isBespoke) {
    return (
      <ViewportShell
        title={title}
        codeReference={codeRef}
        visitedCount={0}
        totalCount={totalALEQuestions}
        onBack={handleBack}
        shellConfig={{}}
        capabilities={{ resetCamera: true }}
        content={{
          canvasContent: (
            <LabViewport
              modelId={modelId}
              model={{ model_id: modelId, name: title, slug: modelId, url: '' }}
              parameters={[]}
              hotspots={[]}
              userTier="free"
              preLoadedConfig={config}
            />
          ),
        }}
      >
        {showContextCard && !showOnboarding && (
          <div className="z-30 pointer-events-auto">
            <ModuleContextCard config={moduleMetadata} onDismiss={handleContextDismiss} />
          </div>
        )}
        {showOnboarding && (
          <div className="z-50 pointer-events-auto">
            <OnboardingFlow onComplete={handleOnboardingComplete} />
          </div>
        )}
      </ViewportShell>
    )
  }

  // ── Fallback: ViewportShell header + own internal layout (calculator, etc.) ─
  return (
    <ViewportShell
      title={title}
      codeReference={codeRef}
      visitedCount={0}
      totalCount={totalALEQuestions}
      onBack={handleBack}
      shellConfig={{}}
      capabilities={{ resetCamera: true }}
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
      {showContextCard && !showOnboarding && (
        <div className="z-30 pointer-events-auto">
          <ModuleContextCard config={moduleMetadata} onDismiss={handleContextDismiss} />
        </div>
      )}
      {showOnboarding && (
        <div className="z-50 pointer-events-auto">
          <OnboardingFlow onComplete={handleOnboardingComplete} />
        </div>
      )}
    </ViewportShell>
  )
}

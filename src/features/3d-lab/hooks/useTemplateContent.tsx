'use client'

import { useMemo } from 'react'
import { CanvasWrapper } from '@/features/3d-lab/components/CanvasWrapper'
import { SceneErrorBoundary } from '@/features/3d-lab/components/templates/SceneErrorBoundary'
import { GenericControlPanel } from '@/features/3d-lab/components/templates/GenericControlPanel'
import { ComplianceReportPanel } from '@/features/3d-lab/components/templates/ComplianceReportPanel'
import { ExplodedPartsSidebar } from '@/features/3d-lab/components/templates/ExplodedPartsSidebar'
import { ExplodeSliderControl } from '@/features/3d-lab/components/templates/ExplodeSliderControl'
import { CutawayLayersSidebar } from '@/features/3d-lab/components/templates/CutawayLayersSidebar'
import { CutDepthSliderControl } from '@/features/3d-lab/components/templates/CutDepthSliderControl'
import { createModuleStore } from '@/features/3d-lab/stores/createModuleStore'
import { getModuleById } from '@/features/3d-lab/config/registry'
import {
  TEMPLATE_SHELL_DEFAULTS,
  type ParametricSceneConfig,
  type ExplodedAssemblyConfig,
  type CutawaySectionConfig,
  type ViewportShellConfig,
  type ViewportCapabilities,
  type ViewportShellContent,
  type TemplateType,
} from '@/features/3d-lab/types/templates'

// ─── Lazy template scene renderers ──────────────────────────────────────────
// Only import renderers for migrated templates. Others use legacy path.
import dynamic from 'next/dynamic'

const ParametricSceneRenderer = dynamic(
  () => import('@/features/3d-lab/templates/ParametricSceneRenderer').then((m) => m.ParametricSceneRenderer),
  { ssr: false },
)

const ExplodedAssemblyScene = dynamic(
  () => import('@/features/3d-lab/templates/ExplodedAssemblyScene').then((m) => m.ExplodedAssemblyScene),
  { ssr: false },
)

const CutawaySectionScene = dynamic(
  () => import('@/features/3d-lab/templates/CutawaySectionScene').then((m) => m.CutawaySectionScene),
  { ssr: false },
)

// ─── Hook ───────────────────────────────────────────────────────────────────

interface TemplateContentResult {
  shellConfig: ViewportShellConfig
  capabilities: ViewportCapabilities
  content: ViewportShellContent
}

/**
 * useTemplateContent — Builds ViewportShellContent for a given module config.
 * Each template type produces different sidebar/canvas content, but the shell
 * layout and chrome is standardized.
 *
 * Templates provide CONTENT only. The shell provides CONTAINERS.
 */
export const useTemplateContent = (
  moduleId: string,
  config: any,
): TemplateContentResult | null => {
  const entry = getModuleById(moduleId)
  const templateType = entry?.templateType

  // Create a stable module store with template-appropriate defaults
  const defaults = useMemo(() => {
    const d: Record<string, number | boolean | string> = {}
    // Merge parameter defaults
    if (config?.parameters) {
      for (const p of config.parameters) {
        d[p.key] = p.default
      }
    }
    // Template-specific defaults
    if (templateType === 'exploded') {
      d.explode = 0
    }
    if (templateType === 'cutaway' && config?.layers) {
      const cutMax = Math.max(...config.layers.map((l: any) => l.depth + (l.geometry?.args?.[1] ?? 0.1)))
      d.cutPosition = cutMax
    }
    return d
  }, [config?.parameters, config?.layers, templateType])

  const useStore = useMemo(
    () => createModuleStore(defaults),
    [config?.id], // eslint-disable-line react-hooks/exhaustive-deps
  )

  // Get template defaults, merge with any module-level overrides
  const templateDefaults = templateType ? TEMPLATE_SHELL_DEFAULTS[templateType] : null

  return useMemo(() => {
    if (!config || !templateType || !templateDefaults) return null

    const shellConfig: ViewportShellConfig = { ...templateDefaults.shell }
    const capabilities: ViewportCapabilities = { ...templateDefaults.capabilities }

    const cameraPos = config.camera?.position ?? [3, 3, 3]
    const cameraFov = config.camera?.fov ?? 45

    const canvasWrapper = (children: React.ReactNode) => (
      <SceneErrorBoundary>
        <CanvasWrapper
          sceneConfig={{
            cameraPosition: cameraPos,
            cameraFov: cameraFov,
            minDistance: 1,
            maxDistance: 25,
            showGround: false,
          }}
        >
          {children}
        </CanvasWrapper>
      </SceneErrorBoundary>
    )

    switch (templateType as TemplateType) {
      case 'parametric': {
        const cfg = config as ParametricSceneConfig
        const hasCompliancePanel = (() => {
          if (!cfg.violations || cfg.violations.length === 0) return false
          const prefixes = new Set(cfg.violations.map((v) => v.id.split('-')[0]))
          prefixes.delete('conflict')
          return prefixes.size > 1
        })()

        return {
          shellConfig: {
            ...shellConfig,
            rightSidebar: hasCompliancePanel
              ? { width: 280, title: 'Compliance', mobileTabLabel: 'Compliance' }
              : shellConfig.rightSidebar,
            leftSidebar: { width: 240, title: cfg.title, mobileTabLabel: 'Controls' },
          },
          capabilities,
          content: {
            canvasContent: canvasWrapper(
              <ParametricSceneRenderer
                config={cfg}
                useStore={useStore}
                hideOverlays={hasCompliancePanel}
              />,
            ),
            leftSidebarContent: (
              <GenericControlPanel
                embedded
                title={cfg.title}
                parameters={cfg.parameters}
                presets={cfg.presets}
                useStore={useStore}
                contextScenario={cfg.contextScenario}
                violations={cfg.violations}
              />
            ),
            rightSidebarContent: hasCompliancePanel && cfg.violations ? (
              <ComplianceReportPanel
                embedded
                violations={cfg.violations}
                useStore={useStore}
              />
            ) : undefined,
          },
        }
      }

      case 'exploded': {
        const cfg = config as ExplodedAssemblyConfig
        return {
          shellConfig: { ...shellConfig },
          capabilities,
          content: {
            canvasContent: canvasWrapper(
              <ExplodedAssemblyScene config={cfg} useStore={useStore} />,
            ),
            rightSidebarContent: (
              <ExplodedPartsSidebar config={cfg} useStore={useStore} />
            ),
            toolbarExtras: (
              <ExplodeSliderControl useStore={useStore} />
            ),
          },
        }
      }

      case 'cutaway': {
        const cfg = config as CutawaySectionConfig
        const cutMax = Math.max(...cfg.layers.map((l) => l.depth + (l.geometry.args?.[1] ?? 0.1)))
        return {
          shellConfig: { ...shellConfig },
          capabilities,
          content: {
            canvasContent: canvasWrapper(
              <CutawaySectionScene config={cfg} useStore={useStore} />,
            ),
            rightSidebarContent: (
              <CutawayLayersSidebar config={cfg} useStore={useStore} />
            ),
            toolbarExtras: (
              <CutDepthSliderControl config={cfg} useStore={useStore} cutMax={cutMax} />
            ),
          },
        }
      }

      // Non-migrated templates fall back to null (use legacy rendering)
      default:
        return null
    }
  }, [config, templateType, templateDefaults, useStore])
}

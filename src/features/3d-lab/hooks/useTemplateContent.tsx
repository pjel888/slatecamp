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
import { FloorPlanLegendSidebar } from '@/features/3d-lab/components/templates/FloorPlanLegendSidebar'
import { AnimatedStepsSidebar } from '@/features/3d-lab/components/templates/AnimatedStepsSidebar'
import { ConfigPanel } from '@/features/3d-lab/components/templates/WallConfigurator/ConfigPanel'
import { BOMPanel as WallConfiguratorV1BOMPanel } from '@/features/3d-lab/components/templates/WallConfigurator/BOMPanel'
import { WallConfiguratorLeftPanel } from '@/features/3d-lab/components/templates/WallConfiguratorLeftPanel'
import { WallConfiguratorRightPanel } from '@/features/3d-lab/components/templates/WallConfiguratorRightPanel'
import { DevControlsSceneContent } from '@/features/3d-lab/DevControlsModule/canvas/DevControlsCanvas'
import { DevControlsLeftSidebar, DevControlsRightSidebar, DevControlsStatusContent } from '@/features/3d-lab/DevControlsModule/dashboard/DevControlsShellSlots'
import { DevControlsLayerToggles } from '@/features/3d-lab/DevControlsModule/dashboard/DevControlsLayerToggles'
import { SharedToolbarBridge } from '@/features/3d-lab/DevControlsModule/dashboard/SharedToolbarBridge'
import { CAMERA_PRESETS as SITE_DEV_CAMERA_PRESETS } from '@/features/3d-lab/DevControlsModule/canvas/constants'
import { createModuleStore } from '@/features/3d-lab/stores/createModuleStore'
import { getModuleById } from '@/features/3d-lab/config/registry'
import {
  TEMPLATE_SHELL_DEFAULTS,
  type ParametricSceneConfig,
  type ExplodedAssemblyConfig,
  type CutawaySectionConfig,
  type FloorPlanConfig,
  type AnimatedSequenceConfig,
  type CalculatorConfig,
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

const FloorPlanScene = dynamic(
  () => import('@/features/3d-lab/templates/FloorPlanScene').then((m) => m.FloorPlanScene),
  { ssr: false },
)

const AnimatedSequenceScene = dynamic(
  () => import('@/features/3d-lab/templates/AnimatedSequenceScene').then((m) => m.AnimatedSequenceScene),
  { ssr: false },
)

const WallConfiguratorRenderer = dynamic(
  () => import('@/features/3d-lab/templates/WallConfiguratorRenderer').then((m) => m.WallConfiguratorRenderer),
  { ssr: false },
)

const CalculatorTemplateSlot = dynamic(
  () => import('@/features/3d-lab/templates/CalculatorTemplate').then((m) => m.CalculatorTemplateSlot),
  { ssr: false },
)


const siteDevelopmentCameraControls = {
  presets: {
    perspective: SITE_DEV_CAMERA_PRESETS.perspective,
    orbit: SITE_DEV_CAMERA_PRESETS.orbit,
    top: SITE_DEV_CAMERA_PRESETS.top,
    front: SITE_DEV_CAMERA_PRESETS.front,
    left: SITE_DEV_CAMERA_PRESETS.left,
    right: SITE_DEV_CAMERA_PRESETS.right,
    rear: SITE_DEV_CAMERA_PRESETS.rear,
    'iso-ne': SITE_DEV_CAMERA_PRESETS['iso-ne'],
    'iso-nw': SITE_DEV_CAMERA_PRESETS['iso-nw'],
    'iso-se': SITE_DEV_CAMERA_PRESETS['iso-se'],
    'iso-sw': SITE_DEV_CAMERA_PRESETS['iso-sw'],
  },
  zoomToFit: SITE_DEV_CAMERA_PRESETS.perspective,
  resetPreset: 'perspective' as const,
  minDistance: 0.01,
  maxDistance: Infinity,
  minPanTargetDistance: 16,
}

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
    if (templateType === 'animated') {
      d.currentStep = 0
      d.isPlaying = false
    }
    if (templateType === 'cutaway' && config?.layers) {
      const cutMax = Math.max(...config.layers.map((l: any) => l.depth + (l.geometry?.args?.[1] ?? 0.1)))
      d.cutPosition = cutMax
    }
    return d
  }, [config?.parameters, config?.layers, templateType])

  const useStore = useMemo(
    () => createModuleStore(defaults),
    [config?.id],
  )

  // Get template defaults, merge with any module-level overrides
  const templateDefaults = templateType ? TEMPLATE_SHELL_DEFAULTS[templateType] : null

  return useMemo(() => {
    if (!config || !templateType || !templateDefaults) return null

    const shellConfig: ViewportShellConfig = { ...templateDefaults.shell }
    const capabilities: ViewportCapabilities = { ...templateDefaults.capabilities }

    const cameraPos = config.camera?.position ?? [3, 3, 3]
    const cameraTarget = config.camera?.target ?? [0, 1, 0]
    const cameraFov = config.camera?.fov ?? 45
    const moduleCameraControls = {
      presets: {
        perspective: { position: cameraPos, target: cameraTarget, fov: cameraFov },
        orbit: { position: cameraPos, target: cameraTarget, fov: cameraFov },
        ...(config.camera?.presets ?? {}),
      },
      zoomToFit: config.camera?.zoomToFit ?? { position: cameraPos, target: cameraTarget, fov: cameraFov },
      resetPreset: config.camera?.resetPreset ?? ('perspective' as const),
      minPanTargetDistance: config.camera?.minPanTargetDistance,
      minDistance: 0.01,
      maxDistance: Infinity,
    }

    const canvasWrapper = (
      children: React.ReactNode,
      sceneConfigOverrides: React.ComponentProps<typeof CanvasWrapper>['sceneConfig'] = {},
    ) => (
      <SceneErrorBoundary>
        <CanvasWrapper
          sceneConfig={{
            cameraPosition: cameraPos,
            cameraTarget,
            cameraFov: cameraFov,
            minDistance: 0.01,
            maxDistance: Infinity,
            cameraControls: moduleCameraControls,
            showGround: false,
            ...sceneConfigOverrides,
          }}
        >
          {children}
        </CanvasWrapper>
      </SceneErrorBoundary>
    )

    switch (templateType as TemplateType) {
      case 'parametric': {
        const cfg = config as ParametricSceneConfig

        // ── Site Development Controls special path ──
        // Bespoke content is now slotted into the shared shell instead of owning
        // its own global grid, status bar, toolbar, canvas, or OrbitControls.
        if (cfg.id === 'site-development-controls') {
          return {
            shellConfig: {
              ...shellConfig,
              leftSidebar: { width: 480, title: 'Site Controls', mobileTabLabel: 'Controls' },
              rightSidebar: { width: 300, title: 'Compliance', mobileTabLabel: 'Compliance' },
              statusBar: true,
            },
            capabilities,
            content: {
              canvasContent: (
                <>
                  <SharedToolbarBridge />
                  {canvasWrapper(
                    <DevControlsSceneContent />,
                    {
                      cameraPosition: SITE_DEV_CAMERA_PRESETS.perspective.position,
                      cameraTarget: SITE_DEV_CAMERA_PRESETS.perspective.target,
                      cameraFov: SITE_DEV_CAMERA_PRESETS.perspective.fov,
                      maxDistance: Infinity,
                      showGround: false,
                      disableLighting: true,
                      disableSceneBase: true,
                      clearColor: '#F2F0EB',
                      cameraControls: siteDevelopmentCameraControls,
                    },
                  )}
                </>
              ),
              leftSidebarContent: <DevControlsLeftSidebar />,
              rightSidebarContent: <DevControlsRightSidebar />,
              statusBarContent: <DevControlsStatusContent />,
              layersPanelContent: <DevControlsLayerToggles />,
            },
          }
        }

        // ── Wall Configurator v2 special path ──
        // The unified wall configurator needs custom sidebar panels
        // (PerformanceDashboard, BOMPanel, CoreTypeCardStrip, ViewModeButtonStrip)
        if (cfg.id === 'unified-wall-configurator') {
          return {
            shellConfig: {
              ...shellConfig,
              rightSidebar: { width: 320, title: 'Performance', mobileTabLabel: 'Performance' },
              leftSidebar: { width: 340, title: cfg.title, mobileTabLabel: 'Controls' },
            },
            capabilities,
            content: {
              canvasContent: canvasWrapper(
                <ParametricSceneRenderer
                  config={cfg}
                  useStore={useStore}
                  hideOverlays
                />,
              ),
              leftSidebarContent: (
                <WallConfiguratorLeftPanel config={cfg} useStore={useStore} />
              ),
              rightSidebarContent: (
                <WallConfiguratorRightPanel config={cfg} useStore={useStore} />
              ),
            },
          }
        }

        // ── Standard parametric path ──
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
              ? { width: 300, title: 'Compliance', mobileTabLabel: 'Compliance' }
              : shellConfig.rightSidebar,
            leftSidebar: { width: 320, title: cfg.title, mobileTabLabel: 'Controls' },
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

      case 'floorplan': {
        const cfg = config as FloorPlanConfig
        return {
          shellConfig: {
            ...shellConfig,
            leftSidebar: { width: 320, title: cfg.title, mobileTabLabel: 'Controls' },
          },
          capabilities,
          content: {
            canvasContent: canvasWrapper(
              <FloorPlanScene config={cfg} useStore={useStore} />,
            ),
            leftSidebarContent: cfg.parameters ? (
              <GenericControlPanel
                embedded
                title={cfg.title}
                parameters={cfg.parameters}
                presets={cfg.presets}
                useStore={useStore}
                contextScenario={cfg.contextScenario}
                violations={cfg.violations}
              />
            ) : undefined,
            rightSidebarContent: (
              <FloorPlanLegendSidebar config={cfg} useStore={useStore} />
            ),
          },
        }
      }

      case 'animated': {
        const cfg = config as AnimatedSequenceConfig
        return {
          shellConfig: { ...shellConfig },
          capabilities,
          content: {
            canvasContent: canvasWrapper(
              <AnimatedSequenceScene config={cfg} useStore={useStore} />,
            ),
            rightSidebarContent: (
              <AnimatedStepsSidebar config={cfg} useStore={useStore} />
            ),
          },
        }
      }

      case 'wall-configurator': {
        return {
          shellConfig: { ...shellConfig },
          capabilities,
          content: {
            canvasContent: canvasWrapper(
              <WallConfiguratorRenderer config={config as ParametricSceneConfig} />,
            ),
            leftSidebarContent: <ConfigPanel />,
            rightSidebarContent: <WallConfiguratorV1BOMPanel />,
          },
        }
      }

      case 'calculator': {
        const cfg = config as CalculatorConfig
        return {
          shellConfig: {
            ...shellConfig,
            leftSidebar: { width: 340, title: 'Inputs', mobileTabLabel: 'Inputs' },
            rightSidebar: { width: 340, title: 'Results', mobileTabLabel: 'Results' },
            statusBar: true,
          },
          capabilities,
          content: {
            canvasContent: <CalculatorTemplateSlot config={cfg} slot="scene" />,
            leftSidebarContent: <CalculatorTemplateSlot config={cfg} slot="leftSidebar" />,
            rightSidebarContent: <CalculatorTemplateSlot config={cfg} slot="rightSidebar" />,
            statusBarContent: <CalculatorTemplateSlot config={cfg} slot="statusBar" />,
          },
        }
      }

      default:
        return null
    }
  }, [config, templateType, templateDefaults, useStore])
}

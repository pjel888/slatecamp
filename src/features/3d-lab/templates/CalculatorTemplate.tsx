// src/app/dashboard/3d-lab/_templates/CalculatorTemplate.tsx
// Calculator template — renders the three-panel calculator layout.
// Extends the 3D Lab template system with orthographic camera, flat shading,
// and minimal lighting for material estimation tools.
'use client'

import { Suspense, useState, type ReactNode } from 'react'
import { CanvasWrapper } from '@/features/3d-lab/components/CanvasWrapper'
import { SceneErrorBoundary } from '@/features/3d-lab/components/templates/SceneErrorBoundary'
import { CalculatorLighting } from '@/features/3d-lab/components/templates/CalculatorLighting'
import { SceneInvalidator } from '@/components/r3f/SceneInvalidator'
import { CanvasEmptyState } from '@/components/calculators/CanvasEmptyState'
import { CHBInputPanel } from '@/components/calculators/CHBInputPanel'
import { CHBScene } from '@/components/calculators/CHBScene'
import { DrywallInputPanel } from '@/components/calculators/DrywallInputPanel'
import { DrywallScene } from '@/components/calculators/DrywallScene'
import { FlooringInputPanel } from '@/components/calculators/FlooringInputPanel'
import { FlooringScene } from '@/components/calculators/FlooringScene'
import { PaintInputPanel } from '@/components/calculators/PaintInputPanel'
import { PaintScene } from '@/components/calculators/PaintScene'
import { ResultRow } from '@/components/calculators/ResultRow'
import { AssumptionsAccordion } from '@/components/calculators/AssumptionsAccordion'
import { EstimationDisclaimer } from '@/components/calculators/EstimationDisclaimer'
import { ExportActions } from '@/components/calculators/ExportActions'
import { Accordion, AccordionItem } from '@/components/ui/accordion'
import { SponsorCard } from '@/components/calculators/SponsorCard'
import { useFlooringStore } from '@/app/calculators/_stores/flooringStore'
import { usePaintStore } from '@/app/calculators/_stores/paintStore'
import { useDrywallStore } from '@/app/calculators/_stores/drywallStore'
import { useCHBStore } from '@/app/calculators/_stores/chbStore'
import { FloatingCameraBar, getCalcCameraPresets, type CalcCameraPreset } from '@/components/calculators/FloatingCameraBar'
import type { CalculatorConfig } from '../_types/templates'
import Link from 'next/link'
import { ROUTES } from '@/lib/routes'

// ─── Shared Types ─────────────────────────────────────────────────────────────

interface ResultRowData {
  label: string
  value: string | number
  unit: string
  isDeduction?: boolean
  isAddition?: boolean
  isSummary?: boolean
  isHighlighted?: boolean
  decimals?: number
  onHover?: () => void
  onHoverEnd?: () => void
}

interface ToolRenderProps {
  scene: ReactNode
  inputPanel: ReactNode
  resultRows: ResultRowData[]
  assumptions: string[]
  inputVersion: number
  hasDimensions: boolean
  resultMode: 'net' | 'buy'
  onResultModeChange: (mode: 'net' | 'buy') => void
  emptyMessage?: string
}

// ─── Shared Slot Layout ──────────────────────────────────────────────────────

export type CalculatorTemplateSlot = 'full' | 'leftSidebar' | 'rightSidebar' | 'scene' | 'statusBar'

const buildCalculatorCameraControls = (presets: Record<CalcCameraPreset, ReturnType<typeof getCalcCameraPresets>[CalcCameraPreset]>) => ({
  presets: {
    perspective: presets.perspective,
    orbit: presets.perspective,
    top: presets.top,
    front: presets.front,
    left: presets['iso-nw'],
    right: presets['iso-ne'],
    rear: presets['iso-sw'],
    'iso-ne': presets['iso-ne'],
    'iso-nw': presets['iso-nw'],
    'iso-se': presets['iso-se'],
    'iso-sw': presets['iso-sw'],
  },
  zoomToFit: presets.perspective,
  resetPreset: 'perspective' as const,
  minDistance: 0.5,
  maxDistance: 80,
  minPolarAngle: Math.PI * 0.05,
  maxPolarAngle: Math.PI * 0.48,
})

function CalculatorInputContent({ config, tool }: { config: CalculatorConfig; tool: ToolRenderProps }) {
  return (
    <div className="h-full overflow-y-auto p-4">
      <div className="lg:hidden">
        <Accordion>
          <AccordionItem title="Inputs" _index={0}>
            {tool.inputPanel}
          </AccordionItem>
        </Accordion>
      </div>
      <div className="hidden lg:block">
        {tool.inputPanel}
      </div>
      {config.sponsorData && (
        <div className="mt-4 border-t border-border pt-4">
          <SponsorCard
            sponsorName={config.sponsorData.name}
            logoUrl={config.sponsorData.logoUrl}
          />
        </div>
      )}
    </div>
  )
}

function CalculatorSceneContent({
  config,
  tool,
  cameraPreset,
  onCameraPresetChange,
  showLocalCameraBar,
}: {
  config: CalculatorConfig
  tool: ToolRenderProps
  cameraPreset: CalcCameraPreset
  onCameraPresetChange: (preset: CalcCameraPreset) => void
  showLocalCameraBar: boolean
}) {
  const presets = getCalcCameraPresets(config.toolType)
  const cam = presets[cameraPreset]

  return (
    <div className="relative h-full min-h-[56vw] bg-card pointer-events-none lg:min-h-0">
      <SceneErrorBoundary>
        <CanvasWrapper
          sceneConfig={{
            orthographic: cam.isOrtho,
            flat: cam.isOrtho,
            disableLighting: true,
            disableSceneBase: true,
            cameraPosition: cam.position,
            cameraTarget: cam.target,
            cameraFov: cam.fov,
            cameraZoom: cam.zoom,
            clearColor: '#F2F0EB',
            minPolarAngle: Math.PI * 0.05,
            maxPolarAngle: Math.PI * 0.48,
            cameraControls: buildCalculatorCameraControls(presets),
          }}
        >
          <CalculatorLighting />
          <SceneInvalidator inputVersion={tool.inputVersion} />
          <Suspense fallback={null}>{tool.hasDimensions ? tool.scene : null}</Suspense>
        </CanvasWrapper>
      </SceneErrorBoundary>
      {!tool.hasDimensions && <CanvasEmptyState message={tool.emptyMessage} />}
      {showLocalCameraBar && tool.hasDimensions && (
        <FloatingCameraBar current={cameraPreset} onChange={onCameraPresetChange} />
      )}
    </div>
  )
}

function CalculatorResultContent({ tool }: { tool: ToolRenderProps }) {
  return (
    <div className="h-full overflow-y-auto p-4">
      <div className="mb-3 flex rounded-sm border border-border">
        <button
          onClick={() => tool.onResultModeChange('net')}
          className={`flex-1 py-1.5 font-mono text-[10px] uppercase tracking-widest transition-colors duration-150 ${
            tool.resultMode === 'net'
              ? 'bg-primary text-primary-foreground'
              : 'text-muted-foreground hover:bg-muted'
          }`}
        >
          Net quantity
        </button>
        <button
          onClick={() => tool.onResultModeChange('buy')}
          className={`flex-1 border-l border-border py-1.5 font-mono text-[10px] uppercase tracking-widest transition-colors duration-150 ${
            tool.resultMode === 'buy'
              ? 'bg-primary text-primary-foreground'
              : 'text-muted-foreground hover:bg-muted'
          }`}
        >
          Buy quantity
        </button>
      </div>

      {tool.hasDimensions ? (
        <div>
          {tool.resultRows.map((row, i) => (
            <ResultRow key={i} {...row} />
          ))}
          <div className="mt-3">
            <AssumptionsAccordion assumptions={tool.assumptions} />
          </div>
          <div className="mt-4">
            <ExportActions isPremium={false} />
          </div>
          <div className="mt-4 rounded-md border border-border border-l-4 border-l-camp-orange bg-background p-3">
            <p className="font-mono text-[8px] font-medium uppercase tracking-widest text-camp-orange mb-1">
              LEA Connection
            </p>
            <p className="font-sans text-xs text-foreground">
              This calculation is tested in the LEA (Building Technology).
            </p>
            <Link
              href={ROUTES.pricing}
              className="mt-1 inline-block font-sans text-xs text-primary hover:underline"
            >
              Master it with SlateCamp &rarr;
            </Link>
          </div>
        </div>
      ) : (
        <p className="text-xs text-muted-foreground">
          Enter dimensions to see your estimate.
        </p>
      )}
    </div>
  )
}

function CalculatorStatusContent() {
  return (
    <span className="truncate font-mono text-[11px] text-muted-foreground">
      Calculator estimate · verify quantities against project documents before procurement
    </span>
  )
}

function CalculatorLayout({
  config,
  tool,
  slot = 'full',
}: {
  config: CalculatorConfig
  tool: ToolRenderProps
  slot?: CalculatorTemplateSlot
}) {
  const [cameraPreset, setCameraPreset] = useState<CalcCameraPreset>('perspective')

  if (slot === 'leftSidebar') return <CalculatorInputContent config={config} tool={tool} />
  if (slot === 'rightSidebar') return <CalculatorResultContent tool={tool} />
  if (slot === 'statusBar') return <CalculatorStatusContent />
  if (slot === 'scene') {
    return (
      <CalculatorSceneContent
        config={config}
        tool={tool}
        cameraPreset="perspective"
        onCameraPresetChange={() => {}}
        showLocalCameraBar={false}
      />
    )
  }

  return (
    <div className="flex h-full w-full flex-col pointer-events-auto">
      <nav className="border-b border-border bg-card px-4 py-2">
        <p className="font-sans text-xs text-muted-foreground">
          <Link href={ROUTES.calculators.suiteRoot} className="hover:text-primary">
            Calculators
          </Link>
          <span className="mx-1">&gt;</span>
          <span className="text-foreground">{config.title}</span>
        </p>
      </nav>

      <div className="grid flex-1 grid-cols-1 gap-0 lg:grid-cols-[320px_1fr_340px]">
        <div className="overflow-y-auto border-b border-border bg-card lg:border-b-0">
          <CalculatorInputContent config={config} tool={tool} />
        </div>
        <CalculatorSceneContent
          config={config}
          tool={tool}
          cameraPreset={cameraPreset}
          onCameraPresetChange={setCameraPreset}
          showLocalCameraBar
        />
        <div className="overflow-y-auto border-t border-border bg-card lg:border-l lg:border-t-0">
          <CalculatorResultContent tool={tool} />
        </div>
      </div>

      <EstimationDisclaimer />
    </div>
  )
}

// ─── Flooring Tool ────────────────────────────────────────────────────────────

function FlooringTool({ config, slot }: { config: CalculatorConfig; slot?: CalculatorTemplateSlot }) {
  const inputVersion = useFlooringStore((s) => s.inputVersion)
  const computed = useFlooringStore((s) => s.computed)
  const resultMode = useFlooringStore((s) => s.resultMode)
  const setResultMode = useFlooringStore((s) => s.setResultMode)
  const roomLengthMm = useFlooringStore((s) => s.roomLengthMm)
  const roomWidthMm = useFlooringStore((s) => s.roomWidthMm)

  const hasDimensions = roomLengthMm > 0 && roomWidthMm > 0

  const resultRows: ResultRowData[] = hasDimensions
    ? [
        { label: 'Gross floor area', value: computed.grossAreaSqm, unit: 'sq.m.' },
        ...(computed.exclusionAreaSqm > 0
          ? [{ label: 'Exclusions', value: computed.exclusionAreaSqm, unit: 'sq.m.', isDeduction: true } as ResultRowData]
          : []),
        { label: 'Net floor area', value: computed.netAreaSqm, unit: 'sq.m.', isSummary: true },
        { label: 'Tile module area', value: computed.effectiveModuleAreaSqm, unit: 'sq.m.', decimals: 4 },
        { label: 'Raw tile count', value: computed.rawTileCount, unit: 'pcs', decimals: 1 },
        { label: `Waste (${computed.wastePercentApplied}%)`, value: computed.rawTileCount * (computed.wastePercentApplied / 100), unit: 'pcs', isAddition: true, decimals: 1 },
        ...(computed.sparePercentApplied > 0
          ? [{ label: `Spare (${computed.sparePercentApplied}%)`, value: computed.rawTileCount * (computed.sparePercentApplied / 100), unit: 'pcs', isAddition: true, decimals: 1 } as ResultRowData]
          : []),
        { label: 'Adjusted count', value: computed.adjustedTileCount, unit: 'pcs', isSummary: true, decimals: 1 },
        ...(resultMode === 'buy'
          ? [
              { label: 'Tiles to buy', value: computed.roundedTileCount, unit: 'pcs', isHighlighted: true, decimals: 0 } as ResultRowData,
              ...(computed.boxesToBuy != null
                ? [{ label: `Boxes to buy (@ ${computed.boxCoverageSqm} sq.m.)`, value: computed.boxesToBuy, unit: 'boxes', isHighlighted: true, decimals: 0 } as ResultRowData]
                : []),
            ]
          : []),
      ]
    : []

  return (
    <CalculatorLayout
      config={config}
      slot={slot}
      tool={{
        scene: <FlooringScene />,
        inputPanel: <FlooringInputPanel />,
        resultRows,
        assumptions: computed.assumptions,
        inputVersion,
        hasDimensions,
        resultMode,
        onResultModeChange: setResultMode,
        emptyMessage: 'Enter room dimensions to see your 3D tile preview',
      }}
    />
  )
}

// ─── Paint Tool ───────────────────────────────────────────────────────────────

function PaintTool({ config, slot }: { config: CalculatorConfig; slot?: CalculatorTemplateSlot }) {
  const inputVersion = usePaintStore((s) => s.inputVersion)
  const computed = usePaintStore((s) => s.computed)
  const resultMode = usePaintStore((s) => s.resultMode)
  const setResultMode = usePaintStore((s) => s.setResultMode)
  const roomLengthMm = usePaintStore((s) => s.roomLengthMm)
  const roomWidthMm = usePaintStore((s) => s.roomWidthMm)
  const wallHeightMm = usePaintStore((s) => s.wallHeightMm)
  const setHoveredSurface = usePaintStore((s) => s.setHoveredSurface)

  const hasDimensions = roomLengthMm > 0 && roomWidthMm > 0 && wallHeightMm > 0

  const resultRows: ResultRowData[] = hasDimensions
    ? [
        { label: 'Gross wall area', value: computed.grossWallAreaSqm, unit: 'sq.m.' },
        ...(computed.openingAreaSqm > 0
          ? [{ label: 'Openings', value: computed.openingAreaSqm, unit: 'sq.m.', isDeduction: true } as ResultRowData]
          : []),
        { label: 'Net wall area', value: computed.netWallAreaSqm, unit: 'sq.m.', isSummary: true },
        ...computed.wallAreas.map((wa) => ({
          label: wa.wallId.replace('wall-', 'Wall ').replace(/^\w/, (c: string) => c.toUpperCase()),
          value: wa.netSqm,
          unit: 'sq.m.',
          onHover: () => setHoveredSurface(wa.wallId),
          onHoverEnd: () => setHoveredSurface(null),
        } as ResultRowData)),
        ...(computed.ceilingAreaSqm > 0
          ? [{ label: 'Ceiling area', value: computed.ceilingAreaSqm, unit: 'sq.m.', isAddition: true } as ResultRowData]
          : []),
        { label: 'Base paintable area', value: computed.basePaintableAreaSqm, unit: 'sq.m.', isSummary: true },
        { label: `Topcoat (${computed.topcoatCoats} coat${computed.topcoatCoats !== 1 ? 's' : ''} + ${computed.wastePercentApplied}% waste)`, value: computed.adjustedTopcoatAreaSqm, unit: 'sq.m.' },
        { label: 'Topcoat needed', value: computed.topcoatLiters, unit: 'L', isSummary: true },
        ...(computed.primerLiters != null
          ? [{ label: 'Primer needed', value: computed.primerLiters, unit: 'L' } as ResultRowData]
          : []),
        ...(resultMode === 'buy'
          ? computed.topcoatCanSuggestion.map((c) => ({
              label: `Topcoat ${c.sizeLiters}L cans`,
              value: c.quantity,
              unit: 'pcs',
              isHighlighted: true,
              decimals: 0,
            } as ResultRowData))
          : []),
        ...(resultMode === 'buy' && computed.primerCanSuggestion != null
          ? computed.primerCanSuggestion.map((c) => ({
              label: `Primer ${c.sizeLiters}L cans`,
              value: c.quantity,
              unit: 'pcs',
              isHighlighted: true,
              decimals: 0,
            } as ResultRowData))
          : []),
      ]
    : []

  return (
    <CalculatorLayout
      config={config}
      slot={slot}
      tool={{
        scene: <PaintScene />,
        inputPanel: <PaintInputPanel />,
        resultRows,
        assumptions: computed.assumptions,
        inputVersion,
        hasDimensions,
        resultMode,
        onResultModeChange: setResultMode,
        emptyMessage: 'Enter room dimensions to see your 3D paint preview',
      }}
    />
  )
}

// ─── Drywall Tool ─────────────────────────────────────────────────────────────

function DrywallTool({ config, slot }: { config: CalculatorConfig; slot?: CalculatorTemplateSlot }) {
  const inputVersion = useDrywallStore((s) => s.inputVersion)
  const computed = useDrywallStore((s) => s.computed)
  const resultMode = useDrywallStore((s) => s.resultMode)
  const setResultMode = useDrywallStore((s) => s.setResultMode)
  const wallLengthMm = useDrywallStore((s) => s.wallLengthMm)
  const wallHeightMm = useDrywallStore((s) => s.wallHeightMm)

  const hasDimensions = wallLengthMm > 0 && wallHeightMm > 0

  const resultRows: ResultRowData[] = hasDimensions
    ? [
        { label: 'Gross wall area', value: computed.grossWallAreaSqm, unit: 'sq.m.' },
        ...(computed.openingAreaSqm > 0
          ? [{ label: 'Openings', value: computed.openingAreaSqm, unit: 'sq.m.', isDeduction: true } as ResultRowData]
          : []),
        { label: 'Net wall area', value: computed.netWallAreaSqm, unit: 'sq.m.', isSummary: true },
        { label: `Boarded area (${computed.boardedFaceCount} face${computed.boardedFaceCount !== 1 ? 's' : ''} × ${computed.boardLayersPerSide} layer)`, value: computed.totalBoardedAreaSqm, unit: 'sq.m.' },
        { label: 'Boards needed', value: computed.adjustedBoardCount, unit: 'pcs', decimals: 1 },
        ...(resultMode === 'buy'
          ? [{ label: 'Boards to buy', value: computed.roundedBoardCount, unit: 'pcs', isHighlighted: true, decimals: 0 } as ResultRowData]
          : []),
        { label: 'Studs', value: computed.finalStudCount, unit: 'pcs', isSummary: true, decimals: 0 },
        { label: 'Track pieces', value: computed.trackPiecesToBuy, unit: 'pcs', isSummary: true, decimals: 0 },
      ]
    : []

  return (
    <CalculatorLayout
      config={config}
      slot={slot}
      tool={{
        scene: <DrywallScene />,
        inputPanel: <DrywallInputPanel />,
        resultRows,
        assumptions: computed.assumptions,
        inputVersion,
        hasDimensions,
        resultMode,
        onResultModeChange: setResultMode,
        emptyMessage: 'Enter wall dimensions to see your 3D partition preview',
      }}
    />
  )
}


// ─── CHB Tool ─────────────────────────────────────────────────────────────────

function CHBTool({ config, slot }: { config: CalculatorConfig; slot?: CalculatorTemplateSlot }) {
  const inputVersion = useCHBStore((s) => s.inputVersion)
  const computed = useCHBStore((s) => s.computed)
  const resultMode = useCHBStore((s) => s.resultMode)
  const setResultMode = useCHBStore((s) => s.setResultMode)
  const wallLengthMm = useCHBStore((s) => s.wallLengthMm)
  const wallHeightMm = useCHBStore((s) => s.wallHeightMm)

  const hasDimensions = wallLengthMm > 0 && wallHeightMm > 0

  const resultRows: ResultRowData[] = hasDimensions
    ? [
        { label: 'Gross wall area', value: computed.grossWallAreaSqm, unit: 'sq.m.' },
        ...(computed.openingAreaSqm > 0
          ? [{ label: 'Openings', value: computed.openingAreaSqm, unit: 'sq.m.', isDeduction: true } as ResultRowData]
          : []),
        { label: 'Net wall area', value: computed.netWallAreaSqm, unit: 'sq.m.', isSummary: true },
        { label: 'Block module area', value: computed.blockModuleAreaSqm, unit: 'sq.m.', decimals: 4 },
        { label: `Courses (${computed.courseCount})`, value: computed.blocksPerCourse, unit: 'blks/course', decimals: 0 },
        { label: 'Raw block count', value: computed.rawBlockCount, unit: 'pcs', decimals: 1 },
        { label: `Waste (${computed.wastePercentApplied}%)`, value: computed.rawBlockCount * (computed.wastePercentApplied / 100), unit: 'pcs', isAddition: true, decimals: 1 },
        { label: 'Adjusted count', value: computed.adjustedBlockCount, unit: 'pcs', isSummary: true, decimals: 1 },
        ...(resultMode === 'buy'
          ? [{ label: 'Blocks to buy', value: computed.roundedBlockCount, unit: 'pcs', isHighlighted: true, decimals: 0 } as ResultRowData]
          : []),
        { label: 'Mortar volume', value: computed.totalMortarVolumeCuM, unit: 'cu.m.', decimals: 3 },
        { label: 'Cement (40kg bags)', value: computed.cementBags40kg, unit: 'bags', isSummary: true, decimals: 0, isHighlighted: resultMode === 'buy' },
        { label: 'Sand', value: computed.sandVolumeCuM, unit: 'cu.m.', decimals: 3, isHighlighted: resultMode === 'buy' },
        ...(computed.verticalRebarCount > 0
          ? [
              { label: `Vertical rebar (${computed.verticalRebarCount} pcs)`, value: computed.verticalRebarLengthM, unit: 'm', decimals: 1 } as ResultRowData,
            ]
          : []),
        ...(computed.horizontalRebarCount > 0
          ? [
              { label: `Horizontal rebar (${computed.horizontalRebarCount} pcs)`, value: computed.horizontalRebarLengthM, unit: 'm', decimals: 1 } as ResultRowData,
            ]
          : []),
        ...(computed.totalRebarLengthM > 0
          ? [{ label: 'Total rebar', value: computed.totalRebarLengthM, unit: 'm', isSummary: true, decimals: 1 } as ResultRowData]
          : []),
      ]
    : []

  return (
    <CalculatorLayout
      config={config}
      slot={slot}
      tool={{
        scene: <CHBScene />,
        inputPanel: <CHBInputPanel />,
        resultRows,
        assumptions: computed.assumptions,
        inputVersion,
        hasDimensions,
        resultMode,
        onResultModeChange: setResultMode,
        emptyMessage: 'Enter wall dimensions to see your 3D CHB wall preview',
      }}
    />
  )
}

// ─── Main Export ──────────────────────────────────────────────────────────────

export function CalculatorTemplateSlot({
  config,
  slot,
}: {
  config: CalculatorConfig
  slot: CalculatorTemplateSlot
}) {
  switch (config.toolType) {
    case 'flooring':
      return <FlooringTool config={config} slot={slot} />
    case 'paint':
      return <PaintTool config={config} slot={slot} />
    case 'drywall':
      return <DrywallTool config={config} slot={slot} />
    case 'chb':
      return <CHBTool config={config} slot={slot} />
    default:
      return (
        <div className="flex h-full w-full items-center justify-center">
          <p className="text-sm text-muted-foreground">
            Unknown calculator tool: {config.toolType}
          </p>
        </div>
      )
  }
}

export default function CalculatorTemplate({ config }: { config: CalculatorConfig }) {
  return <CalculatorTemplateSlot config={config} slot="full" />
}

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

// ─── Three-Panel Layout ───────────────────────────────────────────────────────

function CalculatorLayout({
  config,
  tool,
}: {
  config: CalculatorConfig
  tool: ToolRenderProps
}) {
  const [cameraPreset, setCameraPreset] = useState<CalcCameraPreset>('perspective')
  const presets = getCalcCameraPresets(config.toolType)
  const cam = presets[cameraPreset]

  return (
    <div className="flex h-full w-full flex-col pointer-events-auto">
      {/* Breadcrumb */}
      <nav className="border-b border-border bg-card px-4 py-2">
        <p className="font-sans text-xs text-muted-foreground">
          <Link href="/calculators" className="hover:text-primary">
            Calculators
          </Link>
          <span className="mx-1">&gt;</span>
          <span className="text-foreground">{config.title}</span>
        </p>
      </nav>

      {/* Three-panel grid */}
      <div className="grid flex-1 grid-cols-1 gap-0 lg:grid-cols-[320px_1fr_340px]">
        {/* Input Panel */}
        <div className="overflow-y-auto border-b border-border bg-card p-4 lg:border-b-0">
          {/* Mobile: collapsible accordion */}
          <div className="lg:hidden">
            <Accordion>
              <AccordionItem title="Inputs" _index={0}>
                {tool.inputPanel}
              </AccordionItem>
            </Accordion>
          </div>
          {/* Desktop: always visible */}
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

        {/* Canvas Panel — pointer-events-none lets orbit controls on Canvas below work */}
        <div className="relative min-h-[56vw] bg-[#F2F0EB] lg:min-h-0 pointer-events-none">
          {tool.hasDimensions ? (
            <>
              <SceneErrorBoundary>
                <CanvasWrapper
                  sceneConfig={{
                    orthographic: cam.isOrtho,
                    flat: cam.isOrtho,
                    disableLighting: true,
                    disableSceneBase: true,
                    cameraPosition: cam.position,
                    cameraFov: cam.fov,
                    cameraZoom: cam.zoom,
                    clearColor: '#F2F0EB',
                    minPolarAngle: Math.PI * 0.05,
                    maxPolarAngle: Math.PI * 0.48,
                  }}
                >
                  <CalculatorLighting />
                  <SceneInvalidator inputVersion={tool.inputVersion} />
                  <Suspense fallback={null}>{tool.scene}</Suspense>
                </CanvasWrapper>
              </SceneErrorBoundary>
              <FloatingCameraBar current={cameraPreset} onChange={setCameraPreset} />
            </>
          ) : (
            <CanvasEmptyState message={tool.emptyMessage} />
          )}
        </div>

        {/* Result Panel */}
        <div className="overflow-y-auto border-t border-border bg-card p-4 lg:border-l lg:border-t-0">
          {/* Net/Buy toggle */}
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

          {/* Calculation trail */}
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
                  href="/pricing"
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
      </div>

      <EstimationDisclaimer />
    </div>
  )
}

// ─── Flooring Tool ────────────────────────────────────────────────────────────

function FlooringTool({ config }: { config: CalculatorConfig }) {
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

function PaintTool({ config }: { config: CalculatorConfig }) {
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

function DrywallTool({ config }: { config: CalculatorConfig }) {
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

function CHBTool({ config }: { config: CalculatorConfig }) {
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

export default function CalculatorTemplate({ config }: { config: CalculatorConfig }) {
  switch (config.toolType) {
    case 'flooring':
      return <FlooringTool config={config} />
    case 'paint':
      return <PaintTool config={config} />
    case 'drywall':
      return <DrywallTool config={config} />
    case 'chb':
      return <CHBTool config={config} />
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

'use client'

// src/app/dashboard/3d-lab/_components/WallConfigurator/BOMPanel.tsx
// Right-panel Bill of Materials output for the Wall Configurator 3D Lab module.
// Reads from useWallLabStore and displays live computed material quantities.

import { useMemo, useState } from 'react'
import { useWallLabStore, computeAreaState, SPONSOR_BRANDS } from '../../_stores/useWallLabStore'
import { computeTileEstimate } from '@/features/wall-configurator/engine/tile.engine'
import {
  CHB_FACE_AREA_SQM,
  BOARD_AREA_SQM,
  BRICKS_PER_SQM,
  PLASTER_THICKNESS_M,
  DRY_VOLUME_FACTOR,
  CEMENT_MIX_FRACTION,
  SAND_MIX_FRACTION,
  CEMENT_BULK_DENSITY_KG_M3,
  CEMENT_BAG_KG,
  PAINT_COVERAGE_SQM_PER_L,
  PACKAGE_PAINT_PAIL_L,
  PACKAGE_PAINT_CAN_L,
  LASON_COVERAGE_SQM_PER_L,
  LASON_PACKAGE_L,
  TILE_ADHESIVE_KG_PER_SQM,
  TILE_GROUT_KG_PER_SQM,
  TILE_ADHESIVE_BAG_KG,
  TILE_GROUT_BAG_KG,
  PLYWOOD_SHEET_AREA_SQM,
  CEMENT_BOARD_AREA_SQM,
} from '@/features/wall-configurator/engine/constants'
import type { BOMRow } from '@/features/wall-configurator/types/wall.types'

// ─── Helpers ─────────────────────────────────────────────────────────────────

function fmt(n: number, decimals = 1): string {
  return n.toLocaleString('en-PH', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })
}

function fmtInt(n: number): string {
  return n.toLocaleString('en-PH', { maximumFractionDigits: 0 })
}

// ─── BOM Row Component ────────────────────────────────────────────────────────

interface BOMRowItemProps {
  row: BOMRow
  showBuy: boolean
  zebra: boolean
}

function BOMRowItem({ row, showBuy, zebra }: BOMRowItemProps) {
  const qty = showBuy ? row.procurementQty : row.adjustedQty
  const isWholeNumber = Number.isInteger(qty)

  return (
    <div
      className={[
        'grid grid-cols-[1fr_auto_auto] items-center gap-x-2 px-3 py-1.5',
        zebra ? 'bg-[#F8F7F5]' : 'bg-white',
      ].join(' ')}
    >
      <span className="text-[12px] text-[#1A2332] leading-snug">{row.label}</span>
      <span className="font-mono text-[13px] font-medium text-right text-[#1A2332] tabular-nums">
        {isWholeNumber ? fmtInt(qty) : fmt(qty)}
      </span>
      <div className="text-right min-w-[36px]">
        <span className="text-[11px] text-[#8896A7]">{row.unit}</span>
        {row.packagingNote ? (
          <span className="block text-[10px] text-[#8896A7] italic leading-none mt-0.5">
            {row.packagingNote}
          </span>
        ) : null}
      </div>
    </div>
  )
}

// ─── Main BOMPanel ────────────────────────────────────────────────────────────

export function BOMPanel() {
  const [showBuy, setShowBuy] = useState(false)

  const state = useWallLabStore((s) => s)
  const {
    coreType,
    layers,
    lason,
    finishType,
    tileConfig,
    topcoatCoats,
    activeSponsorId,
  } = state

  const areaState = useMemo(() => computeAreaState(state), [
    state.lengthM,
    state.heightM,
        state.sides,
  ])

  const { grossAreaSqm, netAreaSqm, finishAreaSqm } = areaState

  const bomRows = useMemo((): BOMRow[] => {
    const rows: BOMRow[] = []

    // ── CORE MATERIAL ──────────────────────────────────────────────────────

    if (coreType === 'chb') {
      const theoretical = netAreaSqm / CHB_FACE_AREA_SQM
      const adjusted = theoretical * 1.05
      const procurement = Math.ceil(adjusted)
      rows.push({
        layerCode: 'CHB_CORE',
        label: 'CHB Units (150mm)',
        unit: 'pcs',
        theoreticalQty: theoretical,
        adjustedQty: adjusted,
        procurementQty: procurement,
        packagingNote: '',
      })
      // Mortar cement for CHB
      const cementBagsTheory = netAreaSqm * 0.5
      const cementBagsAdj = cementBagsTheory * 1.05
      rows.push({
        layerCode: 'CHB_MORTAR_CEMENT',
        label: 'Mortar Cement (masonry)',
        unit: 'bags',
        theoreticalQty: cementBagsTheory,
        adjustedQty: cementBagsAdj,
        procurementQty: Math.ceil(cementBagsAdj),
        packagingNote: '40 kg/bag',
      })
      // Mortar sand
      const sandTheory = netAreaSqm * 0.025
      const sandAdj = sandTheory * 1.05
      rows.push({
        layerCode: 'CHB_MORTAR_SAND',
        label: 'Mortar Sand',
        unit: 'cu.m',
        theoreticalQty: sandTheory,
        adjustedQty: sandAdj,
        procurementQty: Math.ceil(sandAdj * 10) / 10,
        packagingNote: '',
      })
    }

    if (coreType === 'brick') {
      const theoretical = netAreaSqm * BRICKS_PER_SQM
      const adjusted = theoretical * 1.05
      rows.push({
        layerCode: 'BRICK_CORE',
        label: 'Brick Units',
        unit: 'pcs',
        theoreticalQty: theoretical,
        adjustedQty: adjusted,
        procurementQty: Math.ceil(adjusted),
        packagingNote: '',
      })
      // Mortar cement for brick
      const cementBagsTheory = netAreaSqm * 0.5
      const cementBagsAdj = cementBagsTheory * 1.05
      rows.push({
        layerCode: 'BRICK_MORTAR_CEMENT',
        label: 'Mortar Cement (masonry)',
        unit: 'bags',
        theoreticalQty: cementBagsTheory,
        adjustedQty: cementBagsAdj,
        procurementQty: Math.ceil(cementBagsAdj),
        packagingNote: '40 kg/bag',
      })
    }

    if (coreType === 'drywall') {
      const boardsLayer = layers.find((l) => l.code === 'GYP_BOARD')
      if (boardsLayer?.enabled) {
        const theoretical = finishAreaSqm / BOARD_AREA_SQM
        const adjusted = theoretical * 1.05
        rows.push({
          layerCode: 'GYP_BOARD',
          label: "Gypsum Board 4'×8'",
          unit: 'boards',
          theoreticalQty: theoretical,
          adjustedQty: adjusted,
          procurementQty: Math.ceil(adjusted),
          packagingNote: '',
        })
      }
      // Metal studs estimate: 1 stud per 0.6m horizontally
      const wallLength = state.lengthM
      const studsTheory = Math.ceil(wallLength / 0.6) * Math.ceil(state.heightM / 3)
      rows.push({
        layerCode: 'METAL_STUD',
        label: 'Metal Stud (0.6m o.c.)',
        unit: 'pcs',
        theoreticalQty: studsTheory,
        adjustedQty: studsTheory * 1.05,
        procurementQty: Math.ceil(studsTheory * 1.05),
        packagingNote: '',
      })
    }

    if (coreType === 'plywood') {
      const plyLayer = layers.find((l) => l.code === 'PLY_SHEET')
      if (plyLayer?.enabled) {
        const theoretical = finishAreaSqm / PLYWOOD_SHEET_AREA_SQM
        const adjusted = theoretical * 1.05
        rows.push({
          layerCode: 'PLY_SHEET',
          label: "Plywood Sheet 4'×8'",
          unit: 'sheets',
          theoreticalQty: theoretical,
          adjustedQty: adjusted,
          procurementQty: Math.ceil(adjusted),
          packagingNote: '',
        })
      }
    }

    if (coreType === 'cement-board') {
      const cbLayer = layers.find((l) => l.code === 'CB_SHEET')
      if (cbLayer?.enabled) {
        const theoretical = finishAreaSqm / CEMENT_BOARD_AREA_SQM
        const adjusted = theoretical * 1.05
        rows.push({
          layerCode: 'CB_SHEET',
          label: "Cement Board 4'×8'",
          unit: 'sheets',
          theoreticalQty: theoretical,
          adjustedQty: adjusted,
          procurementQty: Math.ceil(adjusted),
          packagingNote: '',
        })
      }
    }

    // ── LASON (concrete neutralizer) ───────────────────────────────────────

    const isMasonry = ['chb', 'brick', 'solid-concrete', 'existing-wall'].includes(coreType)
    if (lason.enabled && isMasonry) {
      const litersTheory = finishAreaSqm / LASON_COVERAGE_SQM_PER_L
      const litersAdj = litersTheory * 1.10
      rows.push({
        layerCode: 'LASON',
        label: 'Lason / Concrete Neutralizer',
        unit: 'L',
        theoreticalQty: litersTheory,
        adjustedQty: litersAdj,
        procurementQty: Math.ceil(litersAdj / LASON_PACKAGE_L) * LASON_PACKAGE_L,
        packagingNote: `${LASON_PACKAGE_L}L bottle`,
      })
    }

    // ── PLASTER layer ──────────────────────────────────────────────────────

    const plasterLayer = layers.find((l) => l.code === 'PLASTER')
    if (plasterLayer?.enabled) {
      const dryVolume = finishAreaSqm * PLASTER_THICKNESS_M * DRY_VOLUME_FACTOR
      const cementVol = dryVolume * CEMENT_MIX_FRACTION
      const cementKg = cementVol * CEMENT_BULK_DENSITY_KG_M3
      const cementBagsTheory = cementKg / CEMENT_BAG_KG
      const cementBagsAdj = cementBagsTheory * 1.05
      rows.push({
        layerCode: 'PLASTER_CEMENT',
        label: 'Plaster Cement',
        unit: 'bags',
        theoreticalQty: cementBagsTheory,
        adjustedQty: cementBagsAdj,
        procurementQty: Math.ceil(cementBagsAdj),
        packagingNote: '40 kg/bag',
      })

      const sandVolTheory = dryVolume * SAND_MIX_FRACTION
      const sandVolAdj = sandVolTheory * 1.05
      rows.push({
        layerCode: 'PLASTER_SAND',
        label: 'Plaster Sand',
        unit: 'cu.m',
        theoreticalQty: sandVolTheory,
        adjustedQty: sandVolAdj,
        procurementQty: Math.ceil(sandVolAdj * 10) / 10,
        packagingNote: '',
      })
    }

    // ── FINISH: tiles ──────────────────────────────────────────────────────

    if (finishType === 'tiles') {
      const tileEst = computeTileEstimate(finishAreaSqm, tileConfig, 0.10)
      rows.push({
        layerCode: 'TILE',
        label: `Wall Tiles (${tileConfig.sizeLabel} mm)`,
        unit: 'pcs',
        theoreticalQty: tileEst.tilesTheoretical,
        adjustedQty: tileEst.tilesAdjusted,
        procurementQty: tileEst.tilesProcurement,
        packagingNote: `${tileEst.tilesPerBox} pcs/box → ${tileEst.boxCount} boxes`,
      })
      rows.push({
        layerCode: 'TILE_ADHESIVE',
        label: 'Tile Adhesive',
        unit: 'bags',
        theoreticalQty: finishAreaSqm * TILE_ADHESIVE_KG_PER_SQM / TILE_ADHESIVE_BAG_KG,
        adjustedQty: tileEst.adhesiveKg / TILE_ADHESIVE_BAG_KG,
        procurementQty: tileEst.adhesiveBags,
        packagingNote: `${TILE_ADHESIVE_BAG_KG} kg/bag`,
      })
      rows.push({
        layerCode: 'TILE_GROUT',
        label: 'Tile Grout',
        unit: 'bags',
        theoreticalQty: finishAreaSqm * TILE_GROUT_KG_PER_SQM / TILE_GROUT_BAG_KG,
        adjustedQty: tileEst.groutKg / TILE_GROUT_BAG_KG,
        procurementQty: tileEst.groutBags,
        packagingNote: `${TILE_GROUT_BAG_KG} kg/bag`,
      })
      return rows
    }

    // ── FINISH: paint layers ───────────────────────────────────────────────

    const primerLayer = layers.find((l) => l.code === 'PRIMER')
    if (primerLayer?.enabled && (finishType === 'paint' || finishType === 'exposed' || finishType === 'wallpaper')) {
      const litersTheory = finishAreaSqm / PAINT_COVERAGE_SQM_PER_L
      const litersAdj = litersTheory * 1.10
      const cansNeeded = Math.ceil(litersAdj / PACKAGE_PAINT_CAN_L)
      rows.push({
        layerCode: 'PRIMER',
        label: 'Primer (1 coat)',
        unit: 'L',
        theoreticalQty: litersTheory,
        adjustedQty: litersAdj,
        procurementQty: cansNeeded * PACKAGE_PAINT_CAN_L,
        packagingNote: `${cansNeeded} × ${PACKAGE_PAINT_CAN_L}L can`,
      })
    }

    const topcoatLayer = layers.find((l) => l.code === 'TOPCOAT')
    if (topcoatLayer?.enabled && finishType === 'paint') {
      const litersTheory = (finishAreaSqm * topcoatCoats) / PAINT_COVERAGE_SQM_PER_L
      const litersAdj = litersTheory * 1.10
      // Prefer 16L pails for large quantities, else 4L cans
      if (litersAdj >= PACKAGE_PAINT_PAIL_L) {
        const pailsNeeded = Math.ceil(litersAdj / PACKAGE_PAINT_PAIL_L)
        rows.push({
          layerCode: 'TOPCOAT',
          label: `Topcoat Paint (${topcoatCoats} coat${topcoatCoats !== 1 ? 's' : ''})`,
          unit: 'L',
          theoreticalQty: litersTheory,
          adjustedQty: litersAdj,
          procurementQty: pailsNeeded * PACKAGE_PAINT_PAIL_L,
          packagingNote: `${pailsNeeded} × ${PACKAGE_PAINT_PAIL_L}L pail`,
        })
      } else {
        const cansNeeded = Math.ceil(litersAdj / PACKAGE_PAINT_CAN_L)
        rows.push({
          layerCode: 'TOPCOAT',
          label: `Topcoat Paint (${topcoatCoats} coat${topcoatCoats !== 1 ? 's' : ''})`,
          unit: 'L',
          theoreticalQty: litersTheory,
          adjustedQty: litersAdj,
          procurementQty: cansNeeded * PACKAGE_PAINT_CAN_L,
          packagingNote: `${cansNeeded} × ${PACKAGE_PAINT_CAN_L}L can`,
        })
      }
    }

    return rows
  }, [
    coreType,
    layers,
    lason,
    finishType,
    tileConfig,
    topcoatCoats,
    netAreaSqm,
    finishAreaSqm,
    state.lengthM,
    state.heightM,
        state.sides,
  ])

  const activeSponsor = activeSponsorId
    ? SPONSOR_BRANDS.find((b) => b.id === activeSponsorId)
    : null

  function handleCopy() {
    const header = `Bill of Materials (${showBuy ? 'Procurement' : 'Adjusted'})\n`
    const divider = '─'.repeat(48) + '\n'
    const lines = bomRows
      .map((r) => {
        const qty = showBuy ? r.procurementQty : r.adjustedQty
        return `${r.label.padEnd(32)} ${String(Number.isInteger(qty) ? fmtInt(qty) : fmt(qty)).padStart(8)} ${r.unit}`
      })
      .join('\n')
    navigator.clipboard.writeText(header + divider + lines).catch(() => undefined)
  }

  function handlePrint() {
    window.print()
  }

  return (
    <div className="flex flex-col h-full">
      {/* ── Header ───────────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[#D4DAE3] shrink-0">
        <div>
          <h2 className="text-sm font-semibold text-[#1A2332] leading-tight">
            Bill of Materials
          </h2>
          <p className="mt-0.5 text-[11px] text-[#4A5568] leading-snug">
            Live estimates — updates as you configure.
          </p>
        </div>

        {/* Net / Buy toggle */}
        <button
          type="button"
          onClick={() => setShowBuy((v) => !v)}
          className={[
            'flex items-center gap-1.5 px-2.5 py-1 rounded-sm border text-[11px] font-medium transition-colors duration-150',
            showBuy
              ? 'bg-[#1B3FC4] border-[#1B3FC4] text-white'
              : 'bg-white border-[#D4DAE3] text-[#4A5568] hover:border-[#1B3FC4] hover:text-[#1B3FC4]',
          ].join(' ')}
          title={showBuy ? 'Showing procurement (buy) quantities' : 'Showing adjusted (net + waste) quantities'}
        >
          <span
            className={[
              'w-3 h-3 rounded-full border inline-block',
              showBuy ? 'bg-white border-white' : 'bg-[#D4DAE3] border-[#D4DAE3]',
            ].join(' ')}
          />
          {showBuy ? 'Buy' : 'Net'}
        </button>
      </div>

      {/* ── Area Summary Strip ────────────────────────────────────── */}
      <div className="flex items-center gap-3 px-4 py-2 bg-[#F8F7F5] border-b border-[#D4DAE3] shrink-0">
        <AreaPill label="Gross" value={grossAreaSqm} />
        <span className="text-[#D4DAE3] text-[10px]">→</span>
        <AreaPill label="Net" value={netAreaSqm} />
        <span className="text-[#D4DAE3] text-[10px]">→</span>
        <AreaPill label="Finish" value={finishAreaSqm} highlight />
      </div>

      {/* ── Materials Table ───────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto min-h-0">
        {bomRows.length === 0 ? (
          <div className="px-4 py-6 text-center">
            <p className="text-[12px] text-[#8896A7]">
              Configure your wall to see material estimates.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-[#D4DAE3]">
            {bomRows.map((row, i) => (
              <BOMRowItem key={row.layerCode} row={row} showBuy={showBuy} zebra={i % 2 === 0} />
            ))}
          </div>
        )}
      </div>

      {/* ── Footer ───────────────────────────────────────────────── */}
      <div className="shrink-0 border-t border-[#D4DAE3]">
        {/* Disclaimer */}
        <p className="px-4 py-2 text-[10px] text-[#8896A7] italic leading-snug">
          Estimates are approximate. Verify quantities with your supplier.
        </p>

        {/* Export row */}
        <div className="flex items-center gap-2 px-4 pb-2">
          <button
            type="button"
            onClick={handlePrint}
            className="flex items-center gap-1 px-2.5 py-1 rounded-sm border border-[#D4DAE3] text-[11px] text-[#4A5568] hover:border-[#1B3FC4] hover:text-[#1B3FC4] transition-colors duration-150"
          >
            <PrintIcon />
            Print
          </button>
          <button
            type="button"
            onClick={handleCopy}
            className="flex items-center gap-1 px-2.5 py-1 rounded-sm border border-[#D4DAE3] text-[11px] text-[#4A5568] hover:border-[#1B3FC4] hover:text-[#1B3FC4] transition-colors duration-150"
          >
            <CopyIcon />
            Copy
          </button>
        </div>

        {/* Sponsor attribution */}
        {activeSponsor && (
          <div className="flex items-center gap-2 px-4 py-2 border-t border-[#D4DAE3] bg-[#F8F7F5]">
            <span className="text-[10px] text-[#8896A7] italic">Powered by</span>
            <span className="text-[11px] font-semibold text-[#1A2332]">{activeSponsor.name}</span>
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function AreaPill({ label, value, highlight }: { label: string; value: number; highlight?: boolean }) {
  return (
    <div className="flex flex-col items-center">
      <span className="text-[9px] text-[#8896A7] uppercase tracking-wide leading-none">{label}</span>
      <span
        className={[
          'font-mono text-[11px] font-medium leading-snug',
          highlight ? 'text-[#1B3FC4]' : 'text-[#1A2332]',
        ].join(' ')}
      >
        {value.toFixed(2)} m²
      </span>
    </div>
  )
}

function PrintIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path
        d="M4 6V2h8v4M4 12H2V7h12v5h-2M4 9h8v5H4V9z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function CopyIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <rect x="5" y="5" width="9" height="9" rx="1" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M11 5V3a1 1 0 00-1-1H3a1 1 0 00-1 1v7a1 1 0 001 1h2"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  )
}

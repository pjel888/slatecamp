'use client'

import { useMemo } from 'react'
import { useWallConfigStore } from '../store/useWallConfigStore'
import { computeAreaState } from '../engine/geometry.engine'
import { computeCHB } from '../engine/chb.engine'
import { computePlaster } from '../engine/plaster.engine'
import { computeDrywallBoards, computeJointCompound, deriveSeamLengthFromBoards } from '../engine/drywall.engine'
import { computePaintLayer } from '../engine/paint.engine'
import { PAINT_COVERAGE_SQM_PER_L, BRICKS_PER_SQM, PLYWOOD_SHEET_AREA_SQM, CEMENT_BOARD_AREA_SQM } from '../engine/constants'
import type { BOMResult, BOMRow } from '../types/wall.types'

export function useWallComputation(): BOMResult {
  const config = useWallConfigStore((s) => s.config)
  const { geometry, openings, sides, layers, coreType } = config

  return useMemo(() => {
    const areaState = computeAreaState(geometry, openings, sides)
    const { netAreaSqm, finishAreaSqm } = areaState
    const rows: BOMRow[] = []

    const coverage = config.paintCoverageSqmPerL ?? PAINT_COVERAGE_SQM_PER_L
    const topcoatCoats = config.topcoatCoats ?? 2

    // CHB core
    if (coreType === 'chb') {
      const chbLayer = layers.find((l) => l.code === 'CHB_CORE')
      if (chbLayer?.enabled) {
        const r = computeCHB(netAreaSqm, chbLayer.wasteFactor)
        rows.push({
          layerCode: 'CHB_CORE',
          label: 'CHB Units',
          unit: 'pcs',
          theoreticalQty: r.theoreticalPcs,
          adjustedQty: r.adjustedPcs,
          procurementQty: r.procurementPcs,
          packagingNote: `${r.procurementPcs} pcs`,
        })
      }
    }

    // Brick core
    if (coreType === 'brick') {
      const brickLayer = layers.find((l) => l.code === 'BRICK_CORE')
      if (brickLayer?.enabled) {
        const theoretical = netAreaSqm * BRICKS_PER_SQM
        const adjusted = theoretical * (1 + brickLayer.wasteFactor)
        const procurement = Math.ceil(adjusted)
        rows.push({
          layerCode: 'BRICK_CORE',
          label: 'Brick Units',
          unit: 'pcs',
          theoreticalQty: theoretical,
          adjustedQty: adjusted,
          procurementQty: procurement,
          packagingNote: `${procurement} pcs`,
        })
      }
    }

    // Plywood sheet
    if (coreType === 'plywood') {
      const plyLayer = layers.find((l) => l.code === 'PLY_SHEET')
      if (plyLayer?.enabled) {
        const theoretical = finishAreaSqm / PLYWOOD_SHEET_AREA_SQM
        const adjusted = theoretical * (1 + plyLayer.wasteFactor)
        const procurement = Math.ceil(adjusted)
        rows.push({
          layerCode: 'PLY_SHEET',
          label: "Plywood Sheet 4'×8'",
          unit: 'sheets',
          theoreticalQty: theoretical,
          adjustedQty: adjusted,
          procurementQty: procurement,
          packagingNote: `${procurement} sheets`,
        })
      }

      const woodFrameLayer = layers.find((l) => l.code === 'WOOD_FRAME')
      if (woodFrameLayer?.enabled) {
        // Studs every 400mm + top and bottom plates per wall run
        const studSpacingM = 0.4
        const studCount = Math.ceil(geometry.lengthM / studSpacingM) + 1
        const plateCount = 2 // top + bottom per wall
        const theoretical = (studCount + plateCount) * geometry.wallCount
        const adjusted = theoretical * (1 + woodFrameLayer.wasteFactor)
        const procurement = Math.ceil(adjusted)
        rows.push({
          layerCode: 'WOOD_FRAME',
          label: 'Wood Frame (2×3 lumber)',
          unit: 'pcs',
          theoreticalQty: theoretical,
          adjustedQty: adjusted,
          procurementQty: procurement,
          packagingNote: `${procurement} pcs`,
        })
      }

      const nailsLayer = layers.find((l) => l.code === 'NAILS')
      if (nailsLayer?.enabled) {
        const KG_PER_SQM = 0.15
        const theoretical = finishAreaSqm * KG_PER_SQM
        const adjusted = theoretical * (1 + nailsLayer.wasteFactor)
        const procurement = Math.ceil(adjusted)
        rows.push({
          layerCode: 'NAILS',
          label: 'Common Wire Nails',
          unit: 'kg',
          theoreticalQty: theoretical,
          adjustedQty: adjusted,
          procurementQty: procurement,
          packagingNote: `${procurement} kg`,
        })
      }
    }

    // Cement board sheet
    if (coreType === 'cement-board') {
      const cbLayer = layers.find((l) => l.code === 'CB_SHEET')
      if (cbLayer?.enabled) {
        const theoretical = finishAreaSqm / CEMENT_BOARD_AREA_SQM
        const adjusted = theoretical * (1 + cbLayer.wasteFactor)
        const procurement = Math.ceil(adjusted)
        rows.push({
          layerCode: 'CB_SHEET',
          label: "Cement Board 4'×8'",
          unit: 'sheets',
          theoreticalQty: theoretical,
          adjustedQty: adjusted,
          procurementQty: procurement,
          packagingNote: `${procurement} sheets`,
        })
      }

      const jcLayer = layers.find((l) => l.code === 'JOINT_COMPOUND')
      if (jcLayer?.enabled) {
        const seamLM = config.seamLengthLM ?? deriveSeamLengthFromBoards(finishAreaSqm)
        const r = computeJointCompound(seamLM, jcLayer.wasteFactor)
        rows.push({
          layerCode: 'JOINT_COMPOUND',
          label: 'Joint Compound',
          unit: 'L',
          theoreticalQty: r.theoreticalLiters,
          adjustedQty: r.adjustedLiters,
          procurementQty: r.procurement4LCans * 4,
          packagingNote: `${r.procurement4LCans} × 4 L can`,
        })
      }

      const tapeLayer = layers.find((l) => l.code === 'JOINT_TAPE')
      if (tapeLayer?.enabled) {
        const seamLM = config.seamLengthLM ?? deriveSeamLengthFromBoards(finishAreaSqm)
        const adjustedLM = seamLM * (1 + tapeLayer.wasteFactor)
        rows.push({
          layerCode: 'JOINT_TAPE',
          label: 'Mesh Joint Tape',
          unit: 'lm',
          theoreticalQty: seamLM,
          adjustedQty: adjustedLM,
          procurementQty: Math.ceil(adjustedLM),
          packagingNote: `${Math.ceil(adjustedLM)} lm`,
        })
      }
    }

    // Surface roughening (solid concrete — labor marker, no material qty)
    if (coreType === 'solid-concrete') {
      const rougheningLayer = layers.find((l) => l.code === 'ROUGHENING')
      if (rougheningLayer?.enabled) {
        rows.push({
          layerCode: 'ROUGHENING',
          label: 'Surface Roughening / Hacking',
          unit: 'sqm',
          theoreticalQty: finishAreaSqm,
          adjustedQty: finishAreaSqm,
          procurementQty: Math.ceil(finishAreaSqm),
          packagingNote: `${Math.ceil(finishAreaSqm)} sqm`,
        })
      }
    }

    // Plaster
    const plasterLayer = layers.find((l) => l.code === 'PLASTER')
    if (plasterLayer?.enabled) {
      const r = computePlaster(finishAreaSqm, plasterLayer.wasteFactor)
      rows.push(
        {
          layerCode: 'PLASTER_CEMENT',
          label: 'Cement (40 kg bags)',
          unit: 'bags',
          theoreticalQty: r.theoreticalCementBags,
          adjustedQty: r.adjustedCementBags,
          procurementQty: r.procurementCementBags,
          packagingNote: `${r.procurementCementBags} \u00d7 40 kg bags`,
        },
        {
          layerCode: 'PLASTER_SAND',
          label: 'Sand',
          unit: 'm\u00b3',
          theoreticalQty: r.theoreticalSandCubicM,
          adjustedQty: r.adjustedSandCubicM,
          procurementQty: Math.ceil(r.adjustedSandCubicM * 100) / 100,
          packagingNote: `${(Math.ceil(r.adjustedSandCubicM * 100) / 100).toFixed(2)} m\u00b3`,
        }
      )
    }

    // Drywall boards
    if (coreType === 'drywall') {
      const boardLayer = layers.find((l) => l.code === 'GYP_BOARD')
      if (boardLayer?.enabled) {
        const r = computeDrywallBoards(finishAreaSqm, boardLayer.wasteFactor)
        rows.push({
          layerCode: 'GYP_BOARD',
          label: "Gypsum Board 4'\u00d78'",
          unit: 'boards',
          theoreticalQty: r.theoreticalBoards,
          adjustedQty: r.adjustedBoards,
          procurementQty: r.procurementBoards,
          packagingNote: `${r.procurementBoards} boards`,
        })
      }

      const jcLayer = layers.find((l) => l.code === 'JOINT_COMPOUND')
      if (jcLayer?.enabled) {
        const seamLM = config.seamLengthLM ?? deriveSeamLengthFromBoards(finishAreaSqm)
        const r = computeJointCompound(seamLM, jcLayer.wasteFactor)
        rows.push({
          layerCode: 'JOINT_COMPOUND',
          label: 'Joint Compound',
          unit: 'L',
          theoreticalQty: r.theoreticalLiters,
          adjustedQty: r.adjustedLiters,
          procurementQty: r.procurement4LCans * 4,
          packagingNote: `${r.procurement4LCans} \u00d7 4 L can`,
        })
      }

      const tapeLayer = layers.find((l) => l.code === 'JOINT_TAPE')
      if (tapeLayer?.enabled) {
        const seamLM = config.seamLengthLM ?? deriveSeamLengthFromBoards(finishAreaSqm)
        const adjustedLM = seamLM * (1 + tapeLayer.wasteFactor)
        rows.push({
          layerCode: 'JOINT_TAPE',
          label: 'Mesh Joint Tape',
          unit: 'lm',
          theoreticalQty: seamLM,
          adjustedQty: adjustedLM,
          procurementQty: Math.ceil(adjustedLM),
          packagingNote: `${Math.ceil(adjustedLM)} lm`,
        })
      }
    }

    // Primer
    const primerLayer = layers.find((l) => l.code === 'PRIMER')
    if (primerLayer?.enabled) {
      const r = computePaintLayer(finishAreaSqm, 1, primerLayer.wasteFactor, coverage)
      rows.push({
        layerCode: 'PRIMER',
        label: 'Primer (1 coat)',
        unit: 'L',
        theoreticalQty: r.theoreticalLiters,
        adjustedQty: r.adjustedLiters,
        procurementQty: r.procurement4LCans * 4,
        packagingNote: `${r.procurement4LCans} \u00d7 4 L can`,
      })
    }

    // Topcoat
    const topcoatLayer = layers.find((l) => l.code === 'TOPCOAT')
    if (topcoatLayer?.enabled) {
      const r = computePaintLayer(finishAreaSqm, topcoatCoats, topcoatLayer.wasteFactor, coverage)
      rows.push({
        layerCode: 'TOPCOAT',
        label: `Topcoat Paint (${topcoatCoats} coats)`,
        unit: 'L',
        theoreticalQty: r.theoreticalLiters,
        adjustedQty: r.adjustedLiters,
        procurementQty: r.procurement16LPails * 16,
        packagingNote: `${r.procurement16LPails} \u00d7 16 L pail`,
      })
    }

    return { areaState, rows }
  }, [config, coreType, geometry, openings, sides, layers])
}

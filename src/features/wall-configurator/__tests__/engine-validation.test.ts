import { describe, it, expect } from 'bun:test'
import { computeAreaState } from '../engine/geometry.engine'
import { computeCHB } from '../engine/chb.engine'
import { computePlaster } from '../engine/plaster.engine'
import { computeDrywallBoards, computeJointCompound } from '../engine/drywall.engine'
import { computePaintLayer } from '../engine/paint.engine'

describe('10 sqm baseline validation', () => {
  const NET_AREA = 10
  const FINISH_AREA_1S = 10
  const FINISH_AREA_2S = 20

  // Geometry engine
  it('computes area state correctly', () => {
    const r = computeAreaState({ lengthM: 10, heightM: 1, wallCount: 1 }, [], 1)
    expect(r.grossAreaSqm).toBeCloseTo(10.00, 2)
    expect(r.netAreaSqm).toBeCloseTo(10.00, 2)
    expect(r.finishAreaSqm).toBeCloseTo(10.00, 2)
  })

  it('computes area state with both sides', () => {
    const r = computeAreaState({ lengthM: 5, heightM: 2, wallCount: 1 }, [], 2)
    expect(r.grossAreaSqm).toBeCloseTo(10.00, 2)
    expect(r.finishAreaSqm).toBeCloseTo(20.00, 2)
  })

  it('deducts openings from area', () => {
    const r = computeAreaState(
      { lengthM: 4, heightM: 3, wallCount: 1 },
      [{ id: '1', label: 'Door', widthM: 0.9, heightM: 2.1, quantity: 1 }],
      1
    )
    expect(r.grossAreaSqm).toBeCloseTo(12.00, 2)
    expect(r.openingAreaSqm).toBeCloseTo(1.89, 2)
    expect(r.netAreaSqm).toBeCloseTo(10.11, 2)
    expect(r.finishAreaSqm).toBeCloseTo(10.11, 2)
    expect(r.finishAreaSqm).not.toBe(r.grossAreaSqm) // Critical: finish NEVER uses gross
  })

  it('clamps opening area to gross area', () => {
    const r = computeAreaState(
      { lengthM: 2, heightM: 2, wallCount: 1 },
      [{ id: '1', label: 'Huge', widthM: 10, heightM: 10, quantity: 1 }],
      1
    )
    expect(r.netAreaSqm).toBe(0)
  })

  // CHB engine
  it('CHB units — 1 side', () => {
    const r = computeCHB(NET_AREA, 0.05)
    expect(r.theoreticalPcs).toBeCloseTo(125.00, 2)
    expect(r.adjustedPcs).toBeCloseTo(131.25, 2)
    expect(r.procurementPcs).toBe(132)
  })

  // Plaster engine — 1 side
  it('Plaster cement — 1 side', () => {
    const r = computePlaster(FINISH_AREA_1S, 0.05)
    expect(r.wetVolumeCubicM).toBeCloseTo(0.127, 3)
    expect(r.dryVolumeCubicM).toBeCloseTo(0.169, 2)
    expect(r.theoreticalCementBags).toBeCloseTo(2.027, 2)
    expect(r.adjustedCementBags).toBeCloseTo(2.128, 2)
    expect(r.procurementCementBags).toBe(3)
  })

  // Plaster engine — 2 sides
  it('Plaster cement — 2 sides', () => {
    const r = computePlaster(FINISH_AREA_2S, 0.05)
    expect(r.theoreticalCementBags).toBeCloseTo(4.054, 2)
    expect(r.procurementCementBags).toBe(5)
  })

  // Paint engine — primer
  it('Primer — 1 side (1 coat, 7 sqm/L)', () => {
    const r = computePaintLayer(FINISH_AREA_1S, 1, 0.10)
    expect(r.theoreticalLiters).toBeCloseTo(1.4286, 3)
    expect(r.adjustedLiters).toBeCloseTo(1.5714, 3)
    expect(r.procurement4LCans).toBe(1)
  })

  // Paint engine — topcoat
  it('Topcoat — 1 side (2 coats, 7 sqm/L)', () => {
    const r = computePaintLayer(FINISH_AREA_1S, 2, 0.10)
    expect(r.theoreticalLiters).toBeCloseTo(2.8571, 3)
    expect(r.adjustedLiters).toBeCloseTo(3.1429, 3)
    expect(r.procurement16LPails).toBe(1)
  })

  // Paint — both sides total
  it('Paint total — both sides matches 9.43L spec', () => {
    const primer = computePaintLayer(FINISH_AREA_2S, 1, 0.10)
    const topcoat = computePaintLayer(FINISH_AREA_2S, 2, 0.10)
    const total = primer.adjustedLiters + topcoat.adjustedLiters
    expect(total).toBeCloseTo(9.429, 2)
  })

  // Drywall boards
  it('Drywall boards — 1 side', () => {
    const r = computeDrywallBoards(FINISH_AREA_1S, 0.05)
    expect(r.theoreticalBoards).toBeCloseTo(3.364, 2)
    expect(r.procurementBoards).toBe(4)
  })

  it('Drywall boards — 2 sides', () => {
    const r = computeDrywallBoards(FINISH_AREA_2S, 0.05)
    expect(r.theoreticalBoards).toBeCloseTo(6.728, 2)
    expect(r.procurementBoards).toBe(8)
  })

  // Joint compound
  it('Joint compound — 10 lm seam reference', () => {
    const r = computeJointCompound(10, 0.10)
    expect(r.theoreticalLiters).toBeCloseTo(0.8333, 3)
    expect(r.procurement4LCans).toBe(1)
  })
})

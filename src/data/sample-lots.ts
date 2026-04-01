// src/data/sample-lots.ts
// ─── Pre-defined surveyor lot descriptions for the "Sample Lots" dropdown ──
// Based on common Philippine TCT/OCT patterns used in ALE Area C exams.

import type { LotSegment } from '@/types/lot'

export interface SampleLot {
  label: string
  description: string
  segments: LotSegment[]
}

export const SAMPLE_LOTS: SampleLot[] = [
  {
    label: 'Rectangular 300 sqm',
    description: 'Standard ALE exam lot — 20m × 15m rectangle',
    segments: [
      { id: 'r300-1', bearing: { base: 'N', degrees: 90, minutes: 0, seconds: 0, turn: 'E' }, distance: 20, boundaryTag: 'front' },
      { id: 'r300-2', bearing: { base: 'S', degrees: 0, minutes: 0, seconds: 0, turn: 'E' }, distance: 15, boundaryTag: 'right_side' },
      { id: 'r300-3', bearing: { base: 'N', degrees: 90, minutes: 0, seconds: 0, turn: 'W' }, distance: 20, boundaryTag: 'rear' },
      { id: 'r300-4', bearing: { base: 'N', degrees: 0, minutes: 0, seconds: 0, turn: 'E' }, distance: 15, boundaryTag: 'left_side' },
    ],
  },
  {
    label: 'L-Shaped Corner Lot',
    description: '6-sided irregular lot typical of subdivision corner plots',
    segments: [
      { id: 'lshape-1', bearing: { base: 'N', degrees: 90, minutes: 0, seconds: 0, turn: 'E' }, distance: 25, boundaryTag: 'front' },
      { id: 'lshape-2', bearing: { base: 'S', degrees: 0, minutes: 0, seconds: 0, turn: 'E' }, distance: 10, boundaryTag: 'right_side' },
      { id: 'lshape-3', bearing: { base: 'N', degrees: 90, minutes: 0, seconds: 0, turn: 'W' }, distance: 12, boundaryTag: 'rear' },
      { id: 'lshape-4', bearing: { base: 'S', degrees: 0, minutes: 0, seconds: 0, turn: 'E' }, distance: 10, boundaryTag: 'right_side' },
      { id: 'lshape-5', bearing: { base: 'N', degrees: 90, minutes: 0, seconds: 0, turn: 'W' }, distance: 13, boundaryTag: 'rear' },
      { id: 'lshape-6', bearing: { base: 'N', degrees: 0, minutes: 0, seconds: 0, turn: 'E' }, distance: 20, boundaryTag: 'left_side' },
    ],
  },
  {
    label: 'Trapezoidal Lot',
    description: 'Irregular 4-sided lot with angled front boundary',
    segments: [
      { id: 'trap-1', bearing: { base: 'N', degrees: 75, minutes: 0, seconds: 0, turn: 'E' }, distance: 22, boundaryTag: 'front' },
      { id: 'trap-2', bearing: { base: 'S', degrees: 10, minutes: 0, seconds: 0, turn: 'E' }, distance: 18, boundaryTag: 'right_side' },
      { id: 'trap-3', bearing: { base: 'S', degrees: 85, minutes: 0, seconds: 0, turn: 'W' }, distance: 20, boundaryTag: 'rear' },
      { id: 'trap-4', bearing: { base: 'N', degrees: 5, minutes: 0, seconds: 0, turn: 'W' }, distance: 16, boundaryTag: 'left_side' },
    ],
  },
  {
    label: 'Narrow Deep Lot',
    description: '8m × 25m narrow lot — tests tight setback compliance',
    segments: [
      { id: 'narrow-1', bearing: { base: 'N', degrees: 90, minutes: 0, seconds: 0, turn: 'E' }, distance: 8, boundaryTag: 'front' },
      { id: 'narrow-2', bearing: { base: 'S', degrees: 0, minutes: 0, seconds: 0, turn: 'E' }, distance: 25, boundaryTag: 'right_side' },
      { id: 'narrow-3', bearing: { base: 'N', degrees: 90, minutes: 0, seconds: 0, turn: 'W' }, distance: 8, boundaryTag: 'rear' },
      { id: 'narrow-4', bearing: { base: 'N', degrees: 0, minutes: 0, seconds: 0, turn: 'E' }, distance: 25, boundaryTag: 'left_side' },
    ],
  },
  {
    label: 'Pentagon Lot',
    description: '5-sided lot with diagonal rear boundary',
    segments: [
      { id: 'pent-1', bearing: { base: 'N', degrees: 90, minutes: 0, seconds: 0, turn: 'E' }, distance: 18, boundaryTag: 'front' },
      { id: 'pent-2', bearing: { base: 'S', degrees: 15, minutes: 0, seconds: 0, turn: 'E' }, distance: 15, boundaryTag: 'right_side' },
      { id: 'pent-3', bearing: { base: 'S', degrees: 60, minutes: 0, seconds: 0, turn: 'W' }, distance: 12, boundaryTag: 'rear' },
      { id: 'pent-4', bearing: { base: 'N', degrees: 80, minutes: 0, seconds: 0, turn: 'W' }, distance: 10, boundaryTag: 'rear' },
      { id: 'pent-5', bearing: { base: 'N', degrees: 10, minutes: 0, seconds: 0, turn: 'W' }, distance: 14, boundaryTag: 'left_side' },
    ],
  },
]

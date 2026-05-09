import { describe, expect, test } from 'bun:test'
import { DASHBOARD_VISIBLE_IDS } from '../../dashboard-visibility'
import { getModuleImportPath, importModuleConfig } from '../../module-paths'
import { getModuleById } from '../../registry'
import {
  BP344_RAMP_PRESETS,
  bp344AccessibleRouteRampConfig,
  evaluateBp344RampCompliance,
} from './bp344-accessible-route-ramp'
import {
  BP344_RAMP_REQUIRED_SOURCE_RULE_FIELDS,
  BP344_RAMP_SOURCE_RULE_BY_ID,
  BP344_RAMP_SOURCE_RULES,
  BP344_RAMP_SOURCE_SHA256,
  getBp344RampSourceGateStatus,
} from './bp344-accessible-route-ramp-source'

const validBaseParams = {
  riseMm: 600,
  runMm: 12_000,
  clearWidthMm: 1_200,
  landingLengthMm: 1_800,
  handrailLowerMm: 700,
  handrailUpperMm: 900,
  handrailGripDiameterMm: 40,
  raisedEdgeMm: 100,
  tactileDepthMm: 600,
  tactileOffsetMm: 300,
  vehicularRiskAtLowerEnd: false,
  lowerEndRailingProvided: false,
}

describe('BP 344 accessible route ramp source contract', () => {
  test('carries complete source-backed metadata for every source rule and fails closed pending human approval', () => {
    expect(BP344_RAMP_SOURCE_SHA256).toBe(
      '63ba8df9a0c5092aa28aae1e1afbbff4f82697768b4ce38230f960444a6a4953',
    )
    expect(BP344_RAMP_SOURCE_RULES).toHaveLength(14)

    for (const rule of BP344_RAMP_SOURCE_RULES) {
      for (const field of BP344_RAMP_REQUIRED_SOURCE_RULE_FIELDS) {
        expect(rule[field]).toBeTruthy()
      }
      expect(rule.source_sha256).toBe(BP344_RAMP_SOURCE_SHA256)
      expect(rule.fail_closed_when_source_missing).toBe(true)
    }

    expect(getBp344RampSourceGateStatus(BP344_RAMP_SOURCE_RULES)).toEqual({
      status: 'SOURCE_PENDING',
      canShowSourceBackedCompliance: false,
      pendingCount: 14,
      missingMetadataCount: 0,
    })
  })
})

describe('BP 344 accessible route ramp formula checks', () => {
  test('passes the general 1:20 ramp case with minimum width, landing, tactile warnings, handrails, and raised edge', () => {
    const result = evaluateBp344RampCompliance(validBaseParams)

    expect(result.slopeRatio).toBe(20)
    expect(result.status).toBe('PASS')
    expect(result.activeErrors).toEqual([])
  })

  test('flags a ramp steeper than 1:20 unless it stays inside the 1:15 special-review envelope', () => {
    const result = evaluateBp344RampCompliance({
      ...validBaseParams,
      riseMm: 800,
      runMm: 10_500,
    })

    expect(result.slopeRatio).toBeCloseTo(13.125, 3)
    expect(result.status).toBe('FAIL')
    expect(result.activeErrors).toContain('bp344-ramp-slope-general-max-1-20')
    expect(result.activeErrors).toContain('bp344-ramp-special-1-15-envelope')
  })

  test('marks 1:15 envelope cases as source-backed review instead of learner-visible pass', () => {
    const result = evaluateBp344RampCompliance({
      ...validBaseParams,
      riseMm: 700,
      runMm: 10_500,
    })

    expect(result.slopeRatio).toBe(15)
    expect(result.status).toBe('REVIEW')
    expect(result.activeWarnings).toContain('bp344-ramp-special-1-15-envelope')
  })

  test('requires lower-end railing when vehicular traffic is possible', () => {
    const result = evaluateBp344RampCompliance({
      ...validBaseParams,
      vehicularRiskAtLowerEnd: true,
      lowerEndRailingProvided: false,
    })

    expect(result.status).toBe('FAIL')
    expect(result.activeErrors).toContain('bp344-ramp-lower-end-railing-vehicular-risk')
  })
})

describe('BP 344 accessible route ramp module contract', () => {
  test('adds the BP 344 ramp as a dashboard-visible QA card that still fails closed on source-backed compliance', async () => {
    const registryEntry = getModuleById('bp344-accessible-route-ramp')

    expect(registryEntry?.id).toBe('bp344-accessible-route-ramp')
    expect(registryEntry?.status).toBe('built')
    expect(registryEntry?.codeRef).toBe('BP 344 · Source pending QA')
    expect(getModuleImportPath('bp344-accessible-route-ramp')).toBe(
      '02-accessibility/bp344-accessible-route-ramp',
    )
    expect(DASHBOARD_VISIBLE_IDS.has('bp344-accessible-route-ramp')).toBe(true)
    expect(bp344AccessibleRouteRampConfig.sourceTruth?.canShowSourceBackedCompliance).toBe(false)
    expect(bp344AccessibleRouteRampConfig.sourceTruth?.sourceGateStatus).toBe('SOURCE_PENDING')

    const imported = await importModuleConfig('bp344-accessible-route-ramp')
    expect((imported as { id?: string } | null)?.id).toBe('bp344-accessible-route-ramp')
  })

  test('defines stable preset IDs before Wiki or Quiz deep-links can target presets', () => {
    const ids = BP344_RAMP_PRESETS.map((preset) => preset.id)

    expect(ids).toEqual([
      'bp344-ramp-general-1-20-minimums',
      'bp344-ramp-special-1-15-review',
      'bp344-ramp-vehicular-risk-warning',
    ])
    expect(new Set(ids).size).toBe(ids.length)
    expect(bp344AccessibleRouteRampConfig.presets?.map((preset) => preset.id)).toEqual(ids)
  })

  test('renders as a legible ramp diagram with wedge massing, rails, tactile blocks, travel cue, and teaching labels', () => {
    const geometry = bp344AccessibleRouteRampConfig.geometry(validBaseParams)
    const byId = new Map(geometry.map((item) => [item.id, item]))
    const annotationIds = bp344AccessibleRouteRampConfig.annotations?.map((rule) => rule.id) ?? []

    expect(byId.get('ramp-solid-wedge')?.type).toBe('extruded-profile')
    expect(byId.get('ramp-solid-wedge')?.profilePoints?.length).toBeGreaterThanOrEqual(3)
    expect(byId.get('ramp-walking-surface')?.type).toBe('box')
    expect(byId.get('side-profile-slope-wedge')?.type).toBe('extruded-profile')
    expect(byId.get('ramp-travel-direction-arrowhead')?.type).toBe('cone')
    expect(byId.get('handrail-posts-left')?.type).toBe('instanced')
    expect(byId.get('handrail-posts-left')?.instancedPositions?.length).toBeGreaterThanOrEqual(6)
    expect(byId.get('handrail-posts-right')?.instancedPositions?.length).toBe(
      byId.get('handrail-posts-left')?.instancedPositions?.length,
    )
    expect(byId.get('lower-tactile-studs')?.instancedPositions?.length).toBeGreaterThanOrEqual(12)
    expect(byId.get('upper-tactile-studs')?.instancedPositions?.length).toBeGreaterThanOrEqual(12)
    expect(bp344AccessibleRouteRampConfig.alwaysShowAnnotations).toBe(true)
    expect(bp344AccessibleRouteRampConfig.defaultVisibleAnnotationIds).toEqual([
      'bp344-ramp-lower-landing-label',
      'bp344-ramp-slope-surface-label',
      'bp344-ramp-upper-landing-label',
      'bp344-ramp-slope-ratio-label',
    ])
    expect(annotationIds).toEqual(expect.arrayContaining([
      'bp344-ramp-lower-landing-label',
      'bp344-ramp-slope-surface-label',
      'bp344-ramp-upper-landing-label',
      'bp344-ramp-clear-width-label',
      'bp344-ramp-handrail-label',
      'bp344-ramp-tactile-warning-label',
    ]))
  })

  test('keeps route-context rules as annotations instead of compliance pass/fail until deterministic tests exist', () => {
    const violationIds = bp344AccessibleRouteRampConfig.violations?.map((rule) => rule.id) ?? []
    const annotations = bp344AccessibleRouteRampConfig.annotations ?? []
    const annotationIds = annotations.map((rule) => rule.id)

    expect(violationIds.every((id) => !id.includes('door') && !id.includes('corridor'))).toBe(true)
    expect(annotationIds).toContain('bp344-route-context-door-clear-width')
    expect(annotationIds).toContain('bp344-route-context-corridor-clear-width')
    expect(annotations.find((rule) => rule.id === 'bp344-route-context-door-clear-width')?.sourceRuleId).toBe(
      'bp344_route_door_clear_width',
    )
    expect(annotations.find((rule) => rule.id === 'bp344-route-context-door-clear-width')?.sourceCardId).toBe(
      'sc-bp344-doors-clear-level-hardware-2024-p31-p33',
    )
    expect(annotations.find((rule) => rule.id === 'bp344-route-context-corridor-clear-width')?.sourceRuleId).toBe(
      'bp344_route_corridor_clear_width',
    )
    expect(annotations.find((rule) => rule.id === 'bp344-route-context-corridor-clear-width')?.sourceCardId).toBe(
      'sc-bp344-corridors-turnabout-2024-p35',
    )
  })

  test('resolves every violation and annotation sourceRuleId to a concrete source card and locator', () => {
    const sourceLinkedItems = [
      ...(bp344AccessibleRouteRampConfig.violations ?? []),
      ...(bp344AccessibleRouteRampConfig.annotations ?? []),
    ]

    expect(sourceLinkedItems.length).toBeGreaterThan(0)

    for (const item of sourceLinkedItems) {
      expect(item.sourceRuleId).toBeTruthy()
      expect(BP344_RAMP_SOURCE_RULE_BY_ID.has(item.sourceRuleId!)).toBe(true)
      expect(item.sourceCardId).toBeTruthy()
      expect(item.codeCitation).toBeTruthy()
      expect(item.codeCitation).not.toBe('BP 344 2024 IRR · source pending')
    }
  })
})

import { existsSync, readFileSync } from 'node:fs'
import path from 'node:path'
import { describe, expect, test } from 'bun:test'
import { FORBIDDEN_PROMOTION_VALUES, PLAN_DIR, assertNoPromotionStatusValues } from './source-reconciliation-utils'

type JsonRecord = Record<string, unknown>

function readJson<T>(relativePath: string): T {
  return JSON.parse(readFileSync(path.join(PLAN_DIR, relativePath), 'utf8')) as T
}

function flattenRecords(value: unknown): JsonRecord[] {
  const out: JsonRecord[] = []
  const visit = (item: unknown) => {
    if (Array.isArray(item)) {
      for (const child of item) visit(child)
      return
    }
    if (item && typeof item === 'object') {
      const record = item as JsonRecord
      out.push(record)
      for (const child of Object.values(record)) visit(child)
    }
  }
  visit(value)
  return out
}

const allowedPacketRecommendations = new Set([
  'needs_more_evidence',
  'ready_for_human_packet_review',
  'conflict_requires_sme',
  'reject_do_not_use',
])

const allowedLocatorStatuses = new Set([
  'locator_supported',
  'locator_partial',
  'locator_missing',
  'locator_not_checked',
  'extraction_blocked',
  'unknown',
])

const allowedLocatorConfidence = new Set(['high', 'medium', 'low', 'none', 'unknown'])

describe('source verification invariant artifacts', () => {
  test('generated status and recommendation fields do not leak forbidden promotion labels', () => {
    const artifacts = [
      readJson('source-reconciliation-matrix.generated.json'),
      readJson('source-locator-evidence.generated.json'),
      readJson('source-human-sme-packet-prep.generated.json'),
      readJson('source-locator-packet-readiness-validation.json'),
      readJson('admin-ai-audit-source-payload.dry-run.json'),
    ]

    for (const artifact of artifacts) {
      expect(() => assertNoPromotionStatusValues(flattenRecords(artifact))).not.toThrow()
    }
  })

  test('locator evidence rows stay blocked and use explicit safe unions', () => {
    const artifact = readJson<{ rows: JsonRecord[]; row_count: number }>('source-locator-evidence.generated.json')

    expect(artifact.rows).toHaveLength(artifact.row_count)
    expect(artifact.row_count).toBeGreaterThan(0)

    for (const row of artifact.rows) {
      expect(row.source_family).toBeTruthy()
      expect(row.source_approval_status).toBe('blocked')
      expect(row.source_pack_creation_status).toBe('blocked')
      expect(allowedLocatorStatuses.has(String(row.locator_status))).toBe(true)
      expect(allowedLocatorConfidence.has(String(row.locator_confidence))).toBe(true)
      if (row.risk_tier === 'HIGH') {
        expect(row.human_review_required).toBe('true')
        expect(row.sme_review_required).toBe('true')
      }
    }
  })

  test('packet prep recommendations stay non-promotional and route high-risk rows to review', () => {
    const artifact = readJson<{ packets: JsonRecord[]; packet_count: number }>('source-human-sme-packet-prep.generated.json')

    expect(artifact.packets).toHaveLength(artifact.packet_count)
    expect(artifact.packet_count).toBeGreaterThan(0)

    for (const packet of artifact.packets) {
      expect(allowedPacketRecommendations.has(String(packet.current_status))).toBe(true)
      expect(packet.source_approval_status).toBe('blocked')
      expect(packet.source_pack_creation_status).toBe('blocked')
      expect(packet.blocked_actions).toBeInstanceOf(Array)
      const blockedActions = packet.blocked_actions as string[]
      expect(blockedActions).toContain('source_approval')
      expect(blockedActions).toContain('source_pack_creation')
      if (packet.risk_tier === 'HIGH') {
        expect(packet.human_review_required).toBe('true')
        expect(packet.sme_review_required).toBe('true')
      }
    }
  })

  test('dry-run admin payload cannot imply writes, approvals, source packs, or embeddings', () => {
    const payload = readJson<{
      dry_run: boolean
      db_write_attempted: boolean
      items: JsonRecord[]
      findings: JsonRecord[]
      proposals: JsonRecord[]
      locator_evidence_count: number
      human_sme_packet_prep_count: number
    }>('admin-ai-audit-source-payload.dry-run.json')

    expect(payload.dry_run).toBe(true)
    expect(payload.db_write_attempted).toBe(false)
    expect(payload.locator_evidence_count).toBeGreaterThan(0)
    expect(payload.human_sme_packet_prep_count).toBeGreaterThan(0)

    for (const proposal of payload.proposals) {
      expect(proposal.proposal_status).toBe('blocked')
      expect(proposal.proposal_type).not.toBe('source_approval')
      expect(proposal.proposal_type).not.toBe('source_pack_creation')
      expect(proposal.proposal_type).not.toBe('embedding_creation')
    }
  })

  test('source verification smoke output confirms no mutating side effects', () => {
    const smoke = readJson<{
      ok: boolean
      dry_run_only: boolean
      db_write_attempted: boolean
      source_pack_directory_exists: boolean
      embeddings_directory_exists: boolean
    }>('source-verification-smoke-test.generated.json')

    expect(smoke.ok).toBe(true)
    expect(smoke.dry_run_only).toBe(true)
    expect(smoke.db_write_attempted).toBe(false)
    expect(smoke.source_pack_directory_exists).toBe(false)
    expect(smoke.embeddings_directory_exists).toBe(false)
    for (const forbiddenPath of [
      '.ai/16_source_packs',
      '.ai/content-audit-export/source-packs',
      '.ai/content-audit-export/embeddings',
      'source-packs',
      'embeddings',
    ]) {
      expect(existsSync(path.join(process.cwd(), forbiddenPath))).toBe(false)
    }
  })

  test('package scripts for source verification are dry-run/local safety commands', () => {
    const packageJson = JSON.parse(readFileSync(path.join(process.cwd(), 'package.json'), 'utf8')) as { scripts: Record<string, string> }
    const scripts = packageJson.scripts
    const sourceVerificationScripts = [
      'content-audit:source-reconcile',
      'content-audit:source-readiness',
      'content-audit:source-locators',
      'content-audit:source-packet-prep',
      'content-audit:source-locator-readiness',
      'content-audit:admin-schema-probe',
      'content-audit:admin-source-payload',
      'content-audit:source-verification-smoke',
      'test:source-verification',
    ]

    for (const scriptName of sourceVerificationScripts) {
      const command = scripts[scriptName]
      expect(command).toBeTruthy()
      expect(command).toContain('scripts/content-audit/')
      expect(command).not.toMatch(/supabase\s+db\s+(push|reset|remote|diff|dump)/)
      expect(command).not.toMatch(/sync-run-log-to-admin-audit/)
      expect(command).not.toMatch(/\b(apply|push)\b/i)
    }
  })

  test('forbidden promotion list covers source-pack and embedding readiness terms', () => {
    for (const required of ['approved', 'verified', 'source-pack-ready', 'embedding-ready']) {
      expect(FORBIDDEN_PROMOTION_VALUES).toContain(required)
    }
  })
})

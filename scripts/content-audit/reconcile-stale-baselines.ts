#!/usr/bin/env bun
/**
 * Stale Baseline Reconciliation Script
 * 
 * Safely reconciles repaired articles with stale Supabase baselines.
 * Pipeline:
 * 1. Fetch current Supabase content via project's own supabase client
 * 2. Refresh original.md and metadata hashes
 * 3. Reapply hallucinated-component repairs
 * 4. Validate
 * 5. Diff
 * 6. Backup
 * 7. Push
 * 8. Verify
 * 
 * Usage:
 *   bun run scripts/content-audit/reconcile-stale-baselines.ts --dry-run
 *   bun run scripts/content-audit/reconcile-stale-baselines.ts --apply
 */

import { existsSync, readFileSync, writeFileSync, mkdirSync, readdirSync } from 'node:fs'
import { execSync } from 'node:child_process'
import path from 'node:path'
import {
  createContentAuditSupabaseClient,
  sha256,
  writeJson,
  writeText,
} from './lib'

const EXPORT_ROOT = path.resolve(process.cwd(), '.ai/content-audit-export')
const ARTICLES_DIR = path.join(EXPORT_ROOT, 'articles')
const LOG_DIR = EXPORT_ROOT

// The 26 repaired article IDs
const REPAIRED_IDS = [
  "f815c409-77f7-4489-b3b9-7cb2f3010ad9",
  "eee5c71f-539a-4ec8-a8b2-66e330a0c444",
  "265185c0-c1ac-4f40-8db0-bde23084f634",
  "9085e0d8-3498-4d3b-b991-46e54d94bde0",
  "7e5be79c-b68f-44ff-8252-ef97874e528d",
  "859b1a7f-8aba-473d-8c28-f9aaa39af11d",
  "850a66f9-db5d-4068-a763-0bc4c1d9872a",
  "687e0da7-4e39-454f-b3f8-a95308678556",
  "47317c8d-e2d6-4d17-b18a-3c469b73080c",
  "9261cc17-24c1-49d2-a45a-158032f6fcd3",
  "b862f4a8-fa65-4cf7-bcb8-bec5b330d837",
  "85bcd328-436d-49ba-9d37-7b202d0d38d4",
  "62733840-d170-40de-a27e-31fa31c30c69",
  "c9b1aadd-4843-4cf3-a551-6dd67678e508",
  "93009368-9041-46e0-b93b-8786100311be",
  "a865c6b2-8c25-404e-bb0c-08d374d374a5",
  "bd7ee04d-e6a5-4f77-a2a7-8a9dc6ddd5f4",
  "ca53ed30-fdc6-42de-bb68-b5335d0d77a6",
  "17350925-ae83-47a1-a30f-a96eb5c1d942",
  "9eb0b48e-110e-4c75-8a0c-4f83063001cf",
  "958cf8ad-c743-41b3-a7fd-47da9421a09b",
  "303f8a75-b42b-4405-8c39-082b4d7b6322",
  "f95d5cc8-30d4-4f74-890f-1018d764da6e",
  "5f341f81-5e43-49d6-a821-2a67c5d07c59",
  "3a7ba43c-5ef5-4fd8-b054-ccb8a567d6f7",
  "425c5476-12a0-476c-96e3-3f10c1530a9c",
]

interface ReconcileResult {
  article_id: string
  status: string
  reason?: string
  supabase_hash?: string
  refreshed_hash?: string
  repair_changes?: number
  validation_valid?: boolean
  validation_errors?: string[]
  compose_ok?: boolean
  dry_run_ok?: boolean
  push_ok?: boolean
  verify_hash?: string
  backup_path?: string
  steps: string[]
}

async function fetchSupabaseContent(supabase: any, articleId: string) {
  const result = await supabase
    .from('wiki_articles')
    .select('article_id, slug, title, content, updated_at')
    .eq('article_id', articleId)
    .single()
  
  if (result.error) {
    console.error(`  Supabase fetch error: ${result.error.message}`)
    return null
  }
  return result.data
}

function findArticleDir(articleId: string): string | null {
  const _dirs = existsSync(ARTICLES_DIR) ? readFileSync : null
  // Use readdir
  if (!existsSync(ARTICLES_DIR)) return null
  
  for (const name of readdirSync(ARTICLES_DIR)) {
    if (name.includes(articleId)) {
      return path.join(ARTICLES_DIR, name)
    }
  }
  return null
}

function refreshBaseline(articleDir: string, supabaseData: any) {
  const content = supabaseData.content ?? ''
  
  // Write fresh original.md
  writeText(path.join(articleDir, 'original.md'), content)
  
  // Update metadata
  const metaPath = path.join(articleDir, 'article-metadata.json')
  const meta = existsSync(metaPath) ? JSON.parse(readFileSync(metaPath, 'utf8')) : {}
  
  const contentHash = sha256(content)
  meta.original_content_hash = contentHash
  meta.remote_content_hash = contentHash
  meta.remote_updated_at = supabaseData.updated_at ?? ''
  meta.slug = supabaseData.slug ?? meta.slug ?? ''
  meta.title = supabaseData.title ?? meta.title ?? ''
  
  writeJson(metaPath, meta)
  
  // Update ui-blocks.json metadata
  const uiPath = path.join(articleDir, 'ui-blocks.json')
  if (existsSync(uiPath)) {
    const ui = JSON.parse(readFileSync(uiPath, 'utf8'))
    ui.original_content_hash = contentHash
    writeJson(uiPath, ui)
  }
  
  return { originalHash: contentHash, content, meta }
}

function reapplyRepair(articleDir: string) {
  const uiPath = path.join(articleDir, 'ui-blocks.json')
  if (!existsSync(uiPath)) return { repaired: false, reason: 'no ui-blocks.json' }
  
  const ui = JSON.parse(readFileSync(uiPath, 'utf8'))
  const blocks = ui.blocks ?? []
  
  if (!Array.isArray(blocks)) return { repaired: false, reason: 'invalid blocks' }
  
  const REPLACEMENTS: Record<string, string | null> = {
    JSX: null,
    details: 'Accordion',
    LeartBox: 'Callout',
    Leart: 'Note',
    InfoBox: 'Callout',
    TechnicalBox: 'Callout',
    DataTable: 'WikiExamTable',
    JSXCode: null,
    ComparisonChart: 'ComparisonTable',
    PriceBreakdown: 'KeyValues',
    SensorTable: 'WikiExamTable',
    ComplianceChecklist: 'ProcessFlow',
    DataQualitySpec: 'Note',
    RevealBlock: 'Accordion',
    QuestionBank: null,
    ConflictMatrix: 'ComparisonTable',
    EthicalFramework: 'ProcessFlow',
    RegulationFramework: 'ProcessFlow',
    MDXComponent: 'Callout',
  }
  
  let changes = 0
  const newBlocks: any[] = []
  
  for (const b of blocks) {
    const comp = b.component_name ?? ''
    const _blockId = b.block_id ?? ''
    
    if (!(comp in REPLACEMENTS)) {
      newBlocks.push(b)
      continue
    }
    
    const replacement = REPLACEMENTS[comp]
    if (replacement === null) {
      changes++
      // Skip this block (remove it)
    } else {
      changes++
      b.component_name = replacement
      let raw = b.raw ?? ''
      // Simple tag replacement
      raw = raw.replace(new RegExp(`<${comp}\\b`, 'g'), `<${replacement}`)
      raw = raw.replace(new RegExp(`</${comp}>`, 'g'), `</${replacement}>`)
      b.raw = raw
      newBlocks.push(b)
    }
  }
  
  ui.blocks = newBlocks
  ui.ui_block_count = newBlocks.length
  ui.total_blocks = newBlocks.length
  
  writeJson(uiPath, ui)
  
  return { repaired: true, changes, blocksBefore: blocks.length, blocksAfter: newBlocks.length }
}

function runValidation(articleDir: string) {
  const validator = path.resolve(process.cwd(), '.ai/content-audit-export/scripts/validate_article.py')
  try {
    const out = execSync(`python3 "${validator}" "${articleDir}"`, { encoding: 'utf8', timeout: 30000 })
    return JSON.parse(out)
  } catch (e: any) {
    return { valid: false, errors: [{ type: 'validator_crash', message: e.stderr || e.message }] }
  }
}

function runCompose(articleId: string): { ok: boolean; output: string } {
  try {
    const out = execSync(
      `bun run content-audit:compose -- --article-id ${articleId} --overwrite`,
      { encoding: 'utf8', timeout: 60000, cwd: process.cwd() }
    )
    return { ok: true, output: out }
  } catch (e: any) {
    return { ok: false, output: e.stdout + e.stderr }
  }
}

function runPushDryRun(articleId: string): { ok: boolean; output: string } {
  try {
    const out = execSync(
      `bun run content-audit:push --dry-run -- --article-id ${articleId}`,
      { encoding: 'utf8', timeout: 60000, cwd: process.cwd() }
    )
    return { ok: true, output: out }
  } catch (e: any) {
    return { ok: false, output: e.stdout + e.stderr }
  }
}

function runPushApply(articleId: string): { ok: boolean; output: string } {
  try {
    const out = execSync(
      `bun run content-audit:push:apply -- --article-id ${articleId}`,
      { encoding: 'utf8', timeout: 60000, cwd: process.cwd() }
    )
    return { ok: true, output: out }
  } catch (e: any) {
    return { ok: false, output: e.stdout + e.stderr }
  }
}

function backupSupabaseRow(articleId: string, content: string): string {
  const backupDir = path.join(LOG_DIR, 'backups', 'reconciled')
  mkdirSync(backupDir, { recursive: true })
  const backupPath = path.join(backupDir, `${articleId}.md`)
  writeFileSync(backupPath, content, 'utf8')
  return backupPath
}

async function reconcileArticle(supabase: any, articleId: string, dryRun: boolean): Promise<ReconcileResult> {
  const result: ReconcileResult = {
    article_id: articleId,
    status: 'pending',
    steps: [],
  }
  
  // Step 1: Find article dir
  const articleDir = findArticleDir(articleId)
  if (!articleDir) {
    result.status = 'failed-needs-review'
    result.reason = 'article_dir_not_found'
    return result
  }
  result.steps.push('dir_found')
  
  // Step 2: Fetch Supabase content
  const supabaseData = await fetchSupabaseContent(supabase, articleId)
  if (!supabaseData) {
    result.status = 'failed-needs-review'
    result.reason = 'supabase_fetch_failed'
    return result
  }
  result.supabase_hash = sha256(supabaseData.content ?? '')
  result.steps.push('supabase_fetched')
  
  // Step 3: Backup
  result.backup_path = backupSupabaseRow(articleId, supabaseData.content ?? '')
  result.steps.push('backed_up')
  
  // Step 4: Refresh baseline
  const baseline = refreshBaseline(articleDir, supabaseData)
  result.refreshed_hash = baseline.originalHash
  result.steps.push('baseline_refreshed')
  
  // Step 5: Reapply repair
  const repair = reapplyRepair(articleDir)
  result.repair_changes = repair.changes ?? 0
  result.steps.push('repair_reapplied')
  
  if (!repair.repaired) {
    result.status = 'failed-needs-review'
    result.reason = repair.reason
    return result
  }
  
  // Step 6: Validate
  const validation = runValidation(articleDir)
  result.validation_valid = validation.valid ?? false
  result.validation_errors = validation.errors?.map((e: any) => e.message) ?? []
  result.steps.push('validated')
  
  if (!result.validation_valid) {
    result.status = 'failed-needs-review'
    result.reason = `validation_failed: ${result.validation_errors.join('; ')}`
    return result
  }
  
  // Step 7: Compose
  const compose = runCompose(articleId)
  result.compose_ok = compose.ok
  result.steps.push('composed')
  
  if (!compose.ok) {
    result.status = 'failed-needs-review'
    result.reason = 'compose_failed'
    return result
  }
  
  // Step 8: Dry-run push
  const dryPush = runPushDryRun(articleId)
  result.dry_run_ok = dryPush.ok
  result.steps.push('dry_run')
  
  if (!dryPush.ok) {
    result.status = 'failed-needs-review'
    result.reason = 'dry_run_failed'
    return result
  }
  
  if (dryRun) {
    result.status = 'dry-run-passed'
    return result
  }
  
  // Step 9: Apply push
  const push = runPushApply(articleId)
  result.push_ok = push.ok
  result.steps.push('pushed')
  
  if (!push.ok) {
    result.status = 'failed-needs-review'
    result.reason = 'push_failed'
    return result
  }
  
  // Step 10: Verify by re-fetching
  const verifyData = await fetchSupabaseContent(supabase, articleId)
  if (verifyData) {
    result.verify_hash = sha256(verifyData.content ?? '')
    result.status = 'reconciled-and-pushed'
  } else {
    result.status = 'reconciled-push-unverified'
  }
  result.steps.push('verified')
  
  return result
}

async function main() {
  const args = process.argv.slice(2)
  const dryRun = !args.includes('--apply')
  const singleId = args.find(a => a.startsWith('--article-id='))?.split('=')[1]
  
  const ids = singleId ? [singleId] : REPAIRED_IDS
  
  console.log(`Reconciling ${ids.length} repaired articles`)
  console.log(`Mode: ${dryRun ? 'DRY RUN' : 'APPLY'}`)
  console.log('='.repeat(60))
  
  const supabase = createContentAuditSupabaseClient()
  
  const results: ReconcileResult[] = []
  
  for (const id of ids) {
    console.log(`\n--- ${id} ---`)
    const result = await reconcileArticle(supabase, id, dryRun)
    results.push(result)
    console.log(`Status: ${result.status}`)
    if (result.reason) console.log(`Reason: ${result.reason}`)
    if (result.repair_changes !== undefined) console.log(`Repair changes: ${result.repair_changes}`)
    if (result.validation_errors && result.validation_errors.length > 0) {
      console.log(`Validation errors: ${result.validation_errors.join('; ')}`)
    }
  }
  
  // Save results
  const logPath = path.join(LOG_DIR, 'reconcile-results.json')
  writeJson(logPath, results)
  
  const passed = results.filter(r => r.status === 'reconciled-and-pushed' || r.status === 'dry-run-passed')
  const failed = results.filter(r => r.status === 'failed-needs-review')
  
  console.log(`\n${'='.repeat(60)}`)
  console.log(`Passed: ${passed.length}`)
  console.log(`Failed: ${failed.length}`)
  console.log(`Log: ${logPath}`)
}

main().catch(e => {
  console.error(e)
  process.exit(1)
})

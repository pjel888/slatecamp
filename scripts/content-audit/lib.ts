import { createHash, randomUUID } from 'node:crypto'
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { createClient } from '@supabase/supabase-js'
import type { Database } from '../../src/types/supabase'

export const EXPORT_VERSION = 'content-roundtrip-v1'
export const PARSER_VERSION = 'ui-block-parser-v1'
export const DEFAULT_OUTPUT_ROOT = '.ai/content-audit-export'
export const HASH_ALGORITHM = 'sha256' as const
export const BULK_APPLY_CONFIRMATION = 'APPLY ALL SAFE CONTENT AUDIT PUSHES'
const UI_PLACEHOLDER_OPEN = '[SLATECAMP_UI_BLOCK:'
const UI_PLACEHOLDER_CLOSE = '[/SLATECAMP_UI_BLOCK]'

export type JsonObject = Record<string, unknown>
export type SupabaseClient = ReturnType<typeof createClient<Database>>

export interface CliOptions {
  all?: boolean
  limit?: number
  articleId?: string
  slug?: string
  changedOnly?: boolean
  input?: string
  output?: string
  dryRun?: boolean
  overwrite?: boolean
  strict?: boolean
  includeQuestions?: boolean
  includeSources?: boolean
  includeTaxonomy?: boolean
  json?: boolean
  summary?: boolean
  apply?: boolean
  force?: boolean
  allSafe?: boolean
  confirm?: string
  questionId?: string
  adminAuditLog?: boolean
  allowUiBlockEdits?: boolean
  reviewerId?: string
  note?: string
  command?: string
  repairPlaceholders?: boolean
}

export interface ArticleMetadata {
  article_id: string
  title: string
  slug: string | null
  subject_label: string | null
  difficulty_label: string | null
  status: string | null
  read_time?: string | null
  reviewed_at: string | null
  reviewed_by: string | null
  reviewer_comments?: string | null
  created_at?: string | null
  created_by?: string | null
  updated_at: string | null
  updated_by?: string | null
  updated_note?: string | null
  content_hash: string
  original_content_hash: string
  normalized_content_hash: string | null
  candidate_content_hash: string | null
  ui_blocks_hash: string | null
  linked_questions_hash?: string | null
  sources_hash?: string | null
  hash_algorithm?: typeof HASH_ALGORITHM
  exported_at: string
  export_run_id: string
  export_version: string
  source_table: 'wiki_articles'
  source_count: number
  linked_question_count: number
  taxonomy_node_count: number
  taxonomy_count: number
  parser_status: 'not_started' | 'passed' | 'warnings' | 'failed'
  content_complexity: 'plain_markdown' | 'markdown_with_ui' | 'unknown'
}

export interface UiBlock {
  block_id: string
  block_type: 'mdx_component' | 'raw_html' | 'shortcode' | 'container_directive' | 'fenced_custom_block' | 'unknown_custom_block'
  component_name: string | null
  raw: string
  raw_hash: string
  placeholder: string
  placeholder_hash: string
  props?: JsonObject | null
  props_json?: JsonObject | null
  props_text?: string | null
  children_raw?: string | null
  children_text?: string | null
  start_offset: number
  end_offset: number
  line_start: number
  line_end: number
  parser_confidence: 'high' | 'medium' | 'low'
  parse_status: 'parsed' | 'props_unparsed' | 'unknown_block' | 'failed'
  warnings: string[]
  status: 'preserved' | 'unknown' | 'parse_warning' | 'parse_error'
}

export interface UiBlocksFile {
  article_id: string
  slug: string | null
  normalized_created_at: string
  parser_version: string
  original_content_hash: string
  normalized_content_hash: string
  ui_block_count: number
  total_blocks: number
  blocks: UiBlock[]
  unknown_blocks: UiBlock[]
  unresolved_critical_blocks: UiBlock[]
  ui_blocks_hash: string
}

export interface NormalizeResult {
  article_id: string
  slug: string | null
  normalized: string
  uiBlocks: UiBlocksFile
  warnings: string[]
}

export interface ComposeReport {
  article_id: string
  slug: string | null
  generated_at: string
  original_hash: string | null
  normalized_hash: string
  candidate_hash: string
  ui_blocks_count: number
  placeholders_found: number
  placeholders_resolved: number
  unresolved_placeholders: string[]
  unused_blocks: string[]
  preserved_blocks_reinserted: number
  candidate_matches_original: boolean | null
  safe_to_diff: boolean
  blockers: string[]
  warnings: string[]
}

export interface DiffReport {
  article_id: string
  slug: string | null
  generated_at: string
  old_hash: string
  new_hash: string
  original_hash: string
  normalized_hash: string | null
  candidate_hash: string
  changed: boolean
  changed_line_count: number
  inserted_line_count: number
  deleted_line_count: number
  ui_blocks_original_count: number
  ui_blocks_candidate_count: number
  ui_blocks_changed_count: number
  ui_blocks_count: number
  unresolved_placeholders_count: number
  preserved_blocks_count: number
  changed_text_summary: JsonObject
  changed_ui_blocks_summary: JsonObject
  locally_safe_to_push: boolean
  safe_to_push: boolean
  blockers: string[]
  warnings: string[]
  summary: string
}

export interface PushSafetyInput {
  metadata: ArticleMetadata
  original: string
  candidate: string | null
  diffReport: DiffReport | null
  uiBlocks: UiBlocksFile | null
  remoteContent: string | null
  apply: boolean
  dryRun: boolean
  force: boolean
  repairPlaceholders?: boolean
}

export interface PushSafetyResult {
  dry_run: boolean
  apply: boolean
  remote_hash_before: string | null
  original_hash: string
  candidate_hash: string | null
  stale_check_passed: boolean
  pushed: boolean
  blockers: string[]
  warnings: string[]
}

export type ContentAuditSyncStatus = 'exported' | 'normalized' | 'candidate_ready' | 'dry_run_passed' | 'pushed' | 'conflict' | 'error'

export interface SyncStateArticle {
  folder: string
  original_hash: string
  candidate_hash: string | null
  last_diff_at: string | null
  last_push_dry_run_at: string | null
  last_push_applied_at: string | null
  sync_status: ContentAuditSyncStatus
}

export interface SyncStateFile {
  generated_at: string
  last_export_run_id: string | null
  last_component_inventory_run_id: string | null
  articles: Record<string, SyncStateArticle>
}

export interface ParserErrorsFile {
  article_id: string
  slug: string | null
  generated_at: string
  parser_version: string
  error_count: number
  warning_count: number
  unknown_block_count: number
  critical_block_count: number
  errors: Array<{
    block_id: string
    component_name: string | null
    status: UiBlock['status']
    parse_status: UiBlock['parse_status']
    message: string
  }>
  warnings: Array<{
    block_id: string
    component_name: string | null
    status: UiBlock['status']
    parse_status: UiBlock['parse_status']
    messages: string[]
  }>
  unknown_blocks: Array<Pick<UiBlock, 'block_id' | 'component_name' | 'block_type' | 'raw_hash' | 'line_start' | 'line_end' | 'warnings'>>
  critical_blocks: Array<Pick<UiBlock, 'block_id' | 'component_name' | 'block_type' | 'raw_hash' | 'line_start' | 'line_end' | 'warnings'>>
}

export interface ArticleComponentUsage {
  article_id: string
  slug: string | null
  title: string
  component_count: number
  components: Array<{
    component_name: string
    block_ids: string[]
    found_in_repo: boolean
    file_path: string | null
  }>
  unknown_components: string[]
  custom_ui_block_count: number
  normalized_status: string
  components_detected: string[]
  unknown_components_detected: string[]
}

export interface ComponentUsageReport {
  generated_at: string
  article_count: number
  articles_with_components: number
  articles_plain_markdown: number
  usage: ArticleComponentUsage[]
  components_used_across_articles: Array<{
    component_name: string
    article_count: number
    found_in_repo: boolean
    file_path: string | null
  }>
  articles: ArticleComponentUsage[]
}

export function parseArgs(argv = process.argv.slice(2)): CliOptions {
  const options: CliOptions = {}
  const positional: string[] = []

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index]
    if (!arg.startsWith('--')) {
      positional.push(arg)
      continue
    }

    const rawArg = arg.slice(2)
    const eqIndex = rawArg.indexOf('=')
    const rawKey = eqIndex === -1 ? rawArg : rawArg.slice(0, eqIndex)
    const inlineValue = eqIndex === -1 ? undefined : rawArg.slice(eqIndex + 1)
    const key = rawKey.replace(/-([a-z])/g, (_, char: string) => char.toUpperCase()) as keyof CliOptions
    const next = argv[index + 1]
    const hasSeparateValue = next !== undefined && !next.startsWith('--')
    const rawValue = inlineValue ?? (hasSeparateValue ? next : 'true')
    if (hasSeparateValue && inlineValue === undefined) index += 1

    const value = coerceCliValue(rawValue)
    ;(options as JsonObject)[key] = value
  }

  if (positional[0]) options.command = positional[0]
  normalizeAliases(options)
  return options
}

function normalizeAliases(options: CliOptions) {
  const raw = options as JsonObject
  if (raw.article && !options.articleId) options.articleId = String(raw.article)
  if (raw.article_id && !options.articleId) options.articleId = String(raw.article_id)
  if (raw.question && !options.questionId) options.questionId = String(raw.question)
  if (raw.question_id && !options.questionId) options.questionId = String(raw.question_id)
  if (raw.all_safe && !options.allSafe) options.allSafe = Boolean(raw.all_safe)
  if (raw.changed_only && !options.changedOnly) options.changedOnly = Boolean(raw.changed_only)
  if (raw.admin_audit_log && !options.adminAuditLog) options.adminAuditLog = Boolean(raw.admin_audit_log)
  if (raw.allow_ui_block_edits && !options.allowUiBlockEdits) options.allowUiBlockEdits = Boolean(raw.allow_ui_block_edits)
  options.includeQuestions ??= true
  options.includeSources ??= true
  options.includeTaxonomy ??= true
}

function coerceCliValue(value: string): string | number | boolean {
  if (value === 'true') return true
  if (value === 'false') return false
  if (/^-?\d+$/.test(value)) return Number(value)
  return value
}

export function loadEnvLocal(cwd = process.cwd()) {
  for (const fileName of ['.env.local', '.env']) {
    const envPath = path.join(cwd, fileName)
    if (!existsSync(envPath)) continue
    for (const line of readFileSync(envPath, 'utf-8').split('\n')) {
      const trimmed = line.trim()
      if (!trimmed || trimmed.startsWith('#')) continue
      const eqIndex = trimmed.indexOf('=')
      if (eqIndex === -1) continue
      const key = trimmed.slice(0, eqIndex).trim()
      const value = trimmed.slice(eqIndex + 1).trim().replace(/^['"]|['"]$/g, '')
      if (!process.env[key]) process.env[key] = value
    }
  }
}

export function createContentAuditSupabaseClient(): SupabaseClient {
  loadEnvLocal()
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL/SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY for content audit script.')
  }

  return createClient<Database>(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}

export function sha256(content: string): string {
  return `sha256:${createHash('sha256').update(content, 'utf8').digest('hex')}`
}

export function sha256Json(value: unknown): string {
  return sha256(JSON.stringify(value))
}

export function nowIso() {
  return new Date().toISOString()
}

export function buildArticleContentUpdatePayload({
  content,
  updatedAt,
  reviewerId,
  note,
  suppressPublicUpdatedNote = false,
}: {
  content: string
  updatedAt: string
  reviewerId?: string | null
  note?: string | null
  suppressPublicUpdatedNote?: boolean
}): Record<string, unknown> {
  const updatePayload: Record<string, unknown> = {
    content,
    updated_at: updatedAt,
  }
  if (reviewerId) updatePayload.updated_by = reviewerId
  if (note && !suppressPublicUpdatedNote) updatePayload.updated_note = note
  return updatePayload
}

export function createExportId() {
  return `content-roundtrip-${new Date().toISOString().replace(/[:.]/g, '-')}-${randomUUID().slice(0, 8)}`
}

export function resolveExportRoot(rawPath?: string, cwd = process.cwd()): string {
  const defaultRoot = path.resolve(cwd, DEFAULT_OUTPUT_ROOT)
  const target = path.resolve(cwd, rawPath ?? DEFAULT_OUTPUT_ROOT)
  const relative = path.relative(defaultRoot, target)
  if (relative.startsWith('..') || path.isAbsolute(relative)) {
    throw new Error(`Refusing to write outside ${DEFAULT_OUTPUT_ROOT}: ${rawPath}`)
  }
  return target
}

export function safeFolderName(slug: string | null | undefined, articleId: string, used = new Set<string>()) {
  const baseSource = slug?.trim() || 'article'
  const base = baseSource
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 100) || 'article'
  const suffix = `--${articleId}`
  let candidate = `${base}${suffix}`.slice(0, 170)
  let counter = 2
  while (used.has(candidate)) {
    candidate = `${base}${suffix}-${counter}`.slice(0, 180)
    counter += 1
  }
  used.add(candidate)
  return candidate
}

export async function writeJson(filePath: string, value: unknown) {
  await mkdir(path.dirname(filePath), { recursive: true })
  await writeFile(filePath, `${JSON.stringify(value, null, 2)}\n`, 'utf-8')
}

export async function writeText(filePath: string, value: string) {
  await mkdir(path.dirname(filePath), { recursive: true })
  await writeFile(filePath, value, 'utf-8')
}

export async function readJson<T>(filePath: string): Promise<T> {
  return JSON.parse(await readFile(filePath, 'utf-8')) as T
}

export async function readSyncState(root: string): Promise<SyncStateFile> {
  const syncStatePath = path.join(root, 'sync-state.json')
  if (!existsSync(syncStatePath)) {
    return {
      generated_at: nowIso(),
      last_export_run_id: null,
      last_component_inventory_run_id: null,
      articles: {},
    }
  }
  return readJson<SyncStateFile>(syncStatePath)
}

export async function writeSyncState(root: string, state: SyncStateFile) {
  await writeJson(path.join(root, 'sync-state.json'), {
    ...state,
    generated_at: nowIso(),
  })
}

export async function updateSyncStateRoot(root: string, patch: Partial<Omit<SyncStateFile, 'generated_at' | 'articles'>>) {
  const state = await readSyncState(root)
  await writeSyncState(root, { ...state, ...patch })
}

export async function updateArticleSyncState(
  root: string,
  articleDir: string,
  metadata: Pick<ArticleMetadata, 'article_id' | 'original_content_hash' | 'content_hash' | 'candidate_content_hash'>,
  patch: Partial<Omit<SyncStateArticle, 'folder' | 'original_hash'>>,
) {
  const state = await readSyncState(root)
  const folder = path.relative(path.join(root, 'articles'), articleDir) || path.basename(articleDir)
  const existing = state.articles[metadata.article_id]
  state.articles[metadata.article_id] = {
    candidate_hash: metadata.candidate_content_hash ?? null,
    last_diff_at: null,
    last_push_dry_run_at: null,
    last_push_applied_at: null,
    sync_status: 'exported',
    ...existing,
    folder,
    original_hash: metadata.original_content_hash || metadata.content_hash,
    ...patch,
  }
  await writeSyncState(root, state)
}

export interface ChangedArticleDecisionInput {
  currentContent: string
  currentUpdatedAt?: string | null
  existingMetadata?: Partial<Pick<ArticleMetadata, 'original_content_hash' | 'content_hash' | 'updated_at'>> | null
  existingOriginal?: string | null
}

export function shouldExportChangedArticle({
  currentContent,
  existingMetadata,
  existingOriginal,
}: ChangedArticleDecisionInput) {
  if (!existingMetadata && existingOriginal == null) return true
  const currentHash = sha256(currentContent)
  const existingHash = existingMetadata?.original_content_hash ?? existingMetadata?.content_hash ?? (existingOriginal != null ? sha256(existingOriginal) : null)
  return existingHash !== currentHash
}

export function discoverArticleDirs(root: string, filters: Pick<CliOptions, 'articleId' | 'slug'> = {}) {
  const articlesRoot = path.join(root, 'articles')
  if (!existsSync(articlesRoot)) return []

  return readdirSync(articlesRoot)
    .map((name) => path.join(articlesRoot, name))
    .filter((entry) => statSync(entry).isDirectory())
    .filter((articleDir) => {
      const metadataPath = path.join(articleDir, 'article-metadata.json')
      if (!existsSync(metadataPath)) return false
      if (!filters.articleId && !filters.slug) return true
      try {
        const metadata = JSON.parse(readFileSync(metadataPath, 'utf-8')) as ArticleMetadata
        return (!filters.articleId || metadata.article_id === filters.articleId) && (!filters.slug || metadata.slug === filters.slug)
      } catch {
        return false
      }
    })
}

export function lineNumberAt(content: string, offset: number) {
  return content.slice(0, offset).split('\n').length
}

interface CodeFenceRange {
  start: number
  end: number
  fence: string
  info: string
  bodyStart: number
  bodyEnd: number
}

function codeFenceRanges(content: string): CodeFenceRange[] {
  const ranges: CodeFenceRange[] = []
  const lineRegex = /^(```|~~~)([^\n]*)\n?/gm
  let openStart: number | null = null
  let openFence: string | null = null
  let openInfo = ''
  let bodyStart = 0
  let match: RegExpExecArray | null

  while ((match = lineRegex.exec(content)) !== null) {
    if (openStart === null) {
      openStart = match.index
      openFence = match[1]
      openInfo = match[2]?.trim() ?? ''
      bodyStart = lineRegex.lastIndex
      continue
    }
    if (match[1] === openFence) {
      const nextNewline = content.indexOf('\n', lineRegex.lastIndex)
      ranges.push({
        start: openStart,
        end: nextNewline === -1 ? content.length : nextNewline + 1,
        fence: openFence,
        info: openInfo,
        bodyStart,
        bodyEnd: match.index,
      })
      openStart = null
      openFence = null
      openInfo = ''
      bodyStart = 0
    }
  }

  if (openStart !== null && openFence !== null) {
    ranges.push({ start: openStart, end: content.length, fence: openFence, info: openInfo, bodyStart, bodyEnd: content.length })
  }
  return ranges
}

function isInsideRanges(index: number, ranges: Array<{ start: number; end: number }>) {
  return ranges.some((range) => index >= range.start && index < range.end)
}

const RAW_HTML_BLOCKS = new Set(['div', 'iframe', 'script', 'style', 'details', 'summary', 'video', 'audio', 'canvas', 'svg', 'section', 'aside'])
const VOID_HTML_TAGS = new Set(['img', 'br', 'hr', 'input', 'meta', 'link'])

interface DetectedRange {
  start: number
  end: number
  componentName: string | null
  blockType: UiBlock['block_type']
  propsText: string | null
  childrenRaw: string | null
  confidence: UiBlock['parser_confidence']
  warnings: string[]
}

export function normalizeArticleContent(original: string, metadata: Pick<ArticleMetadata, 'article_id' | 'slug'>): NormalizeResult {
  const ranges = detectUiBlockRanges(original)
  const blocks: UiBlock[] = []
  let normalized = ''
  let cursor = 0

  ranges.forEach((range, index) => {
    const raw = original.slice(range.start, range.end)
    const blockId = `ui_${String(index + 1).padStart(4, '0')}`
    const props = parseProps(range.propsText)
    const propsText = range.propsText?.trim() || null
    const propsSummary = props ? summarizeProps(props) : propsText
    const childrenText = extractReadableText(range.childrenRaw ?? raw)
    const status: UiBlock['status'] = range.confidence === 'low' ? 'unknown' : props === null && propsText ? 'parse_warning' : 'preserved'
    const parseStatus: UiBlock['parse_status'] = range.confidence === 'low' ? 'unknown_block' : props === null && propsText ? 'props_unparsed' : 'parsed'
    const componentLabel = range.componentName ?? 'unknown'
    const placeholder = makePlaceholder({
      blockId,
      componentName: componentLabel,
      status,
      propsSummary,
      childrenText,
    })

    normalized += original.slice(cursor, range.start)
    normalized += placeholder
    cursor = range.end

    blocks.push({
      block_id: blockId,
      block_type: range.blockType,
      component_name: range.componentName,
      raw,
      raw_hash: sha256(raw),
      placeholder,
      placeholder_hash: sha256(placeholder),
      props,
      props_json: props,
      props_text: propsText,
      children_raw: range.childrenRaw,
      children_text: childrenText,
      start_offset: range.start,
      end_offset: range.end,
      line_start: lineNumberAt(original, range.start),
      line_end: lineNumberAt(original, range.end),
      parser_confidence: range.confidence,
      parse_status: parseStatus,
      warnings: range.warnings,
      status,
    })
  })

  normalized += original.slice(cursor)
  const normalizedHash = sha256(normalized)
  const unknownBlocks = blocks.filter((block) => block.status === 'unknown' || block.parse_status === 'unknown_block')
  const uiBlocksFile: UiBlocksFile = {
    article_id: metadata.article_id,
    slug: metadata.slug ?? null,
    normalized_created_at: nowIso(),
    parser_version: PARSER_VERSION,
    original_content_hash: sha256(original),
    normalized_content_hash: normalizedHash,
    ui_block_count: blocks.length,
    total_blocks: blocks.length,
    blocks,
    unknown_blocks: unknownBlocks,
    unresolved_critical_blocks: blocks.filter((block) => block.status === 'parse_error'),
    ui_blocks_hash: sha256Json(blocks.map((block) => ({ block_id: block.block_id, raw_hash: block.raw_hash, placeholder_hash: block.placeholder_hash }))),
  }

  return {
    article_id: metadata.article_id,
    slug: metadata.slug ?? null,
    normalized,
    uiBlocks: uiBlocksFile,
    warnings: blocks.flatMap((block) => block.warnings),
  }
}

export function buildParserErrorsFile(result: NormalizeResult): ParserErrorsFile {
  const issueBlocks = result.uiBlocks.blocks.filter((block) =>
    block.status === 'unknown' ||
    block.status === 'parse_warning' ||
    block.status === 'parse_error' ||
    block.parse_status === 'unknown_block' ||
    block.parse_status === 'props_unparsed' ||
    block.parse_status === 'failed' ||
    block.warnings.length > 0,
  )
  const criticalBlocks = result.uiBlocks.unresolved_critical_blocks
  const unknownBlocks = result.uiBlocks.unknown_blocks
  const errors = criticalBlocks.map((block) => ({
    block_id: block.block_id,
    component_name: block.component_name,
    status: block.status,
    parse_status: block.parse_status,
    message: block.warnings[0] ?? 'Critical parser issue detected.',
  }))

  return {
    article_id: result.article_id,
    slug: result.slug,
    generated_at: nowIso(),
    parser_version: result.uiBlocks.parser_version,
    error_count: errors.length,
    warning_count: issueBlocks.length - errors.length,
    unknown_block_count: unknownBlocks.length,
    critical_block_count: criticalBlocks.length,
    errors,
    warnings: issueBlocks
      .filter((block) => !criticalBlocks.some((critical) => critical.block_id === block.block_id))
      .map((block) => ({
        block_id: block.block_id,
        component_name: block.component_name,
        status: block.status,
        parse_status: block.parse_status,
        messages: block.warnings.length > 0 ? block.warnings : [`Parser status: ${block.status}/${block.parse_status}`],
      })),
    unknown_blocks: unknownBlocks.map(toParserBlockReference),
    critical_blocks: criticalBlocks.map(toParserBlockReference),
  }
}

function toParserBlockReference(block: UiBlock) {
  return {
    block_id: block.block_id,
    component_name: block.component_name,
    block_type: block.block_type,
    raw_hash: block.raw_hash,
    line_start: block.line_start,
    line_end: block.line_end,
    warnings: block.warnings,
  }
}

export function detectUiBlockRanges(content: string): DetectedRange[] {
  const protectedRanges = codeFenceRanges(content)
  const ranges: DetectedRange[] = []

  addFencedCustomBlockRanges(content, protectedRanges, ranges)
  addJsxRanges(content, protectedRanges, ranges)
  addShortcodeRanges(content, protectedRanges, ranges)
  addDirectiveRanges(content, protectedRanges, ranges)

  return ranges
    .sort((left, right) => left.start - right.start || right.end - left.end)
    .reduce<DetectedRange[]>((acc, range) => {
      const last = acc[acc.length - 1]
      if (last && range.start < last.end) {
        if (range.end > last.end) last.end = range.end
        return acc
      }
      acc.push(range)
      return acc
    }, [])
}

function addFencedCustomBlockRanges(content: string, fencedRanges: CodeFenceRange[], ranges: DetectedRange[]) {
  for (const fence of fencedRanges) {
    const info = fence.info.trim()
    const body = content.slice(fence.bodyStart, fence.bodyEnd)
    const componentName = inferFencedComponentName(info, body)
    if (!componentName) continue
    ranges.push({
      start: fence.start,
      end: fence.end,
      componentName,
      blockType: 'fenced_custom_block',
      propsText: info || null,
      childrenRaw: body,
      confidence: 'medium',
      warnings: ['Explicit fenced UI/content block preserved as a single raw block; ordinary code fences remain protected.'],
    })
  }
}

function inferFencedComponentName(info: string, body: string) {
  const language = info.split(/\s+/)[0]?.toLowerCase() ?? ''
  if (/^(slatecamp-ui|ui-block|ui-component|component|components|interactive|interactivity|mdx-component)$/.test(language)) {
    return info.match(/(?:component|name)=["']?([A-Za-z][\w.-]*)/)?.[1] ?? language
  }
  if (/^(json|jsonc)$/.test(language) && /"(?:(?:component(?:_name)?)|block_type)"\s*:/.test(body) && /"raw_preserved"\s*:\s*true|"slatecamp_ui"\s*:\s*true/.test(body)) {
    return body.match(/"component(?:_name)?"\s*:\s*"([^"]+)"/)?.[1] ?? 'json-ui-block'
  }
  return null
}

function addJsxRanges(content: string, protectedRanges: Array<{ start: number; end: number }>, ranges: DetectedRange[]) {
  const tagRegex = /<([A-Za-z][\w]*(?:\.[A-Za-z][\w]*)*)([^<>]*?)(\/?)>/g
  let match: RegExpExecArray | null

  while ((match = tagRegex.exec(content)) !== null) {
    const [full, tagName, rawProps, slash] = match
    const start = match.index
    if (isInsideRanges(start, protectedRanges)) continue
    if (full.startsWith('</') || full.startsWith('<!--')) continue
    if (looksLikeComparison(content, start, full)) continue

    const isPascalOrNamespaced = /^[A-Z]/.test(tagName) || tagName.includes('.')
    const isHtmlBlock = RAW_HTML_BLOCKS.has(tagName.toLowerCase())
    const isVoidHtml = VOID_HTML_TAGS.has(tagName.toLowerCase())
    if (!isPascalOrNamespaced && !isHtmlBlock && !isVoidHtml) continue

    const selfClosing = slash === '/' || full.endsWith('/>') || isVoidHtml
    let end = tagRegex.lastIndex
    let childrenRaw: string | null = null
    const warnings: string[] = []
    let confidence: UiBlock['parser_confidence'] = isPascalOrNamespaced || isHtmlBlock ? 'high' : 'medium'

    if (!selfClosing) {
      const closeTag = `</${tagName}>`
      const closeIndex = content.indexOf(closeTag, tagRegex.lastIndex)
      if (closeIndex !== -1) {
        childrenRaw = content.slice(tagRegex.lastIndex, closeIndex)
        end = closeIndex + closeTag.length
      } else if (isPascalOrNamespaced) {
        const lineEnd = content.indexOf('\n', tagRegex.lastIndex)
        end = lineEnd === -1 ? content.length : lineEnd
        confidence = 'low'
        warnings.push(`No closing tag found for ${tagName}; preserved opening line as unknown custom block.`)
      } else {
        continue
      }
    }

    ranges.push({
      start,
      end,
      componentName: tagName,
      blockType: isHtmlBlock || isVoidHtml ? 'raw_html' : 'mdx_component',
      propsText: rawProps?.trim() || null,
      childrenRaw,
      confidence,
      warnings,
    })
    tagRegex.lastIndex = end
  }
}

function looksLikeComparison(content: string, start: number, full: string) {
  const before = content[start - 1] ?? ''
  const after = content[start + full.length] ?? ''
  return /\d/.test(before) && /\d/.test(after)
}

function addShortcodeRanges(content: string, protectedRanges: Array<{ start: number; end: number }>, ranges: DetectedRange[]) {
  const shortcodeRegex = /\{\{[\s\S]*?\}\}/g
  let match: RegExpExecArray | null
  while ((match = shortcodeRegex.exec(content)) !== null) {
    if (isInsideRanges(match.index, protectedRanges)) continue
    const raw = match[0]
    const name = raw.match(/^\{\{\s*([A-Za-z][\w.-]*)/)?.[1] ?? null
    ranges.push({
      start: match.index,
      end: match.index + raw.length,
      componentName: name,
      blockType: 'shortcode',
      propsText: raw.replace(/^\{\{\s*|\s*\}\}$/g, ''),
      childrenRaw: null,
      confidence: name ? 'medium' : 'low',
      warnings: name ? [] : ['Shortcode name could not be parsed; preserved as unknown block.'],
    })
  }
}

function addDirectiveRanges(content: string, protectedRanges: Array<{ start: number; end: number }>, ranges: DetectedRange[]) {
  const lineRegex = /^:::\s*([A-Za-z][\w.-]*)?[^\n]*\n/gm
  let match: RegExpExecArray | null
  while ((match = lineRegex.exec(content)) !== null) {
    const start = match.index
    if (isInsideRanges(start, protectedRanges)) continue
    const closingRegex = /^:::$/gm
    closingRegex.lastIndex = lineRegex.lastIndex
    const close = closingRegex.exec(content)
    const end = close ? close.index + close[0].length : content.indexOf('\n', lineRegex.lastIndex)
    const safeEnd = end === -1 ? content.length : end
    ranges.push({
      start,
      end: safeEnd,
      componentName: match[1] ?? null,
      blockType: 'container_directive',
      propsText: match[0].trim(),
      childrenRaw: close ? content.slice(lineRegex.lastIndex, close.index) : null,
      confidence: match[1] ? 'medium' : 'low',
      warnings: close ? [] : ['Container directive closing marker not found; preserved as unknown block.'],
    })
    lineRegex.lastIndex = safeEnd
  }
}

function parseProps(propsText: string | null): JsonObject | null {
  if (!propsText) return {}
  const props: JsonObject = {}
  let parsedAny = false
  const attrRegex = /([A-Za-z_$][\w$:-]*)\s*=\s*("[^"]*"|'[^']*'|\{[^}]*\}|[^\s"'{}]+)|\b([A-Za-z_$][\w$:-]*)\b/g
  let match: RegExpExecArray | null

  while ((match = attrRegex.exec(propsText)) !== null) {
    const key = match[1] ?? match[3]
    if (!key) continue
    if (key === 'class' || key === 'className' || key === 'style') parsedAny = true
    const rawValue = match[2]
    if (!rawValue) {
      props[key] = true
      parsedAny = true
      continue
    }
    props[key] = normalizePropValue(rawValue)
    parsedAny = true
  }

  return parsedAny ? props : null
}

function normalizePropValue(rawValue: string) {
  if ((rawValue.startsWith('"') && rawValue.endsWith('"')) || (rawValue.startsWith("'") && rawValue.endsWith("'"))) {
    return rawValue.slice(1, -1)
  }
  if (rawValue.startsWith('{') && rawValue.endsWith('}')) return rawValue
  if (rawValue === 'true') return true
  if (rawValue === 'false') return false
  if (/^-?\d+(\.\d+)?$/.test(rawValue)) return Number(rawValue)
  return rawValue
}

function summarizeProps(props: JsonObject) {
  const entries = Object.entries(props).slice(0, 12)
  if (entries.length === 0) return '(none)'
  return entries.map(([key, value]) => `${key}=${JSON.stringify(value)}`).join(', ')
}

function extractReadableText(raw: string | null) {
  if (!raw) return null
  const text = raw
    .replace(/<[^>]+>/g, ' ')
    .replace(/\{[^}]*\}/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
  return text ? text.slice(0, 500) : null
}

function makePlaceholder({
  blockId,
  componentName,
  status,
  propsSummary,
  childrenText,
}: {
  blockId: string
  componentName: string
  status: UiBlock['status']
  propsSummary: string | null | undefined
  childrenText: string | null | undefined
}) {
  const lines = [
    `${UI_PLACEHOLDER_OPEN}${blockId} component="${escapeAttribute(componentName)}" status="${status}"]`,
    'Extracted summary:',
    `- Props: ${propsSummary || '(none detected)'}`,
    `- Text: ${childrenText || '(none detected)'}`,
    UI_PLACEHOLDER_CLOSE,
  ]
  return lines.join('\n')
}

function escapeAttribute(value: string) {
  return value.replace(/"/g, '&quot;')
}

export function normalizeUiBlockId(blockId: string) {
  return blockId.replace(/^block_/, 'ui_')
}

function legacyUiBlockId(blockId: string) {
  return blockId.replace(/^ui_/, 'block_')
}

function uiBlockIdAliases(blockId: string) {
  const normalized = normalizeUiBlockId(blockId)
  const legacy = legacyUiBlockId(normalized)
  return [...new Set([blockId, normalized, legacy])]
}

export function normalizeUiBlockRecord(block: UiBlock): UiBlock {
  const props = block.props ?? block.props_json ?? null
  return {
    ...block,
    block_id: normalizeUiBlockId(block.block_id),
    props,
    props_json: props,
  }
}

export function placeholderRegex() {
  // Matches both:
  // 1. Self-closing: [SLATECAMP_UI_BLOCK:ui_0001 component="Name" status="preserved"]
  // 2. Block: [SLATECAMP_UI_BLOCK:ui_0001]...[/SLATECAMP_UI_BLOCK]
  return /\[SLATECAMP_UI_BLOCK:((?:ui|block)_\d{4})[^\]]*\](?:[\s\S]*?\[\/SLATECAMP_UI_BLOCK\])?/g
}

export function containsRawSlatecampUiBlockPlaceholder(content?: string | null): boolean {
  if (!content) return false
  return placeholderRegex().test(content)
}

export function findPlaceholders(content: string) {
  const placeholders: Array<{ blockId: string; raw: string; start: number; end: number }> = []
  const regex = placeholderRegex()
  let match: RegExpExecArray | null
  while ((match = regex.exec(content)) !== null) {
    placeholders.push({ blockId: match[1], raw: match[0], start: match.index, end: match.index + match[0].length })
  }
  return placeholders
}

export function composeCandidate({
  normalized,
  uiBlocks,
  original,
}: {
  normalized: string
  uiBlocks: UiBlocksFile
  original?: string | null
}): { candidate: string; report: ComposeReport } {
  const blocks = uiBlocks.blocks.map(normalizeUiBlockRecord)
  const blocksById = new Map<string, UiBlock>()
  for (const block of blocks) {
    for (const alias of uiBlockIdAliases(block.block_id)) blocksById.set(alias, block)
  }
  const placeholders = findPlaceholders(normalized)
  const unresolved: string[] = []
  const used = new Set<string>()
  let candidate = ''
  let cursor = 0

  for (const placeholder of placeholders) {
    const block = blocksById.get(placeholder.blockId)
    candidate += normalized.slice(cursor, placeholder.start)
    if (!block) {
      unresolved.push(placeholder.blockId)
      candidate += placeholder.raw
    } else {
      candidate += block.raw
      used.add(block.block_id)
    }
    cursor = placeholder.end
  }
  candidate += normalized.slice(cursor)

  const unusedBlocks = blocks.map((block) => block.block_id).filter((blockId) => !used.has(blockId))
  const blockers = [...unresolved.map((blockId) => `Unresolved placeholder ${blockId}`)]
  const warnings = unusedBlocks.map((blockId) => `UI block ${blockId} was not used during composition.`)
  const originalHash = original != null ? sha256(original) : null
  const candidateHash = sha256(candidate)
  const report: ComposeReport = {
    article_id: uiBlocks.article_id,
    slug: uiBlocks.slug,
    generated_at: nowIso(),
    original_hash: originalHash,
    normalized_hash: sha256(normalized),
    candidate_hash: candidateHash,
    ui_blocks_count: blocks.length,
    placeholders_found: placeholders.length,
    placeholders_resolved: placeholders.length - unresolved.length,
    unresolved_placeholders: unresolved,
    unused_blocks: unusedBlocks,
    preserved_blocks_reinserted: blocks.filter((block) => candidate.includes(block.raw)).length,
    candidate_matches_original: originalHash ? candidateHash === originalHash : null,
    safe_to_diff: blockers.length === 0,
    blockers,
    warnings,
  }
  return { candidate, report }
}

export function diffCandidate({
  metadata,
  original,
  normalized,
  candidate,
  uiBlocks,
}: {
  metadata: ArticleMetadata
  original: string
  normalized?: string | null
  candidate: string
  uiBlocks?: UiBlocksFile | null
}): DiffReport {
  const oldHash = sha256(original)
  const newHash = sha256(candidate)
  const lineStats = summarizeLineDiff(original, candidate)
  const unresolvedPlaceholders = candidate.includes(UI_PLACEHOLDER_OPEN) ? findPlaceholders(candidate).length || 1 : 0
  const blocks = uiBlocks?.blocks.map(normalizeUiBlockRecord) ?? []
  const missingBlocks = blocks.filter((block) => !candidate.includes(block.raw))
  const changedUiBlocks = missingBlocks.length
  const blockers: string[] = []
  const warnings: string[] = []

  if (unresolvedPlaceholders > 0) blockers.push('Candidate contains unresolved UI block placeholders.')
  if (missingBlocks.length > 0) blockers.push(`Candidate is missing ${missingBlocks.length} preserved UI block(s).`)
  if (oldHash !== metadata.original_content_hash && oldHash !== metadata.content_hash) {
    blockers.push('original.md hash does not match article metadata export hash.')
  }
  if (!candidate) blockers.push('candidate.md is empty or missing.')
  if (blocks.some((block) => block.status === 'parse_error')) blockers.push('ui-blocks.json contains parse_error blocks.')
  if (blocks.some((block) => block.status === 'unknown' || block.parse_status === 'unknown_block')) {
    warnings.push('ui-blocks.json contains unknown custom blocks; push requires review or --force.')
  }
  warnings.push('Remote stale check has not been run by diff; push command must verify Supabase before mutation.')

  const locallySafe = blockers.length === 0
  return {
    article_id: metadata.article_id,
    slug: metadata.slug,
    generated_at: nowIso(),
    old_hash: oldHash,
    new_hash: newHash,
    original_hash: oldHash,
    normalized_hash: normalized ? sha256(normalized) : null,
    candidate_hash: newHash,
    changed: oldHash !== newHash,
    changed_line_count: lineStats.changed,
    inserted_line_count: lineStats.inserted,
    deleted_line_count: lineStats.deleted,
    ui_blocks_original_count: blocks.length,
    ui_blocks_candidate_count: blocks.filter((block) => candidate.includes(block.raw)).length,
    ui_blocks_changed_count: changedUiBlocks,
    ui_blocks_count: blocks.length,
    unresolved_placeholders_count: unresolvedPlaceholders,
    preserved_blocks_count: blocks.filter((block) => candidate.includes(block.raw)).length,
    changed_text_summary: lineStats,
    changed_ui_blocks_summary: {
      missing_block_ids: missingBlocks.map((block) => block.block_id),
      changed_count: changedUiBlocks,
    },
    locally_safe_to_push: locallySafe,
    safe_to_push: locallySafe,
    blockers,
    warnings,
    summary: locallySafe ? 'Locally safe after recomposition; remote stale check still required before push.' : `Unsafe: ${blockers.join('; ')}`,
  }
}

export function buildDiffMarkdown(report: DiffReport) {
  return [
    `# Content Diff Report: ${report.slug ?? report.article_id}`,
    '',
    `Generated: ${report.generated_at}`,
    `Article ID: ${report.article_id}`,
    `Changed: ${report.changed}`,
    `Safe to push locally: ${report.safe_to_push}`,
    '',
    '## Hashes',
    '',
    `- Original: \`${report.original_hash}\``,
    `- Normalized: \`${report.normalized_hash ?? 'not available'}\``,
    `- Candidate: \`${report.candidate_hash}\``,
    '',
    '## Line summary',
    '',
    `- Changed lines: ${report.changed_line_count}`,
    `- Inserted lines: ${report.inserted_line_count}`,
    `- Deleted lines: ${report.deleted_line_count}`,
    '',
    '## UI block preservation',
    '',
    `- UI blocks expected: ${report.ui_blocks_count}`,
    `- UI blocks preserved: ${report.preserved_blocks_count}`,
    `- UI blocks changed/missing: ${report.ui_blocks_changed_count}`,
    `- Unresolved placeholders: ${report.unresolved_placeholders_count}`,
    '',
    '## Blockers',
    '',
    ...(report.blockers.length ? report.blockers.map((blocker) => `- ${blocker}`) : ['- None']),
    '',
    '## Warnings',
    '',
    ...(report.warnings.length ? report.warnings.map((warning) => `- ${warning}`) : ['- None']),
    '',
  ].join('\n')
}

export function buildUiBlockEditsFile(result: NormalizeResult) {
  return {
    article_id: result.article_id,
    slug: result.slug,
    generated_at: nowIso(),
    parser_version: result.uiBlocks.parser_version,
    edit_count: 0,
    edits: [] as JsonObject[],
    warnings: [
      'Intentional UI block edits are not part of the current milestone. Preserve raw UI block content unless a future audited workflow explicitly records edits here.',
    ],
  }
}

export function buildComposeErrorFile({
  articleId,
  slug,
  report,
  error,
}: {
  articleId: string | null
  slug: string | null
  report?: ComposeReport | null
  error?: unknown
}) {
  const message = error instanceof Error ? error.message : error == null ? null : String(error)
  return {
    article_id: articleId,
    slug,
    generated_at: nowIso(),
    safe_to_write_candidate: false,
    blockers: report?.blockers ?? (message ? [message] : []),
    warnings: report?.warnings ?? [],
    report: report ?? null,
  }
}

export async function writeRunLog(root: string, runId: string, value: JsonObject) {
  await writeJson(path.join(root, 'runs', runId, 'run-log.json'), {
    run_id: runId,
    generated_at: nowIso(),
    ...value,
  })
}

export function assertBulkApplyConfirmation(options: Pick<CliOptions, 'allSafe' | 'apply' | 'confirm'>) {
  if (options.allSafe && options.apply === true && options.confirm !== BULK_APPLY_CONFIRMATION) {
    throw new Error(`Bulk --all-safe --apply requires --confirm "${BULK_APPLY_CONFIRMATION}".`)
  }
}

function summarizeLineDiff(original: string, candidate: string) {
  const originalLines = original.split('\n')
  const candidateLines = candidate.split('\n')
  const max = Math.max(originalLines.length, candidateLines.length)
  let changed = 0
  for (let index = 0; index < max; index += 1) {
    if (originalLines[index] !== candidateLines[index]) changed += 1
  }
  return {
    changed,
    inserted: Math.max(0, candidateLines.length - originalLines.length),
    deleted: Math.max(0, originalLines.length - candidateLines.length),
    original_line_count: originalLines.length,
    candidate_line_count: candidateLines.length,
  }
}


export async function updateArticleContentIfUnchanged({
  supabase,
  articleId,
  originalContent,
  updatePayload,
}: {
  supabase: any
  articleId: string
  originalContent: string
  updatePayload: JsonObject
}) {
  const { data, error } = await supabase
    .from('wiki_articles')
    .update(updatePayload)
    .eq('article_id', articleId)
    .eq('content', originalContent)
    .select('article_id,updated_at')

  if (error) throw new Error(`Failed to update wiki_articles.content: ${error.message}`)

  const updatedRows = data ?? []
  if (updatedRows.length !== 1) {
    throw new Error(`Stale-safe update affected ${updatedRows.length} rows; expected exactly 1. Remote content may have changed since export.`)
  }

  return updatedRows
}

export function evaluatePushSafety(input: PushSafetyInput): PushSafetyResult {
  const originalHash = sha256(input.original)
  const candidateHash = input.candidate == null ? null : sha256(input.candidate)
  const remoteHash = input.remoteContent == null ? null : sha256(input.remoteContent)
  const blockers: string[] = []
  const warnings: string[] = []

  if (!input.candidate) blockers.push('candidate.md is missing.')

  const candidateHasPlaceholders = containsRawSlatecampUiBlockPlaceholder(input.candidate)
  const remoteHasPlaceholders = containsRawSlatecampUiBlockPlaceholder(input.remoteContent)
  const isRepairScenario = input.repairPlaceholders === true && remoteHasPlaceholders && !candidateHasPlaceholders

  if (input.apply && candidateHash != null && candidateHash === originalHash && !isRepairScenario) {
    blockers.push('candidate.md matches original.md; refusing no-op apply.')
  }
  if (originalHash !== input.metadata.original_content_hash && originalHash !== input.metadata.content_hash) {
    blockers.push('original.md hash does not match article metadata export hash.')
  }

  if (candidateHasPlaceholders) {
    blockers.push('candidate.md contains raw SLATECAMP_UI_BLOCK placeholders; run compose-candidates before push.')
  }
  if (remoteHasPlaceholders) {
    warnings.push('Remote Supabase content contains raw SLATECAMP_UI_BLOCK placeholders and should be repaired from candidate.md.')
  }

  let staleCheckPassed = false
  if (remoteHash == null) {
    blockers.push('Remote content was not fetched; stale check cannot pass.')
  } else {
    if (isRepairScenario) {
      staleCheckPassed = true
      warnings.push('Stale check bypassed in repair mode: remote content is placeholder-corrupted; explicit placeholder repair.')
    } else if (remoteHash === input.metadata.original_content_hash || remoteHash === originalHash) {
      staleCheckPassed = true
    } else {
      blockers.push('Remote Supabase content differs from export baseline; refusing stale push.')
    }
  }

  if (!input.diffReport) blockers.push('diff-report.json is missing.')
  if (input.diffReport && !input.diffReport.safe_to_push) blockers.push('diff-report.json marks candidate unsafe.')
  if (input.diffReport && input.diffReport.unresolved_placeholders_count > 0) blockers.push('Candidate has unresolved placeholders.')
  if (input.diffReport && input.diffReport.ui_blocks_changed_count > 0) blockers.push('UI block preservation failed.')
  if (!input.uiBlocks) blockers.push('ui-blocks.json is missing.')
  if (input.uiBlocks?.unresolved_critical_blocks?.length) blockers.push('ui-blocks.json contains unresolved critical blocks.')
  if (!input.force && input.uiBlocks?.blocks.some((block) => block.status === 'unknown' || block.parse_status === 'unknown_block')) {
    blockers.push('ui-blocks.json contains unknown/unparseable blocks; rerun with --force only after manual review.')
  }
  if (!input.apply) warnings.push('Dry-run mode: no Supabase mutation will be performed.')

  return {
    dry_run: input.dryRun || !input.apply,
    apply: input.apply,
    remote_hash_before: remoteHash,
    original_hash: originalHash,
    candidate_hash: candidateHash,
    stale_check_passed: staleCheckPassed,
    pushed: false,
    blockers,
    warnings,
  }
}

export function extractComponentNamesFromArticle(content: string) {
  const protectedRanges = codeFenceRanges(content)
  const names = new Set<string>()
  const unknown = new Set<string>()
  const tagRegex = /<([A-Za-z][\w]*(?:\.[A-Za-z][\w]*)*)(?:\s[^<>]*?)?\/?>(?!`)/g
  let match: RegExpExecArray | null

  while ((match = tagRegex.exec(content)) !== null) {
    if (isInsideRanges(match.index, protectedRanges)) continue
    const tagName = match[1]
    if (/^[A-Z]/.test(tagName) || tagName.includes('.')) names.add(tagName)
    else if (RAW_HTML_BLOCKS.has(tagName.toLowerCase())) unknown.add(tagName)
  }

  const shortcodeRegex = /\{\{\s*([A-Za-z][\w.-]*)/g
  while ((match = shortcodeRegex.exec(content)) !== null) {
    if (!isInsideRanges(match.index, protectedRanges)) names.add(match[1])
  }

  return { names: [...names].sort(), unknown: [...unknown].sort() }
}

export function scanComponentInventory(repoRoot = process.cwd(), exportRoot = path.resolve(repoRoot, DEFAULT_OUTPUT_ROOT)) {
  const files = collectSourceFiles(repoRoot)
  const components = files.flatMap((filePath) => extractComponentsFromFile(repoRoot, filePath))
  const componentsByName = new Map(components.map((component) => [component.component_name, component]))
  const articleUsage = scanArticleComponentUsage(exportRoot, componentsByName)
  const usedNames = new Set(articleUsage.usage.flatMap((article) => article.components.map((component) => component.component_name)))
  const likelyArticleComponents = components.filter((component) => component.is_candidate_for_article_embed)
  const unknownComponents = [...new Set(articleUsage.usage.flatMap((article) => article.unknown_components))].sort()

  return {
    generated_at: nowIso(),
    repo_root: repoRoot,
    components,
    component_files: files.map((filePath) => ({
      file_path: path.relative(repoRoot, filePath),
      component_count: components.filter((component) => path.resolve(repoRoot, component.file_path) === filePath).length,
    })),
    article_usage: articleUsage,
    unknown_components: unknownComponents,
    audit_report: {
      generated_at: nowIso(),
      total_tsx_jsx_files_scanned: files.filter((file) => /\.[tj]sx$/.test(file)).length,
      total_source_files_scanned: files.length,
      total_components_detected: components.length,
      likely_article_components: likelyArticleComponents.length,
      components_used_in_articles: [...usedNames].filter((name) => componentsByName.has(name)).sort(),
      components_not_used_in_articles: components.map((component) => component.component_name).filter((name) => !usedNames.has(name)).sort(),
      unknown_components_found_in_articles: unknownComponents,
      articles_with_custom_ui: articleUsage.articles_with_components,
      articles_without_custom_ui: articleUsage.articles_plain_markdown,
      warnings: articleUsage.usage.length === 0 ? ['No exported article bundles found; usage report is empty.'] : [],
    },
  }
}

function collectSourceFiles(repoRoot: string) {
  const roots = ['src', 'components', 'app', 'lib', 'features', 'content']
  const extensions = new Set(['.tsx', '.jsx', '.ts', '.js', '.mdx'])
  const excluded = new Set(['node_modules', '.next', 'dist', 'build', 'coverage', '.git', '.ai/content-audit-export', 'storybook-static', 'flowbite', '.omx', '.code-review-graph', '.gitnexus'])
  const files: string[] = []

  for (const rootName of roots) {
    const rootPath = path.join(repoRoot, rootName)
    if (!existsSync(rootPath)) continue
    walk(rootPath)
  }

  function walk(currentPath: string) {
    const relative = path.relative(repoRoot, currentPath)
    if ([...excluded].some((item) => relative === item || relative.startsWith(`${item}${path.sep}`))) return
    const stats = statSync(currentPath)
    if (stats.isDirectory()) {
      for (const entry of readdirSync(currentPath)) walk(path.join(currentPath, entry))
      return
    }
    if (stats.isFile() && /\.(test|spec)\.[tj]sx?$/.test(path.basename(currentPath))) return
    if (stats.isFile() && extensions.has(path.extname(currentPath))) files.push(currentPath)
  }

  return files.sort()
}

interface ComponentInventoryRecord {
  component_name: string
  file_path: string
  export_type: 'default' | 'named' | 'anonymous_default' | 'unknown'
  props_type_name: string | null
  props_fields: string[]
  prop_names: string[]
  required_props: string[]
  optional_props: string[]
  child_support: 'yes' | 'no' | 'unknown'
  imports: string[]
  used_components: string[]
  has_interactivity: boolean
  uses_client_directive: boolean
  uses_state: boolean
  uses_effect: boolean
  uses_canvas_or_svg: boolean
  uses_threejs: boolean
  uses_framer_motion: boolean
  uses_radix_or_dialog: boolean
  uses_charting: boolean
  uses_supabase: boolean
  uses_questions: boolean
  uses_article_id: boolean
  likely_category: string
  likely_article_embeddable: boolean
  is_candidate_for_article_embed: boolean
  confidence: 'low' | 'medium' | 'high'
  reason: string
  notes: string[]
  evidence: string[]
  raw_snippet: string
}

function extractComponentsFromFile(repoRoot: string, filePath: string): ComponentInventoryRecord[] {
  const source = readFileSync(filePath, 'utf-8')
  const relativePath = path.relative(repoRoot, filePath)
  const imports = [...source.matchAll(/import[\s\S]*?from\s+['"]([^'"]+)['"]/g)].map((match) => match[1])
  const propTypes = parsePropTypes(source)
  const candidates: Array<{ name: string; exportType: ComponentInventoryRecord['export_type']; index: number; propsTypeName: string | null }> = []

  for (const match of source.matchAll(/export\s+default\s+function\s+([A-Z][A-Za-z0-9_]*)\s*\(([^)]*)\)/g)) {
    candidates.push({ name: match[1], exportType: 'default', index: match.index ?? 0, propsTypeName: extractPropsType(match[2]) })
  }
  for (const match of source.matchAll(/export\s+function\s+([A-Z][A-Za-z0-9_]*)\s*\(([^)]*)\)/g)) {
    candidates.push({ name: match[1], exportType: 'named', index: match.index ?? 0, propsTypeName: extractPropsType(match[2]) })
  }
  for (const match of source.matchAll(/export\s+const\s+([A-Z][A-Za-z0-9_]*)\s*(?::[^=]+)?=\s*(?:\(([^)]*)\)|([^=]*)=>)/g)) {
    candidates.push({ name: match[1], exportType: 'named', index: match.index ?? 0, propsTypeName: extractPropsType(match[2] ?? '') })
  }
  for (const match of source.matchAll(/export\s*\{([^}]+)\}/g)) {
    for (const exportName of match[1].split(',').map((part) => part.trim().split(/\s+as\s+/).pop()?.trim()).filter(Boolean)) {
      if (exportName && /^[A-Z]/.test(exportName)) {
        const localMatch = source.match(new RegExp(`(?:function|const)\\s+${exportName}\\s*(?:=|\\()`, 'm'))
        candidates.push({ name: exportName, exportType: 'named', index: localMatch?.index ?? match.index ?? 0, propsTypeName: inferPropsTypeFromName(exportName, propTypes) })
      }
    }
  }
  if (/export\s+default\s+(?:memo\()?\s*\(/.test(source)) {
    candidates.push({ name: pascalCase(path.basename(filePath, path.extname(filePath))), exportType: 'anonymous_default', index: source.indexOf('export default'), propsTypeName: null })
  }

  const unique = new Map<string, ComponentInventoryRecord>()
  for (const candidate of candidates) {
    if (/^[A-Z0-9_]+$/.test(candidate.name)) continue
    const propsTypeName = candidate.propsTypeName ?? inferPropsTypeFromName(candidate.name, propTypes)
    const propInfo = propsTypeName ? propTypes.get(propsTypeName) : undefined
    const evidence = buildComponentEvidence(source, relativePath, candidate.name, imports)
    const category = classifyComponent(relativePath, source, candidate.name)
    const confidence = evidence.length >= 4 ? 'high' : evidence.length >= 2 ? 'medium' : 'low'
    const record: ComponentInventoryRecord = {
      component_name: candidate.name,
      file_path: relativePath,
      export_type: candidate.exportType,
      props_type_name: propsTypeName,
      props_fields: propInfo?.fields ?? [],
      prop_names: propInfo?.fields ?? [],
      required_props: propInfo?.required ?? [],
      optional_props: propInfo?.optional ?? [],
      child_support: propInfo?.fields.includes('children') ? 'yes' : 'unknown',
      imports,
      used_components: [...new Set([...source.matchAll(/<([A-Z][A-Za-z0-9_]*)\b/g)].map((match) => match[1]).filter((name) => name !== candidate.name))].sort(),
      has_interactivity: /onClick|onChange|useState|useReducer|drag|pointer|hover|interactive/i.test(source),
      uses_client_directive: /^['"]use client['"]/m.test(source),
      uses_state: /useState|useReducer|zustand|create\(/.test(source),
      uses_effect: /useEffect|useLayoutEffect/.test(source),
      uses_canvas_or_svg: /<canvas|<svg|Canvas|three/i.test(source),
      uses_threejs: /three|@react-three|@react-three\/fiber|@react-three\/drei/i.test(source),
      uses_framer_motion: /framer-motion|motion\./.test(source),
      uses_radix_or_dialog: /@radix-ui|Dialog|Popover|Tooltip/.test(source),
      uses_charting: /recharts|chart|Chart|LineChart|BarChart|PieChart/.test(source),
      uses_supabase: /supabase|createClient/.test(source),
      uses_questions: /question|quiz|prompt/i.test(source),
      uses_article_id: /article_id|articleId/.test(source),
      likely_category: category,
      likely_article_embeddable: evidence.some((item) => item.includes('article') || item.includes('learning') || item.includes('interactive')),
      is_candidate_for_article_embed: evidence.some((item) => item.includes('article') || item.includes('learning') || item.includes('interactive')),
      confidence,
      reason: evidence.join('; ') || 'Exported React-shaped component detected.',
      notes: [],
      evidence,
      raw_snippet: source.slice(candidate.index, candidate.index + 500),
    }
    unique.set(`${record.file_path}:${record.component_name}:${record.export_type}`, record)
  }
  return [...unique.values()]
}

function parsePropTypes(source: string) {
  const propTypes = new Map<string, { fields: string[]; required: string[]; optional: string[] }>()
  const typeRegex = /(interface|type)\s+([A-Z][A-Za-z0-9_]*(?:Props|Properties)?)\s*(?:=)?\s*\{([\s\S]*?)\n\}/g
  let match: RegExpExecArray | null
  while ((match = typeRegex.exec(source)) !== null) {
    const fields: string[] = []
    const required: string[] = []
    const optional: string[] = []
    for (const field of match[3].matchAll(/^\s*([A-Za-z_$][\w$]*)\??\s*:/gm)) {
      fields.push(field[1])
      if (field[0].includes('?')) optional.push(field[1])
      else required.push(field[1])
    }
    propTypes.set(match[2], { fields, required, optional })
  }
  return propTypes
}

function extractPropsType(params: string) {
  return params.match(/:\s*([A-Z][A-Za-z0-9_]*(?:Props|Properties)?)/)?.[1] ?? null
}

function inferPropsTypeFromName(componentName: string, propTypes: Map<string, { fields: string[]; required: string[]; optional: string[] }>) {
  const candidates = [`${componentName}Props`, 'Props']
  return candidates.find((name) => propTypes.has(name)) ?? null
}

function buildComponentEvidence(source: string, relativePath: string, name: string, imports: string[]) {
  const evidence: string[] = []
  if (/wiki|article|content|lesson|learning|quiz|question|prompt|callout|diagram|interactive/i.test(relativePath)) evidence.push('path suggests article/learning usage')
  if (/interactive|diagram|explorer|quiz|question|callout|scenario|timeline|formula|comparison/i.test(name)) evidence.push('component name suggests learning/interactive use')
  if (/children|title|description|summary|content|items|steps|question/i.test(source)) evidence.push('props/source include content-shaped fields')
  if (imports.some((item) => /framer|three|recharts|radix|lucide|d3/.test(item))) evidence.push('imports suggest rich UI behavior')
  if (/article_id|articleId|wiki_articles|markdown|mdx/i.test(source)) evidence.push('source references article rendering/data')
  return evidence
}

function classifyComponent(relativePath: string, source: string, name: string) {
  const haystack = `${relativePath} ${source.slice(0, 3000)} ${name}`.toLowerCase()
  if (/quiz|question|prompt/.test(haystack)) return 'quiz_or_prompt'
  if (/scenario/.test(haystack)) return 'scenario'
  if (/timeline/.test(haystack)) return 'timeline'
  if (/formula|calculator|calc/.test(haystack)) return 'formula'
  if (/diagram|svg|canvas|three|3d/.test(haystack)) return 'diagram'
  if (/compare|comparison|table/.test(haystack)) return 'comparison'
  if (/code|requirement|law|citation/.test(haystack)) return 'code_requirement'
  if (/callout|alert|note/.test(haystack)) return 'callout'
  if (/interactive|slider|drag|state/.test(haystack)) return 'interactive_learning'
  if (/layout|shell|page/.test(haystack)) return 'layout'
  return 'unknown'
}

function pascalCase(value: string) {
  return value
    .split(/[^A-Za-z0-9]+/)
    .filter(Boolean)
    .map((part) => part[0]?.toUpperCase() + part.slice(1))
    .join('') || 'AnonymousComponent'
}

function scanArticleComponentUsage(exportRoot: string, componentsByName: Map<string, ComponentInventoryRecord>): ComponentUsageReport {
  const usage = discoverArticleDirs(exportRoot).map<ArticleComponentUsage>((articleDir) => {
    const metadata = JSON.parse(readFileSync(path.join(articleDir, 'article-metadata.json'), 'utf-8')) as ArticleMetadata
    const originalPath = path.join(articleDir, 'original.md')
    const uiBlocksPath = path.join(articleDir, 'ui-blocks.json')
    const original = existsSync(originalPath) ? readFileSync(originalPath, 'utf-8') : ''
    const detected = extractComponentNamesFromArticle(original)
    const blockIdsByComponent = new Map<string, string[]>()
    let uiBlockCount = detectUiBlockRanges(original).length
    let normalizedStatus = 'not_started'
    if (existsSync(uiBlocksPath)) {
      const uiBlocks = JSON.parse(readFileSync(uiBlocksPath, 'utf-8')) as UiBlocksFile
      uiBlockCount = uiBlocks.total_blocks
      normalizedStatus = uiBlocks.unresolved_critical_blocks.length ? 'failed' : uiBlocks.unknown_blocks.length ? 'warnings' : 'passed'
      for (const block of uiBlocks.blocks) {
        if (!block.component_name) continue
        const blockIds = blockIdsByComponent.get(block.component_name) ?? []
        blockIds.push(block.block_id)
        blockIdsByComponent.set(block.component_name, blockIds)
      }
    }
    const componentNames = [...new Set([...detected.names, ...blockIdsByComponent.keys()])].sort()
    const components = componentNames.map((componentName) => {
      const component = componentsByName.get(componentName)
      return {
        component_name: componentName,
        block_ids: blockIdsByComponent.get(componentName) ?? [],
        found_in_repo: component != null,
        file_path: component?.file_path ?? null,
      }
    })
    const unknownComponents = [...new Set([
      ...componentNames.filter((name) => !componentsByName.has(name)),
      ...detected.unknown,
    ])].sort()

    return {
      article_id: metadata.article_id,
      slug: metadata.slug,
      title: metadata.title,
      component_count: components.length,
      components,
      unknown_components: unknownComponents,
      custom_ui_block_count: uiBlockCount,
      normalized_status: normalizedStatus,
      components_detected: components.filter((component) => component.found_in_repo).map((component) => component.component_name),
      unknown_components_detected: unknownComponents,
    }
  })

  const articleCountByComponent = new Map<string, { articleIds: Set<string>; foundInRepo: boolean; filePath: string | null }>()
  for (const article of usage) {
    for (const component of article.components) {
      const existing = articleCountByComponent.get(component.component_name) ?? {
        articleIds: new Set<string>(),
        foundInRepo: component.found_in_repo,
        filePath: component.file_path,
      }
      existing.articleIds.add(article.article_id)
      existing.foundInRepo ||= component.found_in_repo
      existing.filePath ??= component.file_path
      articleCountByComponent.set(component.component_name, existing)
    }
  }

  const articlesWithComponents = usage.filter((article) =>
    article.component_count > 0 ||
    article.unknown_components.length > 0 ||
    article.custom_ui_block_count > 0,
  ).length

  return {
    generated_at: nowIso(),
    article_count: usage.length,
    articles_with_components: articlesWithComponents,
    articles_plain_markdown: usage.length - articlesWithComponents,
    usage,
    components_used_across_articles: [...articleCountByComponent.entries()]
      .map(([componentName, value]) => ({
        component_name: componentName,
        article_count: value.articleIds.size,
        found_in_repo: value.foundInRepo,
        file_path: value.filePath,
      }))
      .sort((left, right) => right.article_count - left.article_count || left.component_name.localeCompare(right.component_name)),
    articles: usage,
  }
}

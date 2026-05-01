import { mkdir, mkdtemp, writeFile } from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { describe, expect, test } from 'bun:test'
import {
  ArticleMetadata,
  BULK_APPLY_CONFIRMATION,
  UiBlocksFile,
  assertBulkApplyConfirmation,
  buildParserErrorsFile,
  composeCandidate,
  diffCandidate,
  evaluatePushSafety,
  findPlaceholders,
  normalizeArticleContent,
  parseArgs,
  readSyncState,
  scanComponentInventory,
  sha256,
  shouldExportChangedArticle,
  updateArticleSyncState,
  updateArticleContentIfUnchanged,
} from './lib'

function metadata(content = '# Title\n') : ArticleMetadata {
  return {
    article_id: 'article-1',
    title: 'Title',
    slug: 'title',
    subject_label: null,
    difficulty_label: null,
    status: 'draft',
    reviewed_at: null,
    reviewed_by: null,
    updated_at: '2026-05-01T00:00:00.000Z',
    content_hash: sha256(content),
    original_content_hash: sha256(content),
    normalized_content_hash: null,
    candidate_content_hash: null,
    ui_blocks_hash: null,
    linked_questions_hash: sha256('[]'),
    sources_hash: sha256('[]'),
    hash_algorithm: 'sha256',
    exported_at: '2026-05-01T00:00:00.000Z',
    export_run_id: 'test-run',
    export_version: 'test',
    source_table: 'wiki_articles',
    source_count: 0,
    linked_question_count: 0,
    taxonomy_node_count: 0,
    taxonomy_count: 0,
    parser_status: 'not_started',
    content_complexity: 'unknown',
  }
}

describe('content-audit normalization', () => {
  test('normal markdown remains unchanged', () => {
    const original = '# Heading\n\nPlain **markdown** with a list:\n\n- One\n- Two\n'
    const result = normalizeArticleContent(original, metadata(original))
    expect(result.normalized).toBe(original)
    expect(result.uiBlocks.total_blocks).toBe(0)
  })

  test('self-closing component is extracted and preserved', () => {
    const original = 'Before\n<RampInteractiveDiagram slope="1:12" width="1200mm" />\nAfter'
    const result = normalizeArticleContent(original, metadata(original))
    expect(result.uiBlocks.total_blocks).toBe(1)
    expect(result.uiBlocks.blocks[0].raw).toBe('<RampInteractiveDiagram slope="1:12" width="1200mm" />')
    expect(result.normalized).toContain('[SLATECAMP_UI_BLOCK:ui_0001')
    expect(result.normalized).toContain('slope="1:12"')
    expect(result.uiBlocks.blocks[0].props_json).toEqual(result.uiBlocks.blocks[0].props)
  })

  test('paired component with children is extracted and recomposed', () => {
    const original = 'A\n<Callout tone="warning">Ramps must be safe.</Callout>\nB'
    const normalized = normalizeArticleContent(original, metadata(original))
    expect(normalized.uiBlocks.blocks[0].children_text).toContain('Ramps must be safe.')
    const { candidate, report } = composeCandidate({ normalized: normalized.normalized, uiBlocks: normalized.uiBlocks, original })
    expect(report.blockers).toEqual([])
    expect(candidate).toBe(original)
  })

  test('code fence containing component syntax is not extracted', () => {
    const original = '```tsx\n<ComponentExample />\n```\n\nOutside text'
    const result = normalizeArticleContent(original, metadata(original))
    expect(result.uiBlocks.total_blocks).toBe(0)
    expect(result.normalized).toBe(original)
  })

  test('explicit fenced UI blocks are preserved while ordinary json fences are untouched', () => {
    const ordinary = '```json\n{ "component": "LooksLikeUi" }\n```'
    expect(normalizeArticleContent(ordinary, metadata(ordinary)).uiBlocks.total_blocks).toBe(0)

    const explicit = 'Before\n```component name="InteractiveSlope"\n{ "slope": "1:12" }\n```\nAfter'
    const explicitResult = normalizeArticleContent(explicit, metadata(explicit))
    expect(explicitResult.uiBlocks.total_blocks).toBe(1)
    expect(explicitResult.uiBlocks.blocks[0].block_type).toBe('fenced_custom_block')
    expect(explicitResult.uiBlocks.blocks[0].component_name).toBe('InteractiveSlope')
    expect(explicitResult.uiBlocks.blocks[0].raw).toContain('```component')

    const jsonUi = '```json\n{ "component_name": "ChartBlock", "raw_preserved": true }\n```'
    const jsonResult = normalizeArticleContent(jsonUi, metadata(jsonUi))
    expect(jsonResult.uiBlocks.total_blocks).toBe(1)
    expect(jsonResult.uiBlocks.blocks[0].component_name).toBe('ChartBlock')
  })

  test('unknown custom block is preserved and flagged', () => {
    const original = 'Start\n<BrokenWidget value="x">\nEnd'
    const result = normalizeArticleContent(original, metadata(original))
    expect(result.uiBlocks.total_blocks).toBe(1)
    expect(result.uiBlocks.blocks[0].status).toBe('unknown')
    expect(result.uiBlocks.blocks[0].raw).toContain('<BrokenWidget')
    const parserErrors = buildParserErrorsFile(result)
    expect(parserErrors.unknown_block_count).toBe(1)
    expect(parserErrors.warnings[0].block_id).toBe('ui_0001')
  })
})

describe('content-audit compose/diff/push safety', () => {
  test('placeholder parsing accepts current ui ids and legacy block ids', () => {
    const content = [
      '[SLATECAMP_UI_BLOCK:ui_0001 component="A" status="preserved"]',
      '[/SLATECAMP_UI_BLOCK]',
      '[SLATECAMP_UI_BLOCK:block_0002 component="B" status="preserved"]',
      '[/SLATECAMP_UI_BLOCK]',
    ].join('\n')
    expect(findPlaceholders(content).map((placeholder) => placeholder.blockId)).toEqual(['ui_0001', 'block_0002'])
  })

  test('legacy block placeholders still recompose against current ui block records', () => {
    const original = '# A\n\n<Widget label="x" />\n'
    const normalized = normalizeArticleContent(original, metadata(original))
    const legacyNormalized = normalized.normalized.replace('ui_0001', 'block_0001')
    const { candidate, report } = composeCandidate({ normalized: legacyNormalized, uiBlocks: normalized.uiBlocks, original })
    expect(report.blockers).toEqual([])
    expect(candidate).toBe(original)
  })

  test('recomposition restores original content when normalized is unchanged', () => {
    const original = '# A\n\n<Widget label="x" />\n'
    const normalized = normalizeArticleContent(original, metadata(original))
    const { candidate, report } = composeCandidate({ normalized: normalized.normalized, uiBlocks: normalized.uiBlocks, original })
    expect(candidate).toBe(original)
    expect(report.candidate_matches_original).toBe(true)
  })

  test('diff marks unresolved placeholder as unsafe', () => {
    const original = '# A\n\n<Widget label="x" />\n'
    const normalized = normalizeArticleContent(original, metadata(original))
    const candidate = `${normalized.normalized}\nStill unresolved [SLATECAMP_UI_BLOCK:block_9999 component="Missing" status="preserved"]\n[/SLATECAMP_UI_BLOCK]`
    const report = diffCandidate({ metadata: metadata(original), original, normalized: normalized.normalized, candidate, uiBlocks: normalized.uiBlocks })
    expect(report.safe_to_push).toBe(false)
    expect(report.unresolved_placeholders_count).toBeGreaterThan(0)
  })

  test('changed-only export helper compares content hashes only', () => {
    const oldContent = '# Old\n'
    const newContent = '# New\n'
    expect(shouldExportChangedArticle({ currentContent: oldContent, existingMetadata: null, existingOriginal: null })).toBe(true)
    expect(shouldExportChangedArticle({
      currentContent: oldContent,
      currentUpdatedAt: '2026-05-02T00:00:00.000Z',
      existingMetadata: { original_content_hash: sha256(oldContent), updated_at: '2026-05-01T00:00:00.000Z' },
      existingOriginal: oldContent,
    })).toBe(false)
    expect(shouldExportChangedArticle({
      currentContent: newContent,
      existingMetadata: { original_content_hash: sha256(oldContent) },
      existingOriginal: oldContent,
    })).toBe(true)
  })

  test('bulk apply requires exact confirmation phrase', () => {
    expect(() => assertBulkApplyConfirmation({ allSafe: true, apply: true, confirm: undefined })).toThrow(BULK_APPLY_CONFIRMATION)
    expect(() => assertBulkApplyConfirmation({ allSafe: true, apply: true, confirm: BULK_APPLY_CONFIRMATION })).not.toThrow()
    expect(() => assertBulkApplyConfirmation({ allSafe: false, apply: true, confirm: undefined })).not.toThrow()
  })

  test('cli parser supports changed-only, all-safe, and confirm flags', () => {
    const options = parseArgs(['--changed-only', '--all-safe', '--confirm', BULK_APPLY_CONFIRMATION, '--article_id', 'a1'])
    expect(options.changedOnly).toBe(true)
    expect(options.allSafe).toBe(true)
    expect(options.confirm).toBe(BULK_APPLY_CONFIRMATION)
    expect(options.articleId).toBe('a1')
  })



  test('stale-safe apply update requires content compare-and-swap and exactly one row', async () => {
    const eqCalls: Array<[string, unknown]> = []
    const fakeSupabase = {
      from(table: string) {
        expect(table).toBe('wiki_articles')
        return {
          update(payload: Record<string, unknown>) {
            expect(payload.content).toBe('# New\n')
            return this
          },
          eq(column: string, value: unknown) {
            eqCalls.push([column, value])
            return this
          },
          async select(columns: string) {
            expect(columns).toBe('article_id,updated_at')
            return { data: [], error: null }
          },
        }
      },
    }

    await expect(updateArticleContentIfUnchanged({
      supabase: fakeSupabase,
      articleId: 'article-1',
      originalContent: '# Old\n',
      updatePayload: { content: '# New\n' },
    })).rejects.toThrow('expected exactly 1')

    expect(eqCalls).toContainEqual(['article_id', 'article-1'])
    expect(eqCalls).toContainEqual(['content', '# Old\n'])
  })

  test('push refuses stale remote content and defaults to dry-run', () => {
    const original = '# A\n'
    const meta = metadata(original)
    const uiBlocks: UiBlocksFile = {
      article_id: meta.article_id,
      slug: meta.slug,
      normalized_created_at: '2026-05-01T00:00:00.000Z',
      parser_version: 'test',
      original_content_hash: sha256(original),
      normalized_content_hash: sha256(original),
      ui_block_count: 0,
      total_blocks: 0,
      blocks: [],
      unknown_blocks: [],
      unresolved_critical_blocks: [],
      ui_blocks_hash: sha256('[]'),
    }
    const diff = diffCandidate({ metadata: meta, original, normalized: original, candidate: '# B\n', uiBlocks })
    const safety = evaluatePushSafety({
      metadata: meta,
      original,
      candidate: '# B\n',
      diffReport: diff,
      uiBlocks,
      remoteContent: '# changed elsewhere\n',
      apply: false,
      dryRun: true,
      force: false,
    })
    expect(safety.dry_run).toBe(true)
    expect(safety.stale_check_passed).toBe(false)
    expect(safety.blockers.join('\n')).toContain('Remote Supabase content differs')
  })

  test('apply refuses no-op candidate matching original', () => {
    const original = '# A\n'
    const meta = metadata(original)
    const uiBlocks: UiBlocksFile = {
      article_id: meta.article_id,
      slug: meta.slug,
      normalized_created_at: '2026-05-01T00:00:00.000Z',
      parser_version: 'test',
      original_content_hash: sha256(original),
      normalized_content_hash: sha256(original),
      ui_block_count: 0,
      total_blocks: 0,
      blocks: [],
      unknown_blocks: [],
      unresolved_critical_blocks: [],
      ui_blocks_hash: sha256('[]'),
    }
    const diff = diffCandidate({ metadata: meta, original, normalized: original, candidate: original, uiBlocks })
    const safety = evaluatePushSafety({
      metadata: meta,
      original,
      candidate: original,
      diffReport: diff,
      uiBlocks,
      remoteContent: original,
      apply: true,
      dryRun: false,
      force: false,
    })
    expect(safety.blockers.join('\n')).toContain('refusing no-op apply')
  })
})

describe('component inventory', () => {
  test('detects a fixture component and reports rich article usage', async () => {
    const repoRoot = await mkdtemp(path.join(os.tmpdir(), 'content-audit-'))
    await mkdir(path.join(repoRoot, 'src', 'components'), { recursive: true })
    const exportRoot = path.join(repoRoot, '.ai', 'content-audit-export')
    const articleDir = path.join(exportRoot, 'articles', 'fixture')
    await mkdir(articleDir, { recursive: true })
    await writeFile(path.join(repoRoot, 'src', 'components', 'FixtureLearningWidget.tsx'), `
      export interface FixtureLearningWidgetProps { title: string; children?: React.ReactNode }
      export function FixtureLearningWidget({ title, children }: FixtureLearningWidgetProps) {
        return <section><h2>{title}</h2>{children}</section>
      }
    `)
    const original = '<FixtureLearningWidget title="Hello">Body</FixtureLearningWidget>'
    const meta = metadata(original)
    const normalized = normalizeArticleContent(original, meta)
    await writeFile(path.join(articleDir, 'article-metadata.json'), `${JSON.stringify(meta)}\n`)
    await writeFile(path.join(articleDir, 'original.md'), original)
    await writeFile(path.join(articleDir, 'ui-blocks.json'), `${JSON.stringify(normalized.uiBlocks)}\n`)

    const inventory = scanComponentInventory(repoRoot, exportRoot)
    expect(inventory.components.some((component) => component.component_name === 'FixtureLearningWidget')).toBe(true)
    expect(inventory.article_usage.articles_with_components).toBe(1)
    expect(inventory.article_usage.components_used_across_articles[0].component_name).toBe('FixtureLearningWidget')
    expect(inventory.article_usage.usage[0].components[0].block_ids).toEqual(['ui_0001'])
  })
})

describe('sync state', () => {
  test('writes per-article sync status', async () => {
    const root = await mkdtemp(path.join(os.tmpdir(), 'content-audit-sync-'))
    const articleDir = path.join(root, 'articles', 'title')
    await mkdir(articleDir, { recursive: true })
    const meta = metadata('# Title\n')

    await updateArticleSyncState(root, articleDir, meta, {
      candidate_hash: 'sha256:candidate',
      sync_status: 'candidate_ready',
      last_diff_at: '2026-05-01T00:00:00.000Z',
    })

    const syncState = await readSyncState(root)
    expect(syncState.articles[meta.article_id].folder).toBe('title')
    expect(syncState.articles[meta.article_id].sync_status).toBe('candidate_ready')
    expect(syncState.articles[meta.article_id].candidate_hash).toBe('sha256:candidate')
  })
})

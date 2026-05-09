#!/usr/bin/env bun
import path from 'node:path'
import { existsSync, statSync } from 'node:fs'
import { readFile } from 'node:fs/promises'
import {
  ArticleMetadata,
  DiffReport,
  UiBlocksFile,
  assertBulkApplyConfirmation,
  buildArticleContentUpdatePayload,
  buildComposeErrorFile,
  buildDiffMarkdown,
  composeCandidate,
  containsRawSlatecampUiBlockPlaceholder,
  createContentAuditSupabaseClient,
  createExportId,
  diffCandidate,
  discoverArticleDirs,
  evaluatePushSafety,
  nowIso,
  parseArgs,
  resolveExportRoot,
  sha256,
  updateArticleSyncState,
  updateArticleContentIfUnchanged,
  writeJson,
  writeRunLog,
  writeText,
} from './lib'

async function main() {
  const options = parseArgs()
  assertBulkApplyConfirmation(options)
  const root = resolveExportRoot(options.input)
  const runId = createExportId()
  const startedAt = nowIso()
  if (!options.articleId && !options.slug && !options.allSafe) {
    throw new Error('Push requires --article-id, --slug, or --all-safe. Dry-run is still default.')
  }
  const articleDirs = discoverArticleDirs(root, options)
  const supabase = createContentAuditSupabaseClient()
  const dryRun = options.dryRun === true || options.apply !== true
  let processed = 0
  let pushed = 0
  let errorCount = 0

  for (const articleDir of articleDirs) {
    const attemptedAt = nowIso()
    let report: any = {
      attempted_at: attemptedAt,
      dry_run: dryRun,
      apply: options.apply === true,
      pushed: false,
      blockers: [] as string[],
      warnings: [] as string[],
      updated_rows_count: 0,
    }

    try {
      const metadata = JSON.parse(await readFile(path.join(articleDir, 'article-metadata.json'), 'utf-8')) as ArticleMetadata
      report.article_id = metadata.article_id
      report.slug = metadata.slug
      const originalPath = path.join(articleDir, 'original.md')
      const candidatePath = path.join(articleDir, 'candidate.md')
      const diffPath = path.join(articleDir, 'diff-report.json')
      const uiBlocksPath = path.join(articleDir, 'ui-blocks.json')
      const normalizedPath = path.join(articleDir, 'normalized.md')
      const original = existsSync(originalPath) ? await readFile(originalPath, 'utf-8') : ''
      let candidate = existsSync(candidatePath) ? await readFile(candidatePath, 'utf-8') : null
      const uiBlocks = existsSync(uiBlocksPath) ? JSON.parse(await readFile(uiBlocksPath, 'utf-8')) as UiBlocksFile : null
      const preparation = await prepareCandidateAndDiff({
        articleDir,
        metadata,
        original,
        candidate,
        uiBlocks,
        candidatePath,
        diffPath,
        normalizedPath,
        uiBlocksPath,
      })
      candidate = preparation.candidate
      const diffReport = preparation.diffReport
      report.preparation_actions = preparation.actions

      const { data: remote, error } = await supabase
        .from('wiki_articles')
        .select('article_id,content,updated_at')
        .eq('article_id', metadata.article_id)
        .maybeSingle()
      if (error) throw new Error(`Failed to fetch current remote article: ${error.message}`)
      if (!remote) throw new Error('Remote article not found')

      const safety = evaluatePushSafety({
        metadata,
        original,
        candidate,
        diffReport,
        uiBlocks,
        remoteContent: remote.content,
        apply: options.apply === true,
        dryRun,
        force: options.force === true,
        repairPlaceholders: options.repairPlaceholders === true,
      })

      report = {
        ...report,
        ...safety,
        remote_updated_at_before: remote.updated_at,
        dry_run: safety.dry_run,
        apply: safety.apply,
      }

      if (options.allSafe && diffReport && !diffReport.safe_to_push) {
        report.blockers.push('--all-safe skipped article because diff-report is unsafe.')
      }

      if (report.blockers.length === 0 && options.apply === true && !dryRun) {
        const isRepairScenario = options.repairPlaceholders === true && containsRawSlatecampUiBlockPlaceholder(remote.content)
        const updatePayload = buildArticleContentUpdatePayload({
          content: candidate,
          updatedAt: nowIso(),
          reviewerId: options.reviewerId,
          note: options.note,
          suppressPublicUpdatedNote: isRepairScenario,
        })
        const compareAndSwapContent = isRepairScenario ? remote.content : original
        if (isRepairScenario) {
          report.repair_mode = 'placeholder_content'
          if (options.note) {
            report.warnings.push('--repair-placeholders treats --note as an operational note; it was not written to public updated_note.')
          }
        }
        const updated = await updateArticleContentIfUnchanged({
          supabase,
          articleId: metadata.article_id,
          originalContent: compareAndSwapContent,
          originalUpdatedAt: isRepairScenario ? remote.updated_at : null,
          updatePayload,
        })
        report.pushed = true
        report.updated_rows_count = updated.length
        report.updated_at_after = updated[0]?.updated_at ?? null
      }

      const syncStatus = report.pushed
        ? 'pushed'
        : report.blockers.some((blocker: string) => blocker.includes('stale') || blocker.includes('Remote Supabase content differs'))
          ? 'conflict'
          : report.blockers.length === 0
            ? 'dry_run_passed'
            : 'error'
      const syncPatch = {
        candidate_hash: safety.candidate_hash,
        last_diff_at: diffReport?.generated_at ?? null,
        sync_status: syncStatus,
      } as Parameters<typeof updateArticleSyncState>[3]
      if (dryRun) syncPatch.last_push_dry_run_at = attemptedAt
      if (report.pushed) syncPatch.last_push_applied_at = attemptedAt
      await updateArticleSyncState(root, articleDir, metadata, syncPatch)
      await writePushReports(articleDir, report)
      if (report.blockers.some((blocker: string) => blocker.includes('stale') || blocker.includes('Remote Supabase content differs'))) {
        await writeJson(path.join(articleDir, 'conflict-report.json'), report)
      }
      processed += 1
      if (report.pushed) pushed += 1
      console.log(`${report.pushed ? '✓ pushed' : '✓ push dry/safe-check'} ${metadata.article_id}: blockers=${report.blockers.length}`)
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      errorCount += 1
      report.blockers.push(message)
      await writePushReports(articleDir, report)
      console.error(`✗ push ${articleDir}: ${message}`)
      if (options.strict) throw error
    }
  }
  await writeRunLog(root, runId, {
    command: 'content-audit:push',
    started_at: startedAt,
    completed_at: nowIso(),
    dry_run: dryRun,
    apply: options.apply === true,
    all_safe: options.allSafe === true,
    processed,
    pushed,
    error_count: errorCount,
    status: errorCount > 0 ? 'completed_with_errors' : 'completed',
  })
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error)
  process.exit(1)
})

async function prepareCandidateAndDiff({
  articleDir,
  metadata,
  original,
  candidate,
  uiBlocks,
  candidatePath,
  diffPath,
  normalizedPath,
  uiBlocksPath,
}: {
  articleDir: string
  metadata: ArticleMetadata
  original: string
  candidate: string | null
  uiBlocks: UiBlocksFile | null
  candidatePath: string
  diffPath: string
  normalizedPath: string
  uiBlocksPath: string
}) {
  const actions: string[] = []
  const candidateNeedsCompose = !candidate || isFileStale(candidatePath, [normalizedPath, uiBlocksPath])
  if (candidateNeedsCompose) {
    if (!existsSync(normalizedPath)) throw new Error('candidate.md missing/stale and normalized.md is unavailable for auto-compose.')
    if (!uiBlocks) throw new Error('candidate.md missing/stale and ui-blocks.json is unavailable for auto-compose.')
    const normalized = await readFile(normalizedPath, 'utf-8')
    const composed = composeCandidate({ normalized, uiBlocks, original })
    await writeJson(path.join(articleDir, 'compose-report.json'), composed.report)
    if (composed.report.blockers.length > 0) {
      await writeJson(path.join(articleDir, 'compose-error.json'), buildComposeErrorFile({
        articleId: metadata.article_id,
        slug: metadata.slug,
        report: composed.report,
      }))
      throw new Error(`Auto-compose failed: ${composed.report.blockers.join('; ')}`)
    }
    candidate = composed.candidate
    await writeText(candidatePath, candidate)
    metadata.candidate_content_hash = composed.report.candidate_hash
    await writeJson(path.join(articleDir, 'article-metadata.json'), metadata)
    actions.push('auto_composed_candidate')
  }

  let diffReport = existsSync(diffPath) ? JSON.parse(await readFile(diffPath, 'utf-8')) as DiffReport : null
  const diffNeedsGeneration = !diffReport ||
    isFileStale(diffPath, [path.join(articleDir, 'original.md'), candidatePath, uiBlocksPath]) ||
    (candidate ? diffReport.candidate_hash !== sha256(candidate) : false)

  if (diffNeedsGeneration) {
    if (!candidate) throw new Error('candidate.md is missing and could not be auto-composed.')
    const normalized = existsSync(normalizedPath) ? await readFile(normalizedPath, 'utf-8') : null
    diffReport = diffCandidate({ metadata, original, normalized, candidate, uiBlocks })
    await writeJson(diffPath, diffReport)
    await writeText(path.join(articleDir, 'diff-report.md'), buildDiffMarkdown(diffReport))
    actions.push('auto_generated_diff')
  }

  return { candidate, diffReport, actions }
}

async function writePushReports(articleDir: string, report: unknown) {
  await writeJson(path.join(articleDir, 'push-report.json'), report)
  await writeJson(path.join(articleDir, 'push-result.json'), report)
}

function isFileStale(targetPath: string, sourcePaths: string[]) {
  if (!existsSync(targetPath)) return true
  const targetMtime = statSync(targetPath).mtimeMs
  return sourcePaths.some((sourcePath) => existsSync(sourcePath) && statSync(sourcePath).mtimeMs > targetMtime)
}

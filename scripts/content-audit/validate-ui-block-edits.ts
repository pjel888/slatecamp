#!/usr/bin/env bun
import { existsSync, readFileSync } from 'node:fs'
import path from 'node:path'
import {
  ArticleMetadata,
  UiBlocksFile,
  discoverArticleDirs,
  parseArgs,
  resolveExportRoot,
  sha256,
  writeJson,
} from './lib'

type UiBlockEdit = {
  block_id?: string
  status?: 'proposed' | 'approved' | 'rejected'
  previous_raw_hash?: string
  raw_hash?: string
  proposed_raw?: string
  raw?: string
  reason?: string
  approved_by?: string
  approved_at?: string
}

async function main() {
  const options = parseArgs()
  const root = resolveExportRoot(options.input)
  const aggregate = {
    generated_at: new Date().toISOString(),
    article_count: 0,
    valid: true,
    blockers: [] as string[],
    warnings: [] as string[],
    articles: [] as any[],
  }

  for (const articleDir of discoverArticleDirs(root, options)) {
    const metadata = JSON.parse(readFileSync(path.join(articleDir, 'article-metadata.json'), 'utf-8')) as ArticleMetadata
    const report = validateArticleUiBlockEdits(articleDir, metadata)
    aggregate.articles.push(report)
    aggregate.article_count += 1
    for (const blocker of report.blockers) aggregate.blockers.push(`${report.folder}: ${blocker}`)
    for (const warning of report.warnings) aggregate.warnings.push(`${report.folder}: ${warning}`)
    await writeJson(path.join(articleDir, 'ui-block-edit-validation.json'), report)
  }

  aggregate.valid = aggregate.blockers.length === 0
  await writeJson(path.join(root, 'ui-block-edit-validation.json'), aggregate)
  console.log(JSON.stringify({ valid: aggregate.valid, article_count: aggregate.article_count, blockers: aggregate.blockers.length, warnings: aggregate.warnings.length }, null, 2))
  if (!aggregate.valid) process.exit(1)
}

function validateArticleUiBlockEdits(articleDir: string, metadata: ArticleMetadata) {
  const folder = path.basename(articleDir)
  const uiBlocksPath = path.join(articleDir, 'ui-blocks.json')
  const editsPath = path.join(articleDir, 'ui-block-edits.json')
  const report = {
    article_id: metadata.article_id,
    slug: metadata.slug,
    folder,
    valid: true,
    edit_count: 0,
    approved_edit_count: 0,
    blockers: [] as string[],
    warnings: [] as string[],
    edits: [] as any[],
  }

  if (!existsSync(uiBlocksPath)) {
    report.blockers.push('ui-blocks.json missing.')
    report.valid = false
    return report
  }
  if (!existsSync(editsPath)) {
    report.warnings.push('ui-block-edits.json missing; run normalize to create the edit ledger.')
    return report
  }

  const uiBlocks = JSON.parse(readFileSync(uiBlocksPath, 'utf-8')) as UiBlocksFile
  const editsFile = JSON.parse(readFileSync(editsPath, 'utf-8')) as { edit_count?: number; edits?: UiBlockEdit[] }
  const edits = editsFile.edits ?? []
  const blocksById = new Map(uiBlocks.blocks.map((block) => [block.block_id, block]))
  report.edit_count = edits.length
  if (editsFile.edit_count != null && editsFile.edit_count !== edits.length) report.blockers.push('ui-block-edits.json edit_count does not match edits length.')

  for (const edit of edits) {
    const editReport = validateEdit(edit, blocksById)
    report.edits.push(editReport)
    if (editReport.status === 'approved') report.approved_edit_count += 1
    report.blockers.push(...editReport.blockers)
    report.warnings.push(...editReport.warnings)
  }

  report.valid = report.blockers.length === 0
  return report
}

function validateEdit(edit: UiBlockEdit, blocksById: Map<string, UiBlocksFile['blocks'][number]>) {
  const blockers: string[] = []
  const warnings: string[] = []
  const blockId = edit.block_id ?? ''
  const block = blocksById.get(blockId)
  const proposedRaw = edit.proposed_raw ?? edit.raw ?? null
  if (!blockId) blockers.push('UI block edit is missing block_id.')
  if (blockId && !block) blockers.push(`UI block edit references unknown block_id ${blockId}.`)
  if (!proposedRaw) blockers.push(`UI block edit ${blockId || '(missing id)'} is missing proposed_raw/raw.`)
  if (!edit.reason) warnings.push(`UI block edit ${blockId || '(missing id)'} has no reason.`)
  if (block && edit.previous_raw_hash && edit.previous_raw_hash !== block.raw_hash) blockers.push(`UI block edit ${blockId} previous_raw_hash does not match preserved block raw_hash.`)
  if (proposedRaw && edit.raw_hash && edit.raw_hash !== sha256(proposedRaw)) blockers.push(`UI block edit ${blockId} raw_hash does not match proposed raw content.`)
  if (edit.status === 'approved' && (!edit.approved_by || !edit.approved_at)) blockers.push(`Approved UI block edit ${blockId} requires approved_by and approved_at.`)
  if (edit.status !== 'approved') warnings.push(`UI block edit ${blockId || '(missing id)'} is not approved and will not be eligible for any future compose path.`)
  return {
    block_id: blockId || null,
    status: edit.status ?? 'proposed',
    proposed_raw_hash: proposedRaw ? sha256(proposedRaw) : null,
    blockers,
    warnings,
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error)
  process.exit(1)
})

#!/usr/bin/env bun
import path from 'node:path'
import { existsSync } from 'node:fs'
import { readFile, writeFile } from 'node:fs/promises'
import {
  ArticleMetadata,
  buildParserErrorsFile,
  discoverArticleDirs,
  normalizeArticleContent,
  parseArgs,
  resolveExportRoot,
  updateArticleSyncState,
  writeJson,
  writeText,
} from './lib'

async function main() {
  const options = parseArgs()
  const root = resolveExportRoot(options.input)
  const articleDirs = discoverArticleDirs(root, options)
  let processed = 0

  for (const articleDir of articleDirs) {
    try {
      const metadataPath = path.join(articleDir, 'article-metadata.json')
      const originalPath = path.join(articleDir, 'original.md')
      const normalizedPath = path.join(articleDir, 'normalized.md')
      const uiBlocksPath = path.join(articleDir, 'ui-blocks.json')
      if (!existsSync(originalPath)) throw new Error('original.md missing')
      if (!options.overwrite && (existsSync(normalizedPath) || existsSync(uiBlocksPath))) {
        console.log(`↷ skip ${articleDir}: normalized outputs exist; pass --overwrite`)
        continue
      }

      const metadata = JSON.parse(await readFile(metadataPath, 'utf-8')) as ArticleMetadata
      const original = await readFile(originalPath, 'utf-8')
      const result = normalizeArticleContent(original, metadata)
      metadata.normalized_content_hash = result.uiBlocks.normalized_content_hash
      metadata.ui_blocks_hash = result.uiBlocks.ui_blocks_hash
      metadata.parser_status = result.uiBlocks.unresolved_critical_blocks.length ? 'failed' : result.uiBlocks.unknown_blocks.length || result.warnings.length ? 'warnings' : 'passed'
      metadata.content_complexity = result.uiBlocks.total_blocks > 0 ? 'markdown_with_ui' : 'plain_markdown'

      if (!options.dryRun) {
        await writeText(normalizedPath, result.normalized)
        await writeJson(uiBlocksPath, result.uiBlocks)
        await writeJson(path.join(articleDir, 'parser-errors.json'), buildParserErrorsFile(result))
        await writeFile(metadataPath, `${JSON.stringify(metadata, null, 2)}\n`, 'utf-8')
        await updateArticleSyncState(root, articleDir, metadata, {
          sync_status: metadata.parser_status === 'failed' ? 'error' : 'normalized',
        })
      }
      processed += 1
      console.log(`${options.dryRun ? 'DRY' : '✓'} normalize ${metadata.article_id}: ${result.uiBlocks.total_blocks} UI block(s), ${metadata.parser_status}`)
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      console.error(`✗ normalize ${articleDir}: ${message}`)
      if (options.strict) throw error
    }
  }

  console.log(`Processed ${processed} article bundle(s) in ${root}`)
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error)
  process.exit(1)
})

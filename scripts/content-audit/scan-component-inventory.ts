#!/usr/bin/env bun
import { readFileSync } from 'node:fs'
import path from 'node:path'
import {
  ArticleMetadata,
  ComponentUsageReport,
  discoverArticleDirs,
  createExportId,
  parseArgs,
  resolveExportRoot,
  scanComponentInventory,
  updateSyncStateRoot,
  writeJson,
  writeText,
} from './lib'

async function main() {
  const options = parseArgs()
  const exportRoot = resolveExportRoot(options.input ?? options.output)
  const inventoryRunId = createExportId()
  const inventory = scanComponentInventory(process.cwd(), exportRoot)
  const inventoryRoot = path.join(exportRoot, 'component-inventory')

  if (!options.dryRun) {
    await writeJson(path.join(inventoryRoot, 'components.json'), {
      generated_at: inventory.generated_at,
      repo_root: inventory.repo_root,
      component_count: inventory.components.length,
      components: inventory.components,
    })
    await writeJson(path.join(inventoryRoot, 'component-files.json'), {
      generated_at: inventory.generated_at,
      file_count: inventory.component_files.length,
      files: inventory.component_files,
    })
    await writeJson(path.join(inventoryRoot, 'component-usage-in-articles.json'), inventory.article_usage)
    await writeJson(path.join(inventoryRoot, 'unknown-components.json'), {
      generated_at: inventory.generated_at,
      unknown_components: inventory.unknown_components,
    })
    await writeJson(path.join(inventoryRoot, 'component-audit-report.json'), inventory.audit_report)
    await writeText(path.join(inventoryRoot, 'component-fit-notes.md'), makeFitNotes(inventory))
    await writePerArticleComponentUsage(exportRoot, inventory.article_usage)
    await updateSyncStateRoot(exportRoot, { last_component_inventory_run_id: inventoryRunId })
  }

  console.log(JSON.stringify(inventory.audit_report, null, 2))
}

async function writePerArticleComponentUsage(exportRoot: string, usageReport: ComponentUsageReport) {
  const dirsByArticleId = new Map<string, string>()
  for (const articleDir of discoverArticleDirs(exportRoot)) {
    const metadata = JSON.parse(readFileSync(path.join(articleDir, 'article-metadata.json'), 'utf-8')) as ArticleMetadata
    dirsByArticleId.set(metadata.article_id, articleDir)
  }

  for (const usage of usageReport.usage) {
    const articleDir = dirsByArticleId.get(usage.article_id)
    if (!articleDir) continue
    await writeJson(path.join(articleDir, 'component-usage.json'), {
      generated_at: usageReport.generated_at,
      ...usage,
    })
  }
}

function makeFitNotes(inventory: ReturnType<typeof scanComponentInventory>) {
  const likely = inventory.components.filter((component) => component.is_candidate_for_article_embed).slice(0, 50)
  return [
    '# Component Inventory Notes',
    '',
    `Generated at: ${inventory.generated_at}`,
    '',
    'This is an inventory only. It does not recommend or insert components into articles.',
    '',
    '## Likely article/learning components',
    '',
    ...likely.map((component) => `- \`${component.component_name}\` — ${component.file_path} (${component.likely_category}, ${component.confidence})`),
    '',
  ].join('\n')
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error)
  process.exit(1)
})

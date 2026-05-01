#!/usr/bin/env bun
import { existsSync, readFileSync } from 'node:fs'
import path from 'node:path'
import {
  ArticleMetadata,
  discoverArticleDirs,
  parseArgs,
  resolveExportRoot,
  writeJson,
} from './lib'

type ComponentRecord = Record<string, any>

async function main() {
  const options = parseArgs()
  const root = resolveExportRoot(options.input)
  const inventoryPath = path.join(root, 'component-inventory', 'components.json')
  if (!existsSync(inventoryPath)) throw new Error('component-inventory/components.json missing; run content-audit:inventory first.')
  const inventory = JSON.parse(readFileSync(inventoryPath, 'utf-8')) as { components?: ComponentRecord[] }
  const components = inventory.components ?? []
  const aggregate = {
    generated_at: new Date().toISOString(),
    mode: 'metadata_only_no_auto_insertion',
    article_count: 0,
    suggestions: [] as any[],
    warnings: ['This report is metadata-only. It does not insert components or rewrite articles.'],
  }

  for (const articleDir of discoverArticleDirs(root, options)) {
    const metadata = JSON.parse(readFileSync(path.join(articleDir, 'article-metadata.json'), 'utf-8')) as ArticleMetadata
    const normalizedPath = path.join(articleDir, 'normalized.md')
    const originalPath = path.join(articleDir, 'original.md')
    const content = existsSync(normalizedPath)
      ? readFileSync(normalizedPath, 'utf-8')
      : existsSync(originalPath)
        ? readFileSync(originalPath, 'utf-8')
        : ''
    const taxonomyPath = path.join(articleDir, 'taxonomy.json')
    const taxonomy = existsSync(taxonomyPath) ? readFileSync(taxonomyPath, 'utf-8') : ''
    const desiredCategories = inferDesiredCategories(`${metadata.title}\n${content}\n${taxonomy}`)
    const suggestions = components
      .filter((component) => desiredCategories.includes(component.likely_category) || component.is_candidate_for_article_embed)
      .slice(0, 8)
      .map((component) => ({
        component_name: component.component_name,
        file_path: component.file_path,
        likely_category: component.likely_category,
        confidence: component.confidence,
        reason: `Category ${component.likely_category} matched article signals: ${desiredCategories.join(', ') || 'general learning component'}`,
        auto_insert: false,
      }))

    const report = {
      article_id: metadata.article_id,
      slug: metadata.slug,
      generated_at: aggregate.generated_at,
      desired_categories: desiredCategories,
      suggestion_count: suggestions.length,
      suggestions,
      auto_insertion_enabled: false,
      warnings: ['Auto-insertion is intentionally disabled; use this as review metadata only.'],
    }
    await writeJson(path.join(articleDir, 'component-suggestions.json'), report)
    aggregate.suggestions.push(report)
    aggregate.article_count += 1
  }

  if (options.apply) {
    await writeJson(path.join(root, 'component-insertion-report.json'), {
      generated_at: aggregate.generated_at,
      applied: false,
      blockers: ['Automatic component insertion is intentionally disabled for content safety.'],
      warnings: ['No article content, normalized.md, or candidate.md was modified.'],
    })
  }
  await writeJson(path.join(root, 'component-inventory', 'component-suggestions.json'), aggregate)
  console.log(JSON.stringify({ article_count: aggregate.article_count, suggestions: aggregate.suggestions.length }, null, 2))
}

function inferDesiredCategories(text: string) {
  const haystack = text.toLowerCase()
  const categories: string[] = []
  if (/formula|compute|calculation|calculator|ratio|slope|area|load|cost/.test(haystack)) categories.push('formula')
  if (/timeline|history|period|era|chronolog/.test(haystack)) categories.push('timeline')
  if (/law|code|requirement|section|rule|nbcp|bp 344|fire code|pd 1096|ra 9514/.test(haystack)) categories.push('code_requirement')
  if (/compare|versus| vs |difference|classification/.test(haystack)) categories.push('comparison')
  if (/scenario|case|practice|judgment|decision/.test(haystack)) categories.push('scenario')
  if (/diagram|visual|drawing|plan|section|elevation|detail/.test(haystack)) categories.push('diagram')
  if (/quiz|question|prompt|recall/.test(haystack)) categories.push('quiz_or_prompt')
  if (categories.length === 0) categories.push('callout')
  return [...new Set(categories)]
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error)
  process.exit(1)
})

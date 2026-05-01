#!/usr/bin/env bun
import path from 'node:path'
import { existsSync, readFileSync } from 'node:fs'
import {
  ArticleMetadata,
  CliOptions,
  EXPORT_VERSION,
  HASH_ALGORITHM,
  createContentAuditSupabaseClient,
  createExportId,
  discoverArticleDirs,
  nowIso,
  parseArgs,
  resolveExportRoot,
  safeFolderName,
  sha256,
  sha256Json,
  shouldExportChangedArticle,
  updateArticleSyncState,
  updateSyncStateRoot,
  writeJson,
  writeRunLog,
  writeText,
} from './lib'

type ArticleRow = Record<string, any>

type ExistingBundle = {
  articleDir: string | null
  metadata: Partial<ArticleMetadata> | null
  original: string | null
}

interface ExportedArticleSummary {
  article_id: string
  title: string
  slug: string | null
  folder: string
  bundle_path: string
  content_hash: string
  original_content_hash: string
  linked_questions_hash: string
  sources_hash: string
  linked_question_count: number
  question_count: number
  source_count: number
  taxonomy_count: number
  ui_block_count: number
  parser_status: ArticleMetadata['parser_status']
}

async function main() {
  const options = parseArgs()
  const exportRoot = resolveExportRoot(options.output)
  const dryRun = options.dryRun === true
  const exportId = createExportId()
  const startedAt = nowIso()
  const manifest = {
    export_version: EXPORT_VERSION,
    export_run_id: exportId,
    export_id: exportId,
    generated_at: startedAt,
    export_started_at: startedAt,
    export_completed_at: null as string | null,
    repo_path: process.cwd(),
    supabase_project_ref: inferSupabaseProjectRef(),
    hash_algorithm: HASH_ALGORITHM,
    changed_only: options.changedOnly === true,
    article_count: 0,
    question_count: 0,
    source_count: 0,
    taxonomy_link_count: 0,
    component_count: 0,
    total_articles_exported: 0,
    total_questions_exported: 0,
    total_sources_exported: 0,
    total_taxonomy_links_exported: 0,
    articles: [] as ExportedArticleSummary[],
    skipped_unchanged: [] as Array<{ article_id: string; slug: string | null; content_hash: string }>,
    errors: [] as string[],
    warnings: [] as string[],
  }

  const supabase = createContentAuditSupabaseClient()
  const articles = await fetchArticles(options, supabase)
  const usedFolders = new Set<string>()

  for (const article of articles) {
    try {
      const content = article.content ?? ''
      const existingBundle = findExistingBundle(exportRoot, article)
      const changed = shouldExportChangedArticle({
        currentContent: content,
        currentUpdatedAt: article.updated_at ?? null,
        existingMetadata: existingBundle.metadata,
        existingOriginal: existingBundle.original,
      })
      if (options.changedOnly && !changed) {
        manifest.skipped_unchanged.push({ article_id: article.article_id, slug: article.slug ?? null, content_hash: sha256(content) })
        console.log(`↷ unchanged ${article.article_id} ${article.slug ?? ''}`)
        continue
      }

      const folder = existingBundle.articleDir && options.changedOnly
        ? path.basename(existingBundle.articleDir)
        : safeFolderName(article.slug, article.article_id, usedFolders)
      usedFolders.add(folder)
      const articleDir = path.join(exportRoot, 'articles', folder)
      if (!dryRun && existsSync(articleDir) && options.overwrite !== true && options.changedOnly !== true) {
        manifest.warnings.push(`Skipping ${article.article_id}: ${articleDir} exists; pass --overwrite true to replace bundle files.`)
        continue
      }

      const [questions, sources, taxonomy] = await Promise.all([
        options.includeQuestions === false ? Promise.resolve([]) : fetchQuestions(article.article_id, supabase),
        options.includeSources === false ? Promise.resolve([]) : fetchSources(article.article_id, supabase),
        options.includeTaxonomy === false ? Promise.resolve([]) : fetchTaxonomy(article.article_id, supabase),
      ])
      const linkedQuestionsHash = sha256Json(questions)
      const sourcesHash = sha256Json(sources)
      const contentHash = sha256(content)
      const exportedAt = nowIso()

      const metadata: ArticleMetadata = {
        article_id: article.article_id,
        title: article.title,
        slug: article.slug,
        subject_label: article.subject_label ?? null,
        difficulty_label: article.difficulty_label ?? null,
        status: article.status ?? null,
        read_time: article.read_time ?? null,
        reviewed_at: article.reviewed_at ?? null,
        reviewed_by: article.reviewed_by ?? null,
        reviewer_comments: article.reviewer_comments ?? null,
        created_at: article.created_at ?? null,
        created_by: article.created_by ?? null,
        updated_at: article.updated_at ?? null,
        updated_by: article.updated_by ?? null,
        updated_note: article.updated_note ?? null,
        content_hash: contentHash,
        original_content_hash: contentHash,
        normalized_content_hash: null,
        candidate_content_hash: null,
        ui_blocks_hash: null,
        linked_questions_hash: linkedQuestionsHash,
        sources_hash: sourcesHash,
        hash_algorithm: HASH_ALGORITHM,
        exported_at: exportedAt,
        export_run_id: exportId,
        export_version: EXPORT_VERSION,
        source_table: 'wiki_articles',
        source_count: sources.length,
        linked_question_count: questions.length,
        taxonomy_node_count: taxonomy.length,
        taxonomy_count: taxonomy.length,
        parser_status: 'not_started',
        content_complexity: 'unknown',
      }

      if (!dryRun) {
        await writeText(path.join(articleDir, 'original.md'), content)
        await writeJson(path.join(articleDir, 'article-metadata.json'), metadata)
        await writeJson(path.join(articleDir, 'linked-questions.json'), {
          article_id: article.article_id,
          hash_algorithm: HASH_ALGORITHM,
          linked_questions_hash: linkedQuestionsHash,
          question_count: questions.length,
          questions: questions.map((question) => ({ ...question, content_hash: sha256Json(question) })),
        })
        await writeJson(path.join(articleDir, 'sources.json'), {
          article_id: article.article_id,
          hash_algorithm: HASH_ALGORITHM,
          sources_hash: sourcesHash,
          source_count: sources.length,
          sources,
        })
        await writeJson(path.join(articleDir, 'taxonomy.json'), {
          article_id: article.article_id,
          taxonomy_count: taxonomy.length,
          taxonomy,
        })
        await updateArticleSyncState(exportRoot, articleDir, metadata, {
          candidate_hash: null,
          sync_status: 'exported',
        })
      }

      const summary: ExportedArticleSummary = {
        article_id: article.article_id,
        title: article.title,
        slug: article.slug ?? null,
        folder,
        bundle_path: path.relative(exportRoot, articleDir),
        content_hash: contentHash,
        original_content_hash: contentHash,
        linked_questions_hash: linkedQuestionsHash,
        sources_hash: sourcesHash,
        linked_question_count: questions.length,
        question_count: questions.length,
        source_count: sources.length,
        taxonomy_count: taxonomy.length,
        ui_block_count: 0,
        parser_status: metadata.parser_status,
      }
      manifest.articles.push(summary)
      manifest.article_count += 1
      manifest.question_count += questions.length
      manifest.source_count += sources.length
      manifest.taxonomy_link_count += taxonomy.length
      manifest.total_articles_exported += 1
      manifest.total_questions_exported += questions.length
      manifest.total_sources_exported += sources.length
      manifest.total_taxonomy_links_exported += taxonomy.length
      console.log(`${dryRun ? 'DRY' : '✓'} export ${article.article_id} ${article.slug ?? ''}`)
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      manifest.errors.push(`${article.article_id}: ${message}`)
      console.error(`✗ export ${article.article_id}: ${message}`)
      if (options.strict) throw error
    }
  }

  manifest.export_completed_at = nowIso()
  manifest.generated_at = manifest.export_completed_at
  if (!dryRun) {
    await writeJson(path.join(exportRoot, 'manifest.json'), manifest)
    await writeJson(path.join(exportRoot, 'export-summary.json'), manifest)
    await writeRunLog(exportRoot, exportId, {
      command: 'content-audit:export',
      started_at: startedAt,
      completed_at: manifest.export_completed_at,
      changed_only: manifest.changed_only,
      article_count: manifest.article_count,
      skipped_unchanged_count: manifest.skipped_unchanged.length,
      warning_count: manifest.warnings.length,
      error_count: manifest.errors.length,
      status: manifest.errors.length > 0 ? 'completed_with_errors' : 'completed',
    })
    await updateSyncStateRoot(exportRoot, { last_export_run_id: exportId })
  }
  console.log(JSON.stringify(manifest, null, 2))
}

function findExistingBundle(exportRoot: string, article: ArticleRow): ExistingBundle {
  const candidates = [
    ...discoverArticleDirs(exportRoot, { articleId: article.article_id }),
    ...(article.slug ? discoverArticleDirs(exportRoot, { slug: article.slug }) : []),
  ]
  const articleDir = [...new Set(candidates)][0] ?? null
  if (!articleDir) return { articleDir: null, metadata: null, original: null }

  const metadataPath = path.join(articleDir, 'article-metadata.json')
  const originalPath = path.join(articleDir, 'original.md')
  const metadata = existsSync(metadataPath) ? JSON.parse(readFileSync(metadataPath, 'utf-8')) as Partial<ArticleMetadata> : null
  const original = existsSync(originalPath) ? readFileSync(originalPath, 'utf-8') : null
  return { articleDir, metadata, original }
}

async function fetchArticles(options: CliOptions, supabase: any): Promise<ArticleRow[]> {
  let query = supabase
    .from('wiki_articles')
    .select('article_id,title,slug,content,subject_label,difficulty_label,status,read_time,reviewed_at,reviewed_by,reviewer_comments,created_at,created_by,updated_at,updated_by,updated_note')
    .order('updated_at', { ascending: false })

  if (options.articleId) query = query.eq('article_id', options.articleId)
  if (options.slug) query = query.eq('slug', options.slug)
  if (options.limit && options.limit > 0) query = query.limit(options.limit)

  const { data, error } = await query
  if (error) throw new Error(`Failed to fetch wiki_articles: ${error.message}`)
  return data ?? []
}

async function fetchQuestions(articleId: string, supabase: any) {
  const { data, error } = await supabase
    .from('questions')
    .select('question_id,article_id,topic_id,text,options,correct_option_id,correct_value,accepted_answers,value_tolerance,question_type,rationale,explanation,code_citation,bloom_level,application_context,practice_context,difficulty,difficulty_rating,discrimination_rating,is_assessment,model_id,prompt_image_url,created_at,updated_at')
    .eq('article_id', articleId)
    .order('created_at', { ascending: true })
  if (error) throw new Error(`Failed to fetch questions: ${error.message}`)
  return data ?? []
}

async function fetchSources(articleId: string, supabase: any) {
  const { data, error } = await supabase
    .from('wiki_article_sources')
    .select('source_id,article_id,label,url,source_type,description,is_verified,sort_order,created_at,updated_at')
    .eq('article_id', articleId)
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: true })
  if (error) throw new Error(`Failed to fetch wiki_article_sources: ${error.message}`)
  return data ?? []
}

async function fetchTaxonomy(articleId: string, supabase: any) {
  const { data: links, error } = await supabase
    .from('wiki_article_taxonomy')
    .select('article_id,node_id,is_primary,sort_order')
    .eq('article_id', articleId)
    .order('sort_order', { ascending: true })
  if (error) throw new Error(`Failed to fetch wiki_article_taxonomy: ${error.message}`)
  const nodeIds = [...new Set((links ?? []).map((link: any) => link.node_id).filter(Boolean))]
  const nodesById = new Map<string, any>()
  if (nodeIds.length > 0) {
    const { data: nodes, error: nodeError } = await supabase
      .from('taxonomy_tree')
      .select('node_id,name,subject_area,prc_area,node_type,lea_id,slug')
      .in('node_id', nodeIds)
    if (nodeError) throw new Error(`Failed to fetch taxonomy_tree: ${nodeError.message}`)
    for (const node of nodes ?? []) nodesById.set(node.node_id, node)
  }
  return (links ?? []).map((link: any) => ({
    ...link,
    taxonomy_node: nodesById.get(link.node_id) ?? null,
    node_name: nodesById.get(link.node_id)?.name ?? null,
    subject_area: nodesById.get(link.node_id)?.subject_area ?? null,
    prc_area: nodesById.get(link.node_id)?.prc_area ?? null,
    node_type: nodesById.get(link.node_id)?.node_type ?? null,
    lea_id: nodesById.get(link.node_id)?.lea_id ?? null,
    slug: nodesById.get(link.node_id)?.slug ?? null,
  }))
}

function inferSupabaseProjectRef() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL
  return url?.match(/https?:\/\/([^.]+)\.supabase\.co/)?.[1] ?? null
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error)
  process.exit(1)
})

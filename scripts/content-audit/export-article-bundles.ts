#!/usr/bin/env bun
import path from 'node:path'
import { existsSync } from 'node:fs'
import {
  ArticleMetadata,
  CliOptions,
  EXPORT_VERSION,
  createContentAuditSupabaseClient,
  createExportId,
  nowIso,
  parseArgs,
  resolveExportRoot,
  safeFolderName,
  sha256,
  sha256Json,
  updateArticleSyncState,
  updateSyncStateRoot,
  writeJson,
  writeText,
} from './lib'

type ArticleRow = Record<string, any>

async function main() {
  const options = parseArgs()
  const exportRoot = resolveExportRoot(options.output)
  const dryRun = options.dryRun === true
  const exportId = createExportId()
  const startedAt = nowIso()
  const manifest = {
    export_id: exportId,
    export_started_at: startedAt,
    export_completed_at: null as string | null,
    repo_path: process.cwd(),
    supabase_project_ref: inferSupabaseProjectRef(),
    total_articles_exported: 0,
    total_questions_exported: 0,
    total_sources_exported: 0,
    total_taxonomy_links_exported: 0,
    errors: [] as string[],
    warnings: [] as string[],
  }

  const supabase = createContentAuditSupabaseClient()
  const articles = await fetchArticles(options, supabase)
  const usedFolders = new Set<string>()

  for (const article of articles) {
    try {
      const folder = safeFolderName(article.slug, article.article_id, usedFolders)
      const articleDir = path.join(exportRoot, 'articles', folder)
      if (!dryRun && existsSync(articleDir) && options.overwrite !== true) {
        manifest.warnings.push(`Skipping ${article.article_id}: ${articleDir} exists; pass --overwrite true to replace bundle files.`)
        continue
      }

      const [questions, sources, taxonomy] = await Promise.all([
        options.includeQuestions === false ? Promise.resolve([]) : fetchQuestions(article.article_id, supabase),
        options.includeSources === false ? Promise.resolve([]) : fetchSources(article.article_id, supabase),
        options.includeTaxonomy === false ? Promise.resolve([]) : fetchTaxonomy(article.article_id, supabase),
      ])

      const content = article.content ?? ''
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
        content_hash: sha256(content),
        original_content_hash: sha256(content),
        normalized_content_hash: null,
        candidate_content_hash: null,
        ui_blocks_hash: null,
        exported_at: nowIso(),
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
          question_count: questions.length,
          questions: questions.map((question) => ({ ...question, content_hash: sha256Json(question) })),
        })
        await writeJson(path.join(articleDir, 'sources.json'), {
          article_id: article.article_id,
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
  if (!dryRun) {
    await writeJson(path.join(exportRoot, 'manifest.json'), manifest)
    await writeJson(path.join(exportRoot, 'export-summary.json'), manifest)
    await updateSyncStateRoot(exportRoot, { last_export_run_id: exportId })
  }
  console.log(JSON.stringify(manifest, null, 2))
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

import { createClient } from '@/lib/supabase/server'
import type { AuditLog } from '@/lib/audit/audit-queries'

export const getAdminStats = async () => {
  const supabase = await createClient()

  const [q, w, a] = await Promise.all([
    supabase.from('questions').select('question_id', { count: 'exact', head: true }),
    supabase.from('wiki_articles').select('article_id', { count: 'exact', head: true }),
    supabase.from('models_3d').select('model_id', { count: 'exact', head: true }),
  ])

  return {
    questions: q.count || 0,
    wiki: w.count || 0,
    assets: a.count || 0,
  }
}

export interface AdminDashboardData {
  questions: number
  wikiTotal: number
  publishedArticles: number
  draftArticles: number
  taxonomyNodes: number
  assets: number
  recentAuditLogs: AuditLog[]
}

export interface SubjectContentCount {
  node_id: string
  name: string
  ale_id: string | null
  questionCount: number
  articleCount: number
}

export interface CoverageGap {
  node_id: string
  name: string
  ale_id: string | null
  exam_frequency: string
}

export const getAdminDashboardData = async (): Promise<AdminDashboardData> => {
  const supabase = await createClient()

  const [q, wTotal, wPublished, wDraft, taxonomy, assets3d, logs] = await Promise.all([
    supabase.from('questions').select('question_id', { count: 'exact', head: true }),
    supabase.from('wiki_articles').select('article_id', { count: 'exact', head: true }),
    supabase.from('wiki_articles').select('article_id', { count: 'exact', head: true }).eq('status', 'published'),
    supabase.from('wiki_articles').select('article_id', { count: 'exact', head: true }).eq('status', 'draft'),
    supabase.from('taxonomy_tree').select('node_id', { count: 'exact', head: true }),
    supabase.from('models_3d').select('model_id', { count: 'exact', head: true }),
    supabase.from('audit_logs').select('id, actor_id, event_type, table_name, record_id, metadata, content_snapshot, created_at').order('created_at', { ascending: false }).limit(20),
  ])

  return {
    questions: q.count || 0,
    wikiTotal: wTotal.count || 0,
    publishedArticles: wPublished.count || 0,
    draftArticles: wDraft.count || 0,
    taxonomyNodes: taxonomy.count || 0,
    assets: assets3d.count || 0,
    recentAuditLogs: (logs.data as AuditLog[]) || [],
  }
}

export const getContentBySubject = async (): Promise<SubjectContentCount[]> => {
  const supabase = await createClient()

  // Fetch level-1 taxonomy nodes (subjects)
  const { data: subjects } = await supabase
    .from('taxonomy_tree')
    .select('node_id, name, ale_id')
    .eq('level', 1)
    .is('deprecated_at', null)
    .order('name', { ascending: true })

  if (!subjects || subjects.length === 0) return []

  const subjectIds = subjects.map((s) => s.node_id)

  // Batch fetch question counts and article counts in two parallel queries
  const [questionsRes, articlesRes] = await Promise.all([
    supabase
      .from('questions')
      .select('topic_id')
      .in('topic_id', subjectIds),
    supabase
      .from('wiki_article_taxonomy')
      .select('node_id')
      .in('node_id', subjectIds),
  ])

  // Build count maps from the batched results
  const questionCountMap = new Map<string, number>()
  for (const q of questionsRes.data ?? []) {
    questionCountMap.set(q.topic_id, (questionCountMap.get(q.topic_id) ?? 0) + 1)
  }

  const articleCountMap = new Map<string, number>()
  for (const a of articlesRes.data ?? []) {
    articleCountMap.set(a.node_id, (articleCountMap.get(a.node_id) ?? 0) + 1)
  }

  return subjects.map((subject) => ({
    node_id: subject.node_id,
    name: subject.name,
    ale_id: subject.ale_id,
    questionCount: questionCountMap.get(subject.node_id) ?? 0,
    articleCount: articleCountMap.get(subject.node_id) ?? 0,
  }))
}

export interface NeedsAttentionData {
  pendingReviews: number
  missingRationale: number
}

export const getNeedsAttentionData = async (): Promise<NeedsAttentionData> => {
  const supabase = await createClient()

  const [reviews, rationale] = await Promise.all([
    supabase
      .from('wiki_articles')
      .select('article_id', { count: 'exact', head: true })
      .eq('status', 'review'),
    supabase
      .from('questions')
      .select('question_id', { count: 'exact', head: true })
      .is('rationale', null),
  ])

  return {
    pendingReviews: reviews.count || 0,
    missingRationale: rationale.count || 0,
  }
}

export const getCriticalCoverageGap = async (): Promise<CoverageGap | null> => {
  const supabase = await createClient()

  // Fetch high-frequency leaf nodes, fall back to medium if none found
  const { data: highFreqLeaves } = await supabase
    .from('taxonomy_tree')
    .select('node_id, name, ale_id, exam_frequency')
    .eq('is_leaf', true)
    .eq('exam_frequency', 'high')
    .is('deprecated_at', null)
    .order('name', { ascending: true })

  let candidates = highFreqLeaves && highFreqLeaves.length > 0 ? highFreqLeaves : null

  if (!candidates) {
    const { data: medFreqLeaves } = await supabase
      .from('taxonomy_tree')
      .select('node_id, name, ale_id, exam_frequency')
      .eq('is_leaf', true)
      .eq('exam_frequency', 'medium')
      .is('deprecated_at', null)
      .order('name', { ascending: true })

    if (!medFreqLeaves || medFreqLeaves.length === 0) return null
    candidates = medFreqLeaves
  }

  // Batch fetch all node IDs that have at least one question
  const candidateIds = candidates.map((n) => n.node_id)
  const { data: coveredNodes } = await supabase
    .from('questions')
    .select('topic_id')
    .in('topic_id', candidateIds)

  const coveredSet = new Set((coveredNodes ?? []).map((q) => q.topic_id))

  // Return the first candidate with zero questions
  const gap = candidates.find((n) => !coveredSet.has(n.node_id))
  return gap
    ? { node_id: gap.node_id, name: gap.name, ale_id: gap.ale_id, exam_frequency: gap.exam_frequency }
    : null
}

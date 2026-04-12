'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { canReviewContent } from '@/lib/admin/roles'
import type { AuditLog } from '@/lib/audit/audit-queries'
import { unstable_cache } from 'next/cache'
import { REVIEW_QUEUE_STATUSES } from '@/lib/admin/editor-workflow'

const fetchAdminStats = unstable_cache(
  async () => {
    const supabase = createAdminClient()

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
  },
  ['admin-stats'],
  { revalidate: 60 }
)

export const getAdminStats = async () => {
  const authorized = await canReviewContent()
  if (!authorized) throw new Error('Unauthorized')

  return fetchAdminStats()
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
  lea_id: string | null
  questionCount: number
  articleCount: number
}

export interface CoverageGap {
  node_id: string
  name: string
  lea_id: string | null
  exam_frequency: string
}

const fetchAdminDashboardData = unstable_cache(
  async () => {
    const supabase = createAdminClient()

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
  },
  ['admin-dashboard-data'],
  { revalidate: 60 }
)

export const getAdminDashboardData = async (): Promise<AdminDashboardData> => {
  const authorized = await canReviewContent()
  if (!authorized) throw new Error('Unauthorized')

  return fetchAdminDashboardData()
}

const fetchContentBySubject = unstable_cache(
  async () => {
    const supabase = createAdminClient()

    // 1. Fetch all non-deprecated taxonomy nodes to build the hierarchy map
    const { data: allNodes, error: nodesError } = await supabase
      .from('taxonomy_tree')
      .select('node_id, parent_id, level, name, lea_id')
      .is('deprecated_at', null)

    if (nodesError || !allNodes) return []

    // 2. Identify subjects (level 1) and build child-to-subject mapping
    const subjects = allNodes
      .filter((n) => n.level === 1)
      .sort((a, b) => a.name.localeCompare(b.name))
    
    const nodeMap = new Map<string, typeof allNodes[number]>(allNodes.map((n) => [n.node_id, n]))
    const subjectMap = new Map<string, string>() // node_id -> level_1_subject_id

    // Helper to find the level 1 ancestor
    const getSubjectAncestor = (nodeId: string): string | null => {
      let current = nodeMap.get(nodeId)
      while (current && current.level > 1 && current.parent_id) {
        current = nodeMap.get(current.parent_id)
      }
      return current && current.level === 1 ? current.node_id : null
    }

    allNodes.forEach((node) => {
      const ancestorId = getSubjectAncestor(node.node_id)
      if (ancestorId) {
        subjectMap.set(node.node_id, ancestorId)
      }
    })

    // 3. Fetch all question topic_ids and article node_ids
    const [questionsRes, articlesRes] = await Promise.all([
      supabase.from('questions').select('topic_id'),
      supabase.from('wiki_article_taxonomy').select('node_id, article_id'),
    ])

    const questionTopicIds = questionsRes.data || []
    const articleMappings = articlesRes.data || []

    // 4. Aggregate counts
    const counts = new Map<string, { q: number; a: Set<string> }>()
    subjects.forEach((s) => counts.set(s.node_id, { q: 0, a: new Set() }))

    questionTopicIds.forEach((q) => {
      const subjectId = subjectMap.get(q.topic_id)
      if (subjectId && counts.has(subjectId)) {
        counts.get(subjectId)!.q++
      }
    })

    articleMappings.forEach((am) => {
      const subjectId = subjectMap.get(am.node_id)
      if (subjectId && counts.has(subjectId)) {
        counts.get(subjectId)!.a.add(am.article_id)
      }
    })

    // 5. Format results
    return subjects.map((s) => {
      const c = counts.get(s.node_id) || { q: 0, a: new Set() }
      return {
        node_id: s.node_id,
        name: s.name,
        lea_id: s.lea_id,
        questionCount: c.q,
        articleCount: c.a.size,
      }
    })
  },
  ['admin-content-by-subject'],
  { revalidate: 60 }
)

export const getContentBySubject = async (): Promise<SubjectContentCount[]> => {
  const authorized = await canReviewContent()
  if (!authorized) throw new Error('Unauthorized')

  return fetchContentBySubject()
}

export interface NeedsAttentionData {
  pendingReviews: number
  missingRationale: number
}

const fetchNeedsAttentionData = unstable_cache(
  async () => {
    const supabase = createAdminClient()

    const [reviews, rationale] = await Promise.all([
      supabase
        .from('wiki_articles')
        .select('article_id', { count: 'exact', head: true })
        .in('status', [...REVIEW_QUEUE_STATUSES]),
      supabase
        .from('questions')
        .select('question_id', { count: 'exact', head: true })
        .is('rationale', null),
    ])

    return {
      pendingReviews: reviews.count || 0,
      missingRationale: rationale.count || 0,
    }
  },
  ['admin-needs-attention'],
  { revalidate: 60 }
)

export const getNeedsAttentionData = async (): Promise<NeedsAttentionData> => {
  const authorized = await canReviewContent()
  if (!authorized) throw new Error('Unauthorized')

  return fetchNeedsAttentionData()
}

const fetchCriticalCoverageGap = unstable_cache(
  async () => {
    const supabase = createAdminClient()

    // Fetch high-frequency leaf nodes, fall back to medium if none found
    const { data: highFreqLeaves } = await supabase
      .from('taxonomy_tree')
      .select('node_id, name, lea_id, exam_frequency')
      .eq('is_leaf', true)
      .eq('exam_frequency', 'high')
      .is('deprecated_at', null)
      .order('name', { ascending: true })

    let candidates = highFreqLeaves && highFreqLeaves.length > 0 ? highFreqLeaves : null

    if (!candidates) {
      const { data: medFreqLeaves } = await supabase
        .from('taxonomy_tree')
        .select('node_id, name, lea_id, exam_frequency')
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
      ? { node_id: gap.node_id, name: gap.name, lea_id: gap.lea_id, exam_frequency: gap.exam_frequency }
      : null
  },
  ['admin-coverage-gap'],
  { revalidate: 60 }
)

export const getCriticalCoverageGap = async (): Promise<CoverageGap | null> => {
  const authorized = await canReviewContent()
  if (!authorized) throw new Error('Unauthorized')

  return fetchCriticalCoverageGap()
}

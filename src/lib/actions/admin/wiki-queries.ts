'use server'

import { createClient } from '@/lib/supabase/server'
import { canReviewContent } from '@/lib/admin/roles'

export const getArticlesWithCoverage = async () => {
  const authorized = await canReviewContent()
  if (!authorized) throw new Error('Unauthorized')

  const supabase = await createClient()

  const { data: articles } = await supabase
    .from('wiki_articles')
    .select('article_id, title, slug, status, content, created_at, updated_at')
    .order('updated_at', { ascending: false })
    .limit(200)

  if (!articles) return []

  const articleIds = articles.map((a) => a.article_id)
  const { data: mappings } = await supabase
    .from('wiki_article_taxonomy')
    .select('article_id, node_id')
    .in('article_id', articleIds)

  if (!mappings || mappings.length === 0) {
    return articles.map((a) => ({ ...a, questionCount: 0, hasCoverage: false }))
  }

  const nodeIds = [...new Set(mappings.map((m) => m.node_id))]
  const { data: questions } = await supabase
    .from('questions')
    .select('topic_id')
    .in('topic_id', nodeIds)

  const nodeQuestionCount = new Map<string, number>()
  for (const q of questions ?? []) {
    nodeQuestionCount.set(q.topic_id, (nodeQuestionCount.get(q.topic_id) ?? 0) + 1)
  }

  const articleQuestionCount = new Map<string, number>()
  for (const m of mappings) {
    const current = articleQuestionCount.get(m.article_id) ?? 0
    articleQuestionCount.set(m.article_id, current + (nodeQuestionCount.get(m.node_id) ?? 0))
  }

  return articles.map((a) => ({
    ...a,
    questionCount: articleQuestionCount.get(a.article_id) ?? 0,
    hasCoverage: (articleQuestionCount.get(a.article_id) ?? 0) > 0,
  }))
}

export const getArticles = async () => {
  const authorized = await canReviewContent()
  if (!authorized) throw new Error('Unauthorized')

  const supabase = await createClient()

  const { data, error } = await supabase
    .from('wiki_articles')
    .select('article_id, title, slug, status, content, created_at, updated_at')
    .order('updated_at', { ascending: false })
    .limit(200)

  if (error) {
    console.error('Error fetching articles:', error)
    return []
  }

  return data || []
}

export const getArticle = async (id: string) => {
  const authorized = await canReviewContent()
  if (!authorized) throw new Error('Unauthorized')

  const supabase = await createClient()
  const { data, error } = await supabase
    .from('wiki_articles')
    .select('id:article_id, title, content')
    .eq('article_id', id)
    .single()

  if (error || !data) return null
  return data
}

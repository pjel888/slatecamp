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

export const getAdminDashboardData = async (): Promise<AdminDashboardData> => {
  const supabase = await createClient()

  const [q, wTotal, wPublished, wDraft, taxonomy, assets3d, logs] = await Promise.all([
    supabase.from('questions').select('question_id', { count: 'exact', head: true }),
    supabase.from('wiki_articles').select('article_id', { count: 'exact', head: true }),
    supabase.from('wiki_articles').select('article_id', { count: 'exact', head: true }).eq('status', 'published'),
    supabase.from('wiki_articles').select('article_id', { count: 'exact', head: true }).eq('status', 'draft'),
    supabase.from('taxonomy_tree').select('node_id', { count: 'exact', head: true }),
    supabase.from('models_3d').select('model_id', { count: 'exact', head: true }),
    supabase.from('audit_logs').select('*').order('created_at', { ascending: false }).limit(20),
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

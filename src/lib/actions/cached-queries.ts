import { unstable_cache } from 'next/cache'
import { createStaticClient } from '@/lib/supabase/server'
import { resolveArticleAndNode } from './wiki-actions'

// ── Global data caches (same for all users, revalidate hourly) ───────────

/** All disciplines — used in layout sidebar + discipline context. */
export const getCachedDisciplines = unstable_cache(
  async () => {
    const supabase = await createStaticClient()
    const { data } = await supabase
      .from('disciplines')
      .select('discipline_id, name, acronym, created_at, updated_at')
      .order('name')
    return data ?? []
  },
  ['disciplines'],
  { revalidate: 3600 }
)

/** Dashboard taxonomy tree (levels 1–3, excluding cross-ref and deprecated). */
export const getCachedTaxonomyTree = unstable_cache(
  async () => {
    const supabase = await createStaticClient()
    const { data } = await supabase
      .from('taxonomy_tree')
      .select('node_id, parent_id, level, name, subject_area, ale_id')
      .in('level', [1, 2, 3])
      .eq('is_cross_ref_only', false)
      .is('deprecated_at', null)
      .not('ale_id', 'is', null)
      .order('subject_area')
      .order('level')
      .order('name')
    return data ?? []
  },
  ['taxonomy-tree-dashboard'],
  { revalidate: 3600 }
)

/** Wiki articles for daily rotation on dashboard. */
export const getCachedWikiArticles = unstable_cache(
  async () => {
    const supabase = await createStaticClient()
    const { data } = await supabase
      .from('wiki_articles')
      .select('article_id, title, slug, content')
      .order('created_at', { ascending: true })
      .limit(50)
    return data ?? []
  },
  ['wiki-articles-rotation'],
  { revalidate: 3600 }
)

/** Wiki article + taxonomy node by slug — per-slug cache. */
export const getCachedArticleAndNode = unstable_cache(
  async (slug: string) => resolveArticleAndNode(slug),
  ['wiki-article'],
  { revalidate: 3600 }
)

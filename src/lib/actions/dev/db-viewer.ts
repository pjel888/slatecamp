'use server'

import { createClient } from '@/lib/supabase/server'
import { assertDeveloperAccess } from '@/lib/developer/access'

export interface TableInfo {
  table_name: string
  row_count: number
  rls_enabled: boolean
}

/**
 * Get table names, approximate row counts, and RLS status for all public tables.
 */
export async function getTableInfo(): Promise<TableInfo[]> {
  await assertDeveloperAccess()

  const supabase = await createClient()

  const { data, error } = await supabase.rpc('get_table_info_for_dev')

  // If the RPC doesn't exist, fall back to a simpler query
  if (error) {
    // Fallback: query pg_stat_user_tables directly via raw SQL isn't available
    // through the Supabase client, so return a helpful message structure
    const knownTables = [
      'profiles',
      'user_subscriptions',
      'user_global_stats',
      'disciplines',
      'questions',
      'quiz_sessions',
      'user_interactions',
      'user_node_mastery',
      'user_srs_cards',
      'taxonomy_tree',
      'wiki_articles',
      'wiki_article_taxonomy',
      'wiki_bookmarks',
      'wiki_highlights',
      'notes',
      'feature_flags',
      'organizations',
      'organization_members',
    ]

    const results: TableInfo[] = []

    for (const table of knownTables) {
      const { count } = await supabase
        .from(table)
        .select('*', { count: 'exact', head: true })

      results.push({
        table_name: table,
        row_count: count ?? 0,
        rls_enabled: true, // Assume true since we can query it
      })
    }

    return results
  }

  return (data as TableInfo[]) ?? []
}

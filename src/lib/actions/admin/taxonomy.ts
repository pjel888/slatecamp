import { createClient } from '@/lib/supabase/server'

export async function getTaxonomyNodes() {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('taxonomy_tree')
    .select('id:node_id, name, level, subject_area, is_leaf, parent_id, discipline_id')
    .order('level', { ascending: true })
    .order('name', { ascending: true })

  if (error) {
    console.error('Error fetching taxonomy nodes:', error)
    return []
  }

  return data || []
}

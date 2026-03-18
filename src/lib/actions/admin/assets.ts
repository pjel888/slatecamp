import { createClient } from '@/lib/supabase/server'

export async function getAssets() {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('models_3d')
    .select('id:model_id, name, slug, url, thumbnail, created_at')
    .order('created_at', { ascending: false })
    .limit(50)

  if (error) {
    console.error('Error fetching assets:', error)
    return []
  }

  return data || []
}

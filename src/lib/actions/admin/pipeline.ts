'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { canManageContent } from '@/lib/admin/roles'
import { revalidatePath } from 'next/cache'

export const getPipelineArticles = async () => {
  const supabase = await createClient()
  const { data } = await supabase
    .from('wiki_articles')
    .select('article_id, title, slug, status, updated_at, created_at')
    .order('updated_at', { ascending: false })
  return data || []
}

export const updateArticleStatus = async (
  articleId: string,
  newStatus: 'draft' | 'review' | 'published',
) => {
  const authorized = await canManageContent()
  if (!authorized) throw new Error('Unauthorized')

  const supabase = createAdminClient()
  const { error } = await supabase
    .from('wiki_articles')
    .update({ status: newStatus, updated_at: new Date().toISOString() })
    .eq('article_id', articleId)

  if (error) throw new Error(`Failed to update status: ${error.message}`)

  revalidatePath('/admin/pipeline')
  revalidatePath('/admin/articles')
  revalidatePath('/admin/reviews')
}

'use server'

import { revalidatePath } from 'next/cache'
import { canManageContent } from '@/lib/admin/roles'
import { createAdminClient } from '@/lib/supabase/admin'

export const bulkDeleteQuestions = async (ids: string[]) => {
  const authorized = await canManageContent()
  if (!authorized) return { error: 'Unauthorized' }

  const supabase = createAdminClient()
  const { error } = await supabase
    .from('questions')
    .delete()
    .in('question_id', ids)

  if (error) return { error: error.message }

  revalidatePath('/admin/questions')
  revalidatePath('/admin/content')
  return { error: null, deleted: ids.length }
}

export const bulkDeleteArticles = async (ids: string[]) => {
  const authorized = await canManageContent()
  if (!authorized) return { error: 'Unauthorized' }

  const supabase = createAdminClient()
  const { error } = await supabase
    .from('wiki_articles')
    .delete()
    .in('article_id', ids)

  if (error) return { error: error.message }

  revalidatePath('/admin/articles')
  revalidatePath('/admin/wiki')
  return { error: null, deleted: ids.length }
}

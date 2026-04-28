'use server'

import { revalidatePath, revalidateTag } from '@/lib/cache/revalidate'
import { CACHE_TAGS } from '../cache-tags'
import { assertPermission } from '@/lib/admin/roles'
import { createAdminClient } from '@/lib/supabase/admin'
import { ROUTES } from '@/lib/routes'

export const bulkDeleteQuestions = async (ids: string[]) => {
  await assertPermission('admin.content.delete')

  const supabase = createAdminClient()
  const { data: rows, error: rowsError } = await supabase
    .from('questions')
    .select('article_id')
    .in('question_id', ids)

  if (rowsError) return { error: rowsError.message }

  const { error } = await supabase
    .from('questions')
    .delete()
    .in('question_id', ids)

  if (error) return { error: error.message }

  revalidatePath(ROUTES.admin.knowledgeQuestions)
  revalidatePath(ROUTES.admin.knowledge)
  const articleIds = [...new Set((rows ?? []).map((row) => row.article_id).filter(Boolean))]
  for (const articleId of articleIds) {
    revalidatePath(ROUTES.admin.article(articleId))
  }
  return { error: null, deleted: ids.length }
}

export const bulkDeleteArticles = async (ids: string[]) => {
  await assertPermission('admin.content.delete')

  const supabase = createAdminClient()
  const { error } = await supabase
    .from('wiki_articles')
    .update({ 
      status: 'archived',
      updated_at: new Date().toISOString()
    })
    .in('article_id', ids)

  if (error) return { error: error.message }

  revalidateTag(CACHE_TAGS.wiki, 'max')
  revalidatePath(ROUTES.admin.knowledge)
  revalidatePath(ROUTES.admin.knowledgeQuestions)
  return { error: null, deleted: ids.length }
}

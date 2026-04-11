'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { canManageContent } from '@/lib/admin/roles'
import { revalidatePath, revalidateTag } from 'next/cache'
import { CACHE_TAGS } from '../cache-tags'
import { ROUTES } from '@/lib/routes'
import { logServerError } from '@/lib/logging/server'

export const getPipelineArticles = async () => {
  const supabase = await createClient()
  const { data } = await supabase
    .from('wiki_articles')
    .select('article_id, title, status, updated_at, profiles(display_name)')
    .order('updated_at', { ascending: false })

  return data || []
}

export const updateArticleStatus = async (articleId: string, newStatus: string) => {
  const authorized = await canManageContent()
  if (!authorized) {
    await logServerError({
      family: 'admin',
      eventName: 'pipeline_update_status_unauthorized',
      message: 'Unauthorized attempt to update article pipeline status.',
      context: {
        routeOrAction: 'admin:pipeline.updateArticleStatus',
        metadata: {
          articleId,
          newStatus,
        },
      },
    })
    throw new Error('Unauthorized')
  }

  const supabase = createAdminClient()
  const { error } = await supabase
    .from('wiki_articles')
    .update({ status: newStatus, updated_at: new Date().toISOString() })
    .eq('article_id', articleId)

  if (error) {
    await logServerError({
      family: 'admin',
      eventName: 'pipeline_update_status_failed',
      message: 'Failed to update article pipeline status.',
      context: {
        routeOrAction: 'admin:pipeline.updateArticleStatus',
        metadata: {
          articleId,
          newStatus,
        },
      },
      error,
    })
    throw new Error(`Failed to update status: ${error.message}`)
  }

  revalidateTag(CACHE_TAGS.wiki, 'max')
  revalidatePath(ROUTES.admin.pipeline)
  revalidatePath(ROUTES.admin.knowledge)
  revalidatePath(ROUTES.admin.reviews)
}

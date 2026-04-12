'use server'

import { revalidatePath } from 'next/cache'

import { canManageContent } from '@/lib/admin/roles'
import { ROUTES } from '@/lib/routes'
import { createAdminClient } from '@/lib/supabase/admin'

export async function generateDraftPreview(articleId: string, content: string) {
  const hasAccess = await canManageContent()
  if (!hasAccess) {
    throw new Error('Forbidden')
  }

  const supabase = createAdminClient()

  const { data, error } = await supabase
    .from('admin_draft_previews')
    .insert({
      article_id: articleId,
      content,
    })
    .select('id')
    .single()

  if (error || !data) {
    console.error('Error generating preview draft:', error)
    throw new Error('Failed to generate preview')
  }

  return data.id as string
}

export async function updateDraftPreview(previewId: string, content: string) {
  const hasAccess = await canManageContent()
  if (!hasAccess) {
    throw new Error('Forbidden')
  }

  const supabase = createAdminClient()

  const { error } = await supabase
    .from('admin_draft_previews')
    .update({ content })
    .eq('id', previewId)

  if (error) {
    console.error('Error updating preview draft:', error)
    throw new Error('Failed to update preview')
  }

  revalidatePath(ROUTES.admin.preview(previewId))
}

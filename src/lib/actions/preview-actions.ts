'use server'

import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'

import { canReviewContent } from '@/lib/admin/roles'
import { ROUTES } from '@/lib/routes'

export async function generateDraftPreview(articleId: string, content: string) {
  // Check authorization using the shared roles utility
  const hasAccess = await canReviewContent()
  if (!hasAccess) {
    throw new Error('Forbidden')
  }

  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options)
            })
          } catch (error) {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  )

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
  // Check authorization
  const hasAccess = await canReviewContent()
  if (!hasAccess) {
    throw new Error('Forbidden')
  }

  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll() { return cookieStore.getAll() }, setAll() {} } }
  )

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

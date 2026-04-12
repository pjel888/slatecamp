'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { canReviewContent, getUserRole } from '@/lib/admin/roles'
import { ROUTES } from '@/lib/routes'

export interface WikiArticle {
  id: string
  title: string
  content: string
  discipline_id: string | null
  author_id: string | null
  status: 'draft' | 'pending_review' | 'changes_requested' | 'approved' | 'published' | 'archived'
  reviewed_by: string | null
  reviewed_at: string | null
  reviewer_comments: string | null
  created_at: string
  updated_at: string
}

export interface CreateArticleInput {
  title: string
  content: string
  discipline_id?: string
  author_id?: string
}

export interface UpdateArticleInput extends Partial<CreateArticleInput> {
  status?: WikiArticle['status']
  reviewed_by?: string
  reviewed_at?: string
  reviewer_comments?: string
}

export async function createArticle(input: CreateArticleInput): Promise<{ success: boolean; error?: string; id?: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: 'Not authenticated' }
  }

  const isAdmin = await canReviewContent()
  if (!isAdmin) {
    return { success: false, error: 'Not authorized' }
  }

  const { data, error } = await supabase
    .from('wiki_articles')
    .insert({
      title: input.title,
      content: input.content,
      discipline_id: input.discipline_id || null,
      author_id: input.author_id || user.id,
      status: 'draft',
    })
    .select('id')
    .single()

  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath(ROUTES.admin.wiki)
  return { success: true, id: data.id }
}

export async function updateArticle(id: string, input: UpdateArticleInput): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: 'Not authenticated' }
  }

  const isAdmin = await canReviewContent()
  if (!isAdmin) {
    return { success: false, error: 'Not authorized' }
  }

  const { error } = await supabase
    .from('wiki_articles')
    .update({
      ...input,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)

  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath('/admin/wiki')
  revalidatePath(`/admin/wiki/${id}`)
  return { success: true }
}

export async function deleteArticle(id: string): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: 'Not authenticated' }
  }

  const isAdmin = await canReviewContent()
  if (!isAdmin) {
    return { success: false, error: 'Not authorized' }
  }

  // Soft delete - set status to archived
  const { error } = await supabase
    .from('wiki_articles')
    .update({ status: 'archived', updated_at: new Date().toISOString() })
    .eq('id', id)

  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath('/admin/wiki')
  return { success: true }
}

export async function submitForReview(id: string): Promise<{ success: boolean; error?: string }> {
  return updateArticle(id, { status: 'pending_review' })
}

export async function approveArticle(id: string, comments?: string): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: 'Not authenticated' }
  }

  const authorized = await canReviewContent()
  if (!authorized) {
    return { success: false, error: 'Not authorized to approve' }
  }

  const { error } = await supabase
    .from('wiki_articles')
    .update({
      status: 'approved',
      reviewed_by: user.id,
      reviewed_at: new Date().toISOString(),
      reviewer_comments: comments || null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)

  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath('/admin/wiki')
  revalidatePath(`/admin/wiki/${id}`)
  return { success: true }
}

export async function requestChanges(id: string, comments: string): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: 'Not authenticated' }
  }

  const authorized = await canReviewContent()
  if (!authorized) {
    return { success: false, error: 'Not authorized to request changes' }
  }

  const { error } = await supabase
    .from('wiki_articles')
    .update({
      status: 'changes_requested',
      reviewed_by: user.id,
      reviewed_at: new Date().toISOString(),
      reviewer_comments: comments,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)

  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath('/admin/wiki')
  revalidatePath(`/admin/wiki/${id}`)
  return { success: true }
}

export async function publishArticle(id: string): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: 'Not authenticated' }
  }

  const isAdmin = await canReviewContent()
  if (!isAdmin) {
    return { success: false, error: 'Not authorized' }
  }

  // Check current status - must be approved before publishing
  const { data: article } = await supabase
    .from('wiki_articles')
    .select('status')
    .eq('id', id)
    .single()

  if (!article || article.status !== 'approved') {
    return { success: false, error: 'Article must be approved before publishing' }
  }

  const { error } = await supabase
    .from('wiki_articles')
    .update({
      status: 'published',
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)

  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath('/admin/wiki')
  revalidatePath(`/admin/wiki/${id}`)
  return { success: true }
}

'use server'

import { z } from 'zod'
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath, revalidateTag } from "next/cache";
import { canManageContent, canReviewContent } from "@/lib/admin/roles";
import { CACHE_TAGS } from '../cache-tags'
import { ROUTES } from '@/lib/routes'
import { logServerError } from '@/lib/logging/server'
import {
  getStatusWriteCandidates,
  isLegacyStatusConstraintError,
  normalizeEditorStatus,
} from '@/lib/admin/editor-workflow'
import { compileMdxPreview } from './content'

const UpdateWikiArticleSchema = z.object({
  title: z.string().min(1, 'Title is required').max(500),
  content: z.string().min(1, 'Content is required'),
  slug: z.string().optional(),
  author_id: z.string().uuid().optional(),
  discipline_id: z.string().uuid().optional(),
  status: z.string().optional(),
  metadata: z.record(z.string(), z.any()).optional(),
  tags: z.array(z.string()).optional(),
})

export const updateWikiArticle = async (id: string, data: z.infer<typeof UpdateWikiArticleSchema>) => {
  const authorized = await canManageContent()
  if (!authorized) {
    await logServerError({
      family: 'admin',
      eventName: 'wiki_update_unauthorized',
      message: 'Unauthorized attempt to update wiki article.',
      context: {
        routeOrAction: 'admin:wiki.update',
        metadata: {
          articleId: id,
        },
      },
    })
    throw new Error('Unauthorized: insufficient permissions')
  }

  const parsed = UpdateWikiArticleSchema.safeParse(data)
  if (!parsed.success) {
    await logServerError({
      family: 'admin',
      eventName: 'wiki_update_validation_failed',
      message: 'Wiki update validation failed.',
      context: {
        routeOrAction: 'admin:wiki.update',
        metadata: {
          articleId: id,
        },
      },
      error: new Error(parsed.error.issues[0].message),
      persist: false,
    })
    throw new Error(parsed.error.issues[0].message)
  }

  const supabase = createAdminClient()

  // Use raw data for update to avoid Zod object differences if needed, 
  // but parsed data is safer.
  const writeCandidates = getStatusWriteCandidates(parsed.data.status)
  let error: { code?: string; message?: string } | null = null

  for (const candidate of writeCandidates) {
    const result = await supabase
      .from('wiki_articles')
      .update({
        ...parsed.data,
        status: candidate,
        updated_at: new Date().toISOString(),
      })
      .eq('article_id', id)

    error = result.error
    if (!error) {
      break
    }

    const shouldRetryCompatibilityWrite =
      candidate !== writeCandidates[writeCandidates.length - 1] &&
      isLegacyStatusConstraintError(error)

    if (!shouldRetryCompatibilityWrite) {
      break
    }
  }

  if (!error) {
    revalidateTag(CACHE_TAGS.wiki, 'max')
    revalidatePath(ROUTES.admin.wiki);
    revalidatePath(ROUTES.admin.article(id));
    revalidatePath(ROUTES.admin.knowledge);
    revalidatePath(ROUTES.wiki.root);
  }

  if (error) {
    await logServerError({
      family: 'admin',
      eventName: 'wiki_update_failed',
      message: 'Failed to update wiki article.',
      context: {
        routeOrAction: 'admin:wiki.update',
        metadata: {
          articleId: id,
        },
      },
      error,
    })
  }

  return { error };
}

export const createWikiArticle = async (data: z.infer<typeof UpdateWikiArticleSchema>) => {
  const authorized = await canManageContent()
  if (!authorized) {
    await logServerError({
      family: 'admin',
      eventName: 'wiki_create_unauthorized',
      message: 'Unauthorized attempt to create wiki article.',
      context: {
        routeOrAction: 'admin:wiki.create',
      },
    })
    throw new Error('Unauthorized: insufficient permissions')
  }

  const parsed = UpdateWikiArticleSchema.safeParse(data)
  if (!parsed.success) {
    await logServerError({
      family: 'admin',
      eventName: 'wiki_create_validation_failed',
      message: 'Wiki creation validation failed.',
      context: {
        routeOrAction: 'admin:wiki.create',
      },
      error: new Error(parsed.error.issues[0].message),
      persist: false,
    })
    throw new Error(parsed.error.issues[0].message)
  }

  const authClient = await createClient()
  const { data: { user } } = await authClient.auth.getUser()

  const supabase = createAdminClient()

  const writeCandidates = getStatusWriteCandidates(parsed.data.status)
  let newArticle = null
  let error: { code?: string; message?: string } | null = null

  for (const candidate of writeCandidates) {
    const result = await supabase
      .from('wiki_articles')
      .insert([{
        ...parsed.data,
        author_id: parsed.data.author_id || user?.id,
        status: candidate,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }])
      .select()
      .single()

    newArticle = result.data
    error = result.error

    if (!error) {
      break
    }

    const shouldRetryCompatibilityWrite =
      candidate !== writeCandidates[writeCandidates.length - 1] &&
      isLegacyStatusConstraintError(error)

    if (!shouldRetryCompatibilityWrite) {
      break
    }
  }

  let mappingError = null

  if (!error && newArticle && parsed.data.discipline_id) {
    const { error: insertMappingError } = await supabase.from('wiki_article_taxonomy').insert({
      article_id: newArticle.article_id,
      node_id: parsed.data.discipline_id,
      is_primary: true
    })

    if (insertMappingError) {
      mappingError = insertMappingError
      await logServerError({
        family: 'admin',
        eventName: 'wiki_create_taxonomy_mapping_failed',
        message: 'Failed to create taxonomy mapping for new wiki article.',
        context: {
          routeOrAction: 'admin:wiki.create',
          userId: user?.id ?? null,
          metadata: {
            articleId: newArticle.article_id,
            nodeId: parsed.data.discipline_id,
          },
        },
        error: insertMappingError,
      })
    }
  }

  revalidateTag(CACHE_TAGS.wiki, 'max')
  revalidatePath(ROUTES.admin.wiki);
  revalidatePath(ROUTES.wiki.root);

  if (error) {
    await logServerError({
      family: 'admin',
      eventName: 'wiki_create_failed',
      message: 'Failed to create wiki article.',
      context: {
        routeOrAction: 'admin:wiki.create',
        userId: user?.id ?? null,
      },
      error,
    })
  }

  return { data: newArticle, error: error ?? mappingError };
}

export async function deleteWikiArticle(id: string) {
  const authorized = await canManageContent()
  if (!authorized) {
    await logServerError({
      family: 'admin',
      eventName: 'wiki_delete_unauthorized',
      message: 'Unauthorized attempt to delete wiki article.',
      context: {
        routeOrAction: 'admin:wiki.delete',
        metadata: {
          articleId: id,
        },
      },
    })
    throw new Error('Unauthorized: insufficient permissions')
  }

  const supabase = createAdminClient()

  // Soft delete by updating status to 'archived'
  const { error } = await supabase
    .from('wiki_articles')
    .update({ 
      status: 'archived',
      updated_at: new Date().toISOString()
    })
    .eq('article_id', id)

  if (error) {
    await logServerError({
      family: 'admin',
      eventName: 'wiki_delete_failed',
      message: 'Failed to archive wiki article.',
      context: {
        routeOrAction: 'admin:wiki.delete',
        metadata: {
          articleId: id,
        },
      },
      error,
    })
    throw new Error(`Failed to archive article: ${error.message}`)
  }

  revalidateTag(CACHE_TAGS.wiki, 'max')
  revalidatePath(ROUTES.admin.wiki);
  revalidatePath(ROUTES.admin.knowledge);
  revalidatePath(ROUTES.wiki.root);

  return { error: null }
}

export const approveWikiArticleReview = async (
  articleId: string,
  reviewerComments?: string,
) => {
  const authorized = await canReviewContent()
  if (!authorized) {
    throw new Error('Unauthorized: insufficient permissions')
  }

  const authClient = await createClient()
  const { data: { user } } = await authClient.auth.getUser()
  const supabase = createAdminClient()

  const { data: article, error: articleError } = await supabase
    .from('wiki_articles')
    .select('article_id, content')
    .eq('article_id', articleId)
    .maybeSingle()

  if (articleError || !article) {
    throw new Error('Article not found for review approval')
  }

  const previewValidation = await compileMdxPreview(article.content)
  if (previewValidation.error) {
    throw new Error(`Cannot approve article with invalid MDX: ${previewValidation.error}`)
  }

  const { error } = await supabase
    .from('wiki_articles')
    .update({
      status: 'approved',
      reviewed_by: user?.id ?? null,
      reviewed_at: new Date().toISOString(),
      reviewer_comments: reviewerComments?.trim() || null,
      updated_at: new Date().toISOString(),
    })
    .eq('article_id', articleId)

  if (error) {
    await logServerError({
      family: 'admin',
      eventName: 'wiki_review_approve_failed',
      message: 'Failed to approve wiki article from review queue.',
      context: {
        routeOrAction: 'admin:wiki.approveReview',
        userId: user?.id ?? null,
        metadata: {
          articleId,
        },
      },
      error,
    })
    throw new Error(error.message)
  }

  revalidateTag(CACHE_TAGS.wiki, 'max')
  revalidatePath(ROUTES.admin.reviews)
  revalidatePath(ROUTES.admin.pipeline)
  revalidatePath(ROUTES.admin.article(articleId))

  return { error: null }
}

export const requestWikiArticleChanges = async (
  articleId: string,
  reviewerComments: string,
) => {
  const authorized = await canReviewContent()
  if (!authorized) {
    throw new Error('Unauthorized: insufficient permissions')
  }

  if (!reviewerComments.trim()) {
    throw new Error('Reviewer comments are required when requesting changes.')
  }

  const authClient = await createClient()
  const { data: { user } } = await authClient.auth.getUser()
  const supabase = createAdminClient()

  const { error } = await supabase
    .from('wiki_articles')
    .update({
      status: 'changes_requested',
      reviewed_by: user?.id ?? null,
      reviewed_at: new Date().toISOString(),
      reviewer_comments: reviewerComments.trim(),
      updated_at: new Date().toISOString(),
    })
    .eq('article_id', articleId)

  if (error) {
    await logServerError({
      family: 'admin',
      eventName: 'wiki_review_request_changes_failed',
      message: 'Failed to request changes for wiki article from review queue.',
      context: {
        routeOrAction: 'admin:wiki.requestChanges',
        userId: user?.id ?? null,
        metadata: {
          articleId,
        },
      },
      error,
    })
    throw new Error(error.message)
  }

  revalidateTag(CACHE_TAGS.wiki, 'max')
  revalidatePath(ROUTES.admin.reviews)
  revalidatePath(ROUTES.admin.pipeline)
  revalidatePath(ROUTES.admin.article(articleId))

  return { error: null }
}

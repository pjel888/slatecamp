'use server'

import { z } from 'zod'
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath, revalidateTag } from "next/cache";
import { canManageContent } from "@/lib/admin/roles";
import { CACHE_TAGS } from '../cache-tags'
import { ROUTES } from '@/lib/routes'

const UpdateWikiArticleSchema = z.object({
  title: z.string().min(1, 'Title is required').max(500),
  content: z.string().min(1, 'Content is required'),
  slug: z.string().optional(),
  author_id: z.string().uuid().optional(),
  discipline_id: z.string().uuid().optional(),
  status: z.enum(['draft', 'pending_review', 'changes_requested', 'approved', 'published', 'archived']).optional(),
  metadata: z.record(z.string(), z.any()).optional(),
  tags: z.array(z.string()).optional(),
})

export const updateWikiArticle = async (id: string, data: z.infer<typeof UpdateWikiArticleSchema>) => {
  const authorized = await canManageContent()
  if (!authorized) throw new Error('Unauthorized: insufficient permissions')

  const parsed = UpdateWikiArticleSchema.safeParse(data)
  if (!parsed.success) throw new Error(parsed.error.issues[0].message)

  const supabase = createAdminClient()

  // Use raw data for update to avoid Zod object differences if needed, 
  // but parsed data is safer.
  const { error } = await supabase
    .from('wiki_articles')
    .update({
      ...parsed.data,
      updated_at: new Date().toISOString()
    })
    .eq('article_id', id)

  if (!error) {
    revalidateTag(CACHE_TAGS.wiki, 'max')
    revalidatePath(ROUTES.admin.wiki);
    revalidatePath(ROUTES.admin.article(id));
    revalidatePath(ROUTES.admin.knowledge);
    revalidatePath(ROUTES.wiki.root);
  }

  return { error };
}

export const createWikiArticle = async (data: z.infer<typeof UpdateWikiArticleSchema>) => {
  const authorized = await canManageContent()
  if (!authorized) throw new Error('Unauthorized: insufficient permissions')

  const parsed = UpdateWikiArticleSchema.safeParse(data)
  if (!parsed.success) throw new Error(parsed.error.issues[0].message)

  const authClient = await createClient()
  const { data: { user } } = await authClient.auth.getUser()

  const supabase = createAdminClient()

  const { data: newArticle, error } = await supabase
    .from('wiki_articles')
    .insert([{
      ...parsed.data,
      author_id: parsed.data.author_id || user?.id,
      status: parsed.data.status || 'draft',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }])
    .select()
    .single()

  if (!error && newArticle) {
    // Auto-link to default discipline if not provided
    const disciplineId = parsed.data.discipline_id || 'architect-ale'
    await supabase.from('wiki_article_taxonomy').insert({
      article_id: newArticle.article_id,
      node_id: disciplineId,
      is_primary: true
    })
  }

  revalidateTag(CACHE_TAGS.wiki, 'max')
  revalidatePath(ROUTES.admin.wiki);
  revalidatePath(ROUTES.admin.articles);
  revalidatePath(ROUTES.wiki.root);

  return { data: newArticle, error: null };
}

export async function deleteWikiArticle(id: string) {
  const authorized = await canManageContent()
  if (!authorized) throw new Error('Unauthorized: insufficient permissions')

  const supabase = createAdminClient()

  const { error } = await supabase
    .from('wiki_articles')
    .delete()
    .eq('article_id', id)

  if (error) {
    throw new Error(`Failed to delete article: ${error.message}`)
  }

  revalidateTag(CACHE_TAGS.wiki, 'max')
  revalidatePath(ROUTES.admin.wiki);
  revalidatePath(ROUTES.admin.articles);
  revalidatePath(ROUTES.wiki.root);

  return { error: null }
}

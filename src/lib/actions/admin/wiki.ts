'use server'

import { z } from 'zod'
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { canManageContent } from "@/lib/admin/roles";

const UpdateWikiArticleSchema = z.object({
  title: z.string().min(1, 'Title is required').max(500),
  content: z.string().min(1, 'Content is required'),
  slug: z.string().optional(),
  status: z.string().optional(),
  node_id: z.string().uuid('Invalid taxonomy node ID').optional().nullable(),
})

const CreateWikiArticleSchema = z.object({
  title: z.string().min(1, 'Title is required').max(500),
  content: z.string().min(1, 'Content is required'),
  slug: z.string().optional(),
  status: z.string().optional(),
  node_id: z.string().uuid('Invalid taxonomy node ID').optional().nullable(),
})

export async function updateWikiArticle(id: string, data: { 
  title: string, 
  content: string, 
  slug?: string, 
  status?: string,
  node_id?: string | null
}) {
  const authorized = await canManageContent()
  if (!authorized) throw new Error('Unauthorized: insufficient permissions')

  const parsed = UpdateWikiArticleSchema.safeParse(data)
  if (!parsed.success) {
    throw new Error(parsed.error.issues.map(e => e.message).join(', '))
  }

  const authClient = await createClient()
  const { data: { user } } = await authClient.auth.getUser()

  const supabase = createAdminClient();

  const { error } = await supabase
    .from('wiki_articles')
    .update({
      title: data.title,
      content: data.content,
      slug: data.slug || data.title.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
      status: data.status,
      updated_at: new Date().toISOString(),
      updated_by: user?.id ?? null,
    })
    .eq('article_id', id);

  if (!error && data.node_id !== undefined) {
    // Update or insert mapping
    if (data.node_id) {
      // We use upsert-like logic: delete old mappings and insert new one
      // OR just update the primary one if it exists
      await supabase.from('wiki_article_taxonomy').delete().eq('article_id', id)
      await supabase.from('wiki_article_taxonomy').insert({
        article_id: id,
        node_id: data.node_id,
        is_primary: true
      })
    } else {
      await supabase.from('wiki_article_taxonomy').delete().eq('article_id', id)
    }
  }

  if (!error) {
    revalidatePath('/admin/wiki');
    revalidatePath(`/admin/wiki/${id}`);
    revalidatePath('/admin/articles');
  }

  return { error };
}

export async function createWikiArticle(data: { 
  title: string, 
  content: string, 
  slug?: string, 
  status?: string,
  node_id?: string | null
}) {
  const authorized = await canManageContent()
  if (!authorized) throw new Error('Unauthorized: insufficient permissions')

  const parsed = CreateWikiArticleSchema.safeParse(data)
  if (!parsed.success) {
    throw new Error(parsed.error.issues.map(e => e.message).join(', '))
  }

  const authClient = await createClient()
  const { data: { user } } = await authClient.auth.getUser()

  const supabase = createAdminClient();

  const slug = data.slug || data.title.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

  const { data: newArticle, error: articleError } = await supabase
    .from('wiki_articles')
    .insert([{
      title: data.title,
      content: data.content,
      slug,
      status: data.status || 'draft',
      created_by: user?.id ?? null,
    }])
    .select('article_id')
    .single();

  if (articleError) return { error: articleError };

  if (data.node_id) {
    await supabase.from('wiki_article_taxonomy').insert({
      article_id: newArticle.article_id,
      node_id: data.node_id,
      is_primary: true
    })
  }

  revalidatePath('/admin/wiki');
  revalidatePath('/admin/articles');

  return { data: newArticle, error: null };
}

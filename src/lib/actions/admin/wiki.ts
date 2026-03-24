'use server'

import { z } from 'zod'
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { canManageContent } from "@/lib/admin/roles";

const UpdateWikiArticleSchema = z.object({
  title: z.string().min(1, 'Title is required').max(500),
  content: z.string().min(1, 'Content is required'),
})

const CreateWikiArticleSchema = z.object({
  title: z.string().min(1, 'Title is required').max(500),
  content: z.string().min(1, 'Content is required'),
})

export async function updateWikiArticle(id: string, data: { title: string, content: string }) {
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
      updated_at: new Date().toISOString(),
      updated_by: user?.id ?? null,
    })
    .eq('article_id', id);

  if (!error) {
    revalidatePath('/admin/wiki');
    revalidatePath(`/admin/wiki/${id}`);
    revalidatePath('/admin/articles');
  }

  return { error };
}

export async function createWikiArticle(data: { title: string, content: string }) {
  const authorized = await canManageContent()
  if (!authorized) throw new Error('Unauthorized: insufficient permissions')

  const parsed = CreateWikiArticleSchema.safeParse(data)
  if (!parsed.success) {
    throw new Error(parsed.error.issues.map(e => e.message).join(', '))
  }

  const authClient = await createClient()
  const { data: { user } } = await authClient.auth.getUser()

  const supabase = createAdminClient();

  const { data: newArticle, error } = await supabase
    .from('wiki_articles')
    .insert([{
      title: data.title,
      content: data.content,
      slug: data.title.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, ''),
      created_by: user?.id ?? null,
    }])
    .select('article_id')
    .single();

  if (!error) {
    revalidatePath('/admin/wiki');
  }

  return { data: newArticle, error };
}

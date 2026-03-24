'use server'

import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";
import { canManageContent } from "@/lib/admin/roles";

export async function updateWikiArticle(id: string, data: { title: string, content: string }) {
  const authorized = await canManageContent()
  if (!authorized) throw new Error('Unauthorized: insufficient permissions')

  const supabase = createAdminClient();

  const { error } = await supabase
    .from('wiki_articles')
    .update({
      title: data.title,
      content: data.content,
      updated_at: new Date().toISOString()
    })
    .eq('article_id', id);

  if (!error) {
    revalidatePath('/admin/wiki');
    revalidatePath(`/admin/wiki/${id}`);
  }

  return { error };
}

export async function createWikiArticle(data: { title: string, content: string }) {
  const authorized = await canManageContent()
  if (!authorized) throw new Error('Unauthorized: insufficient permissions')

  const supabase = createAdminClient();

  const { data: newArticle, error } = await supabase
    .from('wiki_articles')
    .insert([{
      title: data.title,
      content: data.content,
      slug: data.title.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '')
    }])
    .select('article_id')
    .single();

  if (!error) {
    revalidatePath('/admin/wiki');
  }

  return { data: newArticle, error };
}

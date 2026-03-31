'use server'

import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { canManageContent } from "@/lib/admin/roles";

interface CreateQuestionInput {
  text: string
  options: { text: string; is_correct: boolean }[]
  topic_id: string
  article_id?: string
  difficulty?: number
  rationale?: string
  code_citation?: string
  application_context?: string
  practice_context?: string[]
}

export async function deleteQuestions(ids: string[]) {
  const authorized = await canManageContent()
  if (!authorized) throw new Error('Unauthorized: insufficient permissions')

  const supabase = createAdminClient();

  const { error } = await supabase
    .from('questions')
    .delete()
    .in('question_id', ids);

  if (!error) {
    revalidatePath('/admin/knowledge/questions');
    revalidatePath('/admin/knowledge');
  }

  return { error };
}

export async function createQuestion(data: CreateQuestionInput) {
  const authorized = await canManageContent()
  if (!authorized) throw new Error('Unauthorized: insufficient permissions')

  if (!data.text || typeof data.text !== 'string' || data.text.trim().length === 0) {
    throw new Error('Validation error: text is required and must be a non-empty string')
  }
  if (!Array.isArray(data.options) || data.options.length !== 4) {
    throw new Error('Validation error: options must be an array with exactly 4 items')
  }
  if (!data.topic_id || typeof data.topic_id !== 'string' || data.topic_id.trim().length === 0) {
    throw new Error('Validation error: topic_id is required')
  }

  const authClient = await createClient()
  const { data: { user } } = await authClient.auth.getUser()

  const supabase = createAdminClient();

  const { error } = await supabase
    .from('questions')
    .insert([{ ...data, created_by: user?.id ?? null }]);

  if (!error) {
    revalidatePath('/admin/knowledge/questions');
    revalidatePath('/admin/knowledge');
  }

  return { error };
}

export const updateQuestion = async (id: string, data: CreateQuestionInput) => {
  const authorized = await canManageContent()
  if (!authorized) throw new Error('Unauthorized: insufficient permissions')

  if (!data.text || typeof data.text !== 'string' || data.text.trim().length === 0) {
    throw new Error('Validation error: text is required and must be a non-empty string')
  }
  if (!Array.isArray(data.options) || data.options.length !== 4) {
    throw new Error('Validation error: options must be an array with exactly 4 items')
  }
  if (!data.topic_id || typeof data.topic_id !== 'string' || data.topic_id.trim().length === 0) {
    throw new Error('Validation error: topic_id is required')
  }

  const authClient = await createClient()
  const { data: { user } } = await authClient.auth.getUser()

  const supabase = createAdminClient();

  const { error } = await supabase
    .from('questions')
    .update({ ...data, updated_by: user?.id ?? null })
    .eq('question_id', id);

  if (!error) {
    revalidatePath('/admin/knowledge/questions');
    revalidatePath('/admin/knowledge');
  }

  return { error };
}

export const deleteQuestion = async (id: string) => {
  const authorized = await canManageContent()
  if (!authorized) throw new Error('Unauthorized: insufficient permissions')

  const supabase = createAdminClient();

  const { error } = await supabase
    .from('questions')
    .delete()
    .eq('question_id', id);

  if (!error) {
    revalidatePath('/admin/knowledge/questions');
    revalidatePath('/admin/knowledge');
  }

  return { error };
}

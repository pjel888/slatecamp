'use server'

import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";
import { canManageContent } from "@/lib/admin/roles";

interface CreateQuestionInput {
  text: string
  options: { text: string; is_correct: boolean }[]
  topic_id: string
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
    revalidatePath('/admin/questions');
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

  const supabase = createAdminClient();

  const { error } = await supabase
    .from('questions')
    .insert([data]);

  if (!error) {
    revalidatePath('/admin/questions');
  }

  return { error };
}

'use server'

import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { canManageContent } from "@/lib/admin/roles";
import { ROUTES } from "@/lib/routes";

interface CreateQuestionInput {
  text: string
  options: { id?: string; text: string; is_correct?: boolean }[]
  topic_id: string
  correct_option_id?: string
  article_id?: string
  difficulty?: number
  rationale?: string
  explanation?: string
  code_citation?: string
  application_context?: string
  practice_context?: string[]
  prompt_image_url?: string
  is_assessment?: boolean
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
    revalidatePath(ROUTES.admin.knowledgeQuestions);
    revalidatePath(ROUTES.admin.knowledge);
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

  // Extract correct_option_id from options if not provided
  let finalCorrectOptionId = data.correct_option_id
  if (!finalCorrectOptionId && Array.isArray(data.options)) {
    const correctOpt = data.options.find(o => o.is_correct)
    if (correctOpt) {
      finalCorrectOptionId = correctOpt.id || 'A'
    } else {
      const correctIdx = data.options.findIndex(o => o.is_correct)
      if (correctIdx >= 0) {
        finalCorrectOptionId = ['A', 'B', 'C', 'D'][correctIdx]
      }
    }
  }

  // Normalize options for storage: remove is_correct if we store it in a separate column
  const storageOptions = data.options.map((o, i) => ({
    id: o.id || ['A', 'B', 'C', 'D'][i],
    text: o.text
  }))

  // Create clean object for DB insert
  const { options, correct_option_id, ...rest } = data
  
  const { error } = await supabase
    .from('questions')
    .insert([{ 
      ...rest, 
      options: storageOptions,
      correct_option_id: finalCorrectOptionId || 'A',
      created_by: user?.id ?? null 
    }]);

  if (!error) {
    revalidatePath(ROUTES.admin.knowledgeQuestions);
    revalidatePath(ROUTES.admin.knowledge);
  }

  return { error };
}

export const updateQuestion = async (id: string, data: Partial<CreateQuestionInput>) => {
  const authorized = await canManageContent()
  if (!authorized) throw new Error('Unauthorized: insufficient permissions')

  const authClient = await createClient()
  const { data: { user } } = await authClient.auth.getUser()

  const supabase = createAdminClient();

  // Handle options and correct_option_id normalization if provided
  let updateData: any = { ...data, updated_by: user?.id ?? null, updated_at: new Date().toISOString() }
  
  if (data.options) {
    let finalCorrectOptionId = data.correct_option_id
    if (!finalCorrectOptionId) {
      const correctOpt = data.options.find(o => o.is_correct)
      if (correctOpt) {
        finalCorrectOptionId = correctOpt.id || 'A'
      } else {
        const correctIdx = data.options.findIndex(o => o.is_correct)
        if (correctIdx >= 0) {
          finalCorrectOptionId = ['A', 'B', 'C', 'D'][correctIdx]
        }
      }
    }

    if (finalCorrectOptionId) {
      updateData.correct_option_id = finalCorrectOptionId
    }

    updateData.options = data.options.map((o, i) => ({
      id: o.id || ['A', 'B', 'C', 'D'][i],
      text: o.text
    }))
    
    // Remove correct_option_id from data if it was used to avoid duplicate in spread if it's already in updateData
    delete updateData.correct_option_id_input // Wait, I didn't use that. 
    // Just ensure we don't have conflicting keys.
  }

  const { error } = await supabase
    .from('questions')
    .update(updateData)
    .eq('question_id', id);

  if (!error) {
    revalidatePath(ROUTES.admin.knowledgeQuestions);
    revalidatePath(ROUTES.admin.knowledge);
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
    revalidatePath(ROUTES.admin.knowledgeQuestions);
    revalidatePath(ROUTES.admin.knowledge);
  }

  return { error };
}

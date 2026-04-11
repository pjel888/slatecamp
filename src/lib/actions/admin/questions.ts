'use server'

import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { canManageContent } from "@/lib/admin/roles";
import { ROUTES } from "@/lib/routes";
import { logServerError } from "@/lib/logging/server";

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
  if (!authorized) {
    await logServerError({
      family: 'admin',
      eventName: 'questions_delete_many_unauthorized',
      message: 'Unauthorized attempt to bulk delete questions.',
      context: {
        routeOrAction: 'admin:questions.deleteMany',
        metadata: {
          questionCount: ids.length,
        },
      },
    })
    throw new Error('Unauthorized: insufficient permissions')
  }

  const supabase = createAdminClient();

  const { error } = await supabase
    .from('questions')
    .delete()
    .in('question_id', ids);

  if (!error) {
    revalidatePath(ROUTES.admin.knowledgeQuestions);
    revalidatePath(ROUTES.admin.knowledge);
  }

  if (error) {
    await logServerError({
      family: 'admin',
      eventName: 'questions_delete_many_failed',
      message: 'Failed to bulk delete questions.',
      context: {
        routeOrAction: 'admin:questions.deleteMany',
        metadata: {
          questionCount: ids.length,
        },
      },
      error,
    })
  }

  return { error };
}

export async function createQuestion(data: CreateQuestionInput) {
  const authorized = await canManageContent()
  if (!authorized) {
    await logServerError({
      family: 'admin',
      eventName: 'questions_create_unauthorized',
      message: 'Unauthorized attempt to create a question.',
      context: {
        routeOrAction: 'admin:questions.create',
      },
    })
    throw new Error('Unauthorized: insufficient permissions')
  }

  if (!data.text || typeof data.text !== 'string' || data.text.trim().length === 0) {
    await logServerError({
      family: 'admin',
      eventName: 'questions_create_validation_failed',
      message: 'Question creation validation failed for text.',
      context: {
        routeOrAction: 'admin:questions.create',
      },
      error: new Error('Validation error: text is required and must be a non-empty string'),
      persist: false,
    })
    throw new Error('Validation error: text is required and must be a non-empty string')
  }
  if (!Array.isArray(data.options) || data.options.length !== 4) {
    await logServerError({
      family: 'admin',
      eventName: 'questions_create_validation_failed',
      message: 'Question creation validation failed for options.',
      context: {
        routeOrAction: 'admin:questions.create',
      },
      error: new Error('Validation error: options must be an array with exactly 4 items'),
      persist: false,
    })
    throw new Error('Validation error: options must be an array with exactly 4 items')
  }
  if (!data.topic_id || typeof data.topic_id !== 'string' || data.topic_id.trim().length === 0) {
    await logServerError({
      family: 'admin',
      eventName: 'questions_create_validation_failed',
      message: 'Question creation validation failed for topic_id.',
      context: {
        routeOrAction: 'admin:questions.create',
      },
      error: new Error('Validation error: topic_id is required'),
      persist: false,
    })
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
    }
  }

  // Normalize options for storage: remove is_correct if we store it in a separate column
  const storageOptions = data.options.map((o, i) => ({
    id: o.id || ['A', 'B', 'C', 'D'][i],
    text: o.text
  }))

  // Create clean object for DB insert
  const { options: _options, correct_option_id: _correctOptionId, ...rest } = data
  
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

  if (error) {
    await logServerError({
      family: 'admin',
      eventName: 'questions_create_failed',
      message: 'Failed to create question.',
      context: {
        routeOrAction: 'admin:questions.create',
        userId: user?.id ?? null,
        metadata: {
          topicId: data.topic_id,
        },
      },
      error,
    })
  }

  return { error };
}

export const updateQuestion = async (id: string, data: Partial<CreateQuestionInput>) => {
  const authorized = await canManageContent()
  if (!authorized) {
    await logServerError({
      family: 'admin',
      eventName: 'questions_update_unauthorized',
      message: 'Unauthorized attempt to update a question.',
      context: {
        routeOrAction: 'admin:questions.update',
        metadata: {
          questionId: id,
        },
      },
    })
    throw new Error('Unauthorized: insufficient permissions')
  }

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
      }
    }

    if (finalCorrectOptionId) {
      updateData.correct_option_id = finalCorrectOptionId
    }

    updateData.options = data.options.map((o, i) => ({
      id: o.id || ['A', 'B', 'C', 'D'][i],
      text: o.text
    }))
  }

  const { error } = await supabase
    .from('questions')
    .update(updateData)
    .eq('question_id', id);

  if (!error) {
    revalidatePath(ROUTES.admin.knowledgeQuestions);
    revalidatePath(ROUTES.admin.knowledge);
  }

  if (error) {
    await logServerError({
      family: 'admin',
      eventName: 'questions_update_failed',
      message: 'Failed to update question.',
      context: {
        routeOrAction: 'admin:questions.update',
        userId: user?.id ?? null,
        metadata: {
          questionId: id,
        },
      },
      error,
    })
  }

  return { error };
}

export const deleteQuestion = async (id: string) => {
  const authorized = await canManageContent()
  if (!authorized) {
    await logServerError({
      family: 'admin',
      eventName: 'questions_delete_unauthorized',
      message: 'Unauthorized attempt to delete a question.',
      context: {
        routeOrAction: 'admin:questions.deleteOne',
        metadata: {
          questionId: id,
        },
      },
    })
    throw new Error('Unauthorized: insufficient permissions')
  }

  const supabase = createAdminClient();

  const { error } = await supabase
    .from('questions')
    .delete()
    .eq('question_id', id);

  if (!error) {
    revalidatePath(ROUTES.admin.knowledgeQuestions);
    revalidatePath(ROUTES.admin.knowledge);
  }

  if (error) {
    await logServerError({
      family: 'admin',
      eventName: 'questions_delete_failed',
      message: 'Failed to delete question.',
      context: {
        routeOrAction: 'admin:questions.deleteOne',
        metadata: {
          questionId: id,
        },
      },
      error,
    })
  }

  return { error };
}

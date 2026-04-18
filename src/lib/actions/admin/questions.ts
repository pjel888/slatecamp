'use server'

import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { canManageContent } from "@/lib/admin/roles";
import { ROUTES } from "@/lib/routes";
import { logServerError } from "@/lib/logging/server";
import {
  isExceptionQuestionType,
  normalizeQuestionType,
  normalizeQuestionOptionArray,
  resolveCorrectOptionLetter,
  validateStandardQuestionLinkage,
} from '@/lib/admin/editor-integrity/standard-question'

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
  question_type?: string
}

const validateStandardQuestionMutationInput = ({
  text,
  options,
  topicId,
  articleId,
  difficulty,
}: {
  text?: string
  options?: { id?: string; text: string; is_correct?: boolean }[]
  topicId?: string
  articleId?: string
  difficulty?: number
}) => {
  if (!text || typeof text !== 'string' || text.trim().length === 0) {
    throw new Error('Validation error: text is required and must be a non-empty string')
  }

  if (!Array.isArray(options) || options.length !== 4) {
    throw new Error('Validation error: options must be an array with exactly 4 items')
  }

  if (options.some((option) => !option.text || option.text.trim().length === 0)) {
    throw new Error('Validation error: all options must have non-empty text')
  }

  if (!topicId || typeof topicId !== 'string' || topicId.trim().length === 0) {
    throw new Error('Validation error: topic_id is required')
  }

  if (!articleId || typeof articleId !== 'string' || articleId.trim().length === 0) {
    throw new Error('Validation error: article_id is required for standard questions')
  }

  if (difficulty !== undefined && (Number.isNaN(difficulty) || difficulty < 0 || difficulty > 1)) {
    throw new Error('Validation error: difficulty must be between 0 and 1')
  }
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
  const { data: rows, error: rowsError } = await supabase
    .from('questions')
    .select('article_id')
    .in('question_id', ids)

  if (rowsError) {
    throw new Error(rowsError.message)
  }

  const { error } = await supabase
    .from('questions')
    .delete()
    .in('question_id', ids);

  if (!error) {
    revalidatePath(ROUTES.admin.knowledgeQuestions);
    revalidatePath(ROUTES.admin.knowledge);
    const articleIds = [...new Set((rows ?? []).map((row) => row.article_id).filter(Boolean))]
    for (const articleId of articleIds) {
      revalidatePath(ROUTES.admin.article(articleId));
    }
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

  try {
    validateStandardQuestionMutationInput({
      text: data.text,
      options: data.options,
      topicId: data.topic_id,
      articleId: data.article_id,
      difficulty: data.difficulty,
    })
  } catch (error) {
    await logServerError({
      family: 'admin',
      eventName: 'questions_create_validation_failed',
      message: 'Question creation validation failed.',
      context: {
        routeOrAction: 'admin:questions.create',
      },
      error: error instanceof Error ? error : new Error('Validation error'),
      persist: false,
    })
    throw error
  }
  const normalizedQuestionType = normalizeQuestionType(data.question_type)
  if (isExceptionQuestionType(normalizedQuestionType)) {
    throw new Error(
      'Scenario-based question types must use a dedicated authoring flow and cannot be created through the standard question editor.',
    )
  }
  const authClient = await createClient()
  const { data: { user } } = await authClient.auth.getUser()

  const supabase = createAdminClient();

  const linkageValidation = await validateStandardQuestionLinkage(supabase as any, {
    articleId: data.article_id,
    topicId: data.topic_id,
    questionType: normalizedQuestionType,
    stage: 'authoring',
  })

  if (linkageValidation.blockingIssues.length > 0) {
    throw new Error(linkageValidation.blockingIssues[0])
  }

  // Extract correct_option_id from options if not provided
  let finalCorrectOptionId = data.correct_option_id
  if (!finalCorrectOptionId && Array.isArray(data.options)) {
    const correctOpt = data.options.find(o => o.is_correct)
    if (correctOpt) {
      finalCorrectOptionId = correctOpt.id || 'A'
    }
  }
  finalCorrectOptionId = resolveCorrectOptionLetter(finalCorrectOptionId ?? 'A')

  // Normalize options for storage: remove is_correct if we store it in a separate column
  const storageOptions = normalizeQuestionOptionArray(data.options)

  // Create clean object for DB insert
  const { options: _options, correct_option_id: _correctOptionId, ...rest } = data
  
  const { error } = await supabase
    .from('questions')
    .insert([{ 
      ...rest, 
      options: storageOptions,
      correct_option_id: finalCorrectOptionId || 'A',
      question_type: normalizedQuestionType,
      created_by: user?.id ?? null 
    }]);

  if (!error) {
    revalidatePath(ROUTES.admin.knowledgeQuestions);
    revalidatePath(ROUTES.admin.knowledge);
    revalidatePath(ROUTES.admin.article(data.article_id));
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
  const { data: existingQuestion, error: existingQuestionError } = await supabase
    .from('questions')
    .select('article_id, topic_id, text, options, difficulty')
    .eq('question_id', id)
    .maybeSingle()

  if (existingQuestionError || !existingQuestion) {
    throw new Error('Question not found')
  }

  const articleId = data.article_id ?? existingQuestion.article_id
  const topicId = data.topic_id ?? existingQuestion.topic_id
  const questionType = normalizeQuestionType(data.question_type ?? 'mcq')
  if (isExceptionQuestionType(questionType)) {
    throw new Error(
      'Scenario-based question types must use a dedicated authoring flow and cannot be updated through the standard question editor.',
    )
  }

  const linkageValidation = await validateStandardQuestionLinkage(supabase as any, {
    articleId,
    topicId,
    questionType,
    stage: 'authoring',
  })

  if (linkageValidation.blockingIssues.length > 0) {
    throw new Error(linkageValidation.blockingIssues[0])
  }

  if (
    data.text !== undefined ||
    data.options !== undefined ||
    data.difficulty !== undefined ||
    data.topic_id !== undefined ||
    data.article_id !== undefined
  ) {
    validateStandardQuestionMutationInput({
      text: data.text ?? existingQuestion.text,
      options: data.options ?? existingQuestion.options ?? [],
      topicId,
      articleId,
      difficulty: data.difficulty ?? existingQuestion.difficulty ?? undefined,
    })
  }

  // Handle options and correct_option_id normalization if provided
  let updateData: any = {
    ...data,
    article_id: articleId,
    topic_id: topicId,
    question_type: questionType,
    updated_by: user?.id ?? null,
    updated_at: new Date().toISOString(),
  }
  
  if (data.options) {
    let finalCorrectOptionId = data.correct_option_id
    if (!finalCorrectOptionId) {
      const correctOpt = data.options.find(o => o.is_correct)
      if (correctOpt) {
        finalCorrectOptionId = correctOpt.id || 'A'
      }
    }

    if (finalCorrectOptionId) {
      updateData.correct_option_id = resolveCorrectOptionLetter(finalCorrectOptionId)
    }

    updateData.options = normalizeQuestionOptionArray(data.options)
  }

  const { error } = await supabase
    .from('questions')
    .update(updateData)
    .eq('question_id', id);

  if (!error) {
    revalidatePath(ROUTES.admin.knowledgeQuestions);
    revalidatePath(ROUTES.admin.knowledge);
    revalidatePath(ROUTES.admin.article(articleId));
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
  const { data: existingQuestion, error: existingQuestionError } = await supabase
    .from('questions')
    .select('article_id')
    .eq('question_id', id)
    .maybeSingle()

  if (existingQuestionError) {
    throw new Error(existingQuestionError.message)
  }

  const { error } = await supabase
    .from('questions')
    .delete()
    .eq('question_id', id);

  if (!error) {
    revalidatePath(ROUTES.admin.knowledgeQuestions);
    revalidatePath(ROUTES.admin.knowledge);
    if (existingQuestion?.article_id) {
      revalidatePath(ROUTES.admin.article(existingQuestion.article_id));
    }
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

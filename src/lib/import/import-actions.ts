'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'
import { canManageContent } from '@/lib/admin/roles'
import { ROUTES } from '@/lib/routes'
import {
  csvToDbFormat,
  jsonToDbFormat,
  type QuestionCSV,
  type QuestionJSON,
  validateCSVQuestion,
  validateJSONQuestion,
} from './question-schema'
import {
  resolvePrimaryArticleIdForTopic,
  validateStandardQuestionLinkage,
} from '@/lib/admin/editor-integrity/standard-question'

export async function importQuestionsToDb(questions: (QuestionCSV | QuestionJSON)[]): Promise<{ success: boolean; error?: string }> {
  const authorized = await canManageContent()
  if (!authorized) {
    return { success: false, error: 'Unauthorized: insufficient permissions' }
  }

  const supabase = createAdminClient()
  
  // Convert all to db format
  const records = questions.map(q => {
    if ('option_a' in q) {
      return csvToDbFormat(validateCSVQuestion(q))
    } else {
      return jsonToDbFormat(validateJSONQuestion(q))
    }
  })

  const recordsWithArticleIds = []
  const affectedArticleIds = new Set<string>()
  for (const record of records) {
    const articleId = await resolvePrimaryArticleIdForTopic(supabase as any, record.topic_id)
    const validation = await validateStandardQuestionLinkage(supabase as any, {
      articleId,
      topicId: record.topic_id,
      questionType: 'mcq',
      stage: 'authoring',
    })

    if (validation.blockingIssues.length > 0) {
      return { success: false, error: validation.blockingIssues[0] }
    }

    recordsWithArticleIds.push({
      ...record,
      article_id: articleId,
    })
    affectedArticleIds.add(articleId)
  }
  
  // Single transaction - all or nothing
  const { error } = await supabase
    .from('questions')
    .insert(recordsWithArticleIds)
  
  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath(ROUTES.admin.knowledgeQuestions)
  revalidatePath(ROUTES.admin.knowledge)
  for (const articleId of affectedArticleIds) {
    revalidatePath(ROUTES.admin.article(articleId))
  }
  
  return { success: true }
}

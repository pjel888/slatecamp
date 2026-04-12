'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { csvToDbFormat, jsonToDbFormat, type QuestionCSV, type QuestionJSON } from './question-schema'
import {
  resolvePrimaryArticleIdForTopic,
  validateStandardQuestionLinkage,
} from '@/lib/admin/editor-integrity/standard-question'

export async function importQuestionsToDb(questions: (QuestionCSV | QuestionJSON)[]): Promise<{ success: boolean; error?: string }> {
  const supabase = createAdminClient()
  
  // Convert all to db format
  const records = questions.map(q => {
    if ('option_a' in q) {
      return csvToDbFormat(q)
    } else {
      return jsonToDbFormat(q)
    }
  })

  const recordsWithArticleIds = []
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
  }
  
  // Single transaction - all or nothing
  const { error } = await supabase
    .from('questions')
    .insert(recordsWithArticleIds)
  
  if (error) {
    return { success: false, error: error.message }
  }
  
  return { success: true }
}

'use server'

import { createClient } from '@/lib/supabase/server'
import { csvToDbFormat, jsonToDbFormat, type QuestionCSV, type QuestionJSON } from './question-schema'

export async function importQuestionsToDb(questions: (QuestionCSV | QuestionJSON)[]): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()
  
  // Convert all to db format
  const records = questions.map(q => {
    if ('option_a' in q) {
      return csvToDbFormat(q)
    } else {
      return jsonToDbFormat(q)
    }
  })
  
  // Single transaction - all or nothing
  const { error } = await supabase
    .from('questions')
    .insert(records)
  
  if (error) {
    return { success: false, error: error.message }
  }
  
  return { success: true }
}

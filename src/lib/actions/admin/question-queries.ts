import { createClient } from '@/lib/supabase/server'

export async function getQuestions() {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('questions')
    .select('id:question_id, text, topic_id, difficulty, options, created_at')
    .order('created_at', { ascending: false })
    .limit(100)

  if (error) {
    console.error('Error fetching questions:', error)
    return []
  }

  // Ensure options is always an array to prevent {} errors in rendering
  return (data || []).map(q => ({
    ...q,
    options: Array.isArray(q.options) ? q.options : []
  }))
}

export async function getQuestion(id: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('questions')
    .select('id:question_id, text, topic_id, options, correct_option_id, rationale, difficulty')
    .eq('question_id', id)
    .single()

  if (error || !data) {
    return null
  }

  // Parse correct_option_id back to number for editor
  return {
    ...data,
    correct_option_id: parseInt(data.correct_option_id as string) || 0
  }
}

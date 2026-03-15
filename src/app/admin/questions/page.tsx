import { createClient } from '@/lib/supabase/server'
import { QuestionList } from '@/components/admin/QuestionList'

async function getQuestions() {
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

export default async function AdminQuestionsPage() {
  const questions = await getQuestions()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Question Bank</h1>
        <p className="text-muted-foreground">Manage your exam questions</p>
      </div>

      <QuestionList initialQuestions={questions} />
    </div>
  )
}

import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { QuestionEditor } from '@/components/admin/QuestionEditor'

interface PageProps {
  params: Promise<{ id: string }>
}

async function getQuestion(id: string) {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('questions')
    .select('id, text, topic_id, options, correct_option_id, rationale, difficulty')
    .eq('id', id)
    .single()

  if (error || !data) {
    return null
  }

  return data
}

export default async function EditQuestionPage({ params }: PageProps) {
  const { id } = await params
  const question = await getQuestion(id)

  if (!question) {
    notFound()
  }

  return <QuestionEditor question={question} />
}

import { redirect, notFound } from 'next/navigation'
import { canManageContent } from '@/lib/admin/roles'
import { createClient } from '@/lib/supabase/server'
import { QuestionEditor } from '@/components/admin/QuestionEditor'
import {
  getArticleFull,
  getArticleTaxonomyNodes,
} from '@/lib/actions/admin/content'
import { Card } from '@/components/ui/card'
import { Eyebrow } from '@/components/ui/eyebrow'

interface PageProps {
  params: Promise<{ id: string }>
}

const QuestionDetailPage = async ({ params }: PageProps) => {
  const authorized = await canManageContent()
  if (!authorized) redirect('/admin')

  const { id } = await params
  const supabase = await createClient()

  // Fetch question
  const { data: question, error } = await supabase
    .from('questions')
    .select('*')
    .eq('question_id', id)
    .single()

  if (error || !question) notFound()

  // Find linked article via topic_id
  let article = null
  if (question.topic_id) {
    const { data: mapping } = await supabase
      .from('wiki_article_taxonomy')
      .select('article_id')
      .eq('node_id', question.topic_id)
      .eq('is_primary', true)
      .single()

    if (mapping) {
      article = await getArticleFull(mapping.article_id)
    }
  }

  return (
    <div className="flex h-[calc(100vh-4rem)] overflow-hidden">
      {/* Left: Question Editor (60%) */}
      <div className="w-[60%] overflow-y-auto border-r border-border p-6 bg-white">
        <div className="mb-6">
          <Eyebrow>Question Moderation</Eyebrow>
          <h1 className="text-2xl font-bold text-foreground mt-1">Edit Question</h1>
          <p className="text-sm text-muted-foreground mt-1 font-mono">{question.question_id}</p>
        </div>
        <QuestionEditor question={question} />
      </div>

      {/* Right: Article Context (40%) - Sticky Reference Pane */}
      <div className="w-[40%] overflow-y-auto bg-surface-light p-6">
        <div className="mb-4">
          <Eyebrow>Article Reference</Eyebrow>
        </div>
        {article ? (
          <div className="space-y-4">
            <Card className="p-4">
              <h2 className="text-lg font-bold text-foreground">{article.title}</h2>
              <div className="prose prose-sm max-w-none mt-4 text-text-secondary">
                {/* Simplified preview of article content */}
                <div dangerouslySetInnerHTML={{ __html: article.content.slice(0, 5000) + (article.content.length > 5000 ? '...' : '') }} />
              </div>
            </Card>
            <div className="flex justify-end">
              <a 
                href={`/admin/knowledge/${article.article_id}`}
                target="_blank"
                className="text-xs text-camp-cobalt hover:underline font-medium"
              >
                Open Full Article &rarr;
              </a>
            </div>
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-center p-8 border-2 border-dashed border-border rounded-lg">
            <p className="text-sm text-muted-foreground">
              This question is not currently linked to a primary article.
            </p>
            <p className="text-[11px] text-text-tertiary mt-2">
              Assign a topic linked to an article to enable context-aware moderation.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export default QuestionDetailPage

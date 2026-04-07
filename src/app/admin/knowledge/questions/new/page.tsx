import { redirect } from 'next/navigation'
import { canManageContent } from '@/lib/admin/roles'
import { createClient } from '@/lib/supabase/server'
import { QuestionEditor } from '@/components/admin/QuestionEditor'
import {
  getArticleFull,
} from '@/lib/actions/admin/content'
import { Card } from '@/components/ui/card'
import { Eyebrow } from '@/components/ui/eyebrow'

interface PageProps {
  searchParams: Promise<{ topic?: string }>
}

const NewQuestionPage = async ({ searchParams }: PageProps) => {
  const authorized = await canManageContent()
  if (!authorized) redirect('/admin')

  const { topic: topicId } = await searchParams
  const supabase = await createClient()

  // Find linked article via topic_id if provided
  let article = null
  if (topicId) {
    const { data: mapping } = await supabase
      .from('wiki_article_taxonomy')
      .select('article_id')
      .eq('node_id', topicId)
      .eq('is_primary', true)
      .single()

    if (mapping) {
      article = await getArticleFull(mapping.article_id)
    }
  }

  return (
    <div className="flex h-[calc(100vh-4rem)] overflow-hidden">
      {/* Left: Question Editor (60%) */}
      <div className="w-[60%] overflow-y-auto p-6 bg-card">
        <div className="mb-6">
          <Eyebrow>Question Bank</Eyebrow>
          <h1 className="text-2xl font-bold text-foreground mt-1">Create New Question</h1>
          <p className="text-sm text-muted-foreground mt-1">Draft a new assessment item</p>
        </div>
        <QuestionEditor 
          question={topicId ? { topic_id: topicId } as any : undefined} 
        />
      </div>

      {/* Right: Article Context (40%) - Sticky Reference Pane */}
      <div className="w-[40%] overflow-y-auto bg-surface-light p-6">
        <div className="mb-4">
          <Eyebrow>Reference Material</Eyebrow>
        </div>
        {article ? (
          <div className="space-y-4">
            <Card className="p-4">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-lg font-bold text-foreground">{article.title}</h2>
                <span className="px-2 py-0.5 rounded-full bg-success-50 text-emerald text-[10px] font-mono uppercase font-bold">
                  {article.status}
                </span>
              </div>
              <div className="prose prose-sm max-w-none mt-4 text-text-secondary line-clamp-[20]">
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
          <div className="h-full flex flex-col items-center justify-center text-center p-8 border-2 border-dashed border-border rounded-lg bg-card/50">
            <div className="w-12 h-12 rounded-full bg-surface-light flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-text-tertiary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <p className="text-sm text-muted-foreground font-medium">
              No Reference Context
            </p>
            <p className="text-[11px] text-text-tertiary mt-2 max-w-[200px]">
              Select a topic from the Knowledge Browser to view source material while writing questions.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export default NewQuestionPage

import { getWikiArticleBySlug, getWikiArticleByTaxonomySlug } from '@/lib/actions/wiki-actions'
import { WikiArticle } from '@/components/wiki/WikiArticle'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

interface PageProps {
  params: Promise<{
    slug: string
  }>
}

export default async function WikiArticlePage({ params }: PageProps) {
  const { slug } = await params
  
  // 1. Try direct article slug
  let article = await getWikiArticleBySlug(slug)

  // 2. Fallback to taxonomy node slug
  if (!article) {
    article = await getWikiArticleByTaxonomySlug(slug)
  }

  // 3. If still not found, check if it's a valid taxonomy slug but just missing an article
  if (!article) {
    const supabase = await createClient()
    const { data: node } = await supabase
      .from('taxonomy_tree')
      .select('name, node_id')
      .eq('slug', slug)
      .maybeSingle()

    if (node) {
      // Return a "Coming Soon" or empty article object
      return (
        <div className="h-full w-full flex items-center justify-center">
          <div className="text-center p-12 bg-white rounded-2xl border border-zinc-100 shadow-sm max-w-lg">
            <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-zinc-900 mb-3">{node.name}</h1>
            <p className="text-zinc-500 mb-8 leading-relaxed">
              We're currently drafting the authoritative content for this topic. 
              Check back soon for comprehensive coverage of {node.name}.
            </p>
            <div className="h-px w-full bg-zinc-100 mb-8" />
            <p className="text-sm text-zinc-400 italic">
              Knowledge ID: {node.node_id}
            </p>
          </div>
        </div>
      )
    }
  }

  if (!article) {
    notFound()
  }

  return (
    <div className="h-full w-full">
      <WikiArticle article={article} />
    </div>
  )
}

import {
  getWikiArticleBySlug,
  getWikiArticleByTaxonomySlug,
  getActiveTaxonomyNode,
} from '@/lib/actions/wiki-actions'
import { WikiArticle } from '@/components/wiki/WikiArticle'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

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

  // 3. Get the associated taxonomy node for the "Practice" feature
  const node = await getActiveTaxonomyNode(slug)

  // 4. If still not found, check if it's a valid taxonomy slug but just missing an article
  if (!article) {
    // ... (rest of the "Coming Soon" logic remains same)
    const supabase = await createClient()
    const { data: nodeData } = await supabase
      .from('taxonomy_tree')
      .select('name, node_id')
      .eq('slug', slug)
      .maybeSingle()

    if (nodeData) {
      return (
        <div className='h-full w-full flex items-center justify-center'>
          <div className='text-center p-12 bg-white rounded-md border border-zinc-100 shadow-sm max-w-lg'>
            {/* ... icon ... */}
            <h1 className='text-xl font-bold text-zinc-900 mb-3'>
              {nodeData.name}
            </h1>
            <p className='text-zinc-500 mb-8 leading-relaxed'>
              We're currently drafting the authoritative content for this topic.
              Check back soon for comprehensive coverage of {nodeData.name}.
            </p>
            <div className='flex justify-center mb-8'>
              <Link href={`/dashboard/testing?topicId=${nodeData.node_id}`}>
                <Button className='bg-primary hover:bg-[#1535A8] text-white font-bold rounded-sm px-8'>
                  Practice this Topic anyway
                </Button>
              </Link>
            </div>
            <div className='h-px w-full bg-zinc-100 mb-8' />
            <p className='text-sm text-zinc-400 italic'>
              Knowledge ID: {nodeData.node_id}
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
    <div className='h-full w-full'>
      <WikiArticle
        article={article}
        nodeId={node?.node_id}
        nodeName={node?.name}
      />
    </div>
  )
}

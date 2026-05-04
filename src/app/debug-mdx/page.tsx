'use server'

import { compileWikiArticleWithRenderer } from '@/components/wiki/article/WikiArticle'
import React from 'react'

export default async function DebugArticlePage() {
  const slug = 'lea-hist-001-03-core-concept'
  const { getCachedArticleAndNode } = await import('@/lib/actions/cached-queries')
  const { getEIPromptsForArticle, getUserEIResponsesForArticle } = await import('@/lib/actions/ei-prompts')
  
  const { article } = await getCachedArticleAndNode(slug)
  const eiPrompts = await getEIPromptsForArticle(article.article_id)
  const eiResponses = await getUserEIResponsesForArticle(article.article_id)
  
  let mdxResult: any = null
  let errorMsg: string | null = null
  
  try {
    mdxResult = await compileWikiArticleWithRenderer({
      article: { article_id: article.article_id, content: article.content },
      eiPrompts,
      eiResponses,
    })
  } catch (err: any) {
    errorMsg = err.message
  }
  
  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-xl font-bold mb-4">MDX Pipeline Debug: {slug}</h1>
      
      <div className="mb-6 p-4 bg-yellow-100 rounded border">
        <h2 className="font-bold mb-2">Article Details</h2>
        <pre className="text-xs whitespace-pre-wrap">
          ID: {article.article_id}
          Content length: {article.content?.length || 0}
          Has ArticleMedia: {(article.content || '').includes('<ArticleMedia') ? 'YES' : 'NO'}
          EI prompts: {eiPrompts.length}
        </pre>
      </div>
      
      {errorMsg ? (
        <div className="mb-6 p-4 bg-red-100 rounded border border-red-400">
          <h2 className="font-bold text-red-800 mb-2">COMPILE ERROR</h2>
          <pre className="text-sm whitespace-pre-wrap">{errorMsg}</pre>
        </div>
      ) : (
        <div className="mb-6 p-4 bg-green-100 rounded border border-green-400">
          <h2 className="font-bold text-green-800">Compilation Succeeded</h2>
        </div>
      )}
      
      <div className="border p-4 rounded">
        <h2 className="font-bold mb-2">Rendered Output</h2>
        <div className="prose prose-wiki max-w-none">
          {mdxResult?.content || 'No content'}
        </div>
      </div>
    </div>
  )
}

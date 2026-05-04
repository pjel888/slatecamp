'use server'

import React from 'react'
import * as WikiArticleModule from '@/components/wiki/article/WikiArticle'

export default async function DebugMDXDetailedPage() {
  const slug = 'lea-hist-001-03-core-concept'
  const { getCachedArticleAndNode } = await import('@/lib/actions/cached-queries')
  const { getEIPromptsForArticle, getUserEIResponsesForArticle } = await import('@/lib/actions/ei-prompts')
  const { sanitizeMDX, createMdxFallbackSource, injectEIPrompts } = await import('@/lib/wiki-markdown')
  const { compile } = await import('@mdx-js/mdx')
  
  const { article } = await getCachedArticleAndNode(slug)
  const rawContent = article.content || ''

  // Stage 1: Raw from Supabase  
  const stage1 = {
    label: 'Stage 1: Raw Supabase Content',
    hasArticleMedia: rawContent.includes('<ArticleMedia'),
    articleMediaCount: (rawContent.match(/<ArticleMedia/g) || []).length,
    contentLength: rawContent.length,
  }

  // Stage 2: After replace(/\n/g)
  const cleanedNewlines = rawContent.replace(/\\\\n/g, '\n')
  const stage2 = {
    label: 'Stage 2: After newline fix',
    hasArticleMedia: cleanedNewlines.includes('<ArticleMedia'),
  }

  // Stage 3: After strip EI and comments
  const stripped = cleanedNewlines
    .replace(/\[EI\][\s\S]*?\[\/EI\]/g, '')
    .replace(/<!--[\s\S]*?-->/g, '')
  const stage3 = {
    label: 'Stage 3: After EI/comment strip',
    hasArticleMedia: stripped.includes('<ArticleMedia'),
  }

  // Stage 4: After injectEIPrompts (with 0 prompts, it's a no-op)
  const processedContent = injectEIPrompts(stripped, [])
  const stage4 = {
    label: 'Stage 4: After injectEIPrompts',
    hasArticleMedia: processedContent.includes('<ArticleMedia'),
  }

  // Stage 5: After sanitizeMDX  
  const sanitizedContent = sanitizeMDX(processedContent)
  const stage5 = {
    label: 'Stage 5: After sanitizeMDX',
    hasArticleMedia: sanitizedContent.includes('<ArticleMedia'),
    articleMediaCount: (sanitizedContent.match(/<ArticleMedia/g) || []).length,
    sanitizedLength: sanitizedContent.length,
  }

  // Stage 6: Try to compile with @mdx-js/mdx directly
  let compileResult: string | null = null
  let compileError: string | null = null
  try {
    const result = await compile(sanitizedContent, {
      outputFormat: 'function-body',
      providerImportSource: undefined,
      development: false,
    })
    const code = String(result)
    compileResult = code.substring(0, 500) + '\n...'
    // Check if compilation generates ArticleMedia reference
    compileResult += '\n\nHas ArticleMedia ref: ' + code.includes('ArticleMedia')
  } catch (err: any) {
    compileError = err.message
  }

  // Stage 7: Fallback source check
  const fallbackSource = createMdxFallbackSource(processedContent)
  const stage7 = {
    label: 'Stage 7: Fallback source',
    hasArticleMedia: fallbackSource.includes('<ArticleMedia'),
    fallbackLength: fallbackSource.length,
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-xl font-bold mb-4">MDX Pipeline Deep Debug: {slug}</h1>
      <pre className="text-xs bg-gray-100 p-4 rounded mb-6 whitespace-pre-wrap">
        {JSON.stringify({ stage1, stage2, stage3, stage4, stage5, stage7 }, null, 2)}
      </pre>
      
      <h2 className="font-bold mt-4 mb-2">Compile Output</h2>
      {compileError ? (
        <pre className="text-xs bg-red-100 p-4 rounded whitespace-pre-wrap text-red-700">
          COMPILE ERROR: {compileError}
        </pre>
      ) : (
        <pre className="text-xs bg-green-100 p-4 rounded whitespace-pre-wrap">
          {compileResult}
        </pre>
      )}

      <h2 className="font-bold mt-6 mb-2">ArticleMedia Tag Sample</h2>
      <pre className="text-xs bg-gray-100 p-4 rounded whitespace-pre-wrap">
        {(() => {
          const idx = rawContent.indexOf('<ArticleMedia')
          if (idx < 0) return 'NO ArticleMedia FOUND'
          const end = rawContent.indexOf('>', idx)
          return rawContent.substring(idx, Math.min(end + 1, idx + 300))
        })()}
      </pre>
    </div>
  )
}

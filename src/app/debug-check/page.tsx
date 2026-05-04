'use server'

import React from 'react'

export default async function DebugSimpleCheck() {
  // Just use the cached article query
  const { getCachedArticleAndNode } = await import('@/lib/actions/cached-queries')
  const { sanitizeMDX, createMdxFallbackSource, injectEIPrompts } = await import('@/lib/wiki-markdown')
  
  const slug = 'lea-hist-001-03-core-concept'
  const { article } = await getCachedArticleAndNode(slug)
  const content = article?.content || ''
  
  const rawContent = content.replace(/\\\\n/g, '\n')
  const cleaned = rawContent
    .replace(/\[EI\][\s\S]*?\[\/EI\]/g, '')
    .replace(/<!--[\s\S]*?-->/g, '')
  
  const processed = injectEIPrompts(cleaned, [])
  const sanitized = sanitizeMDX(processed)
  const fallback = createMdxFallbackSource(processed)
  
  const amInRaw = content.includes('<ArticleMedia')
  const amInSanitized = sanitized.includes('<ArticleMedia')
  const amInFallback = fallback.includes('<ArticleMedia')
  const examTipCount = (content.match(/<ExamTip>/g) || []).length
  const hasExamTipNewline = content.includes('<ExamTip>\n')
  
  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-xl font-bold mb-4">Simple MDX Pipeline Check</h1>
      <pre className="text-sm bg-gray-100 p-4 rounded whitespace-pre-wrap">
{JSON.stringify({
  contentLength: content.length,
  rawContentLength: rawContent.length,
  sanitizedLength: sanitized.length,
  fallbackLength: fallback.length,
  hasArticleMedia: {
    raw: amInRaw,
    afterSanitizeMDX: amInSanitized,
    inFallback: amInFallback,
  },
  examTipCount,
  hasNewlineAfterExamTip: hasExamTipNewline,
  cacheSource: 'getCachedArticleAndNode (1h cache)',
}, null, 2)}
      </pre>

      <h2 className="font-bold mt-4 mb-2">Notification about cache:</h2>
      <div className="p-3 bg-yellow-100 rounded text-sm">
        <p><strong>⚠️ This page uses getCachedArticleAndNode which caches for 1 hour.</strong></p>
        <p>The fix was pushed to Supabase but the dev server has old cached data.</p>
        <p>To see ArticleMedia, either restart the dev server completely (rm -rf .next & bun run dev) or wait 1 hour.</p>
        <p>The <a href="/debug-supabase" className="text-blue-600 underline">/debug-supabase</a> page fetched DIRECTLY from Supabase and confirmed compilation succeeds.</p>
      </div>
    </div>
  )
}

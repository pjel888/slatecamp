'use server'

import React from 'react'
import { createClient } from '@supabase/supabase-js'

export default async function DebugCacheBypassSimple() {
  const slug = 'lea-hist-001-03-core-concept'
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
  const supabase = createClient(supabaseUrl, supabaseKey)
  
  const { data: article } = await supabase
    .from('wiki_articles')
    .select('article_id, slug, content')
    .eq('slug', slug)
    .single()
  
  const content = article?.content || ''
  const rawContent = content.replace(/\\\\n/g, '\n')
  const cleaned = rawContent
    .replace(/\[EI\][\s\S]*?\[\/EI\]/g, '')
    .replace(/<!--[\s\S]*?-->/g, '')
  
  const { sanitizeMDX, createMdxFallbackSource } = await import('@/lib/wiki-markdown')
  const sanitizedContent = sanitizeMDX(cleaned)
  const fallbackSource = createMdxFallbackSource(cleaned)
  
  // Show sanitized content excerpt with ArticleMedia
  const amIdx = sanitizedContent.indexOf('<ArticleMedia')
  
  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-xl font-bold mb-4">Direct Supabase Compile Test</h1>
      
      <div className="mb-4 p-3 bg-blue-100 rounded text-sm">
        <p><strong>Content length:</strong> {content.length}</p>
        <p><strong>Has ArticleMedia in Supabase:</strong> {content.includes('<ArticleMedia') ? '✅ YES' : '❌ NO'}</p>
        <p><strong>Has ArticleMedia after sanitizeMDX:</strong> {sanitizedContent.includes('<ArticleMedia') ? '✅ YES' : '❌ NO'}</p>
        <p><strong>Has ArticleMedia in fallback:</strong> {fallbackSource.includes('<ArticleMedia') ? 'YES' : '❌ NO (STRIPPED)'}</p>
        <p><strong>Fallback length:</strong> {fallbackSource.length} (vs {sanitizedContent.length} sanitized)</p>
      </div>

      <h2 className="font-bold mt-6 mb-2">Sanitized Content (excerpt around ArticleMedia):</h2>
      <pre className="text-xs bg-gray-100 p-3 rounded whitespace-pre-wrap max-h-40 overflow-auto">
        {amIdx >= 0 ? sanitizedContent.substring(Math.max(0, amIdx - 100), Math.min(sanitizedContent.length, amIdx + 300)) : 'N/A'}
      </pre>

      <h2 className="font-bold mt-6 mb-2">ExamTip content check:</h2>
      <pre className="text-xs bg-gray-100 p-3 rounded whitespace-pre-wrap max-h-40 overflow-auto">
        {(() => {
          const idx = content.indexOf('## How It')
          if (idx < 0) return 'Section not found'
          return content.substring(idx, idx + 1000)
        })()}
      </pre>
    </div>
  )
}

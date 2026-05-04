'use server'

import React from 'react'
import { createServerClient } from '@supabase/ssr'

export default async function DebugDirectFromSupabase() {
  const slug = 'lea-hist-001-03-core-concept'
  
  // Create a direct Supabase client (not cached)
  const { cookies } = await import('next/headers')
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''
  
  const { createClient } = await import('@supabase/supabase-js')
  const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: { persistSession: false }
  })
  
  const { data: article } = await supabase
    .from('wiki_articles')
    .select('article_id, slug, content')
    .eq('slug', slug)
    .single()

  if (!article) {
    return <div>Article not found</div>
  }

  const content = article.content || ''
  const { compile } = await import('@mdx-js/mdx')
  
  let compileResult = ''
  let hasArticleMedia = content.includes('<ArticleMedia')
  let articleMediaCount = (content.match(/<ArticleMedia/g) || []).length
  let examTipFormat = (content.match(/<ExamTip>/g) || []).length
  let hasExamTipNewline = content.includes('<ExamTip>\n')
  
  try {
    const result = await compile(content, {
      outputFormat: 'function-body',
      providerImportSource: undefined,
      development: false,
    })
    const code = String(result)
    compileResult = 'SUCCESS - ' + code.length + ' chars\nHas ArticleMedia ref: ' + code.includes('ArticleMedia')
    
    if (code.includes('ArticleMedia')) {
      compileResult += '\n\n✅ ArticleMedia REF IS IN COMPILED OUTPUT!'
    } else {
      compileResult += '\n\n❌ ArticleMedia NOT in compiled output'
    }
  } catch (err: any) {
    compileResult = `FAILED: ${err.message?.substring(0, 500)}`
  }
  
  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-xl font-bold mb-4">DIRECT Supabase Fetch (No Cache)</h1>
      <pre className="text-xs bg-gray-100 p-4 rounded mb-6 whitespace-pre-wrap">
        {JSON.stringify({
          slug,
          contentLength: content.length,
          hasArticleMedia,
          articleMediaCount,
          examTipCount: examTipFormat,
          hasNewlinesAfterExamTip: hasExamTipNewline,
          fetchMethod: 'direct Supabase (not cached)',
        }, null, 2)}
      </pre>
      <h2 className="font-bold mb-2">Compile Result</h2>
      <pre className="text-xs whitespace-pre-wrap p-4 rounded" style={{background: compileResult.startsWith('SUCCESS') ? '#dcfce7' : '#fee2e2'}}>
        {compileResult}
      </pre>
      
      <h2 className="font-bold mt-6 mb-2">First ArticleMedia Tag</h2>
      <pre className="text-xs bg-gray-100 p-4 rounded whitespace-pre-wrap">
        {(() => {
          const idx = content.indexOf('<ArticleMedia')
          if (idx < 0) return 'NONE'
          const end = content.indexOf('>', idx)
          return content.substring(idx, end + 1)
        })()}
      </pre>
    </div>
  )
}

import React, { Suspense } from 'react'
import { compileMDX } from 'next-mdx-remote/rsc'
import remarkGfm from 'remark-gfm'
import { extractHeadings } from '@/lib/wiki-markdown'
import type { WikiArticle as WikiArticleType } from '@/types/app'
import type { TocHeading } from '@/lib/wiki-markdown'
import type { EIPrompt, EIResponseMap } from '@/lib/actions/ei-prompts'
import { WikiHighlighter } from './WikiHighlighter'
import { WikiNoteAnchor } from './WikiNoteAnchor'
import { WikiTextSelection } from './WikiTextSelection'
import { baseMdxComponents } from './WikiMDXProvider'
import { resolveWidgets } from './widgets/registry'

interface WikiArticleProps {
  article: WikiArticleType
  nodeId?: string
  nodeName?: string
  eiPrompts?: EIPrompt[]
  eiResponses?: EIResponseMap
}

const convertExpressionPropsToStrings = (content: string): string => {
  const result: string[] = []
  let i = 0
  while (i < content.length) {
    const propMatch = content.substring(i).match(/^(\w+)=\{([\[{])/)
    if (!propMatch) {
      result.push(content[i])
      i++
      continue
    }
    const propName = propMatch[1]
    const startBracket = propMatch[2]
    const exprStart = i + propName.length + 2
    let depth = 0
    let j = exprStart
    let inString = false
    let stringChar = ''
    while (j < content.length) {
      const ch = content[j]
      if (inString) {
        if (ch === '\\') { j += 2; continue }
        if (ch === stringChar) inString = false
      } else {
        if (ch === '"' || ch === "'") { inString = true; stringChar = ch }
        else if (ch === '[' || ch === '{') depth++
        else if (ch === ']' || ch === '}') {
          depth--
          if (depth === 0) {
            const exprValue = content.substring(exprStart, j + 1)
            const escaped = exprValue.replace(/"/g, '&quot;')
            result.push(`${propName}="${escaped}"`)
            i = j + 2
            break
          }
        }
      }
      j++
    }
    if (depth !== 0) {
      result.push(content[i])
      i++
    }
  }
  return result.join('')
}

const stripLegacyEITags = (content: string): string =>
  content.replace(/\[EI\][\s\S]*?\[\/EI\]/g, '')

const injectEIPrompts = (content: string, prompts: EIPrompt[]): string => {
  if (prompts.length === 0) return content
  const promptsByHeading = new Map<string, number[]>()
  prompts.forEach((prompt, idx) => {
    const key = prompt.insert_after_heading.toLowerCase().trim()
    if (!promptsByHeading.has(key)) promptsByHeading.set(key, [])
    promptsByHeading.get(key)!.push(idx)
  })

  const lines = content.split('\n')
  const result: string[] = []
  for (const line of lines) {
    result.push(line)
    const headingMatch = line.match(/^(#{2,4})\s+(.+)$/)
    if (headingMatch) {
      const headingText = headingMatch[2].trim().toLowerCase()
      const indices = promptsByHeading.get(headingText)
      if (indices) {
        for (const idx of indices) {
          result.push('')
          // Scope-keyed props
          result.push(`<EIPrompt idx={${idx}} prompts={__mdx_prompts} responses={__mdx_responses} articleId={__mdx_article_id} />`)
          result.push('')
        }
      }
    }
  }
  return result.join('\n')
}

export const getArticleHeadings = (article: WikiArticleType): TocHeading[] => {
  const content = article.content || ''
  const processedContent = content.replace(/\\n/g, '\n')
  return extractHeadings(processedContent)
}

/**
 * Pure content renderer.
 */
export const WikiArticle = async ({
  article,
  nodeId,
  nodeName,
  eiPrompts = [],
  eiResponses = {},
}: WikiArticleProps) => {
  if (!article) return null

  const content = article.content || ''
  const rawContent = content.replace(/\\n/g, '\n')
  const cleaned = stripLegacyEITags(rawContent)
    .replace(/<!--[\s\S]*?-->/g, '')
  const withStringProps = convertExpressionPropsToStrings(cleaned)
  const processedContent = injectEIPrompts(withStringProps, eiPrompts)

  // Resolve dynamic widgets
  // const widgets = await resolveWidgets(processedContent)
  const widgets = {}

  // Final component map
  const components = {
    ...baseMdxComponents,
    ...widgets,
  }

  // Final scope
  const scope = {
    __mdx_prompts: eiPrompts,
    __mdx_responses: eiResponses,
    __mdx_article_id: article.article_id,
  }

  return (
    <>
      <WikiNoteAnchor
        article_id={article.article_id}
        article_title={article.title}
        topic_id={nodeId}
        topic_name={nodeName}
        source_url={`/dashboard/wiki/${article.slug}`}
      />

      <Suspense fallback={null}>
        <WikiHighlighter />
      </Suspense>

      <WikiTextSelection />

      <div className="wiki-prose max-w-none mt-8">
        <Suspense
          fallback={
            <div className="animate-pulse bg-muted h-64 w-full rounded-md" />
          }
        >
          {processedContent ? (
            <RenderMDX 
              source={processedContent} 
              components={components} 
              scope={scope} 
            />
          ) : (
            <p className="text-muted-foreground italic">
              This article has no content yet.
            </p>
          )}
        </Suspense>
      </div>
    </>
  )
}

/**
 * Helper to wrap compileMDX call.
 */
async function RenderMDX({ source, components, scope }: { source: string, components: any, scope: any }) {
  return (
    <pre className="whitespace-pre-wrap font-mono text-xs">
      {source}
    </pre>
  )
}

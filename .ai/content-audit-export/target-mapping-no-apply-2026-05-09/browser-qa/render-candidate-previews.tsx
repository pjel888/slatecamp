import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'

import { compileWikiArticleWithRenderer } from '../../../../src/components/wiki/article/WikiArticle'

const targetRoot = path.resolve('.ai/content-audit-export/target-mapping-no-apply-2026-05-09')
const outputRoot = path.join(targetRoot, 'browser-qa')
const previewRoot = path.join(outputRoot, 'preview')
mkdirSync(previewRoot, { recursive: true })

const targets = [
  { label: 'BP 344', article_id: '5a8ca807-31d5-4a32-933a-c6b83517c6de' },
  { label: 'RA 9266', article_id: 'ae4bdc43-1451-4aa5-8c12-65283f4bbdfd' },
  { label: 'Vitruvius', article_id: '25607252-c20a-4013-99f5-af11e829fd18' },
  { label: 'PD 1096', article_id: '85bcd328-436d-49ba-9d37-7b202d0d38d4' },
  { label: 'UAP SPP 201', article_id: '16bb270e-6887-4bbe-a62e-eace6c4d3fdb' },
]

function readJson(filePath: string) {
  return JSON.parse(readFileSync(filePath, 'utf8'))
}

function escapeHtml(input: unknown): string {
  return String(input ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function safeFileName(input: string): string {
  return input.toLowerCase().replace(/[^a-z0-9-]+/g, '-').replace(/^-|-$/g, '')
}

function wordCount(markdown: string): number {
  return markdown.match(/[\p{L}\p{N}][\p{L}\p{N}'’\-]*/gu)?.length ?? 0
}

function findArticleDir(articleId: string): string {
  const articlesRoot = path.join(targetRoot, 'articles')
  for (const dirName of readdirSync(articlesRoot)) {
    const dir = path.join(articlesRoot, dirName)
    const metaPath = path.join(dir, 'article-metadata.json')
    if (!existsSync(metaPath)) continue
    const meta = readJson(metaPath)
    if (meta.article_id === articleId) return dir
  }
  throw new Error(`Article folder not found for ${articleId}`)
}

function makeArticleHtml(args: {
  label: string
  title: string
  slug: string
  articleId: string
  rendered: string
  sourceStats: Record<string, unknown>
}) {
  const qaJson = escapeHtml(JSON.stringify(args.sourceStats, null, 2))
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${escapeHtml(args.label)} — ${escapeHtml(args.title)} — SlateCamp Browser QA</title>
  <style>
    :root { color-scheme: light; --ink:#172033; --muted:#607089; --line:#d8e0ea; --blue:#1d4ed8; --bg:#f4f7fb; --card:#fff; --warn:#92400e; --ok:#166534; }
    * { box-sizing: border-box; }
    body { margin: 0; background: var(--bg); color: var(--ink); font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; line-height: 1.65; }
    .frame { max-width: 980px; margin: 0 auto; padding: 28px 24px 64px; }
    .qa-banner { border: 1px solid #bfdbfe; background: #eff6ff; color: #1e3a8a; border-radius: 10px; padding: 12px 14px; font-size: 13px; margin-bottom: 18px; }
    .meta { border: 1px solid var(--line); background: var(--card); border-radius: 12px; padding: 16px; margin-bottom: 22px; box-shadow: 0 1px 2px rgba(15,23,42,.04); }
    .meta h1 { margin: 0 0 6px; font-size: 24px; line-height: 1.2; letter-spacing: -0.02em; }
    .meta dl { display: grid; grid-template-columns: 160px minmax(0,1fr); gap: 4px 12px; margin: 12px 0 0; font-size: 13px; }
    .meta dt { color: var(--muted); font-weight: 700; }
    .meta dd { margin: 0; word-break: break-word; }
    .prose { background: var(--card); border: 1px solid var(--line); border-radius: 14px; padding: 32px 38px; box-shadow: 0 10px 30px rgba(15,23,42,.06); }
    .prose h1 { margin: 0 0 22px; font-size: 34px; line-height: 1.14; letter-spacing: -0.03em; }
    .prose h2 { margin: 34px 0 10px; border-top: 1px solid #eef2f7; padding-top: 22px; font-size: 22px; line-height: 1.25; letter-spacing: -0.018em; }
    .prose h3 { margin: 24px 0 8px; font-size: 18px; }
    .prose p { margin: 0 0 14px; }
    .prose ul, .prose ol { margin: 0 0 18px 1.35rem; padding: 0; }
    .prose li { margin: 7px 0; }
    .prose strong { color: #0f172a; }
    .prose code { background: #f1f5f9; border: 1px solid #e2e8f0; border-radius: 5px; padding: .12em .35em; font-size: .92em; }
    .prose blockquote { border-left: 4px solid #93c5fd; margin: 20px 0; padding: 8px 16px; background: #eff6ff; color: #1e3a8a; }
    .prose table { width: 100%; border-collapse: collapse; font-size: 14px; margin: 18px 0; }
    .prose th, .prose td { border: 1px solid #dbe4ef; padding: 8px 10px; vertical-align: top; }
    .prose th { background: #f8fafc; text-align: left; }
    .qa-json { white-space: pre-wrap; font: 11px/1.45 ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; color: #475569; margin-top: 18px; }
    @media (max-width: 720px) { .frame { padding: 16px 12px 48px; } .prose { padding: 22px 18px; } .meta dl { grid-template-columns: 1fr; } }
  </style>
</head>
<body>
  <main class="frame" data-qa-page="candidate-preview" data-article-id="${escapeHtml(args.articleId)}" data-slug="${escapeHtml(args.slug)}">
    <div class="qa-banner"><strong>Browser QA preview:</strong> locally rendered from <code>candidate.md</code> through SlateCamp <code>compileWikiArticleWithRenderer()</code>. No Supabase article/question mutation.</div>
    <section class="meta" aria-label="QA metadata">
      <h1>${escapeHtml(args.label)} — ${escapeHtml(args.title)}</h1>
      <dl>
        <dt>Article ID</dt><dd><code>${escapeHtml(args.articleId)}</code></dd>
        <dt>Slug</dt><dd>${escapeHtml(args.slug)}</dd>
        <dt>Candidate words</dt><dd>${escapeHtml(args.sourceStats.word_count)}</dd>
        <dt>Candidate placeholders</dt><dd>${escapeHtml(args.sourceStats.candidate_placeholder_open_count)} open / ${escapeHtml(args.sourceStats.candidate_placeholder_close_count)} close</dd>
      </dl>
    </section>
    <article class="prose prose-wiki" data-qa-article-body>
      ${args.rendered}
    </article>
    <details>
      <summary>Static source QA stats</summary>
      <pre class="qa-json">${qaJson}</pre>
    </details>
  </main>
  <script>
    window.__slatecampBrowserQa = (() => {
      const body = document.querySelector('[data-qa-article-body]')
      const text = body ? body.innerText : ''
      const html = body ? body.innerHTML : ''
      const headings = [...document.querySelectorAll('[data-qa-article-body] h1, [data-qa-article-body] h2, [data-qa-article-body] h3')].map(h => h.textContent.trim())
      const images = [...document.images]
      return {
        url: location.href,
        articleId: document.querySelector('[data-article-id]')?.getAttribute('data-article-id'),
        slug: document.querySelector('[data-slug]')?.getAttribute('data-slug'),
        rawPlaceholderOpenCount: html.split('[SLATECAMP_UI_BLOCK:').length - 1,
        rawPlaceholderCloseCount: html.split('[/SLATECAMP_UI_BLOCK]').length - 1,
        extractedPropsLineCount: text.split('Props: id=').length - 1,
        hasWikiArticleError: text.includes('Unable to render article') || html.includes('WikiArticleError'),
        articleTextLength: text.length,
        h1Count: document.querySelectorAll('[data-qa-article-body] h1').length,
        h2Count: document.querySelectorAll('[data-qa-article-body] h2').length,
        h3Count: document.querySelectorAll('[data-qa-article-body] h3').length,
        emptyHeadingCount: headings.filter(h => !h).length,
        brokenImageCount: images.filter(img => img.complete && img.naturalWidth === 0).length,
        horizontalOverflow: document.documentElement.scrollWidth > document.documentElement.clientWidth + 2,
        viewport: { width: innerWidth, height: innerHeight },
      }
    })()
  </script>
</body>
</html>`
}

const manifest: any[] = []
const indexItems: string[] = []

for (const target of targets) {
  const articleDir = findArticleDir(target.article_id)
  const metadata = readJson(path.join(articleDir, 'article-metadata.json'))
  const candidatePath = path.join(articleDir, 'candidate.md')
  const normalizedPath = path.join(articleDir, 'normalized.md')
  const candidate = readFileSync(candidatePath, 'utf8')
  const normalized = readFileSync(normalizedPath, 'utf8')
  const sourceStats = {
    article_id: target.article_id,
    label: target.label,
    title: metadata.title,
    slug: metadata.slug,
    folder: path.basename(articleDir),
    candidate_path: path.relative(process.cwd(), candidatePath),
    normalized_path: path.relative(process.cwd(), normalizedPath),
    word_count: wordCount(candidate),
    candidate_char_count: candidate.length,
    candidate_placeholder_open_count: candidate.split('[SLATECAMP_UI_BLOCK:').length - 1,
    candidate_placeholder_close_count: candidate.split('[/SLATECAMP_UI_BLOCK]').length - 1,
    normalized_placeholder_open_count: normalized.split('[SLATECAMP_UI_BLOCK:').length - 1,
    candidate_has_wiki_article_error_text: candidate.includes('WikiArticleError') || candidate.includes('Unable to render article'),
    candidate_component_tags: Array.from(candidate.matchAll(/<([A-Z][A-Za-z0-9]*)\b/g)).map((m) => m[1]),
    candidate_heading_count: (candidate.match(/^#{1,3}\s+/gm) ?? []).length,
  }

  let rendered = ''
  let compileError: string | null = null
  try {
    const compiled = await compileWikiArticleWithRenderer({
      article: { article_id: target.article_id, content: candidate },
      eiPrompts: [],
      eiResponses: {},
    })
    rendered = renderToStaticMarkup(<>{compiled.content}</>)
  } catch (error) {
    compileError = error instanceof Error ? error.message : String(error)
    rendered = `<div class="compile-error"><h1>Compile error</h1><pre>${escapeHtml(compileError)}</pre></div>`
  }

  const htmlStats = {
    rendered_char_count: rendered.length,
    rendered_placeholder_open_count: rendered.split('[SLATECAMP_UI_BLOCK:').length - 1,
    rendered_placeholder_close_count: rendered.split('[/SLATECAMP_UI_BLOCK]').length - 1,
    rendered_has_extracted_props: rendered.includes('Props: id='),
    rendered_has_wiki_article_error: rendered.includes('WikiArticleError') || rendered.includes('Unable to render article'),
    compile_error: compileError,
  }

  const fileName = `${safeFileName(target.label)}-${safeFileName(metadata.slug || target.article_id)}.html`
  const filePath = path.join(previewRoot, fileName)
  writeFileSync(filePath, makeArticleHtml({
    label: target.label,
    title: metadata.title,
    slug: metadata.slug,
    articleId: target.article_id,
    rendered,
    sourceStats: { ...sourceStats, ...htmlStats },
  }))

  const entry = {
    ...sourceStats,
    ...htmlStats,
    preview_file: path.relative(process.cwd(), filePath),
    preview_file_abs: filePath,
    status: compileError || htmlStats.rendered_placeholder_open_count || htmlStats.rendered_has_wiki_article_error ? 'FAIL' : 'PREVIEW_RENDERED',
  }
  manifest.push(entry)
  indexItems.push(`<li><a href="./${escapeHtml(fileName)}">${escapeHtml(target.label)} — ${escapeHtml(metadata.title)}</a> <span>${escapeHtml(target.article_id)}</span></li>`)
}

writeFileSync(path.join(previewRoot, 'index.html'), `<!doctype html><html lang="en"><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width, initial-scale=1"/><title>SlateCamp Candidate Browser QA</title><style>body{font-family:Inter,system-ui,sans-serif;background:#f4f7fb;color:#172033;margin:0}.frame{max-width:900px;margin:0 auto;padding:40px 24px}li{margin:14px 0;padding:12px 14px;background:#fff;border:1px solid #d8e0ea;border-radius:10px}a{font-weight:700;color:#1d4ed8}span{display:block;color:#607089;font-size:12px;margin-top:4px}code{background:#eaf1fb;padding:2px 5px;border-radius:4px}</style></head><body><main class="frame"><h1>SlateCamp Browser QA Candidate Previews</h1><p>Local no-mutation preview pages generated from <code>candidate.md</code> through SlateCamp <code>compileWikiArticleWithRenderer()</code>.</p><ol>${indexItems.join('\n')}</ol></main></body></html>`)
writeFileSync(path.join(outputRoot, 'render-manifest.json'), JSON.stringify({ generated_at: new Date().toISOString(), target_root: targetRoot, preview_root: previewRoot, articles: manifest }, null, 2))
console.log(JSON.stringify({ outputRoot, previewRoot, articles: manifest.map(({ article_id, slug, status, word_count }) => ({ article_id, slug, status, word_count })) }, null, 2))

#!/usr/bin/env bun
/**
 * link-questions-to-articles.ts
 * Links uploaded questions to their parent wiki_articles via article_id.
 * Matches by article_slug from JSON files → wiki_articles.slug → article_id,
 * then updates questions by matching question text.
 *
 * Run: bun run scripts/link-questions-to-articles.ts
 */

import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'

const MISSING_ARTICLES_DIR = path.join(process.cwd(), 'Missing Articles')

async function main() {
  console.log('🔗 SlateCamp Question-Article Linker\n')

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !serviceRoleKey) {
    console.error('❌ Missing env vars')
    process.exit(1)
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  })

  // Step 1: Get all article slugs → article_ids from wiki_articles
  const { data: articles, error: artError } = await supabase
    .from('wiki_articles')
    .select('article_id, slug, title')

  if (artError) {
    console.error('❌ Failed to load articles:', artError.message)
    process.exit(1)
  }

  const slugToArticleId = new Map<string, string>()
  for (const a of articles ?? []) {
    slugToArticleId.set(a.slug, a.article_id)
  }
  console.log(`✓ ${slugToArticleId.size} articles loaded from DB\n`)

  // Step 2: Walk JSON files and build slug → question texts mapping
  const results: { file: string; folder: string; linked: number; notFound: boolean; failed: string }[] = []

  const folders = fs
    .readdirSync(MISSING_ARTICLES_DIR)
    .filter(f => fs.statSync(path.join(MISSING_ARTICLES_DIR, f)).isDirectory())
    .sort()

  let totalLinked = 0
  let totalSkipped = 0
  let totalFailed = 0

  for (const folderName of folders) {
    const folderPath = path.join(MISSING_ARTICLES_DIR, folderName)
    const qFiles = fs
      .readdirSync(folderPath)
      .filter(f => f.endsWith('_questions.json'))
      .sort()

    console.log(`📁 ${folderName} (${qFiles.length} files)`)

    for (const fileName of qFiles) {
      const filePath = path.join(folderPath, fileName)
      let linked = 0
      let notFound = false
      let failed = ''

      try {
        const raw = fs.readFileSync(filePath, 'utf-8')
        let parsed = JSON.parse(raw)

        // Unwrap array-of-one-wrapper
        if (Array.isArray(parsed) && parsed.length === 1 && parsed[0]?.questions) {
          parsed = parsed[0]
        }

        // Extract article_slug
        let articleSlug: string | null = null
        if (!Array.isArray(parsed) && parsed.article_slug) {
          articleSlug = parsed.article_slug
        } else if (Array.isArray(parsed) && parsed[0]?.article_slug) {
          articleSlug = parsed[0].article_slug
        }

        // Fallback: derive slug from filename
        if (!articleSlug) {
          articleSlug = fileName
            .replace('_questions.json', '')
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-|-$/g, '')
        }

        const articleId = slugToArticleId.get(articleSlug)
        if (!articleId) {
          console.log(`   ⚠ ${fileName}: article slug "${articleSlug}" not found in DB`)
          notFound = true
          totalSkipped++
          results.push({ file: fileName, folder: folderName, linked: 0, notFound: true, failed: '' })
          continue
        }

        // Extract question texts
        const questions: Record<string, unknown>[] = Array.isArray(parsed)
          ? parsed
          : (parsed.questions ?? [])

        const questionTexts: string[] = []
        for (const q of questions) {
          const text = (q.text || q.question || q.stem) as string
          if (text) questionTexts.push(text)
        }

        if (questionTexts.length === 0) {
          console.log(`   ↷ ${fileName}: no question texts found`)
          results.push({ file: fileName, folder: folderName, linked: 0, notFound: false, failed: '' })
          continue
        }

        // Update questions in batches of 10 (matching by text)
        const { data: updated, error: updateError } = await supabase
          .from('questions')
          .update({ article_id: articleId })
          .in('text', questionTexts)
          .is('article_id', null)
          .select('question_id')

        if (updateError) throw new Error(`DB: ${updateError.message}`)

        linked = updated?.length ?? 0
        totalLinked += linked
        console.log(`   ✓ ${fileName}: ${linked} linked → ${articleSlug}`)
      } catch (err) {
        failed = err instanceof Error ? err.message : String(err)
        console.error(`   ✗ ${fileName}: ${failed}`)
        totalFailed++
      }

      results.push({ file: fileName, folder: folderName, linked, notFound, failed })
    }
    console.log()
  }

  // Summary
  console.log('═══════════════════════════════════════════')
  console.log('📊 LINKING SUMMARY')
  console.log('═══════════════════════════════════════════')
  console.log(`✓ ${totalLinked} questions linked to articles`)
  console.log(`⚠ ${totalSkipped} files had no matching article in DB`)
  if (totalFailed > 0) {
    console.log(`✗ ${totalFailed} files failed:`)
    for (const f of results.filter(r => r.failed)) {
      console.log(`   [${f.folder}] ${f.file}: ${f.failed}`)
    }
  }

  // Verify: check remaining unlinked
  const { count } = await supabase
    .from('questions')
    .select('question_id', { count: 'exact', head: true })
    .is('article_id', null)

  console.log(`\n📈 Remaining questions without article_id: ${count ?? 'unknown'}`)

  if (totalFailed === 0 && totalSkipped === 0) {
    console.log('\n🎉 All questions linked successfully!')
  }
}

main().catch(err => { console.error('Fatal:', err); process.exit(1) })

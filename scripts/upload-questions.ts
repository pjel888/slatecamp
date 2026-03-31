#!/usr/bin/env bun
/**
 * upload-questions.ts
 * Reads all *_questions.json from "Missing Articles/" and uploads to Supabase.
 * Handles two formats:
 *   (A-v1) Direct w/ string options: [{ topic_id, question, options: string[], answer: string, explanation }]
 *   (A-v2) Direct w/ object options: [{ topic_id, text, options: {id,text}[], correct_option_id, rationale }]
 *   (A-v3) Direct w/ stem + index answer: [{ topic_id, stem, options: string[], answer: number|string, explanation }]
 *   (B) Wrapped: { questions: [{ topic_id, text, options: {id,text}[], correct_option_id, rationale, ... }] }
 * Run: bun run scripts/upload-questions.ts
 */

import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'

const MISSING_ARTICLES_DIR = path.join(process.cwd(), 'Missing Articles')

async function main() {
  console.log('🚀 SlateCamp Questions Upload Script\n')

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !serviceRoleKey) {
    console.error('❌ Missing env vars')
    process.exit(1)
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  })

  const { data: existing, error: eqError } = await supabase
    .from('questions')
    .select('question_id, topic_id, text')

  if (eqError) {
    console.error('❌ Failed to load existing questions:', eqError.message)
    process.exit(1)
  }

  const seen = new Set<string>()
  for (const q of existing ?? []) {
    seen.add(((q.text as string) ?? '').toLowerCase().substring(0, 120))
  }
  console.log(`✓ ${existing?.length ?? 0} existing questions loaded\n`)

  const BLOOM_MAP: Record<string, string> = {
    knowledge: 'remember', comprehension: 'understand', application: 'apply',
    analysis: 'analyze', synthesis: 'evaluate', evaluation: 'evaluate',
  }
  const normalizeBloom = (v: unknown): string | null => {
    if (!v) return null
    const s = String(v).toLowerCase()
    return BLOOM_MAP[s] || (['remember','understand','apply','analyze','evaluate','create'].includes(s) ? s : null)
  }

  const results: { file: string; folder: string; uploaded: number; skipped: number; failed: string }[] = []

  const folders = fs
    .readdirSync(MISSING_ARTICLES_DIR)
    .filter(f => fs.statSync(path.join(MISSING_ARTICLES_DIR, f)).isDirectory())
    .sort()

  for (const folderName of folders) {
    const folderPath = path.join(MISSING_ARTICLES_DIR, folderName)
    const qFiles = fs
      .readdirSync(folderPath)
      .filter(f => f.endsWith('_questions.json'))
      .sort()

    console.log(`📁 ${folderName} (${qFiles.length} files)`)

    for (const fileName of qFiles) {
      const filePath = path.join(folderPath, fileName)
      let uploaded = 0, skipped = 0, failed = ''

      try {
        const raw = fs.readFileSync(filePath, 'utf-8')
        const parsed = JSON.parse(raw)
        let questions: Record<string, unknown>[] = []

        // Unwrap array-of-one-wrapper: [{ questions: [...] }] → { questions: [...] }
        let data = parsed
        if (Array.isArray(data) && data.length === 1 && data[0]?.questions && Array.isArray(data[0].questions)) {
          data = data[0]
        }

        if (Array.isArray(data)) {
          // Format A: two variants
          const first = data[0] as Record<string, unknown> | undefined

          if (first && typeof first.question === 'string' && Array.isArray(first.options) && first.options.length > 0 && typeof first.options[0] === 'string') {
            // Format A-v1: { question: string, options: string[], answer: string }
            // e.g. X-Ray Films, Vent Shafts
            for (const q of data) {
              if (!q.topic_id || !q.question || !Array.isArray(q.options) || !q.answer) continue
              const fp = q.question.toLowerCase().substring(0, 120)
              if (seen.has(fp)) { skipped++; continue }
              seen.add(fp)
              const opts = q.options.map((o: string, i: number) => ({
                id: String.fromCharCode(65 + i),
                text: o,
              }))
              const ans = (q.answer as string).trim()
              let correctId = 'A'
              for (const o of opts) {
                if (
                  o.text.trim().toLowerCase().startsWith(ans.toLowerCase()) ||
                  ans.toLowerCase().startsWith(o.text.trim().toLowerCase().substring(0, 30)) ||
                  o.text.toLowerCase().includes(ans.toLowerCase())
                ) {
                  correctId = o.id
                  break
                }
              }
              questions.push({
                topic_id: q.topic_id,
                text: q.question,
                options: opts,
                correct_option_id: correctId,
                rationale: q.explanation || null,
                difficulty: 0.5,
              })
            }
          } else if (first && typeof first.text === 'string' && Array.isArray(first.options) && first.options.length > 0 && typeof first.options[0] === 'object') {
            // Format A-v2: { text: string, options: {id,text}[], correct_option_id: string }
            // e.g. regenerated PD 1096 files — array-wrapped Format B objects
            for (const q of data) {
              if (!q.topic_id || !q.text || !Array.isArray(q.options)) continue
              const fp = (q.text as string).toLowerCase().substring(0, 120)
              if (seen.has(fp)) { skipped++; continue }
              seen.add(fp)
              const rationaleObj = q.rationale as Record<string, unknown> | undefined
              questions.push({
                topic_id: q.topic_id,
                text: q.text,
                options: q.options,
                correct_option_id: q.correct_option_id || 'A',
                rationale: q.rationale || null,
                difficulty: typeof q.difficulty === 'number' ? q.difficulty : 0.5,
                bloom_level: normalizeBloom(q.bloom_level),
                application_context: null,
                explanation: q.explanation || (rationaleObj?.explanation as string) || null,
                code_citation: q.code_citation || null,
              })
            }
          } else if (first && typeof first.stem === 'string' && Array.isArray(first.options) && first.options.length > 0 && typeof first.options[0] === 'string') {
            // Format A-v3: { stem: string, options: string[], answer: number | string, topic_id }
            // e.g. Egress, Penthouses, Prefab, Rule I, Sanitation, Signs
            for (const q of data) {
              if (!q.topic_id || !q.stem || !Array.isArray(q.options)) continue
              const fp = q.stem.toLowerCase().substring(0, 120)
              if (seen.has(fp)) { skipped++; continue }
              seen.add(fp)
              const opts = q.options.map((o: string, i: number) => ({
                id: String.fromCharCode(65 + i),
                text: o,
              }))
              let correctId = 'A'
              if (typeof q.answer === 'number') {
                correctId = String.fromCharCode(65 + q.answer)
              } else {
                const ans = String(q.answer).trim().toLowerCase()
                for (const o of opts) {
                  if (o.text.trim().toLowerCase().startsWith(ans) || ans.startsWith(o.text.trim().toLowerCase().substring(0, 30)) || o.text.toLowerCase().includes(ans)) {
                    correctId = o.id
                    break
                  }
                }
              }
              questions.push({
                topic_id: q.topic_id,
                text: q.stem,
                options: opts,
                correct_option_id: correctId,
                rationale: q.explanation || null,
                difficulty: typeof q.difficulty === 'number' ? q.difficulty : 0.5,
              })
            }
          } else {
            throw new Error(`Unrecognized Format A variant: missing expected fields in first element`)
          }
        } else if (data.questions && Array.isArray(data.questions)) {
          // Format B: { questions: [...] }
          for (const q of data.questions) {
            if (!q.topic_id || !q.text || !Array.isArray(q.options)) continue
            const fp = (q.text as string).toLowerCase().substring(0, 120)
            if (seen.has(fp)) { skipped++; continue }
            seen.add(fp)
            questions.push({
              topic_id: q.topic_id,
              text: q.text,
              options: q.options,
              correct_option_id: q.correct_option_id || 'A',
              rationale: q.rationale || null,
              difficulty: typeof q.difficulty === 'number' ? q.difficulty : 0.5,
              bloom_level: normalizeBloom(q.bloom_level),
              application_context: null,
              explanation: q.explanation || null,
              code_citation: q.code_citation || null,
            })
          }
        } else {
          throw new Error('Unrecognized JSON structure')
        }

        if (questions.length === 0) {
          console.log(`   ↷ ${fileName} (${skipped} dupes, 0 new)`)
          results.push({ file: fileName, folder: folderName, uploaded: 0, skipped, failed: '' })
          continue
        }

        const { error: insertError } = await supabase
          .from('questions')
          .insert(questions)
          .select('question_id')

        if (insertError) throw new Error(`DB: ${insertError.message}`)

        uploaded = questions.length
        console.log(`   ✓ ${fileName}: ${uploaded} uploaded${skipped > 0 ? ` (+${skipped} dupes)` : ''}`)
      } catch (err) {
        failed = err instanceof Error ? err.message : String(err)
        console.error(`   ✗ ${fileName}: ${failed}`)
      }

      results.push({ file: fileName, folder: folderName, uploaded, skipped, failed })
    }
    console.log()
  }

  const total = results.reduce((s, r) => s + r.uploaded, 0)
  const failedFiles = results.filter(r => r.failed)
  console.log('═══════════════════════════════════════════')
  console.log('📊 UPLOAD SUMMARY')
  console.log('═══════════════════════════════════════════')
  console.log(`✓ ${results.filter(r => r.uploaded > 0).length} files uploaded (${total} questions)`)
  console.log(`↷ ${results.filter(r => r.uploaded === 0 && !r.failed).length} files skipped (duplicates)`)
  if (failedFiles.length > 0) {
    console.log(`✗ ${failedFiles.length} files failed:`)
    for (const f of failedFiles) console.log(`   [${f.folder}] ${f.file}: ${f.failed}`)
  }
  console.log()
  if (failedFiles.length === 0) {
    console.log('🎉 All questions uploaded successfully!')
  } else {
    process.exit(1)
  }
}

main().catch(err => { console.error('Fatal:', err); process.exit(1) })

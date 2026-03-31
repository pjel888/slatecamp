#!/usr/bin/env bun
/**
 * link-questions-fuzzy.ts
 * Links remaining unlinked questions to articles using text matching.
 * For topics with multiple articles, matches question text against article titles/keywords.
 *
 * Run: bun run scripts/link-questions-fuzzy.ts
 */

import { createClient } from '@supabase/supabase-js'

async function main() {
  console.log('🔍 SlateCamp Fuzzy Question-Article Linker\n')

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !serviceRoleKey) {
    console.error('❌ Missing env vars')
    process.exit(1)
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  })

  // Step 1: Get all unlinked questions
  const { data: unlinked, error: uErr } = await supabase
    .from('questions')
    .select('question_id, topic_id, text, rationale, explanation, code_citation')
    .is('article_id', null)

  if (uErr) { console.error('❌', uErr.message); process.exit(1) }
  console.log(`✓ ${unlinked!.length} unlinked questions loaded\n`)

  // Step 2: Get articles for multi-article topics
  const topicIds = [...new Set(unlinked!.map(q => q.topic_id))]

  const { data: articleMappings, error: amErr } = await supabase
    .from('wiki_article_taxonomy')
    .select('node_id, article_id, wiki_articles(article_id, title, slug)')
    .in('node_id', topicIds)

  if (amErr) { console.error('❌', amErr.message); process.exit(1) }

  // Build topic → articles map
  type ArticleInfo = { article_id: string; title: string; slug: string; keywords: string[] }
  const topicArticles = new Map<string, ArticleInfo[]>()

  for (const m of articleMappings ?? []) {
    const art = m.wiki_articles as unknown as { article_id: string; title: string; slug: string } | null
    if (!art) continue
    if (!topicArticles.has(m.node_id)) topicArticles.set(m.node_id, [])

    // Generate keywords from title
    const title = art.title.toLowerCase()
    const keywords = title
      .split(/[\s\-–—&,()\/]+/)
      .filter(w => w.length > 2 && !['the', 'and', 'for', 'with', 'from', 'rule', 'area'].includes(w))

    topicArticles.get(m.node_id)!.push({
      article_id: art.article_id,
      title: art.title,
      slug: art.slug,
      keywords,
    })
  }

  console.log(`✓ ${topicArticles.size} topics with articles loaded\n`)

  // Step 3: Match questions to articles
  let matched = 0
  let unmatched = 0
  const updates: { question_id: string; article_id: string }[] = []
  const unmatchedQuestions: { question_id: string; text: string; topic_id: string }[] = []

  for (const q of unlinked!) {
    const articles = topicArticles.get(q.topic_id)
    if (!articles || articles.length === 0) {
      unmatched++
      continue
    }

    // Build searchable text from question
    const searchText = [
      q.text,
      typeof q.rationale === 'string' ? q.rationale : JSON.stringify(q.rationale ?? ''),
      q.explanation ?? '',
      q.code_citation ?? '',
    ].join(' ').toLowerCase()

    // Score each article by keyword matches
    let bestMatch: ArticleInfo | null = null
    let bestScore = 0

    for (const art of articles) {
      let score = 0

      // Exact title match in text (strongest signal)
      if (searchText.includes(art.title.toLowerCase())) {
        score += 100
      }

      // Slug match (e.g., question mentions "building-permit-process")
      if (searchText.includes(art.slug.replace(/-/g, ' '))) {
        score += 50
      }

      // Keyword matching
      for (const kw of art.keywords) {
        if (searchText.includes(kw)) {
          score += kw.length > 5 ? 3 : 1 // Longer keywords score higher
        }
      }

      // Specific code section matching for PD 1096 articles
      const titleLower = art.title.toLowerCase()
      // Match section numbers: "sec. 707" in question → "height limits" article
      if (titleLower.includes('height limit') && /sec\.?\s*707|building height limit|bhl/i.test(q.text)) score += 80
      if (titleLower.includes('occupancy') && /sec\.?\s*70[12]|occupancy classif/i.test(q.text)) score += 80
      if (titleLower.includes('area metric') && /sec\.?\s*70[34]|floor area|flar|tgfa|gfa/i.test(q.text)) score += 80
      if (titleLower.includes('egress') && /sec\.?\s*1204|sec\.?\s*1207|egress|corridor|exit/i.test(q.text)) score += 80
      if (titleLower.includes('light and ventilation') && /sec\.?\s*80[5-8]|natural light|ventilation.*window/i.test(q.text)) score += 80
      if (titleLower.includes('setback') && /sec\.?\s*80[9]|setback|easement|yard/i.test(q.text)) score += 80
      if (titleLower.includes('fire zone') && /sec\.?\s*50[1-7]|fire zone/i.test(q.text)) score += 80
      if (titleLower.includes('fire resistive') && /sec\.?\s*60[0-3]|fire.resist|type\s+[iv]+\s+construct/i.test(q.text)) score += 80
      if (titleLower.includes('fire extinguish') && /sec\.?\s*121[0-2]|sprinkler|standpipe|extinguish/i.test(q.text)) score += 80
      if (titleLower.includes('permit') && /sec\.?\s*30[1-5]|building permit|permit.*process/i.test(q.text)) score += 80
      if (titleLower.includes('ceiling') && /sec\.?\s*80[5-7]|ceiling height|room size|habitable room/i.test(q.text)) score += 80
      if (titleLower.includes('certificate') && /sec\.?\s*30[6-9]|certificate.*occupancy|fsic/i.test(q.text)) score += 80
      if (titleLower.includes('chimney') && /chimney|fireplace|flue|hearth|damper/i.test(q.text)) score += 80
      if (titleLower.includes('dangerous') && /sec\.?\s*21[4-6]|dangerous.*building|ruinous|abatement/i.test(q.text)) score += 80
      if (titleLower.includes('electrical') && /electrical|mechanical|elevator|escalator|hoistway|boiler/i.test(q.text)) score += 80
      if (titleLower.includes('excavation') && /excavation|foundation|veneer|footing|trench/i.test(q.text)) score += 80
      if (titleLower.includes('glass') && /glass|glazing|jalousie|tempered.*glass/i.test(q.text)) score += 80
      if (titleLower.includes('lathing') && /lath|plaster|stucco|metal\s+lath|wood\s+lath/i.test(q.text)) score += 80
      if (titleLower.includes('location on property') && /sec\.?\s*704|exterior wall|property line|centerline/i.test(q.text)) score += 80
      if (titleLower.includes('parking') && /sec\.?\s*11|parking.*slot|parking.*require/i.test(q.text)) score += 80
      if (titleLower.includes('penthouse') && /penthouse|roof\s+structure|roof\s+deck/i.test(q.text)) score += 80
      if (titleLower.includes('plastics') && /plastic.*construct|light.transmit|fiber.?glass/i.test(q.text)) score += 80
      if (titleLower.includes('prefab') && /prefab|industrialized|modular.*construct/i.test(q.text)) score += 80
      if (titleLower.includes('pedestrian') && /pedestrian.*protect|construction.*barrier|sidewalk.*shed/i.test(q.text)) score += 80
      if (titleLower.includes('sanitation') && /sanitation|water.*supply|plumbing|sewage|septic/i.test(q.text)) score += 80
      if (titleLower.includes('sheet metal') && /sheet metal|spray booth|gauge.*metal/i.test(q.text)) score += 80
      if (titleLower.includes('sign') && /sign.*design|neon|projecting.*sign|wall.*sign/i.test(q.text)) score += 80
      if (titleLower.includes('stage') && /stage|platform|proscenium|gridiron|projection.*room/i.test(q.text)) score += 80
      if (titleLower.includes('x-ray') && /x.?ray|film.*storage|vault.*door/i.test(q.text)) score += 80
      if (titleLower.includes('vent shaft') && /vent.*shaft|air.*duct|skylight.*ventil/i.test(q.text)) score += 80
      if (titleLower.includes('vertical opening') && /vertical.*opening|floor.*opening|escalator.*enclos/i.test(q.text)) score += 80
      if (titleLower.includes('change of use') && /change.*use|change.*occupancy|b-12/i.test(q.text)) score += 80
      if (titleLower.includes('allowable floor') && /allowable.*floor.*area|floor.*area.*increase/i.test(q.text)) score += 80
      if (titleLower.includes('general provision') && /sec\.?\s*10[2-6]|general.*provision|minimum.*standard/i.test(q.text)) score += 80
      if (titleLower.includes('minimum requirement') && /group\s*a|dwelling|minimum.*requirement/i.test(q.text)) score += 80

      if (score > bestScore) {
        bestScore = score
        bestMatch = art
      }
    }

    if (bestMatch && bestScore >= 3) {
      updates.push({ question_id: q.question_id, article_id: bestMatch.article_id })
      matched++
    } else {
      unmatched++
      unmatchedQuestions.push({ question_id: q.question_id, text: q.text.substring(0, 80), topic_id: q.topic_id })
    }
  }

  console.log(`📊 Match results: ${matched} matched, ${unmatched} unmatched\n`)

  // Step 4: Batch update in groups of 50
  let updated = 0
  for (let i = 0; i < updates.length; i += 50) {
    const batch = updates.slice(i, i + 50)

    // Group by article_id for efficient updates
    const byArticle = new Map<string, string[]>()
    for (const u of batch) {
      if (!byArticle.has(u.article_id)) byArticle.set(u.article_id, [])
      byArticle.get(u.article_id)!.push(u.question_id)
    }

    for (const [articleId, questionIds] of byArticle) {
      const { error } = await supabase
        .from('questions')
        .update({ article_id: articleId })
        .in('question_id', questionIds)

      if (error) {
        console.error(`   ✗ Failed batch for article ${articleId}: ${error.message}`)
      } else {
        updated += questionIds.length
      }
    }
  }

  console.log(`✓ ${updated} questions updated in DB`)

  // Final count
  const { count } = await supabase
    .from('questions')
    .select('question_id', { count: 'exact', head: true })
    .is('article_id', null)

  console.log(`\n📈 Remaining unlinked: ${count ?? 'unknown'}`)

  if (unmatched > 0) {
    console.log(`\n⚠ ${unmatched} questions could not be matched. Sample:`)
    for (const u of unmatchedQuestions.slice(0, 5)) {
      console.log(`   "${u.text}..."`)
    }
  }

  if (unmatched === 0) {
    console.log('\n🎉 All questions linked!')
  }
}

main().catch(err => { console.error('Fatal:', err); process.exit(1) })

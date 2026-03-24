// Check payload size and wiki_items content
import { createClient } from '@supabase/supabase-js'

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const supabase = createClient(url, key)

const { data: disc } = await supabase.from('disciplines').select('discipline_id').limit(1).single()
const disciplineId = disc.discipline_id

const { data: nodes } = await supabase
  .from('taxonomy_tree')
  .select('*')
  .eq('discipline_id', disciplineId)
  .eq('is_cross_ref_only', false)
  .is('deprecated_at', null)
  .not('ale_id', 'is', null)
  .order('level', { ascending: true })

// Check payload size
const jsonStr = JSON.stringify(nodes)
console.log(`Total nodes: ${nodes.length}`)
console.log(`JSON payload size: ${(jsonStr.length / 1024).toFixed(1)} KB`)

// Check wiki_items sizes
let totalWikiItems = 0
let nodesWithWikiItems = 0
for (const n of nodes) {
  const wi = JSON.stringify(n.wiki_items || [])
  if (wi.length > 2) { // more than "[]"
    nodesWithWikiItems++
    totalWikiItems += wi.length
  }
}
console.log(`Nodes with wiki_items data: ${nodesWithWikiItems}`)
console.log(`Total wiki_items size: ${(totalWikiItems / 1024).toFixed(1)} KB`)

// Check a sample node's full data
const sampleL3 = nodes.find(n => n.level === 3)
const sampleKeys = Object.keys(sampleL3)
console.log(`\nSample level-3 node keys (${sampleKeys.length}):`, sampleKeys.join(', '))
console.log(`Sample node size: ${JSON.stringify(sampleL3).length} bytes`)

// Check node with biggest payload
let biggestNode = nodes[0]
let biggestSize = 0
for (const n of nodes) {
  const size = JSON.stringify(n).length
  if (size > biggestSize) {
    biggestSize = size
    biggestNode = n
  }
}
console.log(`\nBiggest node: ${biggestNode.name} (${biggestSize} bytes, level ${biggestNode.level})`)

// Simulate full output with articles
const parentNodeIds = new Set(nodes.map(n => n.parent_id).filter(Boolean))
const leafNodeIds = nodes.filter(n => n.level === 2 || !parentNodeIds.has(n.node_id)).map(n => n.node_id)
const CHUNK_SIZE = 80
const chunks = []
for (let i = 0; i < leafNodeIds.length; i += CHUNK_SIZE) {
  chunks.push(leafNodeIds.slice(i, i + CHUNK_SIZE))
}
const articleMap = new Map()
const chunkResults = await Promise.all(chunks.map(chunk =>
  supabase.from('wiki_article_taxonomy')
    .select('node_id, wiki_articles(article_id, slug, title)')
    .in('node_id', chunk)
))
for (const { data: rows } of chunkResults) {
  for (const row of rows || []) {
    if (!row.wiki_articles) continue
    if (!articleMap.has(row.node_id)) articleMap.set(row.node_id, [])
    articleMap.get(row.node_id).push(row.wiki_articles)
  }
}

const finalData = nodes.map(n => ({ ...n, articles: articleMap.get(n.node_id) || [] }))
const finalJsonStr = JSON.stringify(finalData)
console.log(`\nFinal payload with articles: ${(finalJsonStr.length / 1024).toFixed(1)} KB`)
console.log(`Nodes with articles: ${finalData.filter(n => n.articles.length > 0).length}`)

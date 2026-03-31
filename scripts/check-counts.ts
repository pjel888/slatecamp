import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://hrpdwqurngnyajuhbkdg.supabase.co'
const supabaseKey = 'REDACTED_SUPABASE_SERVICE_ROLE_KEY'

const supabase = createClient(supabaseUrl, supabaseKey)

async function check() {
  console.log('--- Subjects (Level 1) ---')
  const { data: subjects } = await supabase.from('taxonomy_tree').select('node_id, name, subject_area').eq('level', 1)
  console.log(JSON.stringify(subjects, null, 2))

  console.log('\n--- Counts by topic_id in questions ---')
  const { data: qCounts } = await supabase.rpc('execute_sql', { sql: 'SELECT topic_id, count(*) FROM questions GROUP BY topic_id' })
  // If rpc fails, we'll try something else
  
  const { data: questions } = await supabase.from('questions').select('topic_id')
  const qMap = new Map()
  questions?.forEach(q => {
    qMap.set(q.topic_id, (qMap.get(q.topic_id) || 0) + 1)
  })
  console.log('Total unique topic_ids in questions:', qMap.size)

  const { data: articleTaxonomy } = await supabase.from('wiki_article_taxonomy').select('node_id')
  const aMap = new Map()
  articleTaxonomy?.forEach(a => {
    aMap.set(a.node_id, (aMap.get(a.node_id) || 0) + 1)
  })
  console.log('Total unique node_ids in articles:', aMap.size)

  // Check if subject_area is indeed common
  const { data: sample } = await supabase.from('taxonomy_tree').select('node_id, subject_area, level').limit(10)
  console.log('\n--- Sample Taxonomy Nodes ---')
  console.log(JSON.stringify(sample, null, 2))
}

check()

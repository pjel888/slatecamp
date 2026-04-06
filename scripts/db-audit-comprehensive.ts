import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://hrpdwqurngnyajuhbkdg.supabase.co'
const supabaseKey = 'REDACTED_SUPABASE_SERVICE_ROLE_KEY'

const supabase = createClient(supabaseUrl, supabaseKey)

async function audit() {
  console.log('--- SCHEMA AUDIT ---')
  
  // 1. Check for missing columns in quiz_sessions (that we recently added)
  const { data: sessionCols } = await supabase.from('quiz_sessions').select('*').limit(1)
  if (sessionCols && sessionCols.length > 0) {
    const keys = Object.keys(sessionCols[0])
    console.log('quiz_sessions columns:', keys.filter(k => ['answered_count', 'correct_count'].includes(k)))
  }

  // 2. Identify the "Problem" subtopics mentioned by user
  console.log('\n--- TAXONOMY AUDIT ---')
  const { data: problemTopics } = await supabase
    .from('taxonomy_tree')
    .select('node_id, name, is_leaf')
    .or('name.ilike.%overview%,name.ilike.%strategy%,name.ilike.%mastery%,name.ilike.%connections%')
  
  console.log('Restricted keywords topics found:', problemTopics?.map(t => ({ name: t.name, is_leaf: t.is_leaf })))

  // 3. Check for topics with < 10 questions
  console.log('\n--- QUESTION DENSITY AUDIT ---')
  const { data: topics } = await supabase.from('taxonomy_tree').select('node_id, name').eq('is_leaf', true)
  const { data: qCounts } = await supabase.from('questions').select('topic_id')
  
  const dist: Record<string, number> = {}
  qCounts?.forEach(q => dist[q.topic_id] = (dist[q.topic_id] || 0) + 1)

  const lowDensity = topics?.filter(t => (dist[t.node_id] || 0) < 10 && (dist[t.node_id] || 0) > 0)
  const zeroDensity = topics?.filter(t => !dist[t.node_id])

  console.log('Total leaf topics:', topics?.length)
  console.log('Topics with 1-9 questions:', lowDensity?.length)
  console.log('Topics with 0 questions:', zeroDensity?.length)
  
  if (lowDensity && lowDensity.length > 0) {
    console.log('Sample low density topics:', lowDensity.slice(0, 5).map(t => `${t.name} (${dist[t.node_id]})`))
  }
}

audit()

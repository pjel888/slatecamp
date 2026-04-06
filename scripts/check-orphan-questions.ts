import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://hrpdwqurngnyajuhbkdg.supabase.co'
const supabaseKey = 'REDACTED_SUPABASE_SERVICE_ROLE_KEY'

const supabase = createClient(supabaseUrl, supabaseKey)

async function check() {
  const { data: questions } = await supabase
    .from('questions')
    .select('topic_id, question_id')
  
  if (!questions) return

  const { data: taxonomy } = await supabase
    .from('taxonomy_tree')
    .select('node_id')
  
  const validTopicIds = new Set(taxonomy?.map(t => t.node_id) || [])
  
  let orphans = 0
  let valid = 0
  const orphanTopics = new Set<string>()

  questions.forEach(q => {
    if (validTopicIds.has(q.topic_id)) {
      valid++
    } else {
      orphans++
      orphanTopics.add(q.topic_id)
    }
  })

  console.log('Valid topic links:', valid)
  console.log('Orphan topic links:', orphans)
  console.log('Unique orphan topics:', orphanTopics.size)
  console.log('Sample orphan topic:', Array.from(orphanTopics)[0])
}

check()

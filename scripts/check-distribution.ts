import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://hrpdwqurngnyajuhbkdg.supabase.co'
const supabaseKey = 'REDACTED_SUPABASE_SERVICE_ROLE_KEY'

const supabase = createClient(supabaseUrl, supabaseKey)

async function check() {
  // Get all disciplines
  const { data: disciplines } = await supabase
    .from('disciplines')
    .select('discipline_id, name')
  
  if (!disciplines) return

  // Get question counts per discipline via taxonomy_tree
  const { data: questions } = await supabase
    .from('questions')
    .select('topic_id')
  
  if (!questions) return

  const { data: taxonomy } = await supabase
    .from('taxonomy_tree')
    .select('node_id, discipline_id')
  
  if (!taxonomy) return

  const topicToDiscipline = new Map(taxonomy.map(t => [t.node_id, t.discipline_id]))
  
  const disCounts: Record<string, number> = {}
  questions.forEach(q => {
    const disId = topicToDiscipline.get(q.topic_id)
    if (disId) {
      disCounts[disId] = (disCounts[disId] || 0) + 1
    }
  })

  const results = disciplines.map(d => ({
    id: d.discipline_id,
    name: d.name,
    count: disCounts[d.discipline_id] || 0
  }))

  console.log('Discipline Distribution:', results)
}

check()

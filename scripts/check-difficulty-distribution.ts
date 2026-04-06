import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://hrpdwqurngnyajuhbkdg.supabase.co'
const supabaseKey = 'REDACTED_SUPABASE_SERVICE_ROLE_KEY'

const supabase = createClient(supabaseUrl, supabaseKey)

async function check() {
  const { data: questions } = await supabase
    .from('questions')
    .select('difficulty')
  
  if (!questions) return

  const bands = {
    easy: questions.filter(q => q.difficulty < 0.4).length,
    medium: questions.filter(q => q.difficulty >= 0.4 && q.difficulty < 0.7).length,
    hard: questions.filter(q => q.difficulty >= 0.7).length,
    nulls: questions.filter(q => q.difficulty === null).length
  }

  console.log('Difficulty Distribution:', bands)
}

check()

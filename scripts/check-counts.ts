import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://hrpdwqurngnyajuhbkdg.supabase.co'
const supabaseKey = 'REDACTED_SUPABASE_SERVICE_ROLE_KEY'

const supabase = createClient(supabaseUrl, supabaseKey)

async function check() {
  const { count, error } = await supabase
    .from('questions')
    .select('*', { count: 'exact', head: true })
  
  console.log('Total questions:', count)
  if (error) console.error('Error:', error)

  const { data: samples } = await supabase
    .from('questions')
    .select('difficulty, topic_id')
    .limit(5)
  
  console.log('Samples:', samples)
}

check()

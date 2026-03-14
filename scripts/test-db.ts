import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://hrpdwqurngnyajuhbkdg.supabase.co'
const supabaseKey = 'REDACTED_SUPABASE_SERVICE_ROLE_KEY'

const supabase = createClient(supabaseUrl, supabaseKey)

async function test() {
  const { data, error } = await supabase.from('taxonomy_tree').select('*')
  if (error) {
    console.error('Error:', error)
  } else {
    console.log('Taxonomy Data:', JSON.stringify(data, null, 2))
  }
}

test()

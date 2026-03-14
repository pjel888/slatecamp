import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://hrpdwqurngnyajuhbkdg.supabase.co'
const supabaseKey = 'REDACTED_SUPABASE_SERVICE_ROLE_KEY'

async function inspect() {
  const response = await fetch(`${supabaseUrl}/rest/v1/`, {
    headers: {
      'apikey': supabaseKey,
      'Authorization': `Bearer ${supabaseKey}`
    }
  })
  
  if (!response.ok) {
    const text = await response.text()
    console.error('Error:', response.status, text)
    return
  }
  
  const spec = await response.json()
  console.log(JSON.stringify(spec, null, 2))
}

inspect()

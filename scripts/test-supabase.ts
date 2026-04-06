import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://127.0.0.1:54321'
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

console.log("Key length:", supabaseKey.length)
console.log("Key start:", supabaseKey.substring(0, 10))

async function run() {
  const supabase = createClient(supabaseUrl, supabaseKey)
  const { data, error } = await supabase.from('taxonomy_cross_references').select('*').limit(1)
  console.log("Data:", data, "Error:", error)
}
run()
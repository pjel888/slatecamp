import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://hrpdwqurngnyajuhbkdg.supabase.co'
const supabaseKey = 'REDACTED_SUPABASE_SERVICE_ROLE_KEY'

const supabase = createClient(supabaseUrl, supabaseKey)

async function check() {
  const { data: { users } } = await supabase.auth.admin.listUsers()
  if (!users || users.length === 0) return
  const user = users[0]

  const recentCutoff = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()

  const { count } = await supabase
    .from('user_interactions')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .gte('interaction_timestamp', recentCutoff)
  
  console.log('Recent interactions (7 days):', count)
}

check()

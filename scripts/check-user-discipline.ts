import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://hrpdwqurngnyajuhbkdg.supabase.co'
const supabaseKey = 'REDACTED_SUPABASE_SERVICE_ROLE_KEY'

const supabase = createClient(supabaseUrl, supabaseKey)

async function check() {
  const { data: { users } } = await supabase.auth.admin.listUsers()
  if (!users || users.length === 0) return

  const user = users[0] // Check first user as sample
  console.log('Checking user:', user.id)

  const { data: globalStats } = await supabase
    .from('user_global_stats')
    .select('current_discipline_id')
    .eq('user_id', user.id)
    .single()
  
  console.log('User Discipline:', globalStats?.current_discipline_id)

  if (globalStats?.current_discipline_id) {
    const { data: leaves } = await supabase
      .from('taxonomy_tree')
      .select('node_id')
      .eq('discipline_id', globalStats.current_discipline_id)
      .eq('is_leaf', true)
    
    console.log('Leaf topics in this discipline:', leaves?.length || 0)

    if (leaves && leaves.length > 0) {
      const leafIds = leaves.map(l => l.node_id)
      const { count } = await supabase
        .from('questions')
        .select('*', { count: 'exact', head: true })
        .in('topic_id', leafIds)
      
      console.log('Questions in these topics:', count)
    }
  }
}

check()

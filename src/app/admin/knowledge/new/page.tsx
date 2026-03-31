import { redirect } from 'next/navigation'
import { canManageContent } from '@/lib/admin/roles'
import { UnifiedContentEditor } from '@/components/admin/unified-editor'
import { createClient } from '@/lib/supabase/server'

export const metadata = {
  title: 'New Article | SlateCamp Admin',
}

const NewContentPage = async () => {
  const authorized = await canManageContent()
  if (!authorized) redirect('/admin')

  // Fetch all taxonomy nodes for the selector
  const supabase = await createClient()
  const { data: nodes } = await supabase
    .from('taxonomy_tree')
    .select('node_id, name, ale_id, level, parent_id, subject_area, is_leaf')
    .order('level', { ascending: true })
    .order('name', { ascending: true })

  // Create a blank article shell — no article_id yet
  // The UnifiedContentEditor handles new articles by checking for empty article_id
  const blankArticle = {
    article_id: '',
    title: '',
    slug: '',
    content: '',
    status: 'draft',
    ale_tests_you: null,
    updated_note: null,
    subject_label: null,
    difficulty_label: null,
    reviewed_by: null,
    reviewer_comments: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }

  return (
    <UnifiedContentEditor
      article={blankArticle as any}
      questions={[]}
      eiPrompts={[]}
      taxonomyNodes={nodes || []}
      taxonomyLinks={[]}
    />
  )
}

export default NewContentPage

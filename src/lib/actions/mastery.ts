'use server'

import { createClient, getUser } from '@/lib/supabase/server'

export interface SubjectMastery {
  subject: string
  score: number
  fullMark: number
}

export async function getSubjectMasteryData(): Promise<SubjectMastery[]> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await getUser()
    if (!user) return []

    // 1. Get current discipline
    const { data: stats } = await supabase
      .from('user_global_stats')
      .select('current_discipline_id')
      .eq('user_id', user.id)
      .maybeSingle()

    if (!stats?.current_discipline_id) return []

    // 2. Fetch all taxonomy nodes for this discipline to build the tree map
    // Exclude ALE-LAWS (cross-ref only) and deprecated v1 nodes
    const { data: taxonomyNodes } = await supabase
      .from('taxonomy_tree')
      .select('node_id, parent_id, level, name')
      .eq('discipline_id', stats.current_discipline_id)
      .eq('is_cross_ref_only', false)
      .is('deprecated_at', null)
      .not('ale_id', 'is', null)

    if (!taxonomyNodes) return []

    // 3. Fetch user mastery
    const { data: userMastery } = await supabase
      .from('user_node_mastery')
      .select('topic_id, current_mastery_weight')
      .eq('user_id', user.id)

    const masteryMap = new Map<string, number>()
    userMastery?.forEach(m => masteryMap.set(m.topic_id, m.current_mastery_weight))

    // 4. Group nodes by their Level 1 ancestor
    const nodeMap = new Map<string, any>()
    taxonomyNodes.forEach(n => nodeMap.set(n.node_id, n))

    const level1Subjects = taxonomyNodes.filter(n => n.level === 1)
    const subjectScores = level1Subjects.map(subject => {
      // Find all descendants of this subject
      const descendants: string[] = []
      const findDescendants = (parentId: string) => {
        taxonomyNodes.forEach(n => {
          if (n.parent_id === parentId) {
            descendants.push(n.node_id)
            findDescendants(n.node_id)
          }
        })
      }

      // Include the subject itself if it has mastery
      descendants.push(subject.node_id)
      findDescendants(subject.node_id)

      // Average the mastery of all descendants that have data
      let totalScore = 0
      let count = 0

      descendants.forEach(id => {
        const score = masteryMap.get(id)
        if (score !== undefined) {
          totalScore += score
          count++
        }
      })

      return {
        subject: subject.name,
        score: count > 0 ? Math.round((totalScore / count) * 100) : 0,
        fullMark: 100,
      }
    })

    return subjectScores
  } catch (err) {
    console.error('[MASTERY: getSubjectMasteryData]', err)
    return []
  }
}

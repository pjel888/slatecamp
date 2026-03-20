/**
 * DEMO MODE MODULE
 * Activated via NEXT_PUBLIC_DEMO_MODE=true environment variable.
 * Provides mock data for the /try landing experience without requiring Supabase.
 * Do NOT delete — this module is env-gated, not import-gated.
 * See: src/app/try/page.tsx
 */
import { DEMO_USER } from './config'
import type { UserTier } from '@/types/app'
import { TIER_CAPABILITIES } from '@/lib/dev/dev-mode'

const uid = DEMO_USER.id
const now = new Date().toISOString()

function daysAgo(n: number): string {
  const d = new Date()
  d.setDate(d.getDate() - n)
  return d.toISOString()
}

/**
 * Build a demo profile for the given tier.
 */
export function getDemoProfile(tier: UserTier = 'institutional') {
  const caps = TIER_CAPABILITIES[tier]
  return {
    id: uid,
    email: DEMO_USER.email,
    full_name: 'Philip Lewis',
    avatar_url: null,
    tier,
    profession: 'architecture' as const,
    exam_target: 'ALE 2026',
    target_exam_date: '2026-09-15',
    daily_streak: 14,
    longest_streak: 21,
    last_active_at: now,
    onboarding_completed: true,
    is_admin: true,
    created_at: '2026-01-15T08:00:00Z',
    updated_at: now,
  }
}

export const DEMO_PROFILE = getDemoProfile('institutional')

export const DEMO_DISCIPLINES = [
  {
    discipline_id: 'ale-uuid',
    name: 'Architecture Licensure Exam',
    acronym: 'ALE',
    created_at: daysAgo(30),
    updated_at: daysAgo(30)
  }
]

export const DEMO_TAXONOMY = []

export const DEMO_NODE_MASTERY = []

export const DEMO_READINESS_SNAPSHOTS = []

export const DEMO_GLOBAL_STATS = []

export const DEMO_NOTE_FOLDERS = []

export const DEMO_NOTES = []

export const DEMO_SUBSCRIPTIONS = []

export const DEMO_WIKI_ARTICLES = []

export const DEMO_WIKI_TAXONOMY = []

export function getDemoDataForTable(table: string, tier?: UserTier): unknown[] {
  switch (table) {
    case 'profiles':
      return [tier ? getDemoProfile(tier) : DEMO_PROFILE]
    case 'user_subscriptions':
      return DEMO_SUBSCRIPTIONS
    case 'wiki_articles':
      return DEMO_WIKI_ARTICLES
    case 'wiki_article_taxonomy':
      return DEMO_WIKI_TAXONOMY
    case 'disciplines':
      return DEMO_DISCIPLINES
    case 'taxonomy_tree':
      return DEMO_TAXONOMY
    case 'user_node_mastery':
      return DEMO_NODE_MASTERY
    case 'user_global_stats':
      return DEMO_GLOBAL_STATS
    case 'readiness_score_snapshots':
      return DEMO_READINESS_SNAPSHOTS
    case 'note_folders':
      return DEMO_NOTE_FOLDERS
    case 'notes':
      return DEMO_NOTES
    case 'user_roles':
      return [{ user_id: uid, role: 'super_admin', created_at: now }]
    case 'questions':
      return [
        { 
          question_id: 'q-1', 
          text: 'What is the primary material used in reinforced concrete?', 
          topic_id: 'ale-uuid', 
          difficulty: 2, 
          options: ['Steel', 'Wood', 'Plastic', 'Glass'], 
          correct_option_id: 'Steel',
          created_at: now 
        }
      ]
    case 'models_3d':
      return [
        {
          model_id: 'm-1',
          name: 'Colosseum',
          slug: 'colosseum',
          url: '/models/colosseum.glb',
          thumbnail: '/models/colosseum.png',
          status: 'published',
          metadata: {},
          created_at: now
        }
      ]
    default:
      return []
  }
}

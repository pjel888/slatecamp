'use server'

import { createClient, getUser } from '@/lib/supabase/server'

/**
 * Lightweight funnel event tracker.
 * Writes to analytics_events table — silently drops on failure.
 *
 * Instrumentation targets (add trackEvent calls at these sites):
 * 1. signup          — src/app/(auth)/register/page.tsx (after successful registration)
 * 2. first_drill     — src/lib/actions/quiz-v2/end-session.ts (on first completed session)
 * 3. first_wiki_read — src/lib/actions/wiki-reads.ts (on first article read)
 * 4. zone_2_reached  — src/lib/actions/readiness-score-update.ts (when zone transitions to 2)
 * 5. first_simulation — src/lib/actions/quiz-v2/end-session.ts (on first full_exam completion)
 */
export const trackEvent = async (
  eventName: string,
  properties?: Record<string, unknown>,
): Promise<void> => {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await getUser()
    if (!user) return

    await supabase.from('analytics_events').insert({
      user_id: user.id,
      event_name: eventName,
      event_properties: properties ?? {},
    })
  } catch (err) {
    console.error('[ANALYTICS] trackEvent failed:', err)
  }
}

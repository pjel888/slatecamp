'use client'

import { createClient } from '@/lib/supabase/client'

type AnalyticsEvent = {
  event_name: string
  event_properties?: Record<string, unknown>
  page_path?: string
  session_id?: string
  referrer?: string
}

export const trackEvent = async ({
  event_name,
  event_properties = {},
  page_path,
  session_id,
  referrer,
}: AnalyticsEvent) => {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    await supabase.from('analytics_events').insert({
      user_id: user.id,
      event_name,
      event_properties,
      page_path: page_path || (typeof window !== 'undefined' ? window.location.pathname : null),
      session_id: session_id || null,
      referrer: referrer || (typeof document !== 'undefined' ? document.referrer : null),
    })
  } catch (e) {
    // Silent fail — analytics should never break the app
    console.warn('[analytics]', e)
  }
}

'use server'

import { createClient, getUser } from '@/lib/supabase/server'

export const trackServerEvent = async (
  event_name: string,
  event_properties: Record<string, unknown> = {},
) => {
  try {
    const supabase = await createClient()
    const { data: { user } } = await getUser()
    if (!user) return

    await supabase.from('analytics_events').insert({
      user_id: user.id,
      event_name,
      event_properties,
    })
  } catch (e) {
    // Silent fail — analytics should never break the app
    console.warn('[analytics:server]', e)
  }
}

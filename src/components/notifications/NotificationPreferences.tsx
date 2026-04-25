'use client'

import { useState, useTransition } from 'react'
import { Switch } from '@/components/ui/switch'
import { updateNotificationPreferences } from '@/lib/actions/notifications'
import { toast } from '@/lib/hooks/use-toast'
import type { NotificationPreferences as PrefsType } from '@/types/notifications'

type BooleanPrefKey = {
  [K in keyof PrefsType]: PrefsType[K] extends boolean ? K : never
}[keyof PrefsType]

interface PreferenceItem {
  key: BooleanPrefKey
  title: string
  description: string
}

interface PreferenceGroup {
  label: string
  items: PreferenceItem[]
}

const PREFERENCE_GROUPS: PreferenceGroup[] = [
  {
    label: 'PROGRESS & STUDY',
    items: [
      { key: 'score_changes', title: 'Score changes', description: 'When your Readiness Score moves' },
      { key: 'trail_ready', title: 'Trail day ready', description: 'When your next Camp Trail day unlocks' },
      { key: 'focus_review', title: 'Focus Review alerts', description: 'When neglected topics are detected' },

      { key: 'milestones', title: 'Milestones', description: 'Zone transitions and Full Exam Simulation' },
    ],
  },
  {
    label: 'CONTENT',
    items: [
      { key: 'content_updates', title: 'Content updates', description: 'New wiki articles and 3D modules' },
      { key: 'daily_digest', title: 'Daily digest', description: 'A compact daily study summary' },
      { key: 'weekly_digest', title: 'Weekly digest', description: 'Sunday summary of your progress' },
    ],
  },
  {
    label: 'OTHER',
    items: [
      { key: 'coaching_tips', title: 'Coaching tips', description: 'Study tips and feature suggestions' },
      { key: 'billing', title: 'Billing', description: 'Subscription renewals and payment issues' },
    ],
  },
]

interface NotificationPreferencesProps {
  initialPreferences: PrefsType
}

export const NotificationPreferences = ({ initialPreferences }: NotificationPreferencesProps) => {
  const [prefs, setPrefs] = useState(initialPreferences)
  const [isPending, startTransition] = useTransition()

  const handleToggle = (key: BooleanPrefKey, value: boolean) => {
    setPrefs((prev) => ({ ...prev, [key]: value }))
    startTransition(async () => {
      const result = await updateNotificationPreferences({ [key]: value })
      if (result.error) {
        setPrefs((prev) => ({ ...prev, [key]: !value }))
        toast({ title: 'Error', description: result.error, variant: 'error' })
        return
      }
      toast({ title: 'Saved', description: 'Notification preferences updated.', variant: 'success' })
    })
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-base font-medium text-foreground">Notification Preferences</h2>
        <p className="text-[13px] text-muted-foreground mt-0.5">Choose what you want to hear about</p>
        <p className="sr-only" aria-live="polite">
          {isPending ? 'Saving notification preference.' : 'Notification preferences ready.'}
        </p>
      </div>

      {PREFERENCE_GROUPS.map((group) => (
        <div key={group.label}>
          <p className="font-mono text-[11px] font-medium uppercase tracking-widest text-muted-foreground mb-3">
            {group.label}
          </p>
          <div className="rounded-md border border-border bg-card overflow-hidden divide-y divide-border">
            {group.items.map((item) => (
              <div key={item.key} className="flex items-center justify-between px-4 py-3">
                <div className="min-w-0 mr-4">
                  <p className="text-sm font-medium text-foreground">{item.title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{item.description}</p>
                </div>
                <Switch
                  checked={prefs[item.key] as boolean}
                  onCheckedChange={(checked) => handleToggle(item.key, checked)}
                  disabled={isPending}
                  aria-label={`Toggle ${item.title}`}
                />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

import { redirect } from 'next/navigation'
import { ROUTES } from '@/lib/constants/routes'
import { getAdminAwareProfile } from '@/lib/admin/get-admin-profile'
import { getProfileData } from '@/lib/actions/profile'
import { getUserEmailPreferences } from '@/lib/actions/email-preferences'
import { fetchNotificationPreferences } from '@/lib/queries/notifications'
import { getProfessionalModeData } from '@/lib/actions/professional-mode'
import { NotificationPreferences } from '@/components/notifications/NotificationPreferences'

import { LogoutCard } from './logout-card'
import { DisciplineCard } from './discipline-card'
import { ThemeCard } from './theme-card'
import { ProfileCard } from './profile-card'
import { NotificationsCard } from './notifications-card'
import { AccountModeCard } from './account-mode-card'

export const metadata = { title: 'Settings' }

const DEFAULT_NOTIFICATION_PREFS = {
  score_changes: true,
  trail_ready: true,
  blindspot: true,
  milestones: true,
  campfire: true,
  content_updates: true,
  weekly_digest: true,
  coaching_tips: false,
  billing: true,
  daily_digest: false,
  quiet_hours_start: null,
  quiet_hours_end: null,
} as const

export default async function SettingsPage() {
  const profile = await getAdminAwareProfile()
  if (!profile) redirect(ROUTES.LOGIN)

  const [profileData, emailPrefs, notifPrefsResult, professionalModeData] = await Promise.all([
    getProfileData(),
    getUserEmailPreferences(),
    fetchNotificationPreferences(profile.id),
    getProfessionalModeData(),
  ])

  const notifPrefs = notifPrefsResult.data ?? DEFAULT_NOTIFICATION_PREFS

  return (
    <div className='max-w-2xl mx-auto space-y-8'>
      {/* Profile — name, avatar, exam date */}
      <ProfileCard
        initialDisplayName={profileData?.display_name ?? null}
        initialAvatarUrl={profileData?.avatar_url ?? null}
        initialExamDate={profileData?.target_exam_date ?? null}
      />

      {/* License / Discipline */}
      <DisciplineCard />

      {/* Appearance / Theme */}
      <ThemeCard />

      {/* Notifications — email on/off toggles */}
      <NotificationsCard
        initialEmailNotifications={emailPrefs.email_notifications_enabled}
        initialMarketingEmails={emailPrefs.marketing_emails_enabled}
      />

      {/* Notifications — per-topic preferences */}
      <NotificationPreferences initialPreferences={notifPrefs} />

      {/* Account Mode — only shown when lea_result is set (exam completed) */}
      {professionalModeData && (
        <AccountModeCard currentMode={professionalModeData.accountMode} />
      )}

      {/* Account / Log out */}
      <LogoutCard />
    </div>
  )
}

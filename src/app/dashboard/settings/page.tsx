import { redirect } from 'next/navigation'
import { ROUTES } from '@/lib/constants/routes'
import { getAdminAwareProfile } from '@/lib/admin/get-admin-profile'
import { getProfileData } from '@/lib/actions/profile'
import { getUserEmailPreferences } from '@/lib/actions/email-preferences'

import { LogoutCard } from './logout-card'
import { DisciplineCard } from './discipline-card'
import { ThemeCard } from './theme-card'
import { ProfileCard } from './profile-card'
import { NotificationsCard } from './notifications-card'

export const metadata = { title: 'Settings' }

export default async function SettingsPage() {
  const profile = await getAdminAwareProfile()
  if (!profile) redirect(ROUTES.LOGIN)

  const [profileData, emailPrefs] = await Promise.all([
    getProfileData(),
    getUserEmailPreferences(),
  ])

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

      {/* Notifications */}
      <NotificationsCard
        initialEmailNotifications={emailPrefs.email_notifications_enabled}
        initialMarketingEmails={emailPrefs.marketing_emails_enabled}
      />

      {/* Account / Log out */}
      <LogoutCard />
    </div>
  )
}

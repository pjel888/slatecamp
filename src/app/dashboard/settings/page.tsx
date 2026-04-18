import { redirect } from 'next/navigation'
import { ROUTES } from '@/lib/routes'
import { getProfileData } from '@/lib/actions/profile'
import { getUserEmailPreferences } from '@/lib/actions/email-preferences'
import { fetchNotificationPreferences } from '@/lib/queries/notifications'
import { getProfessionalModeData } from '@/lib/actions/professional-mode'
import { NotificationPreferences } from '@/components/notifications/NotificationPreferences'
import { getViewerEntitlements } from '@/lib/entitlements/get-viewer-entitlements'

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
  focus_review: true,
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
  const entitlements = await getViewerEntitlements()
  if (!entitlements.userId) redirect(ROUTES.auth.login)

  const [profileData, emailPrefs, notifPrefsResult, professionalModeData] = await Promise.all([
    getProfileData(),
    getUserEmailPreferences(),
    fetchNotificationPreferences(entitlements.userId),
    getProfessionalModeData(),
  ])

  const notifPrefs = notifPrefsResult.data ?? DEFAULT_NOTIFICATION_PREFS

  return (
    <div className='max-w-2xl mx-auto space-y-8'>
      {!profileData?.onboarding_completed_at && (
        <div className='rounded-md border border-primary/20 bg-primary/5 px-4 py-4'>
          <p className='text-sm font-semibold text-foreground'>Your setup is not complete yet.</p>
          <p className='mt-1 text-sm text-muted-foreground'>
            Finish the required items below to unlock the full dashboard. Until then, settings remains your safe place to resume.
          </p>
        </div>
      )}

      <ProfileCard
        initialDisplayName={profileData?.display_name ?? null}
        initialAvatarUrl={profileData?.avatar_url ?? null}
        initialExamDate={profileData?.target_exam_date ?? null}
        initialEnrolledReviewCenter={profileData?.enrolled_review_center ?? null}
        initialOnboardingCompleted={Boolean(profileData?.onboarding_completed_at)}
        initialReviewerType={profileData?.reviewer_type ?? null}
        initialStudyWindow={profileData?.preferred_study_window ?? null}
      />

      <DisciplineCard />

      <ThemeCard />

      <NotificationsCard
        initialEmailNotifications={emailPrefs.email_notifications_enabled}
        initialMarketingEmails={emailPrefs.marketing_emails_enabled}
      />

      <NotificationPreferences initialPreferences={notifPrefs} />

      {professionalModeData && (
        <AccountModeCard currentMode={professionalModeData.accountMode} />
      )}

      <LogoutCard />
    </div>
  )
}

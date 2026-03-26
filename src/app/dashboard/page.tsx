import { Suspense } from 'react'
import { getDashboardPageData } from '@/lib/actions/dashboard-page'
import { syncDashboardNotifications } from '@/lib/actions/sync-notifications'
import { trackServerEvent } from '@/lib/analytics-server'
import { HeroCommandBar } from '@/components/dashboard/HeroCommandBar'
import {
  HeatmapSection,
  HeatmapSectionSkeleton,
} from '@/components/dashboard/HeatmapSection'
import { SubjectMasteryCard } from '@/components/dashboard/SubjectMasteryCard'
import { ImprovedActivityFeed } from '@/components/dashboard/ImprovedActivityFeed'
import { DailyWikiCard } from '@/components/dashboard/FeatureDiscoveryRow'
import { StreakRibbon } from '@/components/dashboard/StreakRibbon'
import ResultsDayBanner from '@/app/dashboard/results-day/_components/ResultsDayBanner'
import { ReviewCenterSyncCard } from '@/components/dashboard/ReviewCenterSyncCard'
import { BloomCognitiveTracker } from '@/components/dashboard/BloomCognitiveTracker'
import TransitionPrompt from '@/app/dashboard/professional/_components/TransitionPrompt'
import { getBloomBreakdown } from '@/lib/actions/bloom-tracker'
import SharedPageLayout from '@/components/layouts/SharedPageLayout'

export default async function DashboardPage() {
  const data = await getDashboardPageData()

  void trackServerEvent('app_opened', {
    days_since_last_visit: 0,
    current_score: data.readinessScore || undefined,
    days_to_exam: data.daysUntilExam ?? undefined,
  })

  // Sync dashboard signals into the notification system (fire-and-forget)
  void syncDashboardNotifications({
    activeTrailDay: data.activeTrailDay,
    srsReview: data.srsReview,
    subjectFloorAlerts: data.subjectFloorAlerts,
  })


  // Bloom cognitive tracker data (only fetched if enough sessions)
  const bloomData = data.sessionsCompleted >= 10 ? await getBloomBreakdown() : []

  // Professional mode transition prompt logic
  const showPasserTransition = data.aleResult === 'passed' && data.daysUntilExam !== null && data.daysUntilExam < -3
  const showOptInTransition = data.aleResult === 'failed' && data.daysUntilExam !== null && data.daysUntilExam < -30

  return (
    <SharedPageLayout>
      <div className='flex flex-col gap-2 w-full h-full min-h-0 border-0'>
        {/* ── Professional Mode Transition (passer or opt-in) ── */}
        {showPasserTransition && <TransitionPrompt variant="passed" />}
        {showOptInTransition && <TransitionPrompt variant="opt-in" />}

        {/* ── Results Day Banner (exam_date 3-14 days ago, no result yet) ── */}
        {data.showResultsDayBanner && <ResultsDayBanner />}

        {/* ── Streak Ribbon + Locked Score ────────────────── */}
        <StreakRibbon
          currentStreak={data.streak.currentStreak}
          streakStatus={data.streak.streakStatus}
        />

        {/* ── 1. Hero: Score + Greeting + Heatmap ────────── */}
        <HeroCommandBar
          userName={data.userName}
          readinessScore={data.readinessScore}
          previousScore={data.previousScore}
          daysUntilExam={data.daysUntilExam}
          heroStats={data.heroStats}
          syllabusCoveragePercent={data.syllabusCoveragePercent}
          readinessMeta={data.readinessMeta}
        >
          <Suspense fallback={<HeatmapSectionSkeleton />}>
            <HeatmapSection />
          </Suspense>
        </HeroCommandBar>

        {/* ── Content grid ──────────────────────────────── */}
        <div className='min-h-0'>
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2 w-full'>
            <div className='lg:col-span-3 rounded-md border border-border bg-white p-2'>
              <div className='grid grid-cols-3 gap-2 h-full'>
                <div className='rounded-md bg-primary-50 min-h-[72px]' />
                <div className='rounded-md bg-success-50 min-h-[72px]' />
                <div className='rounded-md bg-warning-50 min-h-[72px]' />
              </div>
            </div>

            <div className='h-full lg:row-span-2'>
              <ImprovedActivityFeed sessions={data.recentSessions} />
            </div>

            <div className='h-full'>
              <DailyWikiCard
                article={data.dailyArticle}
                notes={data.recentNotes}
              />
            </div>

            <div />

            <div className='h-full'>
              <SubjectMasteryCard data={data.subjectMastery} />
            </div>

            {/* ── Review Center Sync (visible when enrolled) ── */}
            <ReviewCenterSyncCard
              enrolledReviewCenter={data.enrolledReviewCenter}
              subjectMastery={data.subjectMastery}
            />

            {/* ── Bloom Cognitive Tracker (after 10+ sessions) ── */}
            <div className="lg:col-span-2">
              <BloomCognitiveTracker
                data={bloomData}
                sessionsCompleted={data.sessionsCompleted}
              />
            </div>
          </div>
        </div>
      </div>
    </SharedPageLayout>
  )
}

import { Suspense } from 'react'
import { getDashboardPageData } from '@/lib/actions/dashboard-page'
import { HeroCommandBar } from '@/components/dashboard/HeroCommandBar'
import {
  HeatmapSection,
  HeatmapSectionSkeleton,
} from '@/components/dashboard/HeatmapSection'
import { SubjectMasteryCard } from '@/components/dashboard/SubjectMasteryCard'
import { ImprovedActivityFeed } from '@/components/dashboard/ImprovedActivityFeed'
import { DailyWikiCard } from '@/components/dashboard/FeatureDiscoveryRow'
import { OnboardingStateCard } from '@/components/dashboard/OnboardingStateCard'
import { LockedScoreWidget } from '@/components/dashboard/LockedScoreWidget'
import { StreakRibbon } from '@/components/dashboard/StreakRibbon'
import { SrsReviewWidget } from '@/components/dashboard/SrsReviewWidget'
import SharedPageLayout from '@/components/layouts/SharedPageLayout'

export default async function DashboardPage() {
  const data = await getDashboardPageData()

  const showLockedScore =
    data.isFreeUser &&
    data.onboardingState !== 'needs_assessment' &&
    data.onboardingState !== 'needs_score_reveal' &&
    data.scoreUpdatesSinceReveal > 0

  return (
    <SharedPageLayout>
      <div className='flex flex-col gap-2 w-full h-full min-h-0 border-0'>
        {/* ── Onboarding State Card (above everything) ─────── */}
        {data.onboardingState !== 'ready' && (
          <OnboardingStateCard
            state={data.onboardingState}
            trailDay={data.activeTrailDay ?? undefined}
          />
        )}

        {/* ── Streak Ribbon + Locked Score ────────────────── */}
        <div className="flex items-center justify-between gap-2">
          <StreakRibbon
            currentStreak={data.streak.currentStreak}
            streakStatus={data.streak.streakStatus}
          />
          {showLockedScore && (
            <LockedScoreWidget updatesSinceReveal={data.scoreUpdatesSinceReveal} />
          )}
        </div>

        {/* ── SRS Review Widget ───────────────────────────── */}
        {data.srsReview.itemsDue > 0 && (
          <SrsReviewWidget
            itemsDue={data.srsReview.itemsDue}
            subjects={data.srsReview.subjects}
            estimatedMinutes={data.srsReview.estimatedMinutes}
          />
        )}

        {/* ── 1. Hero: Score + Greeting + Heatmap ────────── */}
        <HeroCommandBar
          userName={data.userName}
          readinessScore={data.readinessScore}
          previousScore={data.previousScore}
          daysUntilExam={data.daysUntilExam}
          heroStats={data.heroStats}
          syllabusCoveragePercent={data.syllabusCoveragePercent}
        >
          <Suspense fallback={<HeatmapSectionSkeleton />}>
            <HeatmapSection />
          </Suspense>
        </HeroCommandBar>

        {/* ── 2. Content grid ────────────────────────────── */}
        <div className='min-h-0'>
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2 w-full'>
            <div className='lg:col-span-3 rounded-md border border-[#D4DAE3] bg-white p-2'>
              <div className='grid grid-cols-3 gap-2 h-full'>
                <div className='rounded-md bg-[#EEF2FC] min-h-[72px]' />
                <div className='rounded-md bg-[#EDFAF4] min-h-[72px]' />
                <div className='rounded-md bg-[#FEF8ED] min-h-[72px]' />
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
          </div>
        </div>
      </div>
    </SharedPageLayout>
  )
}

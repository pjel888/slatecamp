import { Suspense } from 'react'
import { HeroCommandBarSkeleton } from '@/components/dashboard/HeroCommandBar'
import { HeroCommandBarServer } from '@/components/dashboard/HeroCommandBarServer'
import {
  HeatmapSection,
  HeatmapSectionSkeleton,
} from '@/components/dashboard/HeatmapSection'
import { SubjectMasterySkeleton } from '@/components/dashboard/SubjectMasterySkeleton'
import { SubjectMasteryServer } from '@/components/dashboard/SubjectMasteryServer'
import { ImprovedActivityFeedSkeleton } from '@/components/dashboard/ImprovedActivityFeed'
import { ActivityFeedServer } from '@/components/dashboard/ActivityFeedServer'
import { FeatureDiscoverySkeleton } from '@/components/dashboard/FeatureDiscoveryRow'
import { DailyWikiServer } from '@/components/dashboard/DailyWikiServer'
import { StreakRibbonSkeleton } from '@/components/dashboard/StreakRibbonSkeleton'
import { StreakRibbonServer } from '@/components/dashboard/StreakRibbonServer'
import { ReviewCenterSyncServer } from '@/components/dashboard/ReviewCenterSyncServer'
import { BloomTrackerSkeleton } from '@/components/dashboard/BloomTrackerSkeleton'
import { BloomTrackerServer } from '@/components/dashboard/BloomTrackerServer'
import { ReviewCalendarSkeleton } from '@/components/dashboard/ReviewCalendarSkeleton'
import { ReviewCalendarServer } from '@/components/dashboard/ReviewCalendarServer'
import { DailyDoseCard } from '@/components/dashboard/DailyDoseCard'
import { ResultsDayBannerServer } from '@/components/dashboard/ResultsDayBannerServer'
import { TransitionPromptServer } from '@/components/dashboard/TransitionPromptServer'
import SharedPageLayout from '@/components/layouts/SharedPageLayout'
import { DashboardAnalyticsSync } from '@/components/dashboard/DashboardAnalyticsSync'

export default async function DashboardPage() {
  return (
    <SharedPageLayout>
      <DashboardAnalyticsSync />
      
      <div className='flex flex-col gap-2 w-full h-full min-h-0 border-0'>
        {/* ── Professional Mode Transition (passer or opt-in) ── */}
        <Suspense key="transition-prompt" fallback={null}>
          <TransitionPromptServer />
        </Suspense>

        {/* ── Results Day Banner (exam_date 3-14 days ago, no result yet) ── */}
        <Suspense key="results-banner" fallback={null}>
          <ResultsDayBannerServer />
        </Suspense>

        {/* ── Streak Ribbon + Locked Score ────────────────── */}
        <Suspense key="streak-ribbon" fallback={<StreakRibbonSkeleton />}>
          <StreakRibbonServer />
        </Suspense>

        {/* ── 1. Hero: Score + Greeting + Heatmap ────────── */}
        <Suspense key="hero" fallback={<HeroCommandBarSkeleton />}>
          <HeroCommandBarServer>
            <Suspense key="heatmap" fallback={<HeatmapSectionSkeleton />}>
              <HeatmapSection />
            </Suspense>
          </HeroCommandBarServer>
        </Suspense>

        {/* ── Daily Dose — adaptive study plan ─────────── */}
        <Suspense key="daily-dose" fallback={null}>
          <DailyDoseCard />
        </Suspense>

        {/* ── Content grid ──────────────────────────────── */}
        <div className='min-h-0'>
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2 w-full'>
            {/* ── Review Calendar (7-day forward view) ── */}
            <div className='lg:col-span-3'>
              <Suspense key="review-calendar" fallback={<ReviewCalendarSkeleton />}>
                <ReviewCalendarServer />
              </Suspense>
            </div>

            <div className='h-full lg:row-span-2'>
              <Suspense key="activity-feed" fallback={<ImprovedActivityFeedSkeleton />}>
                <ActivityFeedServer />
              </Suspense>
            </div>

            <div className='h-full'>
              <Suspense key="daily-wiki" fallback={<FeatureDiscoverySkeleton />}>
                <DailyWikiServer />
              </Suspense>
            </div>

            <div className='h-full'>
              <Suspense key="subject-mastery" fallback={<SubjectMasterySkeleton />}>
                <SubjectMasteryServer />
              </Suspense>
            </div>

            {/* ── Review Center Sync (visible when enrolled) ── */}
            <Suspense key="review-sync" fallback={null}>
              <ReviewCenterSyncServer />
            </Suspense>

            {/* ── Bloom Cognitive Tracker (after 10+ sessions) ── */}
            <div className="lg:col-span-2">
              <Suspense key="bloom-tracker" fallback={<BloomTrackerSkeleton />}>
                <BloomTrackerServer />
              </Suspense>
            </div>
          </div>
        </div>
      </div>
    </SharedPageLayout>
  )
}



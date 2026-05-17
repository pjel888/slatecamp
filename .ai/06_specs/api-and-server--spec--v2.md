# API and Server Functionality

**Last audit:** 2026-04-29
**Post-Plan-B cleanup counts:** 12 App Router route handlers total (11 under `/api`, plus `/auth/callback`).

Plan B cleanup removed the LemonSqueezy route handler (`src/app/api/webhooks/lemonsqueezy/route.ts`) and retained PayRex code as the only payment provider path, but payments are deferred for the current launch and remain disabled by default. LemonSqueezy columns still exist in schema/types as legacy database fields and are tracked in `.ai/data-models.md` / `.ai/risk-register.md` for a later non-destructive database cleanup decision.

## Route handlers

| Endpoint | Methods | File | Purpose | Inputs/Params/Body | Outputs | Auth/Permission | Data/External Services | Env |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| /api/admin/flags | POST, DELETE | src/app/api/admin/flags/route.ts | POST writes dev entitlement override cookie; DELETE clears it. | POST JSON feature flag override; DELETE no body. | JSON success/error. | Demo mode bypasses auth; otherwise authenticated developer override permission. | Dev override cookie and entitlement audit log. | NODE_ENV |
| /api/ai/embed | POST | src/app/api/ai/embed/route.ts | Generate embeddings for text. | POST `{ text }`. | JSON `{ embedding }` or error. | Demo canned/random path; otherwise authenticated + rate-limited. | AI provider and Supabase auth. | Deferred AI provider env if re-enabled |
| /api/ai/generate-questions | POST | src/app/api/ai/generate-questions/route.ts | Generate quiz questions from content chunks. | POST `{ chunkContent, profession, examTarget, difficulty, count }`. | JSON `{ questions }` or error. | Demo canned path; otherwise authenticated + rate-limited. | AI provider question generation. | Deferred AI provider env if re-enabled |
| /api/ai/socratic | POST | src/app/api/ai/socratic/route.ts | Generate a Socratic tutor turn for quiz remediation. | POST question/answer/context/history payload. | JSON tutor message/turn metadata/sources. | Demo canned path; otherwise authenticated + rate-limited. | AI provider. | Deferred AI provider env if re-enabled |
| /api/ai/study-agent | POST | src/app/api/ai/study-agent/route.ts | Study-agent note tools: summarize, flashcards, code_check. | POST `{ action, content }`. | JSON `{ text }` or error. | Demo canned path; otherwise authenticated + rate-limited. | AI provider. | Deferred AI provider env if re-enabled |
| /api/ai/tutor | POST | src/app/api/ai/tutor/route.ts | Contextual AI tutor endpoint. | POST tutor/chat payload. | AI response JSON/stream depending handler. | Demo canned path; otherwise authenticated + rate-limited. | AI provider and Supabase auth. | Deferred AI provider env if re-enabled |
| /api/cron/compute-signals | GET | src/app/api/cron/compute-signals/route.ts | Cron job computing user signals such as velocity and churn risk. | GET with `Authorization: Bearer ${CRON_SECRET}`. | JSON job summary/errors. | CRON_SECRET bearer token. | Supabase service/admin writes. | CRON_SECRET |
| /api/cron/focus-review-scan | GET | src/app/api/cron/focus-review-scan/route.ts | Cron job generating focus-review queues. | GET with `Authorization: Bearer ${CRON_SECRET}`. | JSON job summary/errors. | CRON_SECRET bearer token. | Focus review generator and Supabase. | CRON_SECRET |
| /api/og/score | GET | src/app/api/og/score/route.tsx | Generate Open Graph readiness score image. | GET query params `score`, `zone`, optional `delta`; values sanitized/clamped. | `ImageResponse` graphic response. | Public; sanitizes query params. | Next `ImageResponse`; no database. | — |
| /api/payments/checkout | POST | src/app/api/payments/checkout/route.ts | Create PayRex checkout for pro/prime/institutional tiers when payments are enabled. | POST `{ tier }`. | JSON checkout `{ url, id, provider: "payrex" }` or error code. | Requires payments enabled and authenticated user; demo returns local success URL. | PayRex provider abstraction; user subscription tier metadata. | Deferred PayRex env if payments are re-enabled |
| /api/webhooks/payrex | POST | src/app/api/webhooks/payrex/route.ts | PayRex billing webhook. | POST raw body with PayRex signature header. | JSON receipt/idempotency/error. | Signature verification; payments flag. | user_subscriptions and processed_webhook_events. | Deferred `PAYREX_WEBHOOK_SECRET` if payments are re-enabled |
| /auth/callback | GET | src/app/auth/callback/route.ts | Supabase OAuth/email callback; exchanges code and validates safe relative `next`. | GET query `code`, `next`, optional UTM/source params. | Redirect to next/dashboard/login error. | Public callback; demo redirects without exchange. | Supabase auth, UTM attribution, analytics event. | — |

## Server actions, server-side query modules, and server-only helpers

The following inventory is generated from files with `'use server'`, files under `src/lib/actions/`, and server/query helper paths. Test files are omitted.

| File | Domain | Exported actions/functions | Supabase? | Env |
| --- | --- | --- | --- | --- |
| `src/app/dashboard/exam-outcome/actions.ts` | src | `submitExamOutcome` | Supabase | — |
| `src/app/(auth)/onboarding/page.tsx` | src | `(no named export parsed)` | Supabase | — |
| `src/lib/analytics-server.ts` | src | `trackServerEvent` | Supabase | — |
| `src/lib/developer/access.ts` | src | `assertDeveloperAccess` | — | — |
| `src/lib/queries/adaptive-quiz.ts` | adaptive-quiz.ts | `fetchNextQuestion`, `fetchUserTheta` | Supabase | — |
| `src/lib/queries/trails.ts` | trails.ts | `getPublishedTrails`, `getTrailBySlug`, `getTrailDays`, `getUserEnrollments`, `getEnrollmentForTrail`, `getStepProgress`, `getDayCompletions`, `getFullDayCompletions`, `getDayCompletionDetail`, `getScoreTrajectory`, `recommendTrail`, `getTodayNodeStates` | Supabase | — |
| `src/lib/queries/srs.ts` | srs.ts | `fetchReviewDueCount`, `fetchReviewDeck` | Supabase | — |
| `src/lib/queries/ceo/analytics/get-coverage-gap.ts` | ceo | `getCoverageGapData` | Supabase | — |
| `src/lib/queries/ceo/analytics/get-learning-velocity.ts` | ceo | `getLearningVelocityData` | Supabase | — |
| `src/lib/queries/ceo/analytics/get-pass-rate.ts` | ceo | `getPassRateData` | Supabase | — |
| `src/lib/queries/ceo/analytics/get-engagement-depth.ts` | ceo | `getEngagementDepthData` | Supabase | — |
| `src/lib/queries/ceo/analytics/get-question-health.ts` | ceo | `getQuestionHealthData` | Supabase | — |
| `src/lib/queries/ceo/analytics/get-cage-quality.ts` | ceo | `getCAGEQualityData` | Supabase | — |
| `src/lib/queries/ceo/analytics/get-study-cohorts.ts` | ceo | `getStudyCohortsData` | Supabase | — |
| `src/lib/queries/ceo/analytics/get-content-effectiveness.ts` | ceo | `getContentEffectivenessData` | Supabase | — |
| `src/lib/queries/ceo/analytics/get-adoption-funnel.ts` | ceo | `getAdoptionFunnelData` | Supabase | — |
| `src/lib/srs/update.ts` | src | `deriveQualityRating`, `updateSrsSchedule` | Supabase | — |
| `src/lib/ceo/access.ts` | src | `assertCeoAccess` | — | — |
| `src/lib/supabase/bootstrap.ts` | src | `bootstrapUser` | Supabase | — |
| `src/lib/audit/audit-actions.ts` | src | `getAuditLogsAction` | — | — |
| `src/lib/focus-review/generate-queue.ts` | src | `generateFocusReviewQueue`, `completeFocusReviewQueue`, `deferFocusReviewQueue`, `getActiveFocusReviewQueue` | Supabase | — |
| `src/lib/actions/teach-back.ts` | teach-back.ts | `getTeachBackCriteria`, `submitTeachBack`, `submitRevision` | Supabase + shared AI provider | `AI_PROVIDER`; `OPENROUTER_API_KEY` when OpenRouter is enabled; legacy `ANTHROPIC_API_KEY` only for direct Anthropic fallback |
| `src/lib/actions/dashboard-page.ts` | dashboard-page.ts | `getDashboardPageData`, `getDashboardSyncPayload` | Supabase | — |
| `src/lib/actions/pods.ts` | pods.ts | `createPod`, `joinPod`, `leavePod`, `getPodData`, `getUserPods` | Supabase | — |
| `src/lib/actions/lab.ts` | lab.ts | `record3DLabInteraction`, `create3DLabSession`, `get3DModuleBySlug` | Supabase | — |
| `src/lib/actions/contact.ts` | contact.ts | `sendContactMessage` | — | — |
| `src/lib/actions/comp-exam-onboarding.ts` | comp-exam-onboarding.ts | `saveCompExamScores` | Supabase | — |
| `src/lib/actions/oath-taking.ts` | oath-taking.ts | `getUpcomingOathSchedules`, `getUserOathEligibility`, `generateOathEmail` | Supabase | — |
| `src/lib/actions/studio-mode.ts` | studio-mode.ts | `activateStudioMode`, `getStudioModeData` | Supabase | — |
| `src/lib/actions/ei-prompts.ts` | ei-prompts.ts | `getEIPromptsForArticle`, `getUserEIResponsesForArticle`, `submitEIResponse` | Supabase | — |
| `src/lib/actions/wiki-bookmarks.ts` | wiki-bookmarks.ts | `getWikiBookmarks`, `addWikiBookmark`, `removeWikiBookmark` | Supabase | — |
| `src/lib/actions/session-actions.ts` | session-actions.ts | `buildInProgressSession`, `transformRecentSessions`, `buildAction`, `getActivityFeedData`, `buildRecentSessions` | Supabase | — |
| `src/lib/actions/final-stretch.ts` | final-stretch.ts | `getFinalStretchState`, `getWeakNodesForFinalStretch`, `markFinalStretchUpsellShown` | Supabase | — |
| `src/lib/actions/notification-triggers.ts` | notification-triggers.ts | `triggerScoreChangeNotification`, `triggerZoneTransitionNotification` | Supabase | — |
| `src/lib/actions/daily-mission.ts` | daily-mission.ts | `getDailyMissions`, `claimMissionReward` | Supabase | — |
| `src/lib/actions/analytics.ts` | analytics.ts | `getTaxonomyHeatmap`, `getReadinessTrajectory`, `getReadinessSectionData`, `getPacingQuadrantData`, `getStaminaCurveData`, `getPacingInsights`, `getMemoryHealthData`, `getTimelineHeatmapData` | Supabase | — |
| `src/lib/actions/dae-mode.ts` | dae-mode.ts | `saveDAEContexts`, `getDAEState`, `startDAESession` | Supabase | — |
| `src/lib/actions/streak.ts` | streak.ts | `updateStreak`, `getStreakData`, `checkGraceDayEligibility` | Supabase | — |
| `src/lib/actions/notifications.ts` | notifications.ts | `markNotificationAsRead`, `markAllNotificationsAsRead`, `updateNotificationPreferences`, `getUnreadCount`, `getRecentNotifications` | Supabase | — |
| `src/lib/actions/analytics-data.ts` | analytics-data.ts | `getAccuracyBySubject`, `getTimeSpentDistribution`, `getSessionHistory`, `getConfidenceCalibration`, `getWeakestTopics`, `getStudyActivity` | Supabase | — |
| `src/lib/actions/calibration-score-update.ts` | calibration-score-update.ts | `updateCalibrationScore` | Supabase | — |
| `src/lib/actions/stats-actions.ts` | stats-actions.ts | `computeWeekCounts`, `buildHeroStats`, `buildWeekStats`, `buildStreakData`, `getStreakData`, `getHeroData`, `getDailyWikiData`, `transformSrsReview`, `buildDailyArticle`, `buildRecentNotes`, `buildReadinessMeta` | Supabase | — |
| `src/lib/actions/design-problems.ts` | design-problems.ts | `getDesignProblems`, `getDesignProblem`, `startDesignSession`, `completeDesignSession`, `updateChecklistCompletion` | Supabase | — |
| `src/lib/actions/adaptive-session.ts` | adaptive-session.ts | `selectNextAdaptiveQuestion` | Supabase | — |
| `src/lib/actions/email-preferences.ts` | email-preferences.ts | `getUserEmailPreferences`, `updateEmailPreferences` | Supabase | — |
| `src/lib/actions/wiki-interactions.ts` | wiki-interactions.ts | `submitArticleFeedback`, `getUserArticleFeedback`, `addWikiHighlight`, `getWikiHighlights`, `removeWikiHighlight` | Supabase | — |
| `src/lib/actions/notes-actions.ts` | notes-actions.ts | `getNotesList`, `getNoteFolders`, `getNote`, `createNote`, `createNoteFolder`, `updateNote`, `deleteNote` | Supabase | — |
| `src/lib/actions/bloom-tracker.ts` | bloom-tracker.ts | `getBloomBreakdown` | Supabase | — |
| `src/lib/actions/taxonomy.ts` | taxonomy.ts | `getTaxonomyTree`, `getCoreSubjects` | Supabase | — |
| `src/lib/actions/srs-dashboard.ts` | srs-dashboard.ts | `getSRSDashboardData` | Supabase | — |
| `src/lib/actions/srs-review.ts` | srs-review.ts | `getSrsReviewData` | Supabase | — |
| `src/lib/actions/dashboard.ts` | dashboard.ts | `getDashboardData` | Supabase | — |
| `src/lib/actions/session-insights.ts` | session-insights.ts | `generateSessionInsight` | Supabase | — |
| `src/lib/actions/wiki-quiz.ts` | wiki-quiz.ts | `getWikiQuizQuestions`, `submitWikiQuizAnswer`, `endWikiQuizSession` | Supabase | — |
| `src/lib/actions/social-proof.ts` | social-proof.ts | `getQuestionSocialProof`, `getTopicDailyStudiers`, `getTopicDailyStudiersBatch` | Supabase | — |
| `src/lib/actions/preview-actions.ts` | preview-actions.ts | `generateDraftPreview`, `updateDraftPreview` | Supabase | — |
| `src/lib/actions/user-stats.ts` | user-stats.ts | `getUserGlobalStats`, `ensureUserGlobalStats` | Supabase | — |
| `src/lib/actions/wiki-reads.ts` | wiki-reads.ts | `recordArticleRead`, `updateReadProgress` | Supabase | — |
| `src/lib/actions/professional-mode.ts` | professional-mode.ts | `getProfessionalModeData`, `switchAccountMode`, `activateProfessionalMode`, `stayInReviewMode` | Supabase | — |
| `src/lib/actions/dashboard-helpers.ts` | dashboard-helpers.ts | `shortLabel`, `getMasteryLabel`, `formatModeName`, `getWeekBoundary` | — | — |
| `src/lib/actions/session-discovery.ts` | session-discovery.ts | `generateSessionDiscovery` | Supabase | — |
| `src/lib/actions/results-day.ts` | results-day.ts | `getResultsDayBannerEligibility`, `getResultsDayProfile`, `recordPasserResult`, `recordNonPasserResult`, `bannerConfirmPasser`, `bannerConfirmNonPasser` | Supabase | — |
| `src/lib/actions/cram-card.ts` | cram-card.ts | `getCramCardData` | Supabase | — |
| `src/lib/actions/cached-queries.ts` | cached-queries.ts | `getCachedDisciplines`, `getCachedTaxonomyTree`, `getCachedTaxonomyTreeByDiscipline`, `getCachedTaxonomyTreeFull`, `getCachedWikiArticles`, `getCachedArticleAndNode`, `resolveTaxonomyDescendants` | Supabase | — |
| `src/lib/actions/flash-cards.ts` | flash-cards.ts | `getFlashCategories`, `getFlashCardsForCategory` | Supabase | — |
| `src/lib/actions/trails.ts` | trails.ts | `getPublishedTrails`, `getTrailBySlug`, `getTrailDays`, `getUserEnrollments`, `getEnrollmentForTrail`, `enrollInTrail`, `getStepProgress`, `completeStep`, `getDayCompletions`, `recommendTrail`, `pauseTrail`, `resumeTrail`, `abandonTrail`, `getScoreTrajectory`, `getDayCompletionDetail`, `getFullDayCompletions`, `getTodayNodeStates` | Supabase | — |
| `src/lib/actions/profile.ts` | profile.ts | `saveStudyWindow`, `getStudyWindow`, `getProfileData`, `getOnboardingCompletionStatus`, `completeOnboardingSetup`, `updateProfile`, `updateExamDate`, `uploadAvatar`, `skipOnboarding` | Supabase | — |
| `src/lib/actions/mastery.ts` | mastery.ts | `getSubjectMasteryData` | Supabase | — |
| `src/lib/actions/readiness-score-update.ts` | readiness-score-update.ts | `recomputeAndSaveReadinessScore` | Supabase | — |
| `src/lib/actions/wiki-actions.ts` | wiki-actions.ts | `searchWikiArticles`, `getArticleSources`, `getWikiArticleBySlug`, `getWikiArticleByTaxonomySlug`, `getTaxonomyTree`, `getActiveTaxonomyNode`, `resolveArticleAndNode`, `memoizedResolveArticleAndNode`, `memoizedGetTaxonomyTree`, `memoizedGetBreadcrumbTrail`, `getBreadcrumbTrail`, `getArticleSiblings`, `getWikiArticlesByNode`, `searchWikiPaginated` | Supabase | — |
| `src/lib/actions/sync-notifications.ts` | sync-notifications.ts | `syncDashboardNotifications` | Supabase | — |
| `src/lib/actions/srs.ts` | srs.ts | `startReviewSession` | Supabase | — |
| `src/lib/actions/code-updates.ts` | code-updates.ts | `getCodeUpdates`, `getCodeUpdateCount` | Supabase | — |
| `src/lib/actions/cache-tags.ts` | cache-tags.ts | `CACHE_TAGS`, `getDashboardTag`, `getUserStatsTag`, `getUserMasteryTag`, `getUserSessionsTag`, `getReadinessScoreTag`, `getTaxonomyDisciplineTag`, `getDashboardCacheTags`, `revalidateDashboardCacheTags` | — | — |
| `src/lib/actions/debrief.ts` | debrief.ts | `getDebriefData` | Supabase | — |
| `src/lib/actions/sessions.ts` | sessions.ts | `closeSession`, `deleteSession` | Supabase | — |
| `src/lib/actions/heatmap.ts` | heatmap.ts | `getHeatmapData` | Supabase | — |
| `src/lib/actions/assessment.ts` | assessment.ts | `getAssessmentClientQuestions`, `hasCompletedAssessment`, `createAssessmentSession`, `saveAssessmentInteraction`, `getAssessmentResults`, `getAssessmentQuestions`, `completeAssessment` | Supabase | — |
| `src/lib/actions/mastery-actions.ts` | mastery-actions.ts | `buildSubjectMastery`, `getSubjectMasteryData`, `buildSubjectFloorAlerts`, `buildFocusAreas`, `buildSyllabusCoverage`, `transformSyllabusCoverage`, `buildProjectedLawsMastery`, `transformProjectedLawsMastery` | Supabase | — |
| `src/lib/actions/analytics-events.ts` | analytics-events.ts | `trackEvent` | Supabase | — |
| `src/lib/actions/progress-report/actions.ts` | progress-report | `getMonthlyReport`, `getSimulationTrajectory`, `reportExamOutcome` | Supabase | — |
| `src/lib/actions/progress-report/generate.ts` | progress-report | `generateProgressReport` | Supabase | — |
| `src/lib/actions/mastery/update-decay-rate.ts` | mastery | `updateDecayRate` | Supabase | — |
| `src/lib/actions/mastery/post-interaction-hooks.ts` | mastery | `runPostInteractionHooks` | — | — |
| `src/lib/actions/mastery/dismiss-empty-topic.ts` | mastery | `dismissEmptyTopic` | Supabase | — |
| `src/lib/actions/mastery/cramming-detector.ts` | mastery | `checkCrammingPattern` | Supabase | — |
| `src/lib/actions/mastery/update-mastery-stats.ts` | mastery | `updateMasteryStats` | Supabase | — |
| `src/lib/actions/mastery/update-memory-strength.ts` | mastery | `updateMemoryStrength` | Supabase | — |
| `src/lib/actions/admin/wiki-queries.ts` | admin | `getArticlesWithCoverage`, `getArticles`, `getArticle`, `getAdminTaxonomyTree` | Supabase | — |
| `src/lib/actions/admin/wiki.ts` | admin | `updateWikiArticle`, `createWikiArticle`, `deleteWikiArticle`, `approveWikiArticleReview`, `requestWikiArticleChanges` | Supabase | — |
| `src/lib/actions/admin/question-queries.ts` | admin | `getQuestions`, `getQuestionsGroupedByArticle`, `getQuestionsByTopicIds`, `getQuestionsTaxonomyTree`, `getQuestionsForAnalytics`, `getQuestion` | Supabase | — |
| `src/lib/actions/admin/design-problems.ts` | admin | `getAdminDesignProblems`, `getAdminDesignProblem`, `updateAdminDesignProblemQuestion`, `createAdminDesignProblemQuestion` | Supabase | — |
| `src/lib/actions/admin/pipeline.ts` | admin | `getPipelineArticles`, `updateArticleStatus` | Supabase | — |
| `src/lib/actions/admin/assets.ts` | admin | `getAssets`, `getAsset`, `createAsset`, `uploadAssetFile`, `archiveAsset` | Supabase | — |
| `src/lib/actions/admin/taxonomy.ts` | admin | `getTaxonomyNodes`, `updateTaxonomyNode`, `createTaxonomyNode`, `deleteTaxonomyNode` | Supabase | — |
| `src/lib/actions/admin/content.ts` | admin | `compileMdxPreview`, `getContentEditorIndexData`, `getArticleFull`, `getArticleUpdatedAt`, `getArticleTaxonomyNodes`, `getQuestionsByNodeIds`, `getQuestionsByArticleId`, `importQuestionsForArticle`, `getTaxonomyNodeInfo`, `getTaxonomyNodesInfo`, `getAllEIPromptsForArticle`, `updateArticleFull`, `saveArticleFull`, `updateQuestion`, `createEIPrompt`, `updateEIPrompt`, `deleteEIPrompt` | Supabase | — |
| `src/lib/actions/admin/dashboard.ts` | admin | `getAdminStats`, `getAdminDashboardData`, `getContentBySubject`, `getNeedsAttentionData`, `getCriticalCoverageGap` | Supabase | — |
| `src/lib/actions/admin/design-scenarios.ts` | admin | `getAdminDesignScenarios`, `getAdminDesignScenario`, `updateAdminDesignScenarioQuestion`, `createAdminDesignScenarioQuestion` | Supabase | — |
| `src/lib/actions/admin/coverage.ts` | admin | `fetchCoverageData` | Supabase | — |
| `src/lib/actions/admin/questions.ts` | admin | `deleteQuestions`, `createQuestion`, `updateQuestion`, `deleteQuestion` | Supabase | — |
| `src/lib/actions/admin/bulk.ts` | admin | `bulkDeleteQuestions`, `bulkDeleteArticles` | Supabase | — |
| `src/lib/actions/admin/roles.ts` | admin | `getAdminUsers`, `assignRole`, `revokeRole` | Supabase | — |
| `src/lib/actions/wiki/submit-prequestion.ts` | wiki | `submitPrequestion` | Supabase | — |
| `src/lib/actions/wiki/get-prequestions.ts` | wiki | `getPrequestions` | Supabase | — |
| `src/lib/actions/assessment/get-questions.ts` | assessment | `getAssessmentClientQuestions` | Supabase | — |
| `src/lib/actions/ceo/export-actions.ts` | ceo | `generateInvestorExport` | Supabase | — |
| `src/lib/actions/ceo/team-actions.ts` | ceo | `addTeamMember`, `updateTeamMember`, `removeTeamMember`, `assignSystemRole` | Supabase | — |
| `src/lib/actions/ceo/financial-actions.ts` | ceo | `addFinancialEntry`, `updateFinancialEntry`, `deleteFinancialEntry`, `addCashBalance` | Supabase | — |
| `src/lib/actions/ceo/admin-role-actions.ts` | ceo | `getAdminUsers`, `assignAdminRole`, `revokeAdminRole`, `getPermissionAuditLog` | Supabase | — |
| `src/lib/actions/daily-dose/actions.ts` | daily-dose | `getTodayDose`, `startDoseActivity`, `completeDoseActivity`, `getDoseHistory`, `regenerateDose` | Supabase | — |
| `src/lib/actions/daily-dose/generate.ts` | daily-dose | `generateDailyDose`, `adjustDoseToTimeBudget` | Supabase | — |
| `src/lib/actions/ai/generate-mnemonic.ts` | ai | `generateMnemonic` | — | — |
| `src/lib/actions/dev/test-data.ts` | dev | `generateTestSessions`, `generateTestOrg` | Supabase | — |
| `src/lib/actions/dev/db-viewer.ts` | dev | `getTableInfo` | Supabase | — |
| `src/lib/actions/quiz-v2/skip-question.ts` | quiz-v2 | `skipQuestion` | Supabase | — |
| `src/lib/actions/quiz-v2/check-generation-answer.ts` | quiz-v2 | `checkGenerationAnswer` | Supabase | — |
| `src/lib/actions/quiz-v2/get-review-data.ts` | quiz-v2 | `getReviewData` | Supabase | — |
| `src/lib/actions/quiz-v2/schemas.ts` | quiz-v2 | `startSessionInputSchema`, `gestureSignalEventSchema`, `cageBindingTokenSchema`, `submitAnswerInputSchema`, `endSessionInputSchema`, `sessionQuestionSliceInputSchema` | — | — |
| `src/lib/actions/quiz-v2/post-session-hooks.ts` | quiz-v2 | `runPostSessionHooks` | — | — |
| `src/lib/actions/quiz-v2/start-session.ts` | quiz-v2 | `startSession` | Supabase | — |
| `src/lib/actions/quiz-v2/classify-and-store-error.ts` | quiz-v2 | `classifyErrorDiagnostic`, `classifyAndStoreError` | Supabase | — |
| `src/lib/actions/quiz-v2/save-prediction.ts` | quiz-v2 | `savePrediction` | Supabase | — |
| `src/lib/actions/quiz-v2/pause-resume.ts` | quiz-v2 | `pauseSession`, `resumeSession` | Supabase | — |
| `src/lib/actions/quiz-v2/session-helpers.ts` | quiz-v2 | `TERMINAL_SESSION_STATUSES`, `isTerminalSessionStatus`, `getOwnedSessionOrThrow` | Supabase | — |
| `src/lib/actions/quiz-v2/abandon-session.ts` | quiz-v2 | `abandonSession` | Supabase | — |
| `src/lib/actions/quiz-v2/get-confidence-matrix.ts` | quiz-v2 | `getConfidenceMatrix` | Supabase | — |
| `src/lib/actions/quiz-v2/index.ts` | quiz-v2 | `(no named export parsed)` | — | — |
| `src/lib/actions/quiz-v2/update-session-progress.ts` | quiz-v2 | `updateSessionProgress` | Supabase | — |
| `src/lib/actions/quiz-v2/get-session-questions.ts` | quiz-v2 | `getSessionQuestions` | Supabase | — |
| `src/lib/actions/quiz-v2/submit-answer.ts` | quiz-v2 | `submitAnswer` | Supabase | — |
| `src/lib/actions/quiz-v2/sr-post-submit.ts` | quiz-v2 | `srPostSubmit` | Supabase | — |
| `src/lib/actions/quiz-v2/generate-recommendations.ts` | quiz-v2 | `generateRecommendations` | Supabase | — |
| `src/lib/actions/quiz-v2/flag-question.ts` | quiz-v2 | `flagQuestion` | Supabase | — |
| `src/lib/actions/quiz-v2/get-prediction-history.ts` | quiz-v2 | `getPredictionHistory` | Supabase | — |
| `src/lib/actions/quiz-v2/successive-relearning.ts` | quiz-v2 | `processSuccessiveRelearning`, `getDueSRCycles`, `getUserSRProgress`, `getTopicSRStatus`, `getActiveSRCycles` | Supabase | — |
| `src/lib/actions/quiz-v2/end-session.ts` | quiz-v2 | `endSession` | Supabase | — |
| `src/lib/actions/quiz-v2/save-postdiction.ts` | quiz-v2 | `savePostdiction` | Supabase | — |
| `src/lib/actions/analytics/get-error-patterns.ts` | analytics | `getErrorPatterns` | Supabase | — |
| `src/lib/actions/analytics/write-theta.ts` | analytics | `writeUserTheta` | Supabase | — |
| `src/lib/actions/analytics/get-memory-strength-data.ts` | analytics | `getMemoryStrengthData`, `getMemoryStrengthOverview` | Supabase | — |
| `src/lib/actions/analytics/shared-helpers.ts` | analytics | `wrapResult`, `wrapError`, `fetchUserGlobalStats`, `fetchTaxonomyNodeMap`, `buildLevel1Resolver` | Supabase | — |
| `src/lib/actions/analytics/get-reading-correlation-data.ts` | analytics | `getReadingCorrelationData` | Supabase | — |
| `src/lib/actions/analytics/chart-data.ts` | analytics | `getForgettingCurveData`, `getStaminaHeatmapData`, `getDifficultyMasteryData`, `getStudyVelocityData`, `getPacingAccuracyData`, `getExamCountdownData`, `getAnalytics` | Supabase | — |
| `src/lib/actions/analytics/cross-feature-data.ts` | analytics | `getWikiReadsByUser`, `getUserTheta` | Supabase | — |
| `src/lib/actions/analytics/get-metacognition-data.ts` | analytics | `getMetacognitionData` | Supabase | — |
| `src/lib/actions/analytics/get-relearning-data.ts` | analytics | `getRelearningData` | Supabase | — |
| `src/lib/actions/analytics/get-topic-intelligence-data.ts` | analytics | `getTopicIntelligenceData` | Supabase | — |
| `src/lib/actions/analytics/get-mode-funnel.ts` | analytics | `getModeFunnelData` | Supabase | — |
| `src/lib/actions/analytics/get-multimodal-study-data.ts` | analytics | `getMultimodalStudyData` | Supabase | — |
| `src/lib/actions/analytics/get-calibration-data.ts` | analytics | `getCalibrationCurveData` | Supabase | — |
| `src/lib/actions/analytics/get-mastery-history.ts` | analytics | `getMasteryHistoryData` | Supabase | — |
| `src/lib/actions/analytics/get-irt-data.ts` | analytics | `getIRTTrajectoryData` | Supabase | — |
| `src/lib/actions/analytics/get-reading-depth-data.ts` | analytics | `getReadingDepthData` | Supabase | — |
| `src/lib/api/require-admin.ts` | src | `requireAdmin` | Supabase | — |
| `src/lib/import/import-actions.ts` | src | `importQuestionsToDb` | Supabase | — |
| `src/lib/paywall/score-reveal.ts` | src | `checkScoreRevealAccess`, `markScoreRevealed` | Supabase | — |
| `src/lib/paywall/daily-cap.ts` | src | `checkDailyCap`, `incrementDailyCount` | Supabase | — |


## Auth requirements summary

| Surface | Auth/permission |
| --- | --- |
| Public pages | No authentication: `/`, `/about`, `/contact`, `/pricing`, `/try`, auth pages, `/admin/login`. |
| Dashboard/quiz/wiki/student routes | Authenticated outside demo/dev bypass mode. |
| Admin routes | Authenticated and role/permission-gated by `src/lib/supabase/middleware.ts` and `src/lib/entitlements/policy.ts`. |
| Developer routes | Require developer portal entitlement via `src/lib/developer/access.ts`. |
| CEO routes | Require CEO portal entitlement via `src/lib/ceo/access.ts`. |
| Cron API | Require `Authorization: Bearer ${CRON_SECRET}`. |
| Webhook API | Require provider-specific signature headers. |
| AI API | Demo mode allowed; otherwise authenticated and rate-limited. |


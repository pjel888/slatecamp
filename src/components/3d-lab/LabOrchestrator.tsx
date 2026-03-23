'use client'

// LabOrchestrator — Composes all 3D Lab components into the complete experience.
// This is the single entry point that the page route renders for new-format modules.

import { useEffect, useState, useCallback, useMemo, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useLabStore } from '@/stores/useLabStore'
import { useLabTelemetry } from '@/hooks/useLabTelemetry'
import { labEvents } from '@/lib/lab-analytics'
import type { ModuleConfig, HotspotData, LabQuestion, QuizResult } from '@/types/3d-lab'

import { LabViewer } from './LabViewer'
import { HotspotGroup } from './HotspotGroup'
import { InfoPanel } from './InfoPanel'
import { QuestionPanel } from './QuestionPanel'
import { ToolPalette } from './ToolPalette'
import { PresetViewButtons } from './PresetViewButtons'
import { ParameterPanel } from './ParameterPanel'
import { GuidedSequencer } from './GuidedSequencer'
import { FreeExploreToggle } from './FreeExploreToggle'
import { DisorientationDetector } from './DisorientationDetector'
import { OnboardingFlow } from './OnboardingFlow'
import { ModuleContextCard } from './ModuleContextCard'
import { QuizMode } from './QuizMode'
import { ExitSummary } from './ExitSummary'

const LAB_TOP_BAR_HEIGHT = 36

interface LabOrchestratorProps {
  config: ModuleConfig
  backUrl: string
}

export const LabOrchestrator = ({ config, backUrl }: LabOrchestratorProps) => {
  const router = useRouter()

  // Store state
  const activeHotspotId = useLabStore((s) => s.activeHotspotId)
  const panelMode = useLabStore((s) => s.panelMode)
  const visitedHotspotIds = useLabStore((s) => s.visitedHotspotIds)
  const exploreMode = useLabStore((s) => s.exploreMode)
  const currentSequenceIndex = useLabStore((s) => s.currentSequenceIndex)
  const selectedOptionId = useLabStore((s) => s.selectedOptionId)
  const questionAnswered = useLabStore((s) => s.questionAnswered)
  const quizModeActive = useLabStore((s) => s.quizModeActive)
  const quizResults = useLabStore((s) => s.quizResults)
  const openHotspot = useLabStore((s) => s.openHotspot)
  const closePanel = useLabStore((s) => s.closePanel)
  const openQuestion = useLabStore((s) => s.openQuestion)
  const selectOption = useLabStore((s) => s.selectOption)
  const exitQuizMode = useLabStore((s) => s.exitQuizMode)
  const resetSession = useLabStore((s) => s.resetSession)

  // Local UI state
  const [showOnboarding, setShowOnboarding] = useState(false)
  const [showContextCard, setShowContextCard] = useState(false)
  const [showExitSummary, setShowExitSummary] = useState(false)
  const [activePresetView, setActivePresetView] = useState('3d')
  const DEFAULT_VIEWPORT_WIDTH = 1280
  const [viewportWidth, setViewportWidth] = useState(DEFAULT_VIEWPORT_WIDTH)

  // Active hotspot data
  const activeHotspot: HotspotData | undefined = useMemo(
    () => config.hotspots.find((h) => h.id === activeHotspotId),
    [config.hotspots, activeHotspotId]
  )

  // Active question data
  const activeQuestion: LabQuestion | undefined = useMemo(
    () => activeHotspot ? config.questions.find((q) => q.id === activeHotspot.questionId) : undefined,
    [config.questions, activeHotspot]
  )

  // Nearest unvisited hotspot for disorientation detector
  const nearestUnvisitedId = useMemo(() => {
    const sorted = [...config.hotspots].sort((a, b) => a.sequenceOrder - b.sequenceOrder)
    return sorted.find((h) => !visitedHotspotIds.has(h.id))?.id
  }, [config.hotspots, visitedHotspotIds])

  // Telemetry
  const telemetry = useLabTelemetry(
    { moduleSlug: config.slug },
    {
      onDisorientation1: () => { /* DisorientationDetector handles UI */ },
      onDisorientation2: () => { /* DisorientationDetector handles UI */ },
    }
  )

  // Reset session on mount/unmount
  useEffect(() => {
    resetSession()

    // Initialize parametric defaults
    if (config.parametricControls) {
      for (const control of config.parametricControls) {
        // Random start within ±30% of threshold (generation-before-instruction)
        const threshold = control.codeMin ?? control.defaultValue
        const GENERATION_RANGE_FACTOR = 0.3
        const range = threshold * GENERATION_RANGE_FACTOR
        const randomStart = threshold - range + Math.random() * range * 2
        const clamped = Math.max(control.min, Math.min(control.max, Math.round(randomStart / control.step) * control.step))
        useLabStore.getState().setParametricValue(control.id, clamped)
      }
    }

    // Check onboarding
    if (typeof window !== 'undefined') {
      if (!localStorage.getItem('3dlab_onboarded')) {
        setShowOnboarding(true)
      } else if (!localStorage.getItem(`module_${config.slug}_seen`)) {
        setShowContextCard(true)
      }
    }

    // Track viewport width
    const updateWidth = () => setViewportWidth(window.innerWidth)
    updateWidth()
    window.addEventListener('resize', updateWidth)
    return () => {
      window.removeEventListener('resize', updateWidth)
      resetSession()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [config.slug])

  // Handlers
  const handleHotspotClick = useCallback((id: string) => {
    const hotspot = config.hotspots.find((h) => h.id === id)
    if (hotspot) {
      telemetry.recordHotspotOpen(id, hotspot.type, hotspot.sequenceOrder)
    }
    openHotspot(id)
  }, [config.hotspots, openHotspot, telemetry])

  const handlePracticeClick = useCallback(() => {
    openQuestion()
  }, [openQuestion])

  const questionDisplayTime = useRef(Date.now())

  // Reset timer when question panel opens
  useEffect(() => {
    if (panelMode === 'question') questionDisplayTime.current = Date.now()
  }, [panelMode])

  const handleSelectOption = useCallback((optionId: string) => {
    if (!activeQuestion) return
    selectOption(optionId)
    const correct = optionId === activeQuestion.correctOptionId
    const responseTimeMs = Date.now() - questionDisplayTime.current
    labEvents.questionAnswered(config.slug, activeQuestion.id, correct, optionId, responseTimeMs)
  }, [activeQuestion, selectOption, config.slug])

  const handleClosePanel = useCallback(() => {
    closePanel()
  }, [closePanel])

  const handleBack = useCallback(() => {
    router.push(backUrl)
  }, [router, backUrl])

  const handlePresetView = useCallback((view: string, _position: [number, number, number]) => {
    setActivePresetView(view)
    labEvents.presetViewUsed(config.slug, view)
    // Camera animation is handled by LabCanvas via store
  }, [config.slug])

  const handleResetCamera = useCallback(() => {
    useLabStore.getState().resetCamera()
    setActivePresetView('3d')
  }, [])

  const handleOnboardingComplete = useCallback(() => {
    setShowOnboarding(false)
    if (!localStorage.getItem(`module_${config.slug}_seen`)) {
      setShowContextCard(true)
    }
  }, [config.slug])

  const handleContextDismiss = useCallback(() => {
    setShowContextCard(false)
  }, [])

  const handleQuizComplete = useCallback((results: QuizResult[]) => {
    const correct = results.filter((r) => r.correct).length
    labEvents.quizCompleted(config.slug, correct, results.length, 0)
    exitQuizMode()
    setShowExitSummary(true)
  }, [config.slug, exitQuizMode])

  const handleReturnToWiki = useCallback(() => {
    router.push(`/dashboard/wiki/${config.slug}`)
  }, [router, config.slug])

  const handleRetryModule = useCallback(() => {
    setShowExitSummary(false)
    resetSession()
  }, [resetSession])

  return (
    <>
      <LabViewer config={config} onBack={handleBack}>
        {/* 3D Model content would go here as R3F children */}
        {/* For now, render hotspot dots in 3D space */}
        <HotspotGroup
          hotspots={config.hotspots}
          exploreMode={exploreMode}
          currentSequenceIndex={currentSequenceIndex}
          activeHotspotId={activeHotspotId}
          visitedIds={visitedHotspotIds}
          onHotspotClick={handleHotspotClick}
        />
      </LabViewer>

      {/* === Floating overlays (positioned absolute over the canvas) === */}
      <div className="fixed inset-0 pointer-events-none" style={{ top: LAB_TOP_BAR_HEIGHT, zIndex: 50 }}>

        {/* Canvas dim overlay during question/quiz mode */}
        {(panelMode === 'question' || panelMode === 'quiz') && (
          <div className="absolute inset-0 bg-black/20 pointer-events-auto" onClick={handleClosePanel} />
        )}

        {/* Info Panel */}
        {panelMode === 'info' && activeHotspot && (
          <div className="pointer-events-auto">
            <InfoPanel
              hotspot={activeHotspot}
              onPracticeClick={handlePracticeClick}
              onClose={handleClosePanel}
              viewportWidth={viewportWidth}
            />
          </div>
        )}

        {/* Question Panel */}
        {panelMode === 'question' && activeQuestion && (
          <div className="pointer-events-auto">
            <QuestionPanel
              question={activeQuestion}
              onSelectOption={handleSelectOption}
              onBack={handleClosePanel}
              selectedOptionId={selectedOptionId}
              isAnswered={questionAnswered}
            />
          </div>
        )}

        {/* Parameter Panel (left drawer for parametric modules) */}
        {config.parametricControls && config.parametricControls.length > 0 && !quizModeActive && (
          <div className="pointer-events-auto">
            <ParameterPanel
              title={config.title}
              codeReference={config.codeReference}
              controls={config.parametricControls}
            />
          </div>
        )}

        {/* Tool Palette (bottom-right) */}
        {!quizModeActive && (
          <div className="pointer-events-auto">
            <ToolPalette
              supportsCrossSection={config.supportsCrossSection}
              supportsExplodedView={config.supportsExplodedView}
              onResetCamera={handleResetCamera}
            />
          </div>
        )}

        {/* Preset View Buttons (bottom-left) */}
        {!quizModeActive && config.presetViews && (
          <div className="pointer-events-auto">
            <PresetViewButtons
              presetViews={config.presetViews}
              defaultCameraPosition={config.defaultCameraPosition}
              activeView={activePresetView}
              onViewChange={handlePresetView}
            />
          </div>
        )}

        {/* Guided Sequencer (progress + next button) */}
        {exploreMode === 'guided' && !quizModeActive && (
          <div className="pointer-events-auto">
            <GuidedSequencer hotspots={config.hotspots} moduleSlug={config.slug}>
              <></>
            </GuidedSequencer>
          </div>
        )}

        {/* Free Explore Toggle */}
        {!quizModeActive && (
          <div className="pointer-events-auto">
            <FreeExploreToggle moduleSlug={config.slug} />
          </div>
        )}

        {/* Disorientation Detector */}
        <div className="pointer-events-auto">
          <DisorientationDetector
            moduleSlug={config.slug}
            nearestUnvisitedHotspotId={nearestUnvisitedId}
          />
        </div>

        {/* Quiz Mode (bottom sheet) */}
        {quizModeActive && (
          <div className="pointer-events-auto">
            <QuizMode
              questions={config.questions}
              hotspots={config.hotspots}
              moduleSlug={config.slug}
              onComplete={handleQuizComplete}
              onExit={() => exitQuizMode()}
            />
          </div>
        )}
      </div>

      {/* === Modal-level overlays === */}

      {/* Onboarding (Tier 1 — once per lifetime) */}
      {showOnboarding && (
        <OnboardingFlow onComplete={handleOnboardingComplete} />
      )}

      {/* Module Context Card (Tier 2 — once per module) */}
      {showContextCard && !showOnboarding && (
        <ModuleContextCard config={config} onDismiss={handleContextDismiss} />
      )}

      {/* Exit Summary (after quiz) */}
      {showExitSummary && (
        <ExitSummary
          config={config}
          results={quizResults}
          onReturnToWiki={handleReturnToWiki}
          onRetryModule={handleRetryModule}
        />
      )}
    </>
  )
}

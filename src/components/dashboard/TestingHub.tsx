'use client'

import React, { useState } from 'react'
import { Brain, Coffee, Zap, Settings2, Target, Sparkles, ArrowRight, ShieldCheck, Activity } from 'lucide-react'
import { ModeCard } from './ModeCard'
import { CustomSessionBuilder } from './CustomSessionBuilder'
import type { QuizSession, TaxonomyNode } from '@/types/app'

interface TestingHubProps {
  initialSession: QuizSession | null
  subjects: TaxonomyNode[]
  onStartSession: (config: { mode: string, subjectIds?: string[], count?: number, instantFeedback?: boolean }) => void
  onResumeSession: () => void
  readinessScore?: number
}

export function TestingHub({ initialSession, subjects, onStartSession, onResumeSession, readinessScore = 0 }: TestingHubProps) {
  const [isBuilderOpen, setIsBuilderOpen] = useState(false)
  const canUnlockProofSim = readinessScore >= 0.65

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      {/* Today's Recommendation Banner (PRD Section 1) */}
      <div className="mb-12 p-1 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-sm shadow-lg shadow-blue-200/50">
        <div className="bg-white/95 backdrop-blur-sm p-6 rounded-sm flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-5 text-center md:text-left">
            <div className="w-14 h-14 rounded-sm bg-blue-50 flex items-center justify-center shrink-0 border border-blue-100">
              <Sparkles className="h-7 w-7 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-zinc-900 tracking-tight">Today's Recommendation</h2>
              <p className="text-zinc-500 mt-1 max-w-xl text-sm">
                Your last session was 3 days ago. Your Structural Design node dropped to 48%. 
                We recommend a <span className="font-bold text-blue-600">Camp Mode</span> session targeting that topic today.
              </p>
            </div>
          </div>
          <button 
            onClick={() => onStartSession({ mode: 'camp', count: 10 })}
            className="w-full md:w-auto px-8 py-4 bg-blue-600 text-white rounded-sm font-bold text-sm hover:bg-blue-700 transition-all flex items-center justify-center gap-2 group whitespace-nowrap"
          >
            Start Recommended Session
            <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>

      <header className="mb-12">
        <h1 className="text-2xl font-bold text-zinc-900 tracking-tight">Testing Hub</h1>
        <p className="text-zinc-500 mt-2 text-sm">Select a mode to sharpen your architectural knowledge.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Camp Mode - Teal (PRD) */}
        <ModeCard 
          title="Camp Mode"
          description='"Learn as you go" - First pass on new topics, building foundations with instant SME rationales.'
          icon={Brain}
          accentColor="bg-teal-500"
          primaryActionLabel="Start Camp"
          onPrimaryAction={() => onStartSession({ mode: 'camp' })}
          onSecondaryAction={initialSession?.test_mode === 'camp' ? onResumeSession : undefined}
          hasActiveSession={initialSession?.test_mode === 'camp'}
        />

        {/* Chill Mode - Blue (PRD) */}
        <ModeCard 
          title="Chill Mode"
          description='"Browse and absorb" - Passive review, pre-sleep review, low-energy days. Continuous feed.'
          icon={Coffee}
          accentColor="bg-blue-500"
          primaryActionLabel="Enter Chill"
          onPrimaryAction={() => onStartSession({ mode: 'chill', instantFeedback: true })}
          onSecondaryAction={initialSession?.test_mode === 'chill' ? onResumeSession : undefined}
          hasActiveSession={initialSession?.test_mode === 'chill'}
        />

        {/* Storm Mode - Coral/Red (PRD) */}
        <ModeCard 
          title="Storm Mode"
          description='"Test yourself for real" - 2–4 weeks before exam, simulating exam day stress conditions.'
          icon={Zap}
          accentColor="bg-red-500"
          primaryActionLabel="Begin Storm"
          onPrimaryAction={() => onStartSession({ mode: 'storm', instantFeedback: false })}
          onSecondaryAction={initialSession?.test_mode === 'storm' ? onResumeSession : undefined}
          hasActiveSession={initialSession?.test_mode === 'storm'}
        />

        {/* Proof Simulation - Gated (PRD Section 7B) */}
        <ModeCard 
          title="Proof Simulation™"
          description={canUnlockProofSim 
            ? 'The ultimate rehearsal. 100 questions, full ALE structure, 24h diagnostic lock.' 
            : `Unlock when your Readiness Score reaches 65%. Currently: ${Math.round(readinessScore * 100)}%.`}
          icon={ShieldCheck}
          accentColor="bg-zinc-900"
          primaryActionLabel="Enter Simulation"
          onPrimaryAction={() => onStartSession({ mode: 'proof_sim', count: 100, instantFeedback: false })}
          disabled={!canUnlockProofSim}
        />

        {/* Endurance Cycle - (PRD Section 7C) */}
        <ModeCard 
          title="Endurance Cycle™"
          description="Build cognitive stamina with progressively longer sessions. Fix late-session accuracy decay."
          icon={Activity}
          accentColor="bg-orange-600"
          primaryActionLabel="Start Training"
          onPrimaryAction={() => onStartSession({ mode: 'endurance', count: 20 })}
        />

        {/* Blindspot Mode - Amber (PRD) */}
        <ModeCard 
          title="Blindspot Mode"
          description='"Attack your weak spots" - Targets underperforming nodes identified by the system.'
          icon={Target}
          accentColor="bg-amber-500"
          primaryActionLabel="Target Weak Spots"
          onPrimaryAction={() => onStartSession({ mode: 'blindspot' })}
          onSecondaryAction={initialSession?.test_mode === 'blindspot' ? onResumeSession : undefined}
          hasActiveSession={initialSession?.test_mode === 'blindspot'}
        />

        {/* Custom Session - Purple (PRD) */}
        <div 
          onClick={() => setIsBuilderOpen(true)}
          className="group relative bg-white border border-zinc-200 rounded-sm p-6 transition-all duration-300 hover:shadow-xl hover:border-zinc-300 cursor-pointer flex flex-col h-full"
        >
          <div className="w-12 h-12 rounded-sm bg-purple-500 flex items-center justify-center mb-6 transition-transform duration-300 group-hover:scale-110">
            <Settings2 className="h-6 w-6 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-zinc-900 mb-2">Custom Session</h3>
            <p className="text-sm text-zinc-500 leading-relaxed mb-6">"Your rules" - Targeted topic drilling with custom timers and feedback rules.</p>
          </div>
          <div className="mt-auto">
            <div className="w-full py-2 bg-zinc-50 rounded-sm text-zinc-900 text-sm font-bold flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-all">
              Configure Session
            </div>
          </div>
        </div>
      </div>

      <CustomSessionBuilder 
        open={isBuilderOpen}
        onOpenChange={setIsBuilderOpen}
        subjects={subjects}
        onStart={(config) => {
          setIsBuilderOpen(false)
          onStartSession({ mode: 'custom', ...config })
        }}
      />
    </div>
  )
}

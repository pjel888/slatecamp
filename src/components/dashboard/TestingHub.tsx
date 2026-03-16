'use client'

import React, { useState } from 'react'
import { Brain, Coffee, Zap, Settings2, Target, Sparkles, ArrowRight, ShieldCheck, Activity } from 'lucide-react'
import { ModeCard } from './ModeCard'
import { CustomSessionBuilder } from './CustomSessionBuilder'
import { SubjectDrillSelector } from './SubjectDrillSelector'
import type { QuizSession, TaxonomyNode } from '@/types/app'

interface TestingHubProps {
  initialSession: QuizSession | null
  disciplineId: string
  subjects: TaxonomyNode[]
  onStartSession: (config: { mode: string, subjectIds?: string[], topicIds?: string[], count?: number, instantFeedback?: boolean, config?: any }) => void
  onResumeSession: () => void
  readinessScore?: number
  decayedNode?: { nodeId: string; nodeName: string; masteryScore: number } | null
}

export function TestingHub({ initialSession, disciplineId, subjects, onStartSession, onResumeSession, readinessScore = 0, decayedNode }: TestingHubProps) {
  const [isBuilderOpen, setIsBuilderOpen] = useState(false)
  const [isSubjectDrillOpen, setIsSubjectDrillOpen] = useState(false)
  const canUnlockProofSim = readinessScore >= 0.65

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      {/* Today's Recommendation Banner */}
      {decayedNode ? (
        <div className="mb-16 p-1 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-sm shadow-lg shadow-blue-200/50">
          <div className="bg-white/95 backdrop-blur-sm p-6 rounded-sm flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-5 text-center md:text-left">
              <div className="w-14 h-14 rounded-sm bg-blue-50 flex items-center justify-center shrink-0 border border-blue-100">
                <Sparkles className="h-7 w-7 text-blue-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-zinc-900 tracking-tight">Today's Recommendation</h2>
                <p className="text-zinc-500 mt-1 max-w-xl text-sm leading-relaxed">
                  Your{' '}
                  <span className="text-zinc-900 font-bold underline decoration-blue-500/30">
                    {decayedNode.nodeName}
                  </span>{' '}
                  node is decaying ({decayedNode.masteryScore}% mastery).
                  To maintain <span className="italic text-zinc-700">desirable difficulty</span>, we recommend a targeted drill today.
                </p>
              </div>
            </div>
            <button
              onClick={() => onStartSession({
                mode: 'camp',
                count: 10,
                topicIds: [decayedNode.nodeId],
                config: { isSubjectMode: true },
              })}
              className="w-full md:w-auto px-6 py-3 bg-blue-600 text-white rounded-md font-semibold text-sm hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 group whitespace-nowrap"
            >
              Launch Targeted Drill
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      ) : (
        <div className="mb-16 p-6 bg-zinc-50 border border-zinc-200 rounded-sm flex items-center gap-4">
          <Sparkles className="h-5 w-5 text-zinc-300 shrink-0" />
          <p className="text-sm text-zinc-400">
            Complete a few sessions to unlock personalized recommendations.
          </p>
        </div>
      )}

      <div className="space-y-16">
        {/* Zone 1: Learning & Exploration (Low Cognitive Load) */}
        <section>
          <div className="flex items-center gap-3 mb-8">
            <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400">Zone 01: Foundations</h2>
            <div className="h-px flex-1 bg-zinc-100" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
          </div>
        </section>

        {/* Zone 2: Targeted Drilling (Medium/High Cognitive Load) */}
        <section>
          <div className="flex items-center gap-3 mb-8">
            <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400">Zone 02: Deliberate Practice</h2>
            <div className="h-px flex-1 bg-zinc-100" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <ModeCard 
              title="Subject Mode"
              description="Syllabus targeting - View mastery scores and recency warnings to select topics in the 'Goldilocks Zone'."
              icon={Target}
              accentColor="bg-blue-600"
              primaryActionLabel="Select Subject"
              onPrimaryAction={() => setIsSubjectDrillOpen(true)}
            />
            <ModeCard 
              title="Blindspot Mode"
              description='"Attack your weak spots" - Forced retrieval practice on underperforming nodes identified by the system.'
              icon={ShieldCheck}
              accentColor="bg-amber-500"
              primaryActionLabel="Target Weak Spots"
              onPrimaryAction={() => onStartSession({ mode: 'blindspot' })}
              onSecondaryAction={initialSession?.test_mode === 'blindspot' ? onResumeSession : undefined}
              hasActiveSession={initialSession?.test_mode === 'blindspot'}
            />
            <div 
              onClick={() => setIsBuilderOpen(true)}
              className="group relative bg-white border border-zinc-200 rounded-sm p-6 transition-all duration-150 hover:shadow-sm hover:border-zinc-300 cursor-pointer flex flex-col h-full"
            >
              <div className="w-12 h-12 rounded-sm bg-purple-500 flex items-center justify-center mb-6 transition-transform duration-300 group-hover:scale-110">
                <Settings2 className="h-6 w-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-zinc-900 mb-2">Custom Session</h3>
                <p className="text-sm text-zinc-500 leading-relaxed mb-6">"Your rules" - Bespoke drilling with custom timers, counts, and feedback settings.</p>
              </div>
              <div className="mt-auto">
                <div className="w-full py-2 bg-zinc-50 rounded-sm text-zinc-900 text-sm font-bold flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-all">
                  Configure Session
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Zone 3: High-Stakes Performance (Peak Cognitive Load) */}
        <section>
          <div className="flex items-center gap-3 mb-8">
            <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400">Zone 03: Performance & Stress</h2>
            <div className="h-px flex-1 bg-zinc-100" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <ModeCard 
              title="Storm Mode"
              description='"Test yourself for real" - Simulated exam day stress conditions. Strict timing, no rationales.'
              icon={Zap}
              accentColor="bg-red-500"
              primaryActionLabel="Begin Storm"
              onPrimaryAction={() => onStartSession({ mode: 'storm', instantFeedback: false })}
              onSecondaryAction={initialSession?.test_mode === 'storm' ? onResumeSession : undefined}
              hasActiveSession={initialSession?.test_mode === 'storm'}
            />
            <ModeCard 
              title="Proof Simulation™"
              description={canUnlockProofSim 
                ? 'The ultimate ALE rehearsal. 100 questions, full structure, 24h diagnostic lock.' 
                : `Locked until Readiness reaches 65% (Current: ${Math.round(readinessScore * 100)}%).`}
              icon={ShieldCheck}
              accentColor="bg-zinc-900"
              primaryActionLabel="Enter Simulation"
              onPrimaryAction={() => onStartSession({ mode: 'proof_sim', count: 100, instantFeedback: false })}
              disabled={!canUnlockProofSim}
            />
            <ModeCard 
              title="Endurance Cycle™"
              description="Cognitive stamina training - Progressive session lengths to build focus for 4+ hour exams."
              icon={Activity}
              accentColor="bg-orange-600"
              primaryActionLabel="Start Training"
              onPrimaryAction={() => onStartSession({ mode: 'endurance', count: 20 })}
            />
          </div>
        </section>
      </div>

      <SubjectDrillSelector 
        open={isSubjectDrillOpen}
        onOpenChange={setIsSubjectDrillOpen}
        disciplineId={disciplineId}
        onStart={(config) => onStartSession({ ...config })}
      />

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

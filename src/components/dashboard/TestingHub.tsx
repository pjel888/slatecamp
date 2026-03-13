'use client'

import React, { useState } from 'react'
import { Brain, Coffee, Zap, Settings2 } from 'lucide-react'
import { ModeCard } from './ModeCard'
import { CustomSessionBuilder } from './CustomSessionBuilder'
import type { QuizSession, TaxonomyNode } from '@/types/app'

interface TestingHubProps {
  initialSession: QuizSession | null
  subjects: TaxonomyNode[]
  onStartSession: (config: { mode: string, subjectIds?: string[], count?: number, instantFeedback?: boolean }) => void
  onResumeSession: () => void
}

export function TestingHub({ initialSession, subjects, onStartSession, onResumeSession }: TestingHubProps) {
  const [isBuilderOpen, setIsBuilderOpen] = useState(false)

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <header className="mb-12">
        <h1 className="text-3xl font-bold text-zinc-900 tracking-tight">Testing Hub</h1>
        <p className="text-zinc-500 mt-2">Select a mode to sharpen your architectural knowledge.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Camp Mode */}
        <ModeCard 
          title="Camp Mode"
          description="The standard feedback-first drill. 5 questions with instant rationales. Perfect for active recall."
          icon={Brain}
          accentColor="bg-blue-600"
          primaryActionLabel="Start Camp"
          onPrimaryAction={() => onStartSession({ mode: 'camp' })}
          onSecondaryAction={initialSession?.test_mode === 'camp' ? onResumeSession : undefined}
          hasActiveSession={initialSession?.test_mode === 'camp'}
        />

        {/* Chill Mode */}
        <ModeCard 
          title="Chill Mode"
          description="No pressure, no scores. Just a continuous feed of questions and information. Great for casual study."
          icon={Coffee}
          accentColor="bg-emerald-500"
          primaryActionLabel="Enter Chill"
          onPrimaryAction={() => onStartSession({ mode: 'chill', instantFeedback: true })}
          onSecondaryAction={initialSession?.test_mode === 'chill' ? onResumeSession : undefined}
          hasActiveSession={initialSession?.test_mode === 'chill'}
        />

        {/* Storm Mode */}
        <ModeCard 
          title="Storm Mode"
          description="High-pressure timed mock exam. No rationales until the end. Test your endurance."
          icon={Zap}
          accentColor="bg-indigo-600"
          primaryActionLabel="Begin Storm"
          onPrimaryAction={() => onStartSession({ mode: 'storm', instantFeedback: false })}
          onSecondaryAction={initialSession?.test_mode === 'storm' ? onResumeSession : undefined}
          hasActiveSession={initialSession?.test_mode === 'storm'}
        />

        {/* Custom Session */}
        <div 
          onClick={() => setIsBuilderOpen(true)}
          className="group relative bg-zinc-50 border-2 border-dashed border-zinc-200 rounded-2xl p-6 transition-all duration-300 hover:border-zinc-400 hover:bg-white cursor-pointer flex flex-col items-center justify-center text-center h-full"
        >
          <div className="w-12 h-12 rounded-full bg-zinc-200 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <Settings2 className="h-6 w-6 text-zinc-500 group-hover:text-zinc-900" />
          </div>
          <h3 className="text-lg font-bold text-zinc-900 mb-1">Custom Session</h3>
          <p className="text-sm text-zinc-500">Pick subjects and question count</p>
        </div>
      </div>

      <CustomSessionBuilder 
        open={isBuilderOpen}
        onOpenChange={setIsBuilderOpen}
        subjects={subjects}
        onStart={(config) => {
          setIsBuilderOpen(false)
          onStartSession({ mode: 'camp', ...config })
        }}
      />
    </div>
  )
}

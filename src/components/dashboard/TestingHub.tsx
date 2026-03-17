'use client'

import React, { useState } from 'react'
import {
  Brain,
  Coffee,
  Lightning,
  GearSix,
  Target,
  ArrowRight,
  ShieldCheck,
  Pulse,
} from '@phosphor-icons/react'
import { SCIcon } from '@/components/graphics/icons/Icon'
import { ModeCard } from './ModeCard'
import { CustomSessionBuilder } from './CustomSessionBuilder'
import { SubjectDrillSelector } from './SubjectDrillSelector'
import type { QuizSession, TaxonomyNode } from '@/types/app'

interface TestingHubProps {
  initialSession: QuizSession | null
  disciplineId: string
  subjects: TaxonomyNode[]
  onStartSession: (config: {
    mode: string
    subjectIds?: string[]
    topicIds?: string[]
    count?: number
    instantFeedback?: boolean
    config?: any
  }) => void
  onResumeSession: () => void
  readinessScore?: number
  decayedNode?: {
    nodeId: string
    nodeName: string
    masteryScore: number
  } | null
}

export function TestingHub({
  initialSession,
  disciplineId,
  subjects,
  onStartSession,
  onResumeSession,
  readinessScore = 0,
  decayedNode,
}: TestingHubProps) {
  const [isBuilderOpen, setIsBuilderOpen] = useState(false)
  const [isSubjectDrillOpen, setIsSubjectDrillOpen] = useState(false)
  const canUnlockProofSim = readinessScore >= 0.65

  return (
    <div className='max-w-6xl mx-auto px-4 py-12'>
      {/* Today's Recommendation Banner */}
      {decayedNode ? (
        <div className='mb-16 p-6 bg-white border border-border rounded-md'>
          <div className='flex flex-col md:flex-row items-center justify-between gap-6'>
            <div className='flex items-center gap-5 text-center md:text-left'>
              <div className='w-14 h-14 rounded-md bg-[#EEF2FC] flex items-center justify-center shrink-0 border border-primary/10'>
                <SCIcon icon={Target} size='lg' className='text-primary' />
              </div>
              <div>
                <h2 className='font-display text-lg font-extrabold text-[#1A2332] tracking-tight'>
                  Suggested for Today
                </h2>
                <p className='text-zinc-500 mt-1 max-w-xl text-sm leading-relaxed'>
                  Your understanding of{' '}
                  <span className='text-zinc-900 font-bold underline decoration-primary/30'>
                    {decayedNode.nodeName}
                  </span>{' '}
                  ({decayedNode.masteryScore}% mastery) could use a refresh. A
                  focused session today will help it stick.
                </p>
              </div>
            </div>
            <button
              onClick={() =>
                onStartSession({
                  mode: 'camp',
                  count: 10,
                  topicIds: [decayedNode.nodeId],
                  config: { isSubjectMode: true },
                })
              }
              className='w-full md:w-auto px-6 py-3 bg-primary text-white rounded-sm font-semibold text-sm hover:bg-[#1535A8] transition-colors flex items-center justify-center gap-2 group whitespace-nowrap'
            >
              Start 10-Question Review
              <SCIcon
                icon={ArrowRight}
                size='sm'
                className='group-hover:translate-x-1 transition-transform'
              />
            </button>
          </div>
        </div>
      ) : (
        <div className='mb-16 p-6 bg-[#F8F7F5] border border-border rounded-md flex items-center gap-4'>
          <SCIcon icon={Target} size='md' className='text-zinc-300 shrink-0' />
          <p className='text-sm text-zinc-400'>
            Finish a few sessions and personalized suggestions will appear here.
          </p>
        </div>
      )}

      <div className='space-y-16'>
        {/* Zone 1: Learning & Exploration (Low Cognitive Load) */}
        <section>
          <div className='flex items-center gap-3 mb-8'>
            <h2 className='font-dm-mono text-[11px] font-medium uppercase tracking-[0.2em] text-[#6B6B6B]'>
              Zone 01: Foundations
            </h2>
            <div className='h-px flex-1 bg-zinc-100' />
          </div>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
            <ModeCard
              title='Camp Mode'
              description='Learn as you go — a great starting point for new topics. Every answer comes with clear, expert-written rationales.'
              icon={Brain}
              accentColor='bg-primary'
              primaryActionLabel='Start Camp'
              onPrimaryAction={() => onStartSession({ mode: 'camp' })}
              onSecondaryAction={
                initialSession?.test_mode === 'camp'
                  ? onResumeSession
                  : undefined
              }
              hasActiveSession={initialSession?.test_mode === 'camp'}
            />
            <ModeCard
              title='Chill Mode'
              description='Browse and absorb at a relaxed pace — ideal for pre-sleep review or low-energy days. Continuous, pressure-free feed.'
              icon={Coffee}
              accentColor='bg-[#1B3FC4]'
              primaryActionLabel='Enter Chill'
              onPrimaryAction={() =>
                onStartSession({ mode: 'chill', instantFeedback: true })
              }
              onSecondaryAction={
                initialSession?.test_mode === 'chill'
                  ? onResumeSession
                  : undefined
              }
              hasActiveSession={initialSession?.test_mode === 'chill'}
            />
          </div>
        </section>

        {/* Zone 2: Targeted Practice (Medium/High Cognitive Load) */}
        <section>
          <div className='flex items-center gap-3 mb-8'>
            <h2 className='font-dm-mono text-[11px] font-medium uppercase tracking-[0.2em] text-[#6B6B6B]'>
              Zone 02: Deliberate Practice
            </h2>
            <div className='h-px flex-1 bg-zinc-100' />
          </div>
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
            <ModeCard
              title='Subject Mode'
              description="Pick a topic and go deep — see your mastery score and how recently you've practiced each area to find the right focus."
              icon={Target}
              accentColor='bg-primary'
              primaryActionLabel='Choose a Topic'
              onPrimaryAction={() => setIsSubjectDrillOpen(true)}
            />
            <ModeCard
              title='Blindspot Mode'
              description="Revisit the topics you've practiced least — the system surfaces areas where focused repetition will have the most impact."
              icon={ShieldCheck}
              accentColor='bg-amber-500'
              primaryActionLabel='Revisit Weak Areas'
              onPrimaryAction={() => onStartSession({ mode: 'blindspot' })}
              onSecondaryAction={
                initialSession?.test_mode === 'blindspot'
                  ? onResumeSession
                  : undefined
              }
              hasActiveSession={initialSession?.test_mode === 'blindspot'}
            />
            <div
              onClick={() => setIsBuilderOpen(true)}
              className='group relative bg-white border border-border rounded-md p-6 transition-all duration-150 hover:shadow-sm hover:border-primary/20 cursor-pointer flex flex-col h-full'
            >
              <div className='w-12 h-12 rounded-md bg-zinc-700 flex items-center justify-center mb-6 transition-transform duration-300 group-hover:scale-110'>
                <SCIcon icon={GearSix} size='lg' className='text-white' />
              </div>
              <div className='flex-1'>
                <h3 className='text-sm font-semibold text-[#1A2332] mb-2'>
                  Custom Session
                </h3>
                <p className='text-sm text-[#4A5568] leading-relaxed mb-6'>
                  Design your own session — choose the topics, question count,
                  and feedback style that fit what you need today.
                </p>
              </div>
              <div className='mt-auto'>
                <div className='w-full py-2 bg-zinc-50 rounded-sm text-[#1A2332] text-sm font-bold flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all'>
                  Build Session
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Zone 3: High-Stakes Performance (Peak Cognitive Load) */}
        <section>
          <div className='flex items-center gap-3 mb-8'>
            <h2 className='font-dm-mono text-[11px] font-medium uppercase tracking-[0.2em] text-[#6B6B6B]'>
              Zone 03: Exam Readiness
            </h2>
            <div className='h-px flex-1 bg-zinc-100' />
          </div>
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
            <ModeCard
              title='Storm Mode'
              description='Practice under realistic exam conditions — timed questions, no rationales shown until the end. The closest thing to exam day.'
              icon={Lightning}
              accentColor='bg-red-500'
              primaryActionLabel='Begin Storm'
              onPrimaryAction={() =>
                onStartSession({ mode: 'storm', instantFeedback: false })
              }
              onSecondaryAction={
                initialSession?.test_mode === 'storm'
                  ? onResumeSession
                  : undefined
              }
              hasActiveSession={initialSession?.test_mode === 'storm'}
            />
            <ModeCard
              title='Full Exam Simulation'
              description={
                canUnlockProofSim
                  ? 'Your full-length exam rehearsal — 100 questions across the full syllabus. Review unlocks 24 hours after completion.'
                  : `Unlocks when your Readiness Score reaches 65%. You're currently at ${Math.round(readinessScore * 100)}% — keep going.`
              }
              icon={ShieldCheck}
              accentColor='bg-zinc-900'
              primaryActionLabel='Enter Simulation'
              onPrimaryAction={() =>
                onStartSession({
                  mode: 'proof_sim',
                  count: 100,
                  instantFeedback: false,
                })
              }
              disabled={!canUnlockProofSim}
            />
            <ModeCard
              title='Extended Practice'
              description='Build your focus gradually — sessions grow longer each week to prepare you for the sustained concentration exam day requires.'
              icon={Pulse}
              accentColor='bg-amber-500'
              primaryActionLabel='Start Session'
              onPrimaryAction={() =>
                onStartSession({ mode: 'endurance', count: 20 })
              }
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

'use client'

import React from 'react'
import {
  Brain,
  Lightning,
  Coffee,
  Target,
  ShieldCheck,
  Pulse,
  CaretRight,
  ArrowLeft,
  Timer,
  BookOpen,
  Trophy,
  Warning,
} from '@phosphor-icons/react'
import { SCIcon } from '@/components/graphics/icons/Icon'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { TestMode } from '@/types/app'

interface ModeIntroScreenProps {
  mode: TestMode
  questionCount: number
  onStart: () => void
  onBack: () => void
  config?: any
}

export function ModeIntroScreen({
  mode,
  questionCount,
  onStart,
  onBack,
  config,
}: ModeIntroScreenProps) {
  const isSubjectMode = config?.isSubjectMode

  const modeConfigs = {
    camp: {
      title: isSubjectMode ? 'Subject Mode' : 'Camp Mode',
      icon: isSubjectMode ? Target : Brain,
      color: isSubjectMode ? 'text-primary' : 'text-primary',
      bgColor: isSubjectMode ? 'bg-[#EEF2FC]' : 'bg-[#EEF2FC]',
      description: isSubjectMode
        ? 'Focused practice on a specific syllabus area. Every answer comes with instant feedback and expert rationales to deepen your understanding.'
        : 'Build solid foundations at your own pace. Every answer comes with instant feedback and clear rationales so you always know the why.',
      specs: [
        { label: 'Immediate Feedback', value: 'Enabled', icon: BookOpen },
        { label: 'Detailed Rationales', value: 'SME Authored', icon: Target },
        { label: 'Time Limit', value: 'None', icon: Timer },
        { label: 'Goal', value: 'Deep Understanding', icon: Trophy },
      ],
    },
    storm: {
      title: 'Storm Mode',
      icon: Lightning,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      description:
        'Practice under realistic exam conditions. Timed questions with no feedback shown until the session wraps — the closest thing to the real thing.',
      specs: [
        { label: 'Immediate Feedback', value: 'Held Until End', icon: Warning },
        { label: 'Time Limit', value: '2 min / Question', icon: Timer },
        { label: 'Scoring', value: 'Exam Standard', icon: Target },
        { label: 'Lock Status', value: '24h Review Lock', icon: ShieldCheck },
      ],
    },
    chill: {
      title: 'Chill Mode',
      icon: Coffee,
      color: 'text-primary',
      bgColor: 'bg-[#EEF2FC]',
      description:
        'Relaxed reading and passive review. Reveal answers with a single tap — no scores, no pressure, just learning.',
      specs: [
        { label: 'One-Tap Reveal', value: 'Active', icon: Lightning },
        { label: 'Score Tracking', value: 'Silent', icon: Target },
        { label: 'Tone', value: 'Conversational', icon: BookOpen },
        { label: 'Endless Feed', value: 'Enabled', icon: Pulse },
      ],
    },
    proof_sim: {
      title: 'Full Exam Simulation',
      icon: ShieldCheck,
      color: 'text-zinc-900',
      bgColor: 'bg-zinc-100',
      description:
        'Your full-length exam rehearsal. 100 questions across the entire syllabus — the best way to measure where you truly stand.',
      specs: [
        { label: 'Format', value: 'Full ALE Structure', icon: Target },
        { label: 'Difficulty', value: 'Exam Standard', icon: Pulse },
        { label: 'Mastery Impact', value: '3x Weighted', icon: Trophy },
        { label: 'Review', value: 'Available After 24h', icon: Timer },
      ],
    },
  }

  // Fallback for modes not explicitly detailed (custom, blindspot, endurance)
  const modeConfig =
    modeConfigs[mode as keyof typeof modeConfigs] || modeConfigs.camp
  const Icon = modeConfig.icon

  return (
    <div className='max-w-3xl mx-auto px-6 py-12 flex flex-col min-h-[calc(100vh-12rem)] justify-center'>
      <Button
        variant='ghost'
        onClick={onBack}
        className='w-fit mb-8 -ml-2 text-zinc-500 hover:text-zinc-900 flex items-center gap-2 font-bold text-xs uppercase tracking-widest'
      >
        <SCIcon icon={ArrowLeft} size='sm' />
        Back to Hub
      </Button>

      <div className='space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-300'>
        <div className='flex items-center gap-6'>
          <div
            className={cn(
              'w-20 h-20 rounded-sm flex items-center justify-center border shadow-sm',
              modeConfig.bgColor,
              modeConfig.color
                .replace('text-', 'border-')
                .replace('600', '200'),
            )}
          >
            <SCIcon icon={Icon} size='xl' />
          </div>
          <div>
            <h1 className='text-xl font-semibold text-zinc-900 tracking-tight'>
              {modeConfig.title}
            </h1>
            <p className='text-zinc-500 mt-2 text-sm max-w-xl leading-relaxed'>
              {modeConfig.description}
            </p>
          </div>
        </div>

        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
          {modeConfig.specs.map((spec, i) => {
            const SpecIcon = spec.icon
            return (
              <div
                key={i}
                className='flex items-center gap-4 p-4 rounded-sm bg-white border border-zinc-100 shadow-sm'
              >
                <div className='w-10 h-10 rounded-sm bg-zinc-50 flex items-center justify-center border border-zinc-100'>
                  <SCIcon icon={SpecIcon} size='md' className='text-zinc-400' />
                </div>
                <div>
                  <p className='text-[11px] font-black uppercase tracking-widest text-zinc-400'>
                    {spec.label}
                  </p>
                  <p className='text-sm font-bold text-zinc-900'>
                    {spec.value}
                  </p>
                </div>
              </div>
            )
          })}
        </div>

        <div className='pt-8 flex flex-col gap-4'>
          <Button
            onClick={onStart}
            className='w-full h-12 bg-primary text-white rounded-md font-semibold text-sm hover:bg-[#1535A8] transition-colors flex items-center justify-center gap-2'
          >
            Begin Session
            <SCIcon icon={CaretRight} size='md' />
          </Button>
          <div className='flex items-center justify-center gap-2 text-[11px] font-bold uppercase tracking-widest text-zinc-400'>
            <SCIcon icon={Timer} size='xs' />
            Session will include {questionCount} questions
          </div>
        </div>
      </div>
    </div>
  )
}

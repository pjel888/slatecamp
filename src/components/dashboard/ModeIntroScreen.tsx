'use client'

import React from 'react'
import {
  Brain,
  Zap,
  Coffee,
  Target,
  ShieldCheck,
  Activity,
  ChevronRight,
  ArrowLeft,
  Timer,
  BookOpen,
  Trophy,
  AlertCircle,
} from 'lucide-react'
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
      color: isSubjectMode ? 'text-blue-600' : 'text-teal-600',
      bgColor: isSubjectMode ? 'bg-blue-50' : 'bg-teal-50',
      description: isSubjectMode 
        ? "Targeted drilling for a specific syllabus area. You'll get instant feedback and SME rationales."
        : "Focus on learning and building foundations. You'll get instant feedback and detailed rationales for every answer.",
      specs: [
        { label: 'Immediate Feedback', value: 'Enabled', icon: BookOpen },
        { label: 'Detailed Rationales', value: 'SME Authored', icon: Target },
        { label: 'Time Limit', value: 'None', icon: Timer },
        { label: 'Goal', value: 'Subject Mastery', icon: Trophy },
      ],
    },
    storm: {
      title: 'Storm Mode',
      icon: Zap,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      description:
        'Simulate real exam conditions. High pressure, strict timing, and no feedback until the session is complete.',
      specs: [
        { label: 'Immediate Feedback', value: 'Disabled', icon: AlertCircle },
        { label: 'Time Limit', value: '2 min / Question', icon: Timer },
        { label: 'Scoring', value: 'Exam Standard', icon: Target },
        { label: 'Lock Status', value: '24h Review Lock', icon: ShieldCheck },
      ],
    },
    chill: {
      title: 'Chill Mode',
      icon: Coffee,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      description:
        'Casual browsing and passive absorption. One-tap reveal with no scoring pressure.',
      specs: [
        { label: 'One-Tap Reveal', value: 'Active', icon: Zap },
        { label: 'Score Tracking', value: 'Silent', icon: Target },
        { label: 'Tone', value: 'Conversational', icon: BookOpen },
        { label: 'Endless Feed', value: 'Enabled', icon: Activity },
      ],
    },
    proof_sim: {
      title: 'Proof Simulation™',
      icon: ShieldCheck,
      color: 'text-zinc-900',
      bgColor: 'bg-zinc-100',
      description:
        'The ultimate rehearsal for exam day. 100 questions covering the full syllabus with weighted score impact.',
      specs: [
        { label: 'Format', value: 'Full ALE Structure', icon: Target },
        { label: 'Difficulty', value: 'Exam Mode', icon: Activity },
        { label: 'Mastery Impact', value: '3x Weighted', icon: Trophy },
        { label: 'Review', value: 'After 24 Hours', icon: Timer },
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
        <ArrowLeft className='h-4 w-4' />
        Back to Hub
      </Button>

      <div className='space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500'>
        <div className='flex items-center gap-6'>
          <div
            className={cn(
              'w-20 h-20 rounded-sm flex items-center justify-center border shadow-sm',
              modeConfig.bgColor,
              modeConfig.color.replace('text-', 'border-').replace('600', '200'),
            )}
          >
            <Icon className='h-10 w-10' />
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
                  <SpecIcon className='h-5 w-5 text-zinc-400' />
                </div>
                <div>
                  <p className='text-[10px] font-black uppercase tracking-widest text-zinc-400'>
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
            className='w-full h-12 bg-zinc-900 text-white rounded-md font-semibold text-sm hover:bg-zinc-800 transition-colors flex items-center justify-center gap-2'
          >
            Start Session
            <ChevronRight className='h-5 w-5' />
          </Button>
          <div className='flex items-center justify-center gap-2 text-[11px] font-bold uppercase tracking-widest text-zinc-400'>
            <Timer className='h-3 w-3' />
            Session will include {questionCount} questions
          </div>
        </div>
      </div>
    </div>
  )
}

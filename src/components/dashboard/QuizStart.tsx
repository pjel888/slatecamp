'use client'

import React from 'react'
import {
  Brain,
  Play,
  ArrowCounterClockwise,
  Clock,
  Target,
} from '@phosphor-icons/react'
import { SCIcon } from '@/components/graphics/icons/Icon'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

interface QuizStartProps {
  hasExistingSession: boolean
  onStart: () => void
  onResume: () => void
  disciplineName: string
}

export function QuizStart({
  hasExistingSession,
  onStart,
  onResume,
  disciplineName,
}: QuizStartProps) {
  return (
    <div className='flex items-center justify-center min-h-[calc(100vh-12rem)] px-4'>
      <Card className='w-full max-w-md border-zinc-200 shadow-sm overflow-hidden bg-white'>
        <div className='h-2 bg-primary w-full' />
        <CardHeader className='pt-8 pb-6 text-center'>
          <div className='mx-auto bg-[#EEF2FC] w-14 h-14 rounded-md flex items-center justify-center mb-4'>
            <SCIcon icon={Brain} size='xl' className='text-primary' />
          </div>
          <CardTitle className='text-xl font-bold text-zinc-900'>
            Camp Mode
          </CardTitle>
          <CardDescription className='text-zinc-500 mt-2'>
            Low-stakes diagnostic for {disciplineName}
          </CardDescription>
        </CardHeader>

        <CardContent className='space-y-6 px-8'>
          <div className='grid grid-cols-2 gap-4'>
            <div className='bg-zinc-50 p-4 rounded-md border border-zinc-100 flex flex-col items-center text-center'>
              <SCIcon icon={Target} size='md' className='text-zinc-400 mb-2' />
              <span className='text-xs font-semibold text-zinc-900 uppercase tracking-wider'>
                Goal
              </span>
              <span className='text-[13px] text-zinc-600 mt-1'>Accuracy</span>
            </div>
            <div className='bg-zinc-50 p-4 rounded-md border border-zinc-100 flex flex-col items-center text-center'>
              <SCIcon icon={Clock} size='md' className='text-zinc-400 mb-2' />
              <span className='text-xs font-semibold text-zinc-900 uppercase tracking-wider'>
                Time
              </span>
              <span className='text-[13px] text-zinc-600 mt-1'>Unlimited</span>
            </div>
          </div>

          <div className='space-y-3'>
            <div className='flex items-start gap-3'>
              <div className='h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5'>
                <span className='text-[11px] font-bold text-primary'>1</span>
              </div>
              <p className='text-sm text-zinc-600 leading-relaxed'>
                5 random questions from your syllabus.
              </p>
            </div>
            <div className='flex items-start gap-3'>
              <div className='h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5'>
                <span className='text-[11px] font-bold text-primary'>2</span>
              </div>
              <p className='text-sm text-zinc-600 leading-relaxed'>
                Instant summary rationales after every answer.
              </p>
            </div>
            <div className='flex items-start gap-3'>
              <div className='h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5'>
                <span className='text-[11px] font-bold text-primary'>3</span>
              </div>
              <p className='text-sm text-zinc-600 leading-relaxed'>
                Fluid exploration—change answers to see all rationales.
              </p>
            </div>
          </div>
        </CardContent>

        <CardFooter className='flex flex-col gap-3 p-8 pt-4'>
          {hasExistingSession ? (
            <>
              <Button
                onClick={onResume}
                className='w-full h-12 text-base font-semibold bg-primary hover:bg-[#1535A8] text-white shadow-sm'
              >
                <SCIcon icon={Play} size='md' weight='fill' className='mr-2' />{' '}
                Resume Session
              </Button>
              <Button
                onClick={onStart}
                variant='ghost'
                className='w-full text-zinc-500 hover:text-zinc-900'
              >
                <SCIcon
                  icon={ArrowCounterClockwise}
                  size='sm'
                  className='mr-2'
                />{' '}
                Start Fresh Session
              </Button>
            </>
          ) : (
            <Button
              onClick={onStart}
              className='w-full h-12 text-base font-semibold bg-primary hover:bg-[#1535A8] text-white shadow-sm'
            >
              <SCIcon icon={Play} size='md' weight='fill' className='mr-2' />{' '}
              Start Camp Session
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  )
}

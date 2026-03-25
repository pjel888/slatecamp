'use client'

import React, { useState } from 'react'
import { GearSix, BookOpen, Stack, CheckCircle } from '@phosphor-icons/react/dist/ssr'
import { SCIcon } from '@/components/graphics/icons/Icon'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import type { TaxonomyNode } from '@/types/app'

interface CustomSessionBuilderProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  subjects: TaxonomyNode[]
  onStart: (config: {
    subjectIds: string[]
    count: number
    instantFeedback: boolean
  }) => void
}

export function CustomSessionBuilder({
  open,
  onOpenChange,
  subjects,
  onStart,
}: CustomSessionBuilderProps) {
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>(
    subjects.map((s) => s.node_id),
  )
  const [count, setCount] = useState(10)
  const [instantFeedback, setInstantFeedback] = useState(true)

  const toggleSubject = (id: string) => {
    setSelectedSubjects((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id],
    )
  }

  const handleStart = () => {
    onStart({
      subjectIds: selectedSubjects,
      count,
      instantFeedback,
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-[500px] bg-white border-zinc-200 shadow-lg rounded-md p-0 overflow-hidden'>
        <div className='h-1.5 bg-primary w-full' />

        <DialogHeader className='px-8 pt-8 pb-4'>
          <div className='flex items-center gap-3 mb-2'>
            <div className='bg-zinc-100 p-2 rounded-sm'>
              <SCIcon icon={GearSix} size='md' className='text-zinc-900' />
            </div>
            <DialogTitle className='text-xl font-bold text-zinc-900'>
              Build Your Session
            </DialogTitle>
          </div>
          <DialogDescription className='text-zinc-500'>
            Choose the topics, question count, and feedback style that fit what
            you need today.
          </DialogDescription>
        </DialogHeader>

        <div className='px-8 py-4 space-y-8 max-h-[60vh] overflow-y-auto'>
          {/* Subjects Selection */}
          <div className='space-y-4'>
            <div className='flex items-center justify-between'>
              <Label className='text-xs font-bold uppercase tracking-widest text-zinc-400'>
                Topics to Include
              </Label>
              <Button
                variant='ghost'
                size='sm'
                className='h-7 text-[11px] font-semibold text-primary hover:text-primary-700 hover:bg-primary-50'
                onClick={() =>
                  setSelectedSubjects(subjects.map((s) => s.node_id))
                }
              >
                Select All
              </Button>
            </div>
            <div className='grid grid-cols-1 gap-2'>
              {subjects.map((subject) => (
                <button
                  key={subject.node_id}
                  onClick={() => toggleSubject(subject.node_id)}
                  className={`flex items-center justify-between p-3 rounded-md border transition-all text-left group ${
                    selectedSubjects.includes(subject.node_id)
                      ? 'border-zinc-900 bg-primary text-white'
                      : 'border-zinc-200 bg-white text-zinc-600 hover:border-zinc-300'
                  }`}
                >
                  <div className='flex items-center gap-3'>
                    <SCIcon
                      icon={BookOpen}
                      size='sm'
                      className={
                        selectedSubjects.includes(subject.node_id)
                          ? 'text-zinc-400'
                          : 'text-zinc-300'
                      }
                    />
                    <span className='text-[13px] font-medium truncate'>
                      {subject.name}
                    </span>
                  </div>
                  {selectedSubjects.includes(subject.node_id) && (
                    <SCIcon
                      icon={CheckCircle}
                      size='sm'
                      weight='fill'
                      className='text-white'
                    />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Question Count */}
          <div className='space-y-4'>
            <Label className='text-xs font-bold uppercase tracking-widest text-zinc-400'>
              Question Count
            </Label>
            <RadioGroup
              value={count.toString()}
              onValueChange={(v) => setCount(parseInt(v))}
              className='grid grid-cols-4 gap-2'
            >
              {[5, 10, 20, 50].map((val) => (
                <div key={val}>
                  <RadioGroupItem
                    value={val.toString()}
                    id={`q-${val}`}
                    className='peer sr-only'
                  />
                  <Label
                    htmlFor={`q-${val}`}
                    className='flex flex-col items-center justify-center rounded-md border border-zinc-200 bg-white p-3 peer-data-[state=checked]:border-zinc-900 peer-data-[state=checked]:bg-primary peer-data-[state=checked]:text-white hover:border-zinc-300 cursor-pointer transition-all'
                  >
                    <span className='text-sm font-bold'>{val}</span>
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          {/* Feedback Toggle */}
          <div className='flex items-center justify-between p-4 rounded-md bg-zinc-50 border border-zinc-100'>
            <div className='space-y-0.5'>
              <Label className='text-sm font-bold text-zinc-900'>
                Instant Rationales
              </Label>
              <p className='text-xs text-zinc-500'>
                Show the explanation after every question
              </p>
            </div>
            <Switch
              checked={instantFeedback}
              onCheckedChange={setInstantFeedback}
            />
          </div>
        </div>

        <DialogFooter className='p-8 pt-4 bg-zinc-50/50 border-t border-zinc-100'>
          <Button
            onClick={handleStart}
            disabled={selectedSubjects.length === 0}
            className='w-full h-12 text-base font-bold bg-primary hover:bg-primary-700 text-white rounded-md'
          >
            Start Session
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

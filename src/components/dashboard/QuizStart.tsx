'use client'

import React from 'react'
import { Brain, Play, RotateCcw, Clock, Target } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'

interface QuizStartProps {
  hasExistingSession: boolean
  onStart: () => void
  onResume: () => void
  disciplineName: string
}

export function QuizStart({ hasExistingSession, onStart, onResume, disciplineName }: QuizStartProps) {
  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-12rem)] px-4">
      <Card className="w-full max-w-md border-zinc-200 shadow-sm overflow-hidden bg-white">
        <div className="h-2 bg-blue-600 w-full" />
        <CardHeader className="pt-8 pb-6 text-center">
          <div className="mx-auto bg-blue-50 w-14 h-14 rounded-md flex items-center justify-center mb-4">
            <Brain className="h-8 w-8 text-blue-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-zinc-900">Camp Mode</CardTitle>
          <CardDescription className="text-zinc-500 mt-2">
            Low-stakes diagnostic for {disciplineName}
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6 px-8">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-zinc-50 p-4 rounded-md border border-zinc-100 flex flex-col items-center text-center">
              <Target className="h-5 w-5 text-zinc-400 mb-2" />
              <span className="text-xs font-semibold text-zinc-900 uppercase tracking-wider">Goal</span>
              <span className="text-[13px] text-zinc-600 mt-1">Accuracy</span>
            </div>
            <div className="bg-zinc-50 p-4 rounded-md border border-zinc-100 flex flex-col items-center text-center">
              <Clock className="h-5 w-5 text-zinc-400 mb-2" />
              <span className="text-xs font-semibold text-zinc-900 uppercase tracking-wider">Time</span>
              <span className="text-[13px] text-zinc-600 mt-1">Unlimited</span>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="h-5 w-5 rounded-full bg-blue-100 flex items-center justify-center shrink-0 mt-0.5">
                <span className="text-[10px] font-bold text-blue-600">1</span>
              </div>
              <p className="text-sm text-zinc-600 leading-relaxed">5 random questions from your syllabus.</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="h-5 w-5 rounded-full bg-blue-100 flex items-center justify-center shrink-0 mt-0.5">
                <span className="text-[10px] font-bold text-blue-600">2</span>
              </div>
              <p className="text-sm text-zinc-600 leading-relaxed">Instant summary rationales after every answer.</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="h-5 w-5 rounded-full bg-blue-100 flex items-center justify-center shrink-0 mt-0.5">
                <span className="text-[10px] font-bold text-blue-600">3</span>
              </div>
              <p className="text-sm text-zinc-600 leading-relaxed">Fluid exploration—change answers to see all rationales.</p>
            </div>
          </div>
        </CardContent>

        <CardFooter className="flex flex-col gap-3 p-8 pt-4">
          {hasExistingSession ? (
            <>
              <Button onClick={onResume} className="w-full h-12 text-base font-semibold bg-blue-600 hover:bg-blue-700 text-white shadow-md">
                <Play className="mr-2 h-5 w-5 fill-current" /> Resume Session
              </Button>
              <Button onClick={onStart} variant="ghost" className="w-full text-zinc-500 hover:text-zinc-900">
                <RotateCcw className="mr-2 h-4 w-4" /> Start Fresh Session
              </Button>
            </>
          ) : (
            <Button onClick={onStart} className="w-full h-12 text-base font-semibold bg-blue-600 hover:bg-blue-700 text-white shadow-md">
              <Play className="mr-2 h-5 w-5 fill-current" /> Start Camp Session
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  )
}

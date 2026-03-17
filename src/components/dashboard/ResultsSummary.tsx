'use client'

import React, { useMemo } from 'react'
import { motion } from 'framer-motion'
import {
  Target,
  Clock,
  ArrowRight,
  RotateCcw,
  LayoutDashboard,
  CheckCircle2,
  XCircle,
  BarChart3,
  Search,
  BookOpen
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { Question, Choice } from '@/types/app'

interface ResultsSummaryProps {
  questions: Question[]
  answers: Record<string, string>
  onExit: () => void
  onRestart: () => void
  testMode: string
}

export function ResultsSummary({ 
  questions, 
  answers, 
  onExit, 
  onRestart,
  testMode
}: ResultsSummaryProps) {
  const stats = useMemo(() => {
    const total = questions.length
    let correct = 0
    const subjectStats: Record<string, { total: number; correct: number }> = {}

    questions.forEach(q => {
      const isCorrect = answers[q.question_id] === (q.correct_option_id ?? q.correct_answer)
      if (isCorrect) correct++

      const subject = q.subject_id || 'General'
      if (!subjectStats[subject]) {
        subjectStats[subject] = { total: 0, correct: 0 }
      }
      subjectStats[subject].total++
      if (isCorrect) subjectStats[subject].correct++
    })

    const score = Math.round((correct / total) * 100)

    const masteryLabel =
      score >= 75 ? 'Mastered' :
      score >= 50 ? 'Developing' :
      'Needs Work'

    const masteryColor =
      score >= 75 ? 'text-green-600' :
      score >= 50 ? 'text-amber-600' :
      'text-red-600'

    return { total, correct, score, subjectStats, masteryLabel, masteryColor }
  }, [questions, answers])

  return (
    <div className="max-w-4xl mx-auto py-12 px-6">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-12"
      >
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-sm bg-blue-50 text-blue-600 mb-6 border border-blue-100">
          <Target className="h-8 w-8" />
        </div>
        <h1 className="text-xl font-semibold text-zinc-900 tracking-tight">Session Complete</h1>
        <p className="text-zinc-500 mt-2">Here is how you performed in your {testMode} session.</p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div className="bg-white p-6 rounded-sm border border-zinc-200 shadow-sm flex flex-col items-center">
          <div className="text-zinc-400 mb-2 flex items-center gap-2">
            <Target className="h-4 w-4" />
            <span className="text-[10px] font-black uppercase tracking-widest">Accuracy</span>
          </div>
          <div className="text-xl font-black text-zinc-900">{stats.score}%</div>
          <div className="text-[10px] text-zinc-400 mt-1 uppercase tracking-widest font-bold">
            {stats.correct} / {stats.total} Correct
          </div>
        </div>

        <div className="bg-white p-6 rounded-sm border border-zinc-200 shadow-sm flex flex-col items-center">
          <div className="text-zinc-400 mb-2 flex items-center gap-2">
            <Clock className="h-4 w-4" />
            <span className="text-[10px] font-black uppercase tracking-widest">Status</span>
          </div>
          <div className={`text-xl font-black uppercase ${stats.masteryColor}`}>{stats.masteryLabel}</div>
          <div className="text-[10px] text-zinc-400 mt-1 uppercase tracking-widest font-bold">
            IRT Adjusted
          </div>
        </div>

        <div className="bg-white p-6 rounded-sm border border-zinc-200 shadow-sm flex flex-col items-center">
          <div className="text-zinc-400 mb-2 flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            <span className="text-[10px] font-black uppercase tracking-widest">Readiness</span>
          </div>
          <div className="text-xl font-black text-green-600 uppercase">Updated</div>
          <div className="text-[10px] text-zinc-400 mt-1 uppercase tracking-widest font-bold">
            EMA Recalculated
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400 mb-4">Subject Breakdown</h2>
        <div className="grid grid-cols-1 gap-4">
          {Object.entries(stats.subjectStats).map(([subject, s], idx) => {
            const percentage = Math.round((s.correct / s.total) * 100)
            return (
              <div key={subject} className="bg-white p-5 rounded-sm border border-zinc-200 shadow-sm flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={cn(
                    "w-10 h-10 rounded-sm flex items-center justify-center border",
                    percentage >= 75 ? "bg-green-50 border-green-100 text-green-600" :
                    percentage >= 50 ? "bg-amber-50 border-amber-100 text-amber-600" :
                    "bg-red-50 border-red-100 text-red-600"
                  )}>
                    <BookOpen className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-zinc-900">{subject}</h4>
                    <p className="text-[10px] text-zinc-400 uppercase tracking-widest font-bold">{s.correct}/{s.total} Correct</p>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <div className="w-32 h-2 bg-zinc-100 rounded-sm overflow-hidden border border-zinc-200/30 hidden sm:block">
                    <div 
                      className={cn(
                        "h-full",
                        percentage >= 75 ? "bg-green-500" :
                        percentage >= 50 ? "bg-amber-500" :
                        "bg-red-500"
                      )} 
                      style={{ width: `${percentage}%` }} 
                    />
                  </div>
                  <span className="text-sm font-black text-zinc-900 w-10 text-right">{percentage}%</span>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <div className="mt-12 pt-12 border-t border-zinc-200 grid grid-cols-1 md:grid-cols-2 gap-4">
        <Button 
          onClick={onExit}
          variant="outline"
          className="h-14 rounded-sm border-zinc-200 text-zinc-600 hover:bg-zinc-50 font-bold uppercase tracking-widest text-[10px] gap-2"
        >
          <LayoutDashboard className="h-4 w-4" />
          Back to Dashboard
        </Button>
        <Button 
          onClick={onRestart}
          className="h-14 rounded-sm bg-blue-600 hover:bg-blue-700 text-white font-bold uppercase tracking-widest text-[10px] gap-2"
        >
          <RotateCcw className="h-4 w-4" />
          Start New Session
        </Button>
      </div>
    </div>
  )
}

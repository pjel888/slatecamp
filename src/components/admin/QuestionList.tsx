'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Question, Plus, MagnifyingGlass, Funnel, Trash, PencilSimple, Eye, CircleNotch } from '@phosphor-icons/react'
import { SCIcon } from '@/components/graphics/icons/Icon'
import { cn } from '@/lib/utils'

interface Question {
  id: string
  text: string
  topic_id: string
  difficulty: number
  options: string[]
  created_at: string
}

interface QuestionListProps {
  initialQuestions: Question[]
}

const difficultyLabels: Record<number, string> = {
  1: 'Very Easy',
  2: 'Easy',
  3: 'Medium',
  4: 'Hard',
  5: 'Very Hard',
}

const difficultyColors: Record<number, string> = {
  1: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  2: 'bg-lime-100 text-lime-800 dark:bg-lime-900 dark:text-lime-200',
  3: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  4: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200',
  5: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
}

export function QuestionList({ initialQuestions }: QuestionListProps) {
  const [questions, setQuestions] = useState(initialQuestions)
  const [searchQuery, setSearchQuery] = useState('')
  const [difficultyFilter, setDifficultyFilter] = useState<number | null>(null)
  const [selectedQuestions, setSelectedQuestions] = useState<string[]>([])
  const [isPending, startTransition] = useTransition()

  const handleDeleteSelected = () => {
    startTransition(async () => {
      const supabase = createClient()
      await supabase.from('questions').delete().in('question_id', selectedQuestions)
      setQuestions((prev) => prev.filter((q) => !selectedQuestions.includes(q.id)))
      setSelectedQuestions([])
    })
  }

  const filteredQuestions = questions.filter(q => {
    const matchesSearch = q.text.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesDifficulty = difficultyFilter === null || q.difficulty === difficultyFilter
    return matchesSearch && matchesDifficulty
  })

  const toggleSelect = (id: string) => {
    setSelectedQuestions(prev => 
      prev.includes(id) 
        ? prev.filter(q => q !== id)
        : [...prev, id]
    )
  }

  const toggleSelectAll = () => {
    if (selectedQuestions.length === filteredQuestions.length) {
      setSelectedQuestions([])
    } else {
      setSelectedQuestions(filteredQuestions.map(q => q.id))
    }
  }

  return (
    <div className="space-y-4">
      {/* Search and Filters */}
      <div className="flex gap-4">
        <div className="flex-1 relative">
          <SCIcon icon={MagnifyingGlass} size="sm" className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search questions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-md border border-input bg-background"
          />
        </div>
        <select
          value={difficultyFilter ?? ''}
          onChange={(e) => setDifficultyFilter(e.target.value ? Number(e.target.value) : null)}
          className="px-3 py-2 rounded-md border border-input bg-background"
        >
          <option value="">All Difficulties</option>
          {[1, 2, 3, 4, 5].map(d => (
            <option key={d} value={d}>{difficultyLabels[d]}</option>
          ))}
        </select>
        <Link
          href="/admin/questions/new"
          className="flex items-center gap-2 px-4 py-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90"
        >
          <SCIcon icon={Plus} size="sm" />
          Add Question
        </Link>
        <Link
          href="/admin/questions/import"
          className="flex items-center gap-2 px-4 py-2 rounded-md border border-input hover:bg-muted"
        >
          <SCIcon icon={Question} size="sm" />
          Import
        </Link>
      </div>

      {/* Bulk Actions */}
      {selectedQuestions.length > 0 && (
        <div className="flex items-center gap-4 p-3 rounded-md bg-muted">
          <span className="text-sm">{selectedQuestions.length} selected</span>
          <button
            onClick={handleDeleteSelected}
            disabled={isPending}
            className="flex items-center gap-1 text-sm text-red-600 hover:text-red-700 disabled:opacity-50"
          >
            {isPending ? <SCIcon icon={CircleNotch} size="sm" className="animate-spin" /> : <SCIcon icon={Trash} size="sm" />}
            Delete Selected
          </button>
        </div>
      )}

      {/* Questions Table */}
      <div className="rounded-md border">
        <table className="w-full">
          <thead className="bg-muted">
            <tr>
              <th className="px-4 py-3 text-left">
                <input
                  type="checkbox"
                  checked={selectedQuestions.length === filteredQuestions.length && filteredQuestions.length > 0}
                  onChange={toggleSelectAll}
                  className="rounded"
                />
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium">Question</th>
              <th className="px-4 py-3 text-left text-sm font-medium">Difficulty</th>
              <th className="px-4 py-3 text-left text-sm font-medium">Created</th>
              <th className="px-4 py-3 text-right text-sm font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredQuestions.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                  No questions found
                </td>
              </tr>
            ) : (
              filteredQuestions.map((question) => (
                <tr key={question.id} className="border-t hover:bg-muted/50">
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={selectedQuestions.includes(question.id)}
                      onChange={() => toggleSelect(question.id)}
                      className="rounded"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <p className="line-clamp-2 text-sm">{question.text}</p>
                  </td>
                  <td className="px-4 py-3">
                    <span className={cn(
                      "inline-flex px-2 py-1 rounded-full text-xs font-medium",
                      difficultyColors[question.difficulty]
                    )}>
                      {difficultyLabels[question.difficulty]}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">
                    {new Date(question.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/admin/questions/${question.id}`}
                        className="p-1 hover:bg-muted rounded"
                      >
                        <SCIcon icon={PencilSimple} size="sm" />
                      </Link>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {filteredQuestions.length > 0 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {filteredQuestions.length} questions
          </p>
        </div>
      )}
    </div>
  )
}

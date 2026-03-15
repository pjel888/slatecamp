'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Save, X, Trash2, ArrowLeft } from 'lucide-react'
import { cn } from '@/lib/utils'
import Link from 'next/link'

interface QuestionEditorProps {
  question?: {
    id: string
    text: string
    topic_id: string
    options: string[]
    correct_option_id: number
    rationale: string | null
    difficulty: number
  }
}

export function QuestionEditor({ question }: QuestionEditorProps) {
  const router = useRouter()
  const supabase = createClient()
  
  const [text, setText] = useState(question?.text || '')
  const [topicId, setTopicId] = useState(question?.topic_id || '')
  const [options, setOptions] = useState<string[]>(question?.options || ['', '', '', '', ''])
  const [correctAnswer, setCorrectAnswer] = useState(question?.correct_option_id ?? 0)
  const [rationale, setRationale] = useState(question?.rationale || '')
  const [difficulty, setDifficulty] = useState(question?.difficulty || 3)
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleSave = async () => {
    if (!text.trim() || !topicId.trim() || options.some(o => !o.trim())) {
      alert('Please fill in all required fields')
      return
    }

    setIsSaving(true)
    try {
      const data = {
        text: text.trim(),
        topic_id: topicId.trim(),
        options: options.map(o => o.trim()),
        correct_option_id: correctAnswer,
        rationale: rationale.trim() || null,
        difficulty,
      }

      let error
      if (question?.id) {
        ({ error } = await supabase
          .from('questions')
          .update(data)
          .eq('id', question.id))
      } else {
        ({ error } = await supabase
          .from('questions')
          .insert([data]))
      }

      if (error) throw error

      router.push('/admin/questions')
      router.refresh()
    } catch (error) {
      console.error('Error saving question:', error)
      alert('Failed to save question')
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!question?.id) return
    if (!confirm('Are you sure you want to delete this question?')) return

    setIsDeleting(true)
    try {
      const { error } = await supabase
        .from('questions')
        .delete()
        .eq('id', question.id)

      if (error) throw error

      router.push('/admin/questions')
      router.refresh()
    } catch (error) {
      console.error('Error deleting question:', error)
      alert('Failed to delete question')
    } finally {
      setIsDeleting(false)
    }
  }

  const optionLabels = ['A', 'B', 'C', 'D', 'E']

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Link
          href="/admin/questions"
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Questions
        </Link>
        {question?.id && (
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="flex items-center gap-2 text-red-600 hover:text-red-700"
          >
            <Trash2 className="h-4 w-4" />
            {isDeleting ? 'Deleting...' : 'Delete'}
          </button>
        )}
      </div>

      {/* Form */}
      <div className="space-y-6">
        {/* Question Text */}
        <div>
          <label className="block text-sm font-medium mb-2">Question Text *</label>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Enter your question here..."
            rows={4}
            className="w-full px-3 py-2 rounded-md border border-input bg-background resize-none"
          />
        </div>

        {/* Taxonomy Node */}
        <div>
          <label className="block text-sm font-medium mb-2">Taxonomy Node ID *</label>
          <input
            type="text"
            value={topicId}
            onChange={(e) => setTopicId(e.target.value)}
            placeholder="Enter taxonomy node UUID..."
            className="w-full px-3 py-2 rounded-md border border-input bg-background"
          />
          <p className="text-xs text-muted-foreground mt-1">
            The UUID of the taxonomy node this question belongs to
          </p>
        </div>

        {/* Options */}
        <div>
          <label className="block text-sm font-medium mb-2">Answer Options *</label>
          <div className="space-y-3">
            {options.slice(0, 5).map((option, index) => (
              <div key={index} className="flex items-center gap-3">
                <input
                  type="radio"
                  name="correct-answer"
                  checked={correctAnswer === index}
                  onChange={() => setCorrectAnswer(index)}
                  className="h-4 w-4"
                />
                <span className="w-8 font-medium">{optionLabels[index]}</span>
                <input
                  type="text"
                  value={option}
                  onChange={(e) => {
                    const newOptions = [...options]
                    newOptions[index] = e.target.value
                    setOptions(newOptions)
                  }}
                  placeholder={`Option ${optionLabels[index]}...`}
                  className="flex-1 px-3 py-2 rounded-md border border-input bg-background"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Rationale */}
        <div>
          <label className="block text-sm font-medium mb-2">Rationale</label>
          <textarea
            value={rationale}
            onChange={(e) => setRationale(e.target.value)}
            placeholder="Explain why the correct answer is correct..."
            rows={3}
            className="w-full px-3 py-2 rounded-md border border-input bg-background resize-none"
          />
        </div>

        {/* Difficulty */}
        <div>
          <label className="block text-sm font-medium mb-2">Difficulty</label>
          <input
            type="range"
            min="1"
            max="5"
            value={difficulty}
            onChange={(e) => setDifficulty(Number(e.target.value))}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-muted-foreground mt-1">
            <span>Very Easy (1)</span>
            <span>Very Hard (5)</span>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex gap-3">
        <Link
          href="/admin/questions"
          className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-md border border-input hover:bg-muted"
        >
          <X className="h-4 w-4" />
          Cancel
        </Link>
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
        >
          <Save className="h-4 w-4" />
          {isSaving ? 'Saving...' : question?.id ? 'Update Question' : 'Create Question'}
        </button>
      </div>
    </div>
  )
}

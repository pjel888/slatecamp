'use client'

import { useState } from 'react'
import { StudyWindowSelector } from '@/components/settings/StudyWindowSelector'
import type { Discipline } from '@/types/app'

type ReviewerType = 'first_taker' | 'returning_reviewer' | 'undergrad' | 'dae'

interface Subject {
  node_id: string
  name: string
}

interface OnboardingFormProps {
  disciplines: Discipline[]
  subjectsByDiscipline: Record<string, Subject[]>
  onSubmit: (formData: FormData) => Promise<void>
}

const REVIEWER_OPTIONS: {
  value: ReviewerType
  label: string
  subLabel: string
}[] = [
  {
    value: 'first_taker',
    label: 'Preparing for the ALE',
    subLabel: 'First time taking the board exam',
  },
  {
    value: 'returning_reviewer',
    label: 'Returning reviewer — refining my strategy',
    subLabel: 'You know the ALE. You know what needs to change.',
  },
  {
    value: 'undergrad',
    label: 'Architecture student — studio reference',
    subLabel: 'No pressure. Just the best building code reference.',
  },
  {
    value: 'dae',
    label: 'Licensed architect — staying current',
    subLabel: 'Keep your knowledge current between renewals.',
  },
]

export const OnboardingForm = ({
  disciplines,
  subjectsByDiscipline,
  onSubmit,
}: OnboardingFormProps) => {
  const [selectedDisciplineId, setSelectedDisciplineId] = useState<string>('')
  const [reviewerType, setReviewerType] = useState<ReviewerType>('first_taker')
  const [struggledSubjects, setStruggledSubjects] = useState<string[]>([])

  const subjects = selectedDisciplineId
    ? (subjectsByDiscipline[selectedDisciplineId] ?? [])
    : []

  const showExamDate = reviewerType === 'first_taker' || reviewerType === 'returning_reviewer'
  const showStudyWindow = true
  const showStruggledSubjects = reviewerType === 'returning_reviewer'
  const showSchoolField = reviewerType === 'undergrad'

  const toggleSubject = (nodeId: string) => {
    setStruggledSubjects(prev =>
      prev.includes(nodeId) ? prev.filter(id => id !== nodeId) : [...prev, nodeId]
    )
  }

  return (
    <form action={onSubmit} className="space-y-5">
      {/* Hidden field: struggled subjects serialised as JSON */}
      <input
        type="hidden"
        name="struggledSubjects"
        value={JSON.stringify(
          subjects
            .filter(s => struggledSubjects.includes(s.node_id))
            .map(s => s.name)
        )}
      />

      {/* Discipline Selection */}
      <div>
        <label className="block text-sm font-medium text-[#1A2332] mb-2">
          Choose your discipline
        </label>
        <div className="space-y-2">
          {disciplines.map((discipline: Discipline) => (
            <label
              key={discipline.discipline_id}
              className="flex items-center justify-between rounded-md border border-[#D4DAE3] p-3 transition-colors duration-150 hover:border-[#1B3FC4] hover:bg-[#EEF2FC]/50 cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-sm bg-[#EEF2FC] text-[#1B3FC4]">
                  <span className="text-[11px] font-bold">{discipline.acronym}</span>
                </div>
                <span className="text-sm font-medium text-[#1A2332]">{discipline.name}</span>
              </div>
              <input
                type="radio"
                name="disciplineId"
                value={discipline.discipline_id}
                required
                onChange={() => setSelectedDisciplineId(discipline.discipline_id)}
                className="h-4 w-4 border-[#D4DAE3] text-[#1B3FC4]"
              />
            </label>
          ))}
        </div>
      </div>

      {/* Reviewer Type — 4-way selector */}
      <div>
        <p className="text-sm font-medium text-[#1A2332] mb-2">
          What brings you to SlateCamp?
        </p>
        <div className="space-y-2">
          {REVIEWER_OPTIONS.map(({ value, label, subLabel }) => (
            <label key={value} className="block cursor-pointer">
              <input
                type="radio"
                name="reviewerType"
                value={value}
                checked={reviewerType === value}
                onChange={() => setReviewerType(value)}
                className="peer sr-only"
              />
              <div className="rounded-md border border-[#D4DAE3] p-3 transition-colors duration-150 peer-checked:border-[#1B3FC4] peer-checked:bg-[#EEF2FC] hover:border-[#1B3FC4]/50 hover:bg-[#EEF2FC]/30">
                <div className="flex items-start gap-3">
                  <div
                    className={[
                      'mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2 transition-colors duration-150',
                      reviewerType === value
                        ? 'border-[#1B3FC4]'
                        : 'border-[#D4DAE3]',
                    ].join(' ')}
                  >
                    {reviewerType === value && (
                      <div className="h-2 w-2 rounded-full bg-[#1B3FC4]" />
                    )}
                  </div>
                  <div>
                    <span className="text-sm font-medium text-[#1A2332]">{label}</span>
                    <p className="mt-0.5 text-xs text-[#8896A7]">{subLabel}</p>
                  </div>
                </div>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Returning reviewer — context copy */}
      {reviewerType === 'returning_reviewer' && (
        <div className="rounded-md border border-[#D4DAE3] bg-[#F8F7F5] px-4 py-3">
          <p className="text-[13px] text-[#4A5568] leading-relaxed">
            You know the ALE. You know what needs to change.{' '}
            <span className="font-medium text-[#1A2332]">
              SlateCamp gives you the data to change it.
            </span>
          </p>
        </div>
      )}

      {/* Undergrad — context copy */}
      {reviewerType === 'undergrad' && (
        <div className="rounded-md border border-[#D4DAE3] bg-[#F8F7F5] px-4 py-3">
          <p className="text-[13px] text-[#4A5568] leading-relaxed">
            No pressure. Just the best building code reference in the Philippines.
          </p>
        </div>
      )}

      {/* DAE — context copy */}
      {reviewerType === 'dae' && (
        <div className="rounded-md border border-[#D4DAE3] bg-[#F8F7F5] px-4 py-3">
          <p className="text-[13px] text-[#4A5568] leading-relaxed">
            Keep your knowledge current between renewals.
          </p>
        </div>
      )}

      {/* Struggled subjects — returning_reviewer only */}
      {showStruggledSubjects && subjects.length > 0 && (
        <div>
          <p className="text-sm font-medium text-[#1A2332] mb-1">
            What subject felt hardest?
          </p>
          <p className="text-xs text-[#8896A7] mb-2">
            Select all that apply — we&apos;ll prioritise these areas for you.
          </p>
          <div className="space-y-1.5">
            {subjects.map(subject => {
              const isChecked = struggledSubjects.includes(subject.node_id)
              return (
                <button
                  key={subject.node_id}
                  type="button"
                  onClick={() => toggleSubject(subject.node_id)}
                  className={[
                    'w-full flex items-center gap-3 rounded-md border px-3 py-2.5 text-left transition-colors duration-150',
                    isChecked
                      ? 'border-[#1B3FC4] bg-[#EEF2FC]'
                      : 'border-[#D4DAE3] hover:border-[#1B3FC4]/50 hover:bg-[#EEF2FC]/30',
                  ].join(' ')}
                >
                  <div
                    className={[
                      'flex h-4 w-4 shrink-0 items-center justify-center rounded-sm border-2 transition-colors duration-150',
                      isChecked ? 'border-[#1B3FC4] bg-[#1B3FC4]' : 'border-[#D4DAE3]',
                    ].join(' ')}
                  >
                    {isChecked && (
                      <svg
                        width="10"
                        height="8"
                        viewBox="0 0 10 8"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        aria-hidden="true"
                      >
                        <path
                          d="M1 4L3.5 6.5L9 1"
                          stroke="white"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    )}
                  </div>
                  <span className="text-sm text-[#1A2332]">{subject.name}</span>
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* School / Institution — undergrad only */}
      {showSchoolField && (
        <div>
          <label htmlFor="schoolOrInstitution" className="block text-sm font-medium text-[#1A2332] mb-1.5">
            School or institution
          </label>
          <input
            type="text"
            id="schoolOrInstitution"
            name="schoolOrInstitution"
            placeholder="e.g. University of Santo Tomas"
            className="w-full rounded-sm border border-[#D4DAE3] px-3 py-2 text-sm text-[#1A2332] placeholder:text-[#8896A7] focus:border-[#1B3FC4] focus:outline-none focus:ring-1 focus:ring-[#1B3FC4]"
          />
        </div>
      )}

      {/* Exam Date — first_taker + returning_reviewer only */}
      {showExamDate && (
        <div>
          <label htmlFor="examDate" className="block text-sm font-medium text-[#1A2332] mb-1.5">
            When is your target exam date?
          </label>
          <input
            type="date"
            id="examDate"
            name="examDate"
            className="w-full rounded-sm border border-[#D4DAE3] px-3 py-2 text-sm text-[#1A2332] focus:border-[#1B3FC4] focus:outline-none focus:ring-1 focus:ring-[#1B3FC4]"
          />
          <p className="mt-1 text-xs text-[#8896A7]">
            Helps us recommend the right study trail for your timeline.
          </p>
        </div>
      )}

      {/* Study Window — all types */}
      {showStudyWindow && (
        <div className="pt-2 border-t border-[#D4DAE3]">
          <p className="text-sm font-medium text-[#1A2332] mb-1">
            When do you usually study?
          </p>
          <p className="text-xs text-[#8896A7] mb-2">
            Optional — helps order trail activities for better retention.
          </p>
          <StudyWindowSelector compact />
        </div>
      )}

      <button
        type="submit"
        className="flex w-full justify-center rounded-sm px-4 py-3 text-sm font-semibold text-white transition-colors duration-150 ease-out hover:bg-[#1535A8]"
        style={{ backgroundColor: '#1B3FC4' }}
      >
        Continue to Diagnostic &rarr;
      </button>
    </form>
  )
}

'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { SCIcon } from '@/components/graphics/icons/Icon'
import { User, Camera, CalendarBlank } from '@phosphor-icons/react/dist/ssr'
import { toast } from '@/lib/hooks/use-toast'
import { completeOnboardingSetup, updateProfile, updateExamDate, uploadAvatar, type ReviewerType, type StudyWindow } from '@/lib/actions/profile'
import { cn } from '@/lib/utils'
import { useDiscipline } from '@/lib/context/discipline-context'
import { ROUTES } from '@/lib/routes'

type ReviewCenterValue = 'none' | 'jpt' | 'atlas_cdc' | 'other'

interface ProfileCardProps {
  initialDisplayName: string | null
  initialAvatarUrl: string | null
  initialExamDate: string | null
  initialEnrolledReviewCenter: string | null
  initialOnboardingCompleted: boolean
  initialReviewerType: string | null
  initialStudyWindow: StudyWindow | null
}

const REVIEW_CENTER_OPTIONS = [
  { value: 'none', label: 'Self-directed only' },
  { value: 'jpt', label: 'JPT Review Center' },
  { value: 'atlas_cdc', label: 'ATLAS-CDC' },
  { value: 'other', label: 'Another review center' },
] as const

const STUDY_WINDOW_OPTIONS: { value: StudyWindow; label: string }[] = [
  { value: 'morning', label: 'Morning' },
  { value: 'evening', label: 'Evening' },
  { value: 'both', label: 'Morning and evening' },
  { value: 'any', label: 'No preference' },
]

export const ProfileCard = ({
  initialDisplayName,
  initialAvatarUrl,
  initialExamDate,
  initialEnrolledReviewCenter,
  initialOnboardingCompleted,
  initialReviewerType,
  initialStudyWindow,
}: ProfileCardProps) => {
  const router = useRouter()
  const { activeDiscipline } = useDiscipline()
  const [displayName, setDisplayName] = React.useState(initialDisplayName ?? '')
  const [avatarUrl, setAvatarUrl] = React.useState(initialAvatarUrl ?? '')
  const [examDate, setExamDate] = React.useState(
    initialExamDate ? initialExamDate.slice(0, 10) : ''
  )
  const [reviewerType, setReviewerType] = React.useState<ReviewerType>(
    initialReviewerType === 'returning_reviewer' ? 'returning_reviewer' : 'first_taker',
  )
  const [studyWindow, setStudyWindow] = React.useState<StudyWindow>(initialStudyWindow ?? 'any')
  const [reviewCenter, setReviewCenter] = React.useState<ReviewCenterValue>(
    initialEnrolledReviewCenter === 'jpt' ||
    initialEnrolledReviewCenter === 'atlas_cdc' ||
    initialEnrolledReviewCenter === 'none'
      ? initialEnrolledReviewCenter
      : initialEnrolledReviewCenter
        ? 'other'
        : 'none',
  )
  const [reviewCenterOther, setReviewCenterOther] = React.useState(
    initialEnrolledReviewCenter &&
    initialEnrolledReviewCenter !== 'jpt' &&
    initialEnrolledReviewCenter !== 'atlas_cdc' &&
    initialEnrolledReviewCenter !== 'none'
      ? initialEnrolledReviewCenter
      : '',
  )
  const [completionLoading, setCompletionLoading] = React.useState(false)
  const [completionError, setCompletionError] = React.useState<string | null>(null)
  const [nameLoading, setNameLoading] = React.useState(false)
  const [dateLoading, setDateLoading] = React.useState(false)
  const [avatarLoading, setAvatarLoading] = React.useState(false)
  const fileInputRef = React.useRef<HTMLInputElement>(null)

  const handleNameSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setNameLoading(true)
    try {
      const fd = new FormData()
      fd.set('displayName', displayName)
      const result = await updateProfile(fd)
      if (result.error) {
        toast({ title: 'Error', description: result.error, variant: 'error' })
      } else {
        toast({ title: 'Saved', description: 'Display name updated.', variant: 'success' })
      }
    } finally {
      setNameLoading(false)
    }
  }

  const handleDateSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setDateLoading(true)
    try {
      const fd = new FormData()
      fd.set('examDate', examDate)
      const result = await updateExamDate(fd)
      if (result.error) {
        toast({ title: 'Error', description: result.error, variant: 'error' })
      } else {
        toast({ title: 'Saved', description: 'Exam date updated.', variant: 'success' })
      }
    } finally {
      setDateLoading(false)
    }
  }

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setAvatarLoading(true)
    try {
      const fd = new FormData()
      fd.set('avatar', file)
      const result = await uploadAvatar(fd)
      if (result.error) {
        toast({ title: 'Error', description: result.error, variant: 'error' })
      } else {
        if (result.avatarUrl) setAvatarUrl(result.avatarUrl)
        toast({ title: 'Saved', description: 'Avatar updated.', variant: 'success' })
      }
    } finally {
      setAvatarLoading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const handleFinishSetup = async (e: React.FormEvent) => {
    e.preventDefault()
    setCompletionLoading(true)
    setCompletionError(null)

    try {
      const formData = new FormData()
      formData.set('disciplineId', activeDiscipline?.discipline_id ?? '')
      formData.set('reviewerType', reviewerType)
      formData.set('examDate', examDate)
      formData.set('studyWindow', studyWindow)
      formData.set('enrolledReviewCenter', reviewCenter)
      if (reviewCenter === 'other') {
        formData.set('enrolledReviewCenterOther', reviewCenterOther)
      }

      const result = await completeOnboardingSetup(formData)
      if (!result.success) {
        const fieldError = result.fieldErrors?.disciplineId ?? result.fieldErrors?.reviewerType ?? null
        const description = fieldError ?? result.formError ?? 'We could not finish setup right now.'
        setCompletionError(description)
        toast({ title: 'Setup not finished', description, variant: 'error' })
        return
      }

      toast({
        title: 'Setup complete',
        description: 'Your dashboard is unlocked.',
        variant: 'success',
      })
      router.push(ROUTES.dashboard.root)
      router.refresh()
    } finally {
      setCompletionLoading(false)
    }
  }

  return (
    <Card className='border-border shadow-sm overflow-hidden'>
      <CardHeader className='bg-muted/50 border-b border-border'>
        <div className='flex items-center gap-3'>
          <div className='bg-primary/10 p-2 rounded-md'>
            <SCIcon icon={User} size='md' className='text-primary' />
          </div>
          <div>
            <CardTitle className='text-base font-bold'>Profile</CardTitle>
            <p className='text-xs text-muted-foreground'>
              Manage your display name, avatar, and exam date.
            </p>
          </div>
        </div>
      </CardHeader>

      <CardContent className='p-6 space-y-6'>
        {!initialOnboardingCompleted && (
          <>
            <form onSubmit={handleFinishSetup} className='space-y-4 rounded-md border border-primary/20 bg-primary/5 p-4'>
              <div>
                <p className='text-sm font-semibold text-foreground'>Complete your setup</p>
                <p className='mt-1 text-xs text-muted-foreground'>
                  Finish these items to unlock the full dashboard. Your active discipline comes from the discipline card below.
                </p>
              </div>

              <div className='rounded-sm border border-border bg-card px-3 py-2'>
                <p className='text-[11px] uppercase tracking-wide text-muted-foreground'>Active discipline</p>
                <p className='mt-1 text-sm font-medium text-foreground'>
                  {activeDiscipline?.name ?? 'Select a discipline below before finishing setup.'}
                </p>
              </div>

              <div>
                <label className='block text-sm font-medium text-foreground mb-1.5' htmlFor='reviewerType'>
                  LEA path
                </label>
                <select
                  id='reviewerType'
                  value={reviewerType}
                  onChange={(e) => setReviewerType(e.target.value as ReviewerType)}
                  className='w-full rounded-sm border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary'
                >
                  <option value='first_taker'>Preparing for the LEA</option>
                  <option value='returning_reviewer'>Returning reviewer</option>
                </select>
              </div>

              <div>
                <label className='block text-sm font-medium text-foreground mb-1.5' htmlFor='setupStudyWindow'>
                  Study window
                </label>
                <select
                  id='setupStudyWindow'
                  value={studyWindow}
                  onChange={(e) => setStudyWindow(e.target.value as StudyWindow)}
                  className='w-full rounded-sm border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary'
                >
                  {STUDY_WINDOW_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className='block text-sm font-medium text-foreground mb-1.5' htmlFor='reviewCenter'>
                  Review center
                </label>
                <select
                  id='reviewCenter'
                  value={reviewCenter}
                  onChange={(e) => setReviewCenter(e.target.value as ReviewCenterValue)}
                  className='w-full rounded-sm border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary'
                >
                  {REVIEW_CENTER_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              {reviewCenter === 'other' && (
                <div>
                  <label className='block text-sm font-medium text-foreground mb-1.5' htmlFor='reviewCenterOther'>
                    Which review center?
                  </label>
                  <Input
                    id='reviewCenterOther'
                    value={reviewCenterOther}
                    onChange={(e) => setReviewCenterOther(e.target.value)}
                    placeholder='Enter the review center name'
                  />
                </div>
              )}

              {completionError && (
                <p className='rounded-sm border border-destructive/30 bg-destructive/10 px-3 py-2 text-xs text-destructive'>
                  {completionError}
                </p>
              )}

              <div className='flex items-center justify-between gap-3'>
                <p className='text-xs text-muted-foreground'>
                  The target exam date field below is included when you finish setup.
                </p>
                <Button type='submit' size='md' loading={completionLoading}>
                  Finish setup
                </Button>
              </div>
            </form>

            <div className='border-t border-border' />
          </>
        )}

        {/* Avatar */}
        <div className='flex items-center gap-4'>
          <button
            type='button'
            onClick={() => fileInputRef.current?.click()}
            disabled={avatarLoading}
            className={cn(
              'relative group w-16 h-16 rounded-md overflow-hidden border border-border bg-muted flex items-center justify-center shrink-0 transition-opacity duration-150',
              avatarLoading && 'opacity-50 pointer-events-none'
            )}
            aria-label='Change avatar'
          >
            {avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={avatarUrl} alt='Avatar' className='w-full h-full object-cover' />
            ) : (
              <SCIcon icon={User} size='lg' className='text-muted-foreground' />
            )}
            <span className='absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-150'>
              <SCIcon icon={Camera} size='sm' className='text-white' />
            </span>
          </button>

          <div className='flex-1 min-w-0'>
            <p className='text-sm font-medium text-foreground'>Profile photo</p>
            <p className='text-xs text-muted-foreground mt-0.5'>
              JPG, PNG or WebP. Recommended: 256×256px.
            </p>
            <Button
              variant='outline'
              size='sm'
              className='mt-2'
              loading={avatarLoading}
              onClick={() => fileInputRef.current?.click()}
            >
              {avatarLoading ? 'Uploading…' : 'Change photo'}
            </Button>
          </div>

          <input
            ref={fileInputRef}
            type='file'
            accept='image/jpeg,image/png,image/webp'
            className='sr-only'
            onChange={handleAvatarChange}
            aria-label='Upload avatar'
          />
        </div>

        <div className='border-t border-border' />

        {/* Display name */}
        <form onSubmit={handleNameSave}>
          <label className='block text-sm font-medium text-foreground mb-1.5' htmlFor='displayName'>
            Display name
          </label>
          <div className='flex gap-2'>
            <Input
              id='displayName'
              name='displayName'
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder='Your name'
              className='flex-1'
            />
            <Button type='submit' size='md' loading={nameLoading}>
              Save
            </Button>
          </div>
        </form>

        <div className='border-t border-border' />

        {/* Exam date */}
        <form onSubmit={handleDateSave}>
          <label className='block text-sm font-medium text-foreground mb-1.5' htmlFor='examDate'>
            <span className='flex items-center gap-1.5'>
              <SCIcon icon={CalendarBlank} size='sm' className='text-muted-foreground' />
              Target exam date
            </span>
          </label>
          <p className='text-xs text-muted-foreground mb-2'>
            Used to calculate your pacing and readiness timeline.
          </p>
          <div className='flex gap-2'>
            <Input
              id='examDate'
              name='examDate'
              type='date'
              value={examDate}
              onChange={(e) => setExamDate(e.target.value)}
              className='flex-1'
            />
            <Button type='submit' size='md' loading={dateLoading}>
              Save
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}

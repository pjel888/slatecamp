'use client'

import * as React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { SCIcon } from '@/components/graphics/icons/Icon'
import { User, Camera, CalendarBlank } from '@phosphor-icons/react/dist/ssr'
import { toast } from '@/lib/hooks/use-toast'
import { updateProfile, updateExamDate, uploadAvatar } from '@/lib/actions/profile'
import { cn } from '@/lib/utils'

interface ProfileCardProps {
  initialDisplayName: string | null
  initialAvatarUrl: string | null
  initialExamDate: string | null
}

export const ProfileCard = ({
  initialDisplayName,
  initialAvatarUrl,
  initialExamDate,
}: ProfileCardProps) => {
  const [displayName, setDisplayName] = React.useState(initialDisplayName ?? '')
  const [avatarUrl, setAvatarUrl] = React.useState(initialAvatarUrl ?? '')
  const [examDate, setExamDate] = React.useState(
    initialExamDate ? initialExamDate.slice(0, 10) : ''
  )
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

  return (
    <Card className='border-zinc-200 shadow-sm overflow-hidden'>
      <CardHeader className='bg-zinc-50/50 border-b border-zinc-100'>
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
        {/* Avatar */}
        <div className='flex items-center gap-4'>
          <button
            type='button'
            onClick={() => fileInputRef.current?.click()}
            disabled={avatarLoading}
            className={cn(
              'relative group w-16 h-16 rounded-md overflow-hidden border border-zinc-200 bg-zinc-50 flex items-center justify-center shrink-0 transition-opacity duration-150',
              avatarLoading && 'opacity-50 pointer-events-none'
            )}
            aria-label='Change avatar'
          >
            {avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={avatarUrl} alt='Avatar' className='w-full h-full object-cover' />
            ) : (
              <SCIcon icon={User} size='lg' className='text-zinc-400' />
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

        <div className='border-t border-zinc-100' />

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

        <div className='border-t border-zinc-100' />

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

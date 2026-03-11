import Link from 'next/link'
import { Button } from '@/components/ui/button'

interface NoExamProfilePromptProps {
  /** Page title shown in the heading (e.g. "Quiz", "Review", "Library") */
  title?: string
  /** Short description of what this page does */
  description?: string
}

/**
 * Shown when the user has no exam profile (fallback if ALE auto-creation failed).
 * Sends them to dashboard where profile is ensured.
 */
export function NoExamProfilePrompt({
  title = 'Quiz',
  description = 'Go to the dashboard to set up your exam profile.',
}: NoExamProfilePromptProps) {
  return (
    <div className='space-y-6'>
      <div>
        <h1 className='text-2xl font-semibold text-foreground'>{title}</h1>
        <p className='mt-1 text-sm text-muted-foreground'>{description}</p>
      </div>
      <Link href='/dashboard'>
        <Button>Go to Dashboard</Button>
      </Link>
    </div>
  )
}

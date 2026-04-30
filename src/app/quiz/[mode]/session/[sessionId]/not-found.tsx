import Link from 'next/link'
import { ROUTES } from '@/lib/routes'
import { Button } from '@/components/ui/button'
import { Warning } from '@phosphor-icons/react/dist/ssr'

export default function QuizNotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-6 text-center">
      <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-warning-50">
        <Warning size={32} className="text-warning" weight="bold" />
      </div>
      <h1 className="mb-2 text-2xl font-bold text-foreground">Session Not Found</h1>
      <p className="mb-8 max-w-sm text-sm text-text-secondary leading-relaxed">
        This quiz session may have expired, been completed, or the link is invalid. 
        Your study progress is automatically saved to your mastery profile.
      </p>
      <div className="flex flex-col gap-3 w-full max-w-xs">
        <Button asChild variant="primary" size="lg">
          <Link href={ROUTES.quiz.root}>Return to Quiz</Link>
        </Button>
        <Button asChild variant="ghost" size="lg">
          <Link href={ROUTES.dashboard.root}>Go to Dashboard</Link>
        </Button>
      </div>
    </div>
  )
}

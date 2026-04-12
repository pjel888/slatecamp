import Link from 'next/link'
import { redirect } from 'next/navigation'

import { canManageContent } from '@/lib/admin/roles'
import { ROUTES } from '@/lib/routes'
import { getAdminDesignProblems } from '@/lib/actions/admin/design-problems'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export const metadata = {
  title: 'Design Problem Question Bank | SlateCamp Admin',
}

const AdminDesignProblemQuestionBankPage = async () => {
  const authorized = await canManageContent()
  if (!authorized) redirect(ROUTES.admin.root)

  const problems = await getAdminDesignProblems()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-foreground">Design Problem Question Bank</h1>
        <p className="text-sm text-muted-foreground">
          Dedicated authoring surface for `design_questions` tied to design problems.
        </p>
      </div>

      <div className="space-y-4">
        {problems.map((problem) => (
          <Card key={problem.problem_id} size="md" className="flex items-center justify-between gap-4">
            <div className="space-y-1">
              <p className="text-xs font-mono text-muted-foreground">{problem.problem_id}</p>
              <h2 className="text-sm font-semibold text-foreground">{problem.title}</h2>
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <span>{problem.building_type}</span>
                <span>Difficulty {problem.difficulty ?? 'N/A'}</span>
                <span>{problem.question_count} questions</span>
              </div>
            </div>
            <Button asChild size="sm">
              <Link href={`/admin/knowledge/questions/design-problems/${problem.problem_id}`}>
                Open Design Problem Editor
              </Link>
            </Button>
          </Card>
        ))}
      </div>
    </div>
  )
}

export default AdminDesignProblemQuestionBankPage

import Link from 'next/link'
import { redirect } from 'next/navigation'

import { canManageContent } from '@/lib/admin/roles'
import { ROUTES } from '@/lib/routes'
import { getAdminDesignScenarios } from '@/lib/actions/admin/design-scenarios'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export const metadata = {
  title: 'Scenario Question Bank | SlateCamp Admin',
}

const AdminScenarioQuestionBankPage = async () => {
  const authorized = await canManageContent()
  if (!authorized) redirect(ROUTES.admin.root)

  const scenarios = await getAdminDesignScenarios()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-foreground">Scenario Question Bank</h1>
          <p className="text-sm text-muted-foreground">
            Dedicated authoring surface for design/endurance and other scenario-based exception questions.
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {scenarios.map((scenario) => (
          <Card key={scenario.scenario_id} size="md" className="flex items-center justify-between gap-4">
            <div className="space-y-1">
              <p className="text-xs font-mono text-muted-foreground">{scenario.scenario_id}</p>
              <h2 className="text-sm font-semibold text-foreground">{scenario.title}</h2>
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <span>{scenario.building_type}</span>
                <span>{scenario.difficulty || 'Unspecified difficulty'}</span>
                <span>{scenario.question_count} questions</span>
              </div>
            </div>
            <Button asChild size="sm">
              <Link href={`/admin/knowledge/questions/scenarios/${scenario.scenario_id}`}>
                Open Scenario Editor
              </Link>
            </Button>
          </Card>
        ))}
      </div>
    </div>
  )
}

export default AdminScenarioQuestionBankPage

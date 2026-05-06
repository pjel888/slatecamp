import { redirect } from 'next/navigation'
import { ROUTES } from '@/lib/routes'
import { getProfessionalModeData } from '@/lib/actions/professional-mode'
import { DataLayout } from '@/components/layouts/category/DataLayout'
import ProfessionalHub from './_components/ProfessionalHub'

export const metadata = { title: 'Professional Reference' }

const ProfessionalPage = async () => {
  const data = await getProfessionalModeData()
  if (!data) redirect(ROUTES.auth.login)

  return (
    <DataLayout
      hero={{
        subtitle: 'Professional Reference',
        description: 'Reference tools for licensed practicing architects.',
      }}
    >
      <ProfessionalHub accountMode={data.accountMode} />
    </DataLayout>
  )
}

export default ProfessionalPage

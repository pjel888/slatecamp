import { redirect } from 'next/navigation'
import { ROUTES } from '@/lib/routes'
import { getProfessionalModeData } from '@/lib/actions/professional-mode'
import SharedPageLayout from '@/components/layouts/SharedPageLayout'
import ProfessionalHub from './_components/ProfessionalHub'

export const metadata = { title: 'Professional Reference' }

const ProfessionalPage = async () => {
  const data = await getProfessionalModeData()
  if (!data) redirect(ROUTES.auth.login)

  return (
    <SharedPageLayout>
      <ProfessionalHub accountMode={data.accountMode} />
    </SharedPageLayout>
  )
}

export default ProfessionalPage

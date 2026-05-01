import { redirect } from 'next/navigation'
import { ROUTES } from '@/lib/routes'

interface SetupPageProps {
  params: Promise<{ mode: string }>
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

const toQueryString = (searchParams: Record<string, string | string[] | undefined>) => {
  const params = new URLSearchParams()
  Object.entries(searchParams).forEach(([key, value]) => {
    if (typeof value === 'string') {
      params.set(key, value)
      return
    }

    value?.forEach((entry) => params.append(key, entry))
  })

  const queryString = params.toString()
  return queryString ? `?${queryString}` : ''
}

const LegacyQuizSetupPage = async ({ params, searchParams }: SetupPageProps) => {
  const { mode } = await params
  const resolvedSearchParams = await searchParams
  redirect(`${ROUTES.dashboard.quizSetup(mode)}${toQueryString(resolvedSearchParams)}`)
}

export default LegacyQuizSetupPage

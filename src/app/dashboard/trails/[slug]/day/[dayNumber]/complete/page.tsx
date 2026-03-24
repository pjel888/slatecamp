import { redirect } from 'next/navigation'

const CompleteRedirect = async ({ params }: { params: Promise<{ slug: string; dayNumber: string }> }) => {
  const { slug, dayNumber } = await params
  redirect(`/dashboard/camptrails/${slug}/day/${dayNumber}/complete`)
}

export default CompleteRedirect

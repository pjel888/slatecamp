import { redirect } from 'next/navigation'

const DayRedirect = async ({ params }: { params: Promise<{ slug: string; dayNumber: string }> }) => {
  const { slug } = await params
  redirect(`/dashboard/camptrails/${slug}/today`)
}

export default DayRedirect

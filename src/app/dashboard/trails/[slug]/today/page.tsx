import { redirect } from 'next/navigation'

const TrailTodayRedirect = async ({ params }: { params: Promise<{ slug: string }> }) => {
  const { slug } = await params
  redirect(`/dashboard/camptrails/${slug}/today`)
}

export default TrailTodayRedirect

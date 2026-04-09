import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { fetchNotifications } from '@/lib/queries/notifications'
import { NotificationList } from '@/components/notifications/NotificationList'
import { ROUTES } from '@/lib/routes'

export const metadata = { title: 'Notifications — SlateCamp' }

const NotificationsPage = async () => {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect(ROUTES.LOGIN)

  const { data: notifications } = await fetchNotifications(user.id, { limit: 20 })

  return <NotificationList initialNotifications={notifications ?? []} />
}

export default NotificationsPage

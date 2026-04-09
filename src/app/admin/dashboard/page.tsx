import { redirect } from 'next/navigation'
import { ROUTES } from '@/lib/routes'

// /admin/dashboard now redirects to /admin (the admin overview)
const AdminDashboardRedirect = () => {
  redirect(ROUTES.admin.root)
}

export default AdminDashboardRedirect

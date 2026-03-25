import {
  Home,
  Map,
  Tent,
  BookOpen,
  FlaskConical,
  StickyNote,
  Flame,
  Settings,
  User,
  LayoutDashboard,
  Users,
  FileText,
  Flag,
  BarChart3,
  Route,
  BookMarked,
  Beaker,
  DollarSign,
  TrendingUp,
  Target,
  Package,
  Building2,
} from 'lucide-react'
import type { RoleConfig, UserRole } from '@/types/layout'

// ── Student Navigation ──

const studentConfig: RoleConfig = {
  role: 'student',
  shellTitle: 'SlateCamp',
  allowedRoles: ['student', 'admin', 'ceo', 'super_admin'],
  fallbackRedirect: '/login',
  sections: [
    {
      label: 'Your Camp',
      items: [
        { label: 'Home', href: '/dashboard', icon: Home },
        { label: 'Your Map', href: '/dashboard/heatmap', icon: Map },
        { label: 'Camp Trail', href: '/dashboard/trail', icon: Tent },
      ],
    },
    {
      label: 'Learn',
      items: [
        { label: 'Wiki', href: '/dashboard/wiki', icon: BookOpen },
        { label: '3D Lab', href: '/dashboard/3d-lab', icon: FlaskConical },
        { label: 'Notes', href: '/dashboard/notes', icon: StickyNote },
      ],
    },
    {
      label: 'Community',
      items: [
        { label: 'Campfire', href: '/dashboard/campfire', icon: Flame },
      ],
    },
  ],
  footerItems: [
    { label: 'Settings', href: '/dashboard/settings', icon: Settings },
    { label: 'Profile', href: '/dashboard/profile', icon: User },
  ],
}

// ── Admin Navigation ──

const adminConfig: RoleConfig = {
  role: 'admin',
  shellTitle: 'Admin Panel',
  allowedRoles: ['admin', 'super_admin'],
  fallbackRedirect: '/dashboard',
  sections: [
    {
      label: 'Operations',
      items: [
        { label: 'Overview', href: '/admin', icon: LayoutDashboard },
        { label: 'Users', href: '/admin/users', icon: Users },
        { label: 'Content', href: '/admin/content', icon: FileText },
        { label: 'Reports', href: '/admin/reports', icon: Flag },
      ],
    },
    {
      label: 'Platform',
      items: [
        { label: 'Analytics', href: '/admin/analytics', icon: BarChart3 },
        { label: 'Trail Editor', href: '/admin/trail', icon: Route },
        { label: 'Wiki Editor', href: '/admin/wiki', icon: BookMarked },
        { label: 'Quiz Bank', href: '/admin/quiz-bank', icon: Beaker },
      ],
    },
  ],
  footerItems: [
    { label: 'Settings', href: '/admin/settings', icon: Settings },
  ],
}

// ── CEO Navigation ──

const ceoConfig: RoleConfig = {
  role: 'ceo',
  shellTitle: 'CEO Dashboard',
  allowedRoles: ['ceo', 'super_admin'],
  fallbackRedirect: '/dashboard',
  sections: [
    {
      label: 'Business',
      items: [
        { label: 'Dashboard', href: '/ceo', icon: LayoutDashboard },
        { label: 'Revenue', href: '/ceo/revenue', icon: DollarSign },
        { label: 'Growth', href: '/ceo/growth', icon: TrendingUp },
      ],
    },
    {
      label: 'Product',
      items: [
        { label: 'Users', href: '/ceo/users', icon: Users },
        { label: 'Outcomes', href: '/ceo/outcomes', icon: Target },
        { label: 'Content', href: '/ceo/content', icon: Package },
      ],
    },
    {
      label: 'Operations',
      items: [
        { label: 'Team', href: '/ceo/team', icon: Building2 },
      ],
    },
  ],
  footerItems: [
    { label: 'Settings', href: '/ceo/settings', icon: Settings },
  ],
}

// ── Role Config Registry ──

const roleConfigs: Record<UserRole, RoleConfig> = {
  student: studentConfig,
  admin: adminConfig,
  ceo: ceoConfig,
}

export const getRoleConfig = (role: UserRole): RoleConfig => roleConfigs[role]

export { studentConfig, adminConfig, ceoConfig }

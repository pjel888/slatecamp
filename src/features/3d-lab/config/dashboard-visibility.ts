/**
 * Dashboard Visibility Configuration
 *
 * Controls which 3D Lab modules are visible on the public
 * /dashboard/3d-lab route. All other modules remain accessible
 * via /admin/3d-models but are hidden from standard users.
 *
 * To show a module on the dashboard, add its ID to this set.
 * To restore the full category drill-down, clear the set.
 */
export const DASHBOARD_VISIBLE_IDS: ReadonlySet<string> = new Set([
  'site-development-controls',
  'stairway-configurator',
  'calculator-flooring',
  'unified-wall-configurator',
])

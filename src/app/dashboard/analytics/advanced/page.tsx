import { redirect } from 'next/navigation'
import {
  DEFAULT_ANALYTICS_TAB_ID,
  getAnalyticsTabHref,
} from '@/lib/analytics/tabs'

const AdvancedAnalyticsPage = async () => {
  redirect(getAnalyticsTabHref(DEFAULT_ANALYTICS_TAB_ID))
}

export default AdvancedAnalyticsPage

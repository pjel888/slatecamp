'use client'

import * as React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { SCIcon } from '@/components/graphics/icons/Icon'
import { Bell } from '@phosphor-icons/react/dist/ssr'
import { toast } from '@/lib/hooks/use-toast'
import { updateEmailPreferences } from '@/lib/actions/email-preferences'

interface NotificationsCardProps {
  initialEmailNotifications: boolean
  initialMarketingEmails: boolean
}

export const NotificationsCard = ({
  initialEmailNotifications,
  initialMarketingEmails,
}: NotificationsCardProps) => {
  const [emailNotifications, setEmailNotifications] = React.useState(initialEmailNotifications)
  const [marketingEmails, setMarketingEmails] = React.useState(initialMarketingEmails)
  const [saving, setSaving] = React.useState(false)

  const handleToggle = async (
    field: 'email_notifications_enabled' | 'marketing_emails_enabled',
    value: boolean
  ) => {
    if (saving) return
    setSaving(true)

    if (field === 'email_notifications_enabled') setEmailNotifications(value)
    else setMarketingEmails(value)

    try {
      const result = await updateEmailPreferences({ [field]: value })
      if (result.error) {
        // Revert optimistic update
        if (field === 'email_notifications_enabled') setEmailNotifications(!value)
        else setMarketingEmails(!value)
        toast({ title: 'Error', description: result.error, variant: 'error' })
      } else {
        toast({ title: 'Saved', description: 'Notification preferences updated.', variant: 'success' })
      }
    } finally {
      setSaving(false)
    }
  }

  return (
    <Card className='border-border shadow-sm overflow-hidden'>
      <CardHeader className='bg-muted/50 border-b border-border'>
        <div className='flex items-center gap-3'>
          <div className='bg-primary/10 p-2 rounded-md'>
            <SCIcon icon={Bell} size='md' className='text-primary' />
          </div>
          <div>
            <CardTitle className='text-base font-bold'>Notifications</CardTitle>
            <p className='text-xs text-muted-foreground'>
              Control which emails we send you.
            </p>
          </div>
        </div>
      </CardHeader>

      <CardContent className='p-0'>
        <div className='divide-y divide-border'>
          <div className='flex items-center justify-between px-6 py-4'>
            <div>
              <p className='text-sm font-medium text-foreground'>Email notifications</p>
              <p className='text-xs text-muted-foreground mt-0.5'>
                Session reminders, readiness updates, and progress alerts.
              </p>
            </div>
            <Switch
              checked={emailNotifications}
              onCheckedChange={(checked) =>
                handleToggle('email_notifications_enabled', checked)
              }
              disabled={saving}
              aria-label='Toggle email notifications'
            />
          </div>

          <div className='flex items-center justify-between px-6 py-4'>
            <div>
              <p className='text-sm font-medium text-foreground'>Product updates</p>
              <p className='text-xs text-muted-foreground mt-0.5'>
                New features, tips, and occasional announcements from SlateCamp.
              </p>
            </div>
            <Switch
              checked={marketingEmails}
              onCheckedChange={(checked) =>
                handleToggle('marketing_emails_enabled', checked)
              }
              disabled={saving}
              aria-label='Toggle product update emails'
            />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

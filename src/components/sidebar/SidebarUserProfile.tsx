'use client'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from '@/components/ui/tooltip'
import { ICON_BOX, type SidebarUserProfileProps } from './types'

const getInitials = (name: string, email?: string): string => {
  if (name?.trim()) {
    const parts = name.trim().split(/\s+/)
    if (parts.length >= 2)
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
    return name.slice(0, 2).toUpperCase()
  }
  if (email) return email.slice(0, 2).toUpperCase()
  return 'U'
}

// ---------------------------------------------------------------------------
// SidebarUserProfile
// ---------------------------------------------------------------------------
// No border — parent adds dividers for consistent inset lines.
// ---------------------------------------------------------------------------

export const SidebarUserProfile = ({
  name,
  avatarUrl,
  collapsed,
}: SidebarUserProfileProps) => {
  const initials = getInitials(name)

  const avatar = (
    <div className={ICON_BOX}>
      <Avatar className="h-7 w-7 border border-border shadow-sm">
        {avatarUrl ? <AvatarImage src={avatarUrl} alt={name} /> : null}
        <AvatarFallback className="bg-[#EEF2FC] text-xs font-medium text-[#1A2332]">
          {initials}
        </AvatarFallback>
      </Avatar>
    </div>
  )

  if (collapsed) {
    return (
      <div className="py-2">
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="flex items-center justify-start gap-2.5 px-2 py-[5px] rounded-sm">
              {avatar}
            </div>
          </TooltipTrigger>
          <TooltipContent
            side="right"
            sideOffset={12}
            className="bg-[#1A2332] text-white font-medium text-xs"
          >
            {name}
          </TooltipContent>
        </Tooltip>
      </div>
    )
  }

  return (
    <div className="py-2">
      <div className="flex items-center gap-2.5 px-2 py-[5px] rounded-sm">
        {avatar}
        <div className="min-w-0 flex-1">
          <p className="truncate text-[13px] font-medium text-[#1A2332]">
            {name}
          </p>
        </div>
      </div>
    </div>
  )
}

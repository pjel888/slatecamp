import * as React from 'react'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'

interface UserAvatarProps {
  displayName?: string | null
  avatarUrl?: string | null
  size?: 'sm' | 'default' | 'lg'
  className?: string
}

/**
 * A shared user avatar component that handles image loading and initials fallback.
 * Uses the project's base Avatar primitives.
 */
export const UserAvatar = ({
  displayName,
  avatarUrl,
  size = 'default',
  className,
}: UserAvatarProps) => {
  const initials = displayName
    ? displayName
        .split(' ')
        .map((w) => w[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : '?'

  return (
    <Avatar size={size} className={className}>
      {avatarUrl && (
        <AvatarImage src={avatarUrl} alt={displayName ?? 'User avatar'} />
      )}
      <AvatarFallback>{initials}</AvatarFallback>
    </Avatar>
  )
}

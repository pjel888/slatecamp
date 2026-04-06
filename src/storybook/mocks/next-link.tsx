'use client'

import { forwardRef, type AnchorHTMLAttributes, type MouseEvent } from 'react'
import { useRouter } from './next-navigation'

interface StorybookNextLinkProps
  extends Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'href'> {
  href: string | URL
  prefetch?: boolean
  replace?: boolean
  scroll?: boolean
}

const toHrefString = (href: string | URL) =>
  typeof href === 'string' ? href : href.toString()

const Link = forwardRef<HTMLAnchorElement, StorybookNextLinkProps>(
  ({ href, onClick, replace = false, children, ...props }, ref) => {
    const router = useRouter()
    const nextHref = toHrefString(href)

    const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
      onClick?.(event)

      if (event.defaultPrevented) {
        return
      }

      if (
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey ||
        props.target === '_blank' ||
        nextHref.startsWith('http') ||
        nextHref.startsWith('mailto:') ||
        nextHref.startsWith('#')
      ) {
        return
      }

      event.preventDefault()

      if (replace) {
        router.replace(nextHref)
        return
      }

      router.push(nextHref)
    }

    return (
      <a ref={ref} href={nextHref} onClick={handleClick} {...props}>
        {children}
      </a>
    )
  },
)

Link.displayName = 'StorybookNextLink'

export default Link
export type { StorybookNextLinkProps as LinkProps }

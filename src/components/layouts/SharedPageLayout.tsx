import React from 'react'
import { DottedGridOverlay } from '@/components/marketing/LandingPrimitives'

interface SharedPageLayoutProps {
  children: React.ReactNode
  showDottedGrid?: boolean
}

const SharedPageLayout = ({
  children,
  showDottedGrid = true,
}: SharedPageLayoutProps) => {
  return (
    <div className='relative flex h-full min-h-full w-full'>
      {showDottedGrid && <DottedGridOverlay />}
      <div className='relative z-10 flex h-full min-h-0 w-full flex-1 flex-col p-2'>
        <div className='flex min-h-0 flex-1 flex-col'>{children}</div>
      </div>
    </div>
  )
}

export default SharedPageLayout

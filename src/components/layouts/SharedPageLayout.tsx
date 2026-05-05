import React from 'react'
import { DottedGridOverlay } from '@/components/marketing/LandingPrimitives'

const SharedPageLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className='relative flex h-full min-h-full w-full'>
      <DottedGridOverlay />
      <div className='relative z-10 flex h-full min-h-0 w-full flex-1 flex-col p-2 xl:p-3'>
        <div className='flex min-h-0 flex-1 flex-col'>{children}</div>
      </div>
    </div>
  )
}

export default SharedPageLayout

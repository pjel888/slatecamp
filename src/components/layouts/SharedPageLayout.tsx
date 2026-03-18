import React from 'react'
import { DottedGridOverlay } from '@/components/marketing/LandingPrimitives'

const SharedPageLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className='relative h-full w-full bg-page-bg'>
      <DottedGridOverlay />
      <div className='relative z-10 flex flex-col p-2 xl:p-3 h-full'>
        <div className='flex flex-col flex-1 min-h-0'>{children}</div>
      </div>
    </div>
  )
}

export default SharedPageLayout

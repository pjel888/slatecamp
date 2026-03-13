import React from 'react'
import { DottedGridOverlay } from '../marketing/LandingPrimitives'

const SharedPageLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className='relative flex flex-col h-full overflow-scroll bg-zinc-50 p-2 '>
      <div className='z-10'> {children}</div>
      <DottedGridOverlay />
    </div>
  )
}

export default SharedPageLayout

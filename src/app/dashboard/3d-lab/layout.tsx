'use client'

import React from 'react'
import { ExploreLayout } from '@/components/layouts/category/ExploreLayout'

const ThreeDLabLayoutPage = ({ children }: { children: React.ReactNode }) => {
  return (
    <ExploreLayout
      hero={{
        subtitle: '3D Lab',
        description: 'Explore architectural concepts in interactive 3D.',
      }}
      fullHeight
    >
      {children}
    </ExploreLayout>
  )
}

export default ThreeDLabLayoutPage

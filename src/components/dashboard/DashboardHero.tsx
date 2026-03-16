'use client'

import GradientImage from './GradientImage'

export const DashboardHero = ({
  userName = 'Philip',
}: {
  userName?: string
}) => {
  return (
    <div className='w-full rounded-sm relative h-[200px] shrink-0 mb-2 bg-zinc-950 border border-zinc-800 overflow-hidden'>
      {/* Animated Gradient Background */}
      <div className='absolute inset-0 z-0'>
        <GradientImage />
        {/* Subtle dark vignette to ensure text readability */}
        <div className='absolute inset-0 bg-linear-to-t from-zinc-950/60 via-transparent to-transparent' />
      </div>

      {/* Subtle Grid Overlay */}
      <div
        className='absolute inset-0 opacity-[0.05] z-10 pointer-events-none'
        style={{
          backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }}
      />

      {/* Content */}
      <div className='absolute bottom-6 left-6 z-20'>
        <h1 className='text-white text-xl md:text-2xl font-medium tracking-tight drop-shadow-sm'>
          Hello, {userName}. <br /> Are you ready to work today?
        </h1>
      </div>
    </div>
  )
}

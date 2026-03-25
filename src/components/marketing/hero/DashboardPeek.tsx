'use client'

export const DashboardPeek = () => (
  <div className='relative mx-auto w-full max-w-[900px] pt-2 landing-reveal landing-delay-2'>
    <div className='relative h-[140px] overflow-hidden rounded-t-[10px] border border-b-0 border-[#E5E7EB] bg-[#FFFFFF] shadow-[0_-8px_30px_rgba(0,0,0,0.06)]'>
      {/* Fake window chrome */}
      <div className='flex items-center gap-1.5 border-b border-[#E5E7EB] bg-[#F5F5F5] px-4 py-2.5'>
        <div className='h-2.5 w-2.5 rounded-full bg-[#E63329]' />
        <div className='h-2.5 w-2.5 rounded-full bg-[#F5A623]' />
        <div className='h-2.5 w-2.5 rounded-full bg-[#1B7A3C]' />
        <span className='ml-3 font-[family-name:var(--font-dm-mono)] text-[11px] text-[#6B6B6B]'>
          SlateCamp Dashboard
        </span>
      </div>
      {/* Fake dashboard content */}
      <div className='flex gap-4 px-5 py-3'>
        {/* Sidebar */}
        <div className='hidden w-[140px] shrink-0 space-y-2 sm:block'>
          <div className='h-2 w-20 rounded bg-[#E5E7EB]' />
          <div className='h-2 w-16 rounded bg-[#E5E7EB]' />
          <div className='h-2 w-24 rounded bg-[#E5E7EB]' />
          <div className='h-2 w-20 rounded bg-[#E5E7EB]' />
        </div>
        {/* Main Content */}
        <div className='flex-1 space-y-2'>
          <div className='flex gap-3'>
            <div className='h-14 w-14 shrink-0 rounded-md bg-[#E5E7EB]' />
            <div className='flex-1 space-y-1.5 pt-1'>
              <div className='h-2.5 w-32 rounded bg-[#E5E7EB]' />
              <div className='h-2 w-48 rounded bg-[#E5E7EB]' />
            </div>
          </div>
          <div className='flex gap-2'>
            {[
              'bg-[#1B7A3C]',
              'bg-camp-cobalt',
              'bg-camp-cobalt',
              'bg-[#1B7A3C]',
              'bg-[#1B7A3C]',
              'bg-camp-cobalt',
            ].map((colorClass, i) => (
              <div
                key={i}
                className={`h-6 w-6 shrink-0 rounded-full opacity-20 ${colorClass}`}
                role='img'
                aria-label={`Mockup element ${i + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
      {/* Gradient fade at the bottom */}
      <div className='pointer-events-none absolute inset-x-0 bottom-0 h-12 bg-linear-to-t from-[#FFFFFF] to-transparent' />
    </div>
  </div>
)

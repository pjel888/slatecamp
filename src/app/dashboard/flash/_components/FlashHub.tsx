import Link from 'next/link'
import type { FlashCategory } from '@/lib/flash-cards'

interface FlashHubProps {
  categories: FlashCategory[]
}

export const FlashHub = ({ categories }: FlashHubProps) => {
  return (
    <div className='flex flex-col gap-4 w-full'>
      <div className='flex flex-col gap-1'>
        <h1 className='text-xl font-semibold text-[#1A2332]'>ALE Numbers Flash</h1>
        <p className='text-sm text-[#4A5568]'>
          Critical code numbers for the Architect Licensure Examination. Tap a category to start.
        </p>
      </div>

      <div className='grid grid-cols-1 sm:grid-cols-2 gap-2'>
        {categories.map((cat) => (
          <Link
            key={cat.id}
            href={`/dashboard/flash/${cat.id}`}
            className='group flex flex-col gap-1 rounded-md border border-[#D4DAE3] bg-white p-4 transition-shadow duration-150 ease-out hover:shadow-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1B3FC4]'
          >
            <div className='flex items-center justify-between'>
              <span className='text-sm font-semibold text-[#1A2332] group-hover:text-[#1B3FC4] transition-colors duration-150'>
                {cat.label}
              </span>
              <span className='text-xs tabular-nums text-[#8896A7]'>
                {cat.cardCount} cards
              </span>
            </div>
            <p className='text-xs text-[#4A5568]'>{cat.description}</p>
          </Link>
        ))}
      </div>
    </div>
  )
}

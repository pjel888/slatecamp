'use client'

import React from 'react'
import { BookOpen, MagnifyingGlass, Sparkle, Lightning } from '@phosphor-icons/react'
import { SCIcon } from '@/components/graphics/icons/Icon'

export default function WikiPage() {
  return (
    <div className='flex h-full w-full items-center justify-center p-6'>
      <div className='max-w-2xl w-full text-center space-y-8'>
        {/* Hero Icon */}
        <div className='mx-auto w-20 h-20 bg-[#EEF2FC] rounded-md flex items-center justify-center border border-primary/20 shadow-sm'>
          <SCIcon icon={BookOpen} size="2xl" className='text-primary' />
        </div>

        {/* Text Content */}
        <div className='space-y-3'>
          <h1 className='text-xl font-bold tracking-tight text-zinc-900'>
            Knowledge Wiki
          </h1>
          <p className='text-zinc-500 text-sm leading-relaxed'>
            Access the authoritative guide for the Architecture Licensure Exam.
            Select a topic from the taxonomy tree on the left to begin your study.
          </p>
        </div>

        {/* Feature Grid */}
        <div className='grid grid-cols-1 md:grid-cols-3 gap-4 text-left'>
          <div className='p-4 bg-white rounded-md border border-zinc-100 shadow-sm space-y-2'>
            <div className='w-8 h-8 bg-amber-50 rounded-md flex items-center justify-center'>
              <SCIcon icon={MagnifyingGlass} size="sm" className='text-amber-600' />
            </div>
            <h3 className='text-xs font-bold uppercase tracking-wider text-zinc-900'>Syllabus Mapped</h3>
            <p className='text-xs text-zinc-500 leading-relaxed'>Every article is aligned strictly with the 8 ALE root categories.</p>
          </div>

          <div className='p-4 bg-white rounded-md border border-zinc-100 shadow-sm space-y-2'>
            <div className='w-8 h-8 bg-[#EEF2FC] rounded-md flex items-center justify-center'>
              <SCIcon icon={Sparkle} size="sm" className='text-primary' />
            </div>
            <h3 className='text-xs font-bold uppercase tracking-wider text-zinc-900'>Interactive</h3>
            <p className='text-xs text-zinc-500 leading-relaxed'>Complex codes come alive with 2D illustrations and 3D spatial lab models.</p>
          </div>

          <div className='p-4 bg-white rounded-md border border-zinc-100 shadow-sm space-y-2'>
            <div className='w-8 h-8 bg-green-50 rounded-md flex items-center justify-center'>
              <SCIcon icon={Lightning} size="sm" className='text-green-600' />
            </div>
            <h3 className='text-xs font-bold uppercase tracking-wider text-zinc-900'>Smart Search</h3>
            <p className='text-xs text-zinc-500 leading-relaxed'>Quickly find any provision or term across the entire building code.</p>
          </div>
        </div>

        {/* Footer Hint */}
        <div className='pt-8 border-t border-zinc-100'>
          <p className='text-sm text-zinc-400'>
            Tip: Use the sidebar to expand categories and find specific articles.
          </p>
        </div>
      </div>
    </div>
  )
}

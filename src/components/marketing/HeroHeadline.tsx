'use client'

import { useEffect, useRef } from 'react'
import { annotate } from 'rough-notation'

const H1_CLASS =
  'landing-reveal landing-delay-1 mt-6 text-[clamp(3rem,8vw,5rem)] text-md font-bold leading-[0.92] tracking-[-0.03em] text-[#1D1D1F]'

export function HeroHeadline() {
  const knowRef = useRef<HTMLSpanElement>(null)
  const winRef = useRef<HTMLSpanElement>(null)
  const youllRef = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    if (!knowRef.current || !winRef.current || !youllRef.current) return
    const knowAnnotation = annotate(knowRef.current, {
      type: 'highlight',
      color: '#1f3055',
      strokeWidth: 2,
      animationDuration: 400,
    })

    const winAnnotation = annotate(winRef.current, {
      type: 'circle',
      color: '#08ed80',
      strokeWidth: 2,
      animationDuration: 400,
    })

    const youllAnnotation = annotate(youllRef.current, {
      type: 'underline',
      color: '#0875ed',
      strokeWidth: 2,
      animationDuration: 400,
    })

    const t = setTimeout(() => {
      knowAnnotation.show()
      youllAnnotation.show()
      winAnnotation.show()
    }, 700)
    return () => {
      clearTimeout(t)
      knowAnnotation.remove()
      winAnnotation.remove()
      youllAnnotation.remove()
    }
  }, [])

  return (
    <h1 className={H1_CLASS}>
      <span ref={youllRef}>
        <span ref={knowRef} className='text-neutral-200'>
          {' '}
          Know{' '}
        </span>{' '}
        you&apos;ll
        <span ref={winRef}>
          {' '}
          win <span className='text-signal-amber'>.</span>
        </span>
      </span>{' '}
    </h1>
  )
}

'use client'

import { useEffect, useRef } from 'react'
import { annotate } from 'rough-notation'

const H1_CLASS =
  'landing-reveal landing-delay-1 text-[clamp(3rem,8vw,5rem)]  font-bold leading-[0.92] tracking-[-0.03em] text-zinc-900'

export const HeroHeadline = () => {
  const knowRef = useRef<HTMLSpanElement>(null)
  const winRef = useRef<HTMLSpanElement>(null)
  const youllRef = useRef<HTMLSpanElement>(null)
  const taglineRef = useRef<HTMLParagraphElement>(null)

  useEffect(() => {
    if (!knowRef.current || !winRef.current || !youllRef.current) return

    const winAnnotation = annotate(winRef.current, {
      type: 'circle',
      color: '#2563eb',
      strokeWidth: 2,
      animationDuration: 400,
    })

    const youllAnnotation = annotate(youllRef.current, {
      type: 'underline',
      color: '#2563eb',
      strokeWidth: 2,
      animationDuration: 400,
    })

    const taglineAnnotation = annotate(taglineRef.current, {
      type: 'highlight',
      color: '#2563eb',
      strokeWidth: 2,
      animationDuration: 400,
    })

    const t = setTimeout(() => {
      youllAnnotation.show()
      winAnnotation.show()
      taglineAnnotation.show()
    }, 700)
    return () => {
      clearTimeout(t)
      winAnnotation.remove()
      youllAnnotation.remove()
      taglineAnnotation.remove()
    }
  }, [])

  return (
    <>
      <h1 className={H1_CLASS}>
        <span ref={youllRef}>
          <span ref={knowRef}> Know you&apos;re </span>
          <span ref={winRef}>ready.</span>
        </span>
      </h1>
      <div className='pt-2'>
        <p
          ref={taglineRef}
          className='landing-reveal landing-delay-2 mt-6 max-w-lg text-sm leading-relaxed text-white font-medium w-fit px-2'
        >
          Study with precision. Win with confidence.
        </p>
      </div>
    </>
  )
}

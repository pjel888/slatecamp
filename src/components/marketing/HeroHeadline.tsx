'use client'

import { useEffect, useRef } from 'react'
import { annotate } from 'rough-notation'

const H1_CLASS =
  'landing-reveal landing-delay-1 font-syne text-[clamp(3rem,8vw,5.8rem)] font-extrabold leading-[0.92] text-zinc-900'

export const HeroHeadline = () => {
  const knowRef = useRef<HTMLSpanElement>(null)
  const winRef = useRef<HTMLSpanElement>(null)
  const youllRef = useRef<HTMLSpanElement>(null)
  const taglineRef = useRef<HTMLParagraphElement>(null)

  useEffect(() => {
    if (
      !knowRef.current ||
      !winRef.current ||
      !youllRef.current ||
      !taglineRef.current
    )
      return

    const winAnnotation = annotate(winRef.current, {
      type: 'circle',
      color: '#1B7A3C',
      strokeWidth: 4,
      animationDuration: 200,
    })

    const youllAnnotation = annotate(youllRef.current, {
      type: 'underline',
      color: '#1B3FC4',
      strokeWidth: 4,
      animationDuration: 200,
    })

    const taglineAnnotation = annotate(taglineRef.current, {
      type: 'highlight',
      color: 'oklch(92.9% 0.013 255.508)',
      strokeWidth: 2,
      animationDuration: 200,
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
          <span ref={knowRef}> Know you&apos;ll </span>
          <span ref={winRef}>win.</span>
        </span>
      </h1>
      <div className='pt-2'>
        <p
          ref={taglineRef}
          className='landing-reveal landing-delay-2 mt-6 max-w-lg text-sm leading-relaxed text-primary font-medium w-fit px-2'
        >
          One readiness engine for the ALE — adaptive quizzing, syllabus-mapped
          content, and a score that never lies.
        </p>
      </div>
    </>
  )
}

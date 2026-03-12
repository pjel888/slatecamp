'use client'

import { useEffect, useRef } from 'react'
import { SLATECAMP_COBALT, SLATECAMP_INK } from '@/lib/constants'
import { annotate } from 'rough-notation'

import {
  SLATECAMP_AMBER,
  SLATECAMP_CRIMSON,
  SLATECAMP_EARTH,
  SLATECAMP_EDUCATIONALBLUE,
} from '@/lib/constants/colors'

const H1_CLASS =
  'landing-reveal landing-delay-1 mt-2 text-[clamp(3rem,8vw,5.4rem)] text-md font-bold leading-[0.92] tracking-[-0.03em]'

export const HeroHeadline = () => {
  const knowRef = useRef<HTMLSpanElement>(null)
  const winRef = useRef<HTMLSpanElement>(null)
  const youllRef = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    if (!knowRef.current || !winRef.current || !youllRef.current) return
    // const knowAnnotation = annotate(knowRef.current, {
    //   type: 'highlight',
    //   color: '#1f3055',
    //   strokeWidth: 2,
    //   animationDuration: 400,
    // })

    const winAnnotation = annotate(winRef.current, {
      type: 'circle',
      color: SLATECAMP_AMBER.burntRedOrange,
      strokeWidth: 2,
      animationDuration: 400,
    })

    const youllAnnotation = annotate(youllRef.current, {
      type: 'underline',
      color: SLATECAMP_AMBER.DEFAULT,
      strokeWidth: 2,
      animationDuration: 400,
    })

    const t = setTimeout(() => {
      // knowAnnotation.show()
      youllAnnotation.show()
      winAnnotation.show()
    }, 700)
    return () => {
      clearTimeout(t)
      // knowAnnotation.remove()
      winAnnotation.remove()
      youllAnnotation.remove()
    }
  }, [])

  return (
    <h1 className={H1_CLASS} style={{ color: SLATECAMP_INK.mauveCharcoal }}>
      {/* <h1 className={H1_CLASS} style={{ color: SLATECAMP_AMBER.DEFAULT }}> */}
      <span ref={youllRef}>
        <span ref={knowRef}>
          {' '}
          Know you&apos;ll
          <span ref={winRef}> win. </span>
        </span>
      </span>
    </h1>
  )
}

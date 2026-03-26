'use client'

import { SlideToSubmit } from '@/components/quiz-v2/SlideToSubmit'

export const SlideToSubmitPreview = () => {
  return <SlideToSubmit onSubmit={() => alert('Submitted!')} label="Slide to submit" />
}

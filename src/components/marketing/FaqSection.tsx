'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'
import { Accordion, AccordionItem } from '@/components/ui/accordion'

export interface FaqItem {
  question: string
  answer: string
}

export interface FaqSectionProps {
  questions: FaqItem[]
  heading?: string
  subheading?: string
  variant?: 'grid' | 'accordion'
  className?: string
}

export const FaqSection = ({
  questions,
  heading = 'Frequently asked questions',
  subheading,
  variant = 'accordion',
  className,
}: FaqSectionProps) => (
  <section className={cn('py-12 px-4 mx-auto max-w-screen-xl', className)}>
    <div className="mb-8">
      <h2 className="font-display text-3xl font-extrabold text-foreground mb-2">
        {heading}
      </h2>
      {subheading && (
        <p className="text-muted-foreground">{subheading}</p>
      )}
    </div>

    {variant === 'accordion' ? (
      <Accordion>
        {questions.map((item) => (
          <AccordionItem key={item.question} title={item.question}>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {item.answer}
            </p>
          </AccordionItem>
        ))}
      </Accordion>
    ) : (
      <div className="grid sm:grid-cols-2 gap-6">
        {questions.map((item) => (
          <div
            key={item.question}
            className="rounded-md border border-border bg-card p-6"
          >
            <h3 className="text-base font-medium text-foreground mb-2">
              {item.question}
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {item.answer}
            </p>
          </div>
        ))}
      </div>
    )}
  </section>
)

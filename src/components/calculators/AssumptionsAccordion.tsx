// src/app/calculators/_components/AssumptionsAccordion.tsx
// Collapsible assumptions list shown below calculation results.
'use client'

import { Accordion, AccordionItem } from '@/components/ui/accordion'

interface AssumptionsAccordionProps {
  assumptions: string[]
}

export function AssumptionsAccordion({ assumptions }: AssumptionsAccordionProps) {
  if (assumptions.length === 0) return null

  return (
    <Accordion>
      <AccordionItem title="Assumptions">
        <ul className="space-y-1">
          {assumptions.map((a, i) => (
            <li
              key={i}
              className="font-sans text-xs leading-relaxed text-muted-foreground"
            >
              {a}
            </li>
          ))}
        </ul>
      </AccordionItem>
    </Accordion>
  )
}

import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, test } from 'bun:test'

import { WikiLearningCompletion, WikiLearningJourney } from './WikiLearningJourney'
import type { TocHeading } from '@/lib/wiki-markdown'

const headings: TocHeading[] = [
  { id: 'orientation', text: 'Orientation', level: 2 },
  { id: 'core-rule', text: 'Core Rule', level: 2 },
  { id: 'common-exception', text: 'Common Exception', level: 3 },
]

describe('WikiLearningJourney', () => {
  test('renders a structured learning module from article headings without turning it into a summary', () => {
    const markup = renderToStaticMarkup(
      <WikiLearningJourney
        title="Accessible Door Clearances"
        subject="Building Laws"
        difficulty="Intermediate"
        readTime="8 min"
        whyItMatters="recognize clearance requirements in exam and practice scenarios."
        nodeName="Door Clearances"
        headings={headings}
        relatedTopics={[{ slug: 'corridors', title: 'Corridors' }]}
      />,
    )

    expect(markup).toContain('Guided learning module')
    expect(markup).toContain('Learning map')
    expect(markup).toContain('Core Rule')
    expect(markup).toContain('#core-rule')
    expect(markup).toContain('First checkpoint')
    expect(markup.toLowerCase()).not.toContain('summary')
  })

  test('handles missing optional metadata and headings with a fallback checkpoint', () => {
    const markup = renderToStaticMarkup(
      <WikiLearningJourney
        title="Short Article"
        subject="General Knowledge"
        difficulty="Foundational"
        readTime="1 min"
        headings={[]}
      />,
    )

    expect(markup).toContain('This article has no section headings yet')
    expect(markup).toContain('Before moving on')
    expect(markup).not.toContain('undefined')
  })

  test('renders completion prompts as review actions, not a generic recap', () => {
    const markup = renderToStaticMarkup(
      <WikiLearningCompletion
        title="Roman Architecture"
        nodeName="Roman Architecture"
        headings={headings}
      />,
    )

    expect(markup).toContain('Before you leave this article')
    expect(markup).toContain('Explain')
    expect(markup).toContain('Apply')
    expect(markup).toContain('Practice')
    expect(markup).toContain('Questions to revisit')
    expect(markup.toLowerCase()).not.toContain('summary')
  })
})

import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, test } from 'bun:test'

import { HeroCommandBar } from './HeroCommandBar'

describe('HeroCommandBar activity heatmap slot', () => {
  test('keeps the annual activity heatmap visible for zero-readiness users', () => {
    const markup = renderToStaticMarkup(
      <HeroCommandBar
        userName="test"
        readinessScore={0}
        previousScore={null}
        daysUntilExam={null}
        heroStats={[]}
        syllabusCoveragePercent={0}
        readinessMeta={null}
      >
        <div data-testid="activity-heatmap-slot">Study Activity</div>
      </HeroCommandBar>,
    )

    expect(markup).toContain('data-testid="activity-heatmap-slot"')
  })
})

import type { Meta, StoryObj } from '@storybook/react'
import { WikiArticleHero } from '@/components/wiki/article/WikiArticleHero'
import { Callout } from '@/components/wiki/blocks/Callout'
import { FormulaBlock } from '@/components/wiki/blocks/FormulaBlock'
import { InlineQuiz } from '@/components/wiki/blocks/InlineQuiz'
import { KeyValues } from '@/components/wiki/blocks/KeyValues'
import { RevealBlock } from '@/components/wiki/blocks/RevealBlock'
import { SubjectSnapshot } from '@/components/wiki/blocks/SubjectSnapshot'
import { WrongAnswerBanner } from '@/components/wiki/blocks/WrongAnswerBanner'
import { WikiContentShell } from '@/components/wiki/navigation/WikiContentShell'
import { WikiDisciplineProvider } from '@/components/wiki/navigation/WikiDisciplineContext'
import { WikiHeaderClient } from '@/components/wiki/navigation/WikiHeaderClient'
import { WikiNavigationProvider } from '@/components/wiki/navigation/WikiNavigationContext'
import { WikiRightSidebar } from '@/components/wiki/navigation/WikiRightSidebar'
import { RecallDrill } from '@/components/wiki/widgets/bp344/RecallDrill'
import {
  wikiArticleHeroFixture,
  wikiCompositionParagraphs,
  wikiExamTableFixture,
  wikiFormulaStepsFixture,
  wikiHeaderFixture,
  wikiHeadingsFixture,
  wikiInlineQuizOptionsFixture,
  wikiKeyValuesFixture,
  wikiRelatedTopicsFixture,
  wikiSourcesFixture,
  wikiSubjectSnapshotFixture,
} from '@/storybook/fixtures/wiki'
import { WikiExamTable } from '@/components/wiki/blocks/WikiExamTable'

const WikiScene = () => (
  <WikiNavigationProvider>
    <WikiDisciplineProvider
      disciplineId="laws-discipline"
      disciplineName="Building Laws and Ethics"
    >
      <div className="min-h-screen bg-background p-6">
        <div className="mx-auto max-w-7xl overflow-hidden rounded-lg border border-border bg-white shadow-sm">
          <WikiHeaderClient
            {...wikiHeaderFixture}
            mobileActionsContent={
              <div className="space-y-3 p-4 text-sm text-text-secondary">
                <p className="font-medium text-foreground">Mobile article tools</p>
                <p>Review the topic, inspect sources, and jump to the current section.</p>
              </div>
            }
          />
          <div className="grid lg:grid-cols-[minmax(0,1fr)_260px]">
            <WikiContentShell>
              <article
                id="wiki-center-pane"
                className="max-h-[820px] overflow-y-auto px-8 py-8"
              >
                <div className="mx-auto max-w-3xl space-y-8">
                  <WrongAnswerBanner
                    fromWrongAnswer
                    topicName="Occupancy load"
                  />
                  <WikiArticleHero {...wikiArticleHeroFixture} />
                  <section className="space-y-4">
                    <h2
                      id="occupancy-load"
                      className="text-xl font-semibold text-foreground"
                    >
                      Occupancy load drives exit count
                    </h2>
                    {wikiCompositionParagraphs.map((paragraph) => (
                      <p
                        key={paragraph}
                        className="text-sm leading-7 text-text-secondary"
                      >
                        {paragraph}
                      </p>
                    ))}
                    <Callout variant="most-tested">
                      Start with occupant load before checking door widths, corridor assumptions, or rated separations.
                    </Callout>
                  </section>

                  <section className="space-y-4">
                    <h2
                      id="travel-distance"
                      className="text-xl font-semibold text-foreground"
                    >
                      Travel distance shifts by use group
                    </h2>
                    <KeyValues items={wikiKeyValuesFixture} />
                    <WikiExamTable {...wikiExamTableFixture} />
                  </section>

                  <section className="space-y-4">
                    <h3
                      id="sprinkler-exception"
                      className="text-lg font-semibold text-foreground"
                    >
                      Sprinkler exceptions matter
                    </h3>
                    <FormulaBlock
                      label="Exit planning heuristic"
                      steps={wikiFormulaStepsFixture}
                    />
                    <InlineQuiz
                      question="Which pair should you compare first before locking the exit strategy?"
                      options={wikiInlineQuizOptionsFixture}
                      rationale="Occupant load establishes the required egress capacity before you test the exceptions."
                    />
                  </section>

                  <section className="space-y-4">
                    <h2
                      id="separation-rating"
                      className="text-xl font-semibold text-foreground"
                    >
                      Fire separation rating changes assembly choices
                    </h2>
                    <SubjectSnapshot items={wikiSubjectSnapshotFixture} />
                    <RevealBlock prompt="Recall the design consequence before revealing it.">
                      <p className="text-sm leading-7 text-text-secondary">
                        A higher separation rating can change wall construction, door hardware, and the route the problem expects you to choose.
                      </p>
                    </RevealBlock>
                  </section>

                  <section className="space-y-4">
                    <h3
                      id="exam-trap"
                      className="text-lg font-semibold text-foreground"
                    >
                      Typical LEA trap
                    </h3>
                    <p className="text-sm leading-7 text-text-secondary">
                      The exam often changes one variable and expects you to carry that change through the entire exit decision tree.
                    </p>
                    <RecallDrill />
                  </section>
                </div>
              </article>
            </WikiContentShell>

            <aside className="hidden border-l border-border bg-background/60 p-6 lg:block">
              <WikiRightSidebar
                practiceHref="/dashboard/quiz"
                practiceLabel="Review this topic"
                nodeId="storybook-topic"
                articleId={wikiHeaderFixture.articleId}
                topicName="Fire Safety Planning"
                relatedTopics={wikiRelatedTopicsFixture}
                headings={wikiHeadingsFixture}
                articleSlug={wikiHeaderFixture.articleSlug}
                scrollContainerId={wikiHeaderFixture.scrollContainerId}
                sources={wikiSourcesFixture}
              />
            </aside>
          </div>
        </div>
      </div>
    </WikiDisciplineProvider>
  </WikiNavigationProvider>
)

const meta = {
  title: 'Scenes/Wiki/Full Article Layout',
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    appShell: {
      pathname: '/dashboard/wiki/fire-separation-occupancy-exit-strategy',
      withToaster: true,
    },
    docs: {
      description: {
        component:
          'Fixture-driven reference scene for the wiki article shell, navigation, teaching blocks, and widget integration.',
      },
    },
  },
} satisfies Meta

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => <WikiScene />,
}

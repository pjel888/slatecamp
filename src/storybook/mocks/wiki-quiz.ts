import {
  wikiQuizAnswerKeyFixture,
  wikiQuizQuestionsFixture,
} from '@/storybook/fixtures/wiki'

export type WikiQuizMockBehavior = 'questions' | 'empty' | 'error'

let mockBehavior: WikiQuizMockBehavior = 'questions'

export const setWikiQuizMockBehavior = (behavior: WikiQuizMockBehavior) => {
  mockBehavior = behavior
}

export const getWikiQuizQuestions = async (
  _nodeId: string,
  _articleSlug?: string,
) => {
  if (mockBehavior === 'error') {
    throw new Error('Mocked network error')
  }
  if (mockBehavior === 'empty') {
    return { questions: [] as typeof wikiQuizQuestionsFixture, sessionId: 'storybook-session-empty' }
  }
  return { questions: wikiQuizQuestionsFixture, sessionId: 'storybook-session' }
}

export const submitWikiQuizAnswer = async (input: {
  sessionId: string
  questionId: string
  selectedOptionId: string
  timeSpentMs: number
}) => {
  const correctOptionId = wikiQuizAnswerKeyFixture[input.questionId]
  const question = wikiQuizQuestionsFixture.find(
    (item) => item.question_id === input.questionId,
  )
  const correctOption = question?.options.find(
    (option) => option.id === correctOptionId,
  )

  return {
    isCorrect: input.selectedOptionId === correctOptionId,
    correctOptionId,
    rationale: correctOption
      ? `${correctOption.letter} is correct because it matches the article's code-based explanation.`
      : null,
  }
}

export const endWikiQuizSession = async (_sessionId: string) => ({
  correct: 2,
  total: wikiQuizQuestionsFixture.length,
  percent: 67,
})

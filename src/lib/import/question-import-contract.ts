import { validateJSONQuestion } from './question-schema'

export interface ArticleOwnedQuestionJsonDraft {
  questionStem: string
  answerOptions: string[]
  correctOption: string | number
  rationale?: string
  difficulty?: number
}

export const validateArticleOwnedQuestionArray = (
  questions: unknown[],
  topicId: string,
) => {
  questions.forEach((item, index) => {
    const typedItem = item as Partial<ArticleOwnedQuestionJsonDraft>
    const candidate = {
      taxonomy_node_id: topicId,
      question_text: typedItem.questionStem,
      options: typedItem.answerOptions,
      correct_answer: typedItem.correctOption,
      rationale: typedItem.rationale,
      difficulty: typedItem.difficulty ?? 0.5,
    }

    try {
      validateJSONQuestion(candidate)
    } catch (error) {
      throw new Error(
        `Question ${index + 1}: ${error instanceof Error ? error.message : 'Invalid question payload'}`,
      )
    }
  })
}

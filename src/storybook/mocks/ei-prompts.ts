export type EIPrompt = {
  prompt_id: string
  node_id: string | null
  insert_after_heading: string
  prompt_text: string
  reveal_text: string
  options: Array<{ text: string; is_correct: boolean }>
  sort_order: number
}

export type EIResponseMap = Record<
  string,
  {
    response_text: string | null
    selected_option_index: number | null
    responded_at: string
    updated_at: string
  }
>

export const getEIPromptsForArticle = async (_articleId: string): Promise<EIPrompt[]> =>
  []

export const getUserEIResponsesForArticle = async (
  _articleId: string,
): Promise<EIResponseMap> => ({})

export const submitEIResponse = async (_params: {
  promptId: string
  responseText?: string
  selectedOptionIndex?: number
}) => ({ success: true })

export const submitArticleFeedback = async (
  _articleId: string,
  _isHelpful: boolean,
) => true

export const getUserArticleFeedback = async (_articleId: string) =>
  null as 'up' | 'down' | null

export const addWikiHighlight = async (
  _articleId: string,
  _text: string,
  _color = 'yellow',
) => true

export const getWikiHighlights = async (_articleId: string) => []

export const removeWikiHighlight = async (_highlightId: string) => true

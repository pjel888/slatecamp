const ok = async () => ({ success: true })

export const startSession = ok
export const submitAnswer = ok
export const endSession = ok
export const abandonSession = ok
export const skipQuestion = ok
export const flagQuestion = ok
export const getReviewData = async () => null
export const pauseSession = ok
export const resumeSession = ok
export const getConfidenceMatrix = async () => ({ items: [] })
export const savePrediction = ok
export const savePostdiction = ok
export const getPredictionHistory = async () => []
export const getSessionQuestions = async () => []
export const updateSessionProgress = ok
export const checkGenerationAnswer = async () => ({ isCorrect: false, feedback: '' })

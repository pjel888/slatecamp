import type { Question } from "@/types/app";

/**
 * 2-Parameter Logistic IRT model
 * P(correct | θ, a, b) = 1 / (1 + exp(-a * (θ - b)))
 */
export function probabilityCorrect(
  theta: number,
  discrimination: number,
  difficulty: number
): number {
  return 1 / (1 + Math.exp(-discrimination * (theta - difficulty)));
}

export function selectNextQuestion(
  userTheta: number,
  availableQuestions: Question[],
  answeredIds: Set<string>
): Question | null {
  const candidates = availableQuestions.filter(
    (q) => !answeredIds.has(q.id)
  );

  if (candidates.length === 0) return null;

  // P(correct) ≈ 0.75 → θ - b = ln(3)/a
  candidates.sort(
    (a, b) =>
      Math.abs(
        a.difficulty_rating -
          (userTheta - Math.log(3) / (a.discrimination_rating || 1))
      ) -
      Math.abs(
        b.difficulty_rating -
          (userTheta - Math.log(3) / (b.discrimination_rating || 1))
      )
  );

  return candidates[0];
}

export function updateTheta(
  currentTheta: number,
  question: Question,
  isCorrect: boolean
): number {
  const { difficulty_rating: b, discrimination_rating: a } = question;
  const p = probabilityCorrect(currentTheta, a, b);

  const information = a * a * p * (1 - p);
  if (information === 0) return currentTheta;

  const delta = (Number(isCorrect) - p) / information;
  return currentTheta + Math.max(-1, Math.min(1, delta));
}

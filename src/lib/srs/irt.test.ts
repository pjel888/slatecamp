import { expect, test, describe } from "bun:test";
import { probabilityCorrect, updateTheta, selectNextQuestion } from "./irt";
import type { Question } from "@/types/app";

describe("IRT Algorithm", () => {
  test("probabilityCorrect should return ~0.5 when theta equals difficulty", () => {
    const p = probabilityCorrect(0.5, 1.0, 0.5);
    expect(p).toBeCloseTo(0.5);
  });

  test("probabilityCorrect should increase with higher theta", () => {
    const pLow = probabilityCorrect(0.2, 1.0, 0.5);
    const pHigh = probabilityCorrect(0.8, 1.0, 0.5);
    expect(pHigh).toBeGreaterThan(pLow);
  });

  test("updateTheta should increase theta on correct answer", () => {
    const q: Question = {
      question_id: "q1",
      topic_id: "t1",
      text: "Test",
      options: [],
      correct_option_id: "opt-1",
      rationale: null,
      difficulty: 0.5,
      difficulty_rating: 0.5,
      discrimination_rating: 1.0,
      created_at: new Date().toISOString()
    };
    const newTheta = updateTheta(0.5, q, true);
    expect(newTheta).toBeGreaterThan(0.5);
  });

  test("updateTheta should decrease theta on incorrect answer", () => {
    const q: Question = {
      question_id: "q1",
      topic_id: "t1",
      text: "Test",
      options: [],
      correct_option_id: "opt-1",
      rationale: null,
      difficulty: 0.5,
      difficulty_rating: 0.5,
      discrimination_rating: 1.0,
      created_at: new Date().toISOString()
    };
    const newTheta = updateTheta(0.5, q, false);
    expect(newTheta).toBeLessThan(0.5);
  });

  test("selectNextQuestion should pick question closest to target p=0.75", () => {
    const questions: Question[] = [
      {
        question_id: "q-easy",
        topic_id: "t1",
        text: "Easy",
        options: [],
        correct_option_id: "opt-1",
        rationale: null,
        difficulty: 0.1,
        difficulty_rating: 0.1,
        discrimination_rating: 1.0,
        created_at: new Date().toISOString()
      },
      {
        question_id: "q-hard",
        topic_id: "t1",
        text: "Hard",
        options: [],
        correct_option_id: "opt-1",
        rationale: null,
        difficulty: 0.9,
        difficulty_rating: 0.9,
        discrimination_rating: 1.0,
        created_at: new Date().toISOString()
      }
    ];
    
    // For theta=0.5, target difficulty b = theta - ln(3)/a = 0.5 - 1.1/1 = -0.6
    // Easy (0.1) is closer to -0.6 than Hard (0.9)
    const next = selectNextQuestion(0.5, questions, new Set());
    expect(next?.question_id).toBe("q-easy");
  });
});

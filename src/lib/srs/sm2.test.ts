import { expect, test, describe } from "bun:test";
import { calculateNextReview, getQuality } from "./sm2";

describe("SM-2 Algorithm", () => {
  test("calculateNextReview should increase repetitions on success", () => {
    const result = calculateNextReview(4, 0, 2.5, 0);
    expect(result.repetitions).toBe(1);
    expect(result.interval).toBe(1);
  });

  test("calculateNextReview should reset repetitions on failure", () => {
    const result = calculateNextReview(1, 3, 2.5, 10);
    expect(result.repetitions).toBe(0);
    expect(result.interval).toBe(1);
  });

  test("calculateNextReview should increase interval on subsequent successes", () => {
    const res1 = calculateNextReview(4, 0, 2.5, 0); // Rep 1
    const res2 = calculateNextReview(4, 1, res1.easeFactor, res1.interval); // Rep 2
    expect(res2.repetitions).toBe(2);
    expect(res2.interval).toBe(6);
    
    const res3 = calculateNextReview(4, 2, res2.easeFactor, res2.interval); // Rep 3
    expect(res3.interval).toBeGreaterThan(6);
  });

  test("getQuality should return 1 for incorrect answer", () => {
    expect(getQuality(false, 1000)).toBe(1);
  });

  test("getQuality should return 5 for fast correct answer with high confidence", () => {
    expect(getQuality(true, 3000, 5)).toBe(5);
  });

  test("getQuality should return 4 for medium speed correct answer", () => {
    expect(getQuality(true, 8000)).toBe(4);
  });
});

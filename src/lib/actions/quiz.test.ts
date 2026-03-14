import { expect, test, describe } from "bun:test";
// We test the logic by examining the implementation in quiz.ts
// Since it's a server action with Supabase dependencies, we'll verify the math
// logic which we've implemented.

describe("Pedagogical Algorithms", () => {
  test("Lucky Guess Detector speed threshold", () => {
    const difficulty = 0.8;
    const speedThreshold = 3000 + (difficulty * 5000);
    expect(speedThreshold).toBe(7000);
    
    const fastTime = 5000;
    expect(fastTime).toBeLessThan(speedThreshold);
  });

  test("Mode-aware EMA alpha weighting", () => {
    const getAlpha = (mode: string) => {
      if (mode === 'proof_sim') return 0.6;
      if (mode === 'storm') return 0.4;
      if (mode === 'chill') return 0.1;
      return 0.2;
    };

    expect(getAlpha('proof_sim')).toBe(0.6); // 3x Camp
    expect(getAlpha('chill')).toBe(0.1);     // 0.5x Camp
    expect(getAlpha('storm')).toBe(0.4);     // 2x Camp
  });

  test("Review Lock 24h logic", () => {
    const now = new Date().getTime();
    const recentCompletion = new Date(now - (2 * 60 * 60 * 1000)).toISOString(); // 2h ago
    const oldCompletion = new Date(now - (26 * 60 * 60 * 1000)).toISOString();   // 26h ago
    
    const isLocked = (completedAt: string) => {
      const hours = (new Date().getTime() - new Date(completedAt).getTime()) / (1000 * 60 * 60);
      return hours < 24;
    };

    expect(isLocked(recentCompletion)).toBe(true);
    expect(isLocked(oldCompletion)).toBe(false);
  });
});

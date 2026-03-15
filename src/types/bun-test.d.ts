declare module 'bun:test' {
  export interface ExpectMatchers<T = any> {
    toBe(value: any): void;
    toEqual(value: any): void;
    toBeTruthy(): void;
    toBeFalsy(): void;
    toBeNull(): void;
    toBeUndefined(): void;
    toBeDefined(): void;
    toBeGreaterThan(n: number): void;
    toBeLessThan(n: number): void;
    toBeCloseTo(n: number, numDigits?: number): void;
    toContain(item: any): void;
    toThrow(error?: string | RegExp | Error): void;
    not: ExpectMatchers<T>;
    resolves: ExpectMatchers<Promise<T>>;
    rejects: ExpectMatchers<Promise<T>>;
  }

  export const test: {
    (name: string, fn: () => void | Promise<void>): void;
    skip: (name: string, fn: () => void | Promise<void>) => void;
    only: (name: string, fn: () => void | Promise<void>) => void;
  };

  export const describe: {
    (name: string, fn: () => void): void;
    skip: (name: string, fn: () => void) => void;
    only: (name: string, fn: () => void) => void;
  };

  export function expect(value: any): ExpectMatchers;
  
  export const spyOn: (obj: any, method: string) => any;
  export const beforeAll: (fn: () => void | Promise<void>) => void;
  export const afterAll: (fn: () => void | Promise<void>) => void;
  export const beforeEach: (fn: () => void | Promise<void>) => void;
  export const afterEach: (fn: () => void | Promise<void>) => void;
  export const mock: (fn: Function) => any;
}

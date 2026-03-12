import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * Merges and deduplicates Tailwind classes. Use this (or cn) whenever combining,
 * passing, or conditionally rendering className — never string concat or raw
 * template literals for dynamic Tailwind classes.
 */
export function suggestCanonicalClasses(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/** Alias for suggestCanonicalClasses; same behavior. */
export function cn(...inputs: ClassValue[]) {
  return suggestCanonicalClasses(...inputs)
}

import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * Merges and deduplicates Tailwind classes. Use this whenever combining,
 * passing, or conditionally rendering className — never string concat or raw
 * template literals for dynamic Tailwind classes.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

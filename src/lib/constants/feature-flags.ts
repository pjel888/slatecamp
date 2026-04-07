/**
 * Feature flags for SlateCamp
 * Use process.env.NEXT_PUBLIC_* for client-accessible flags
 */

/**
 * Payment gateway functionality
 * - false (default): All payment features disabled, users get full free access
 * - true: Payment gateways active, normal tiered access
 *
 * Re-enable: set NEXT_PUBLIC_PAYMENTS_ENABLED=true in .env.local
 */
export const FEATURE_PAYMENTS_ENABLED = process.env.NEXT_PUBLIC_PAYMENTS_ENABLED === 'true';

/**
 * Type declaration for importing next-mdx-remote/dist/rsc directly.
 *
 * next-mdx-remote exports compileMDX via the exports map path "./rsc",
 * but Turbopack (Next.js 16.2.3) has a bug with exports-map + barrel
 * re-export chains that causes "Cannot find module" errors.
 *
 * Importing from dist/rsc bypasses the exports map entirely — Node.js
 * resolves the file directly. This declaration tells TypeScript the
 * types are the same as the canonical exports-map path.
 */
declare module 'next-mdx-remote/dist/rsc' {
  export * from 'next-mdx-remote/rsc'
}

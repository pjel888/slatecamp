/**
 * Generic passthrough wrapper for AI-hallucinated MDX component names.
 * Renders children in a subtle bordered box so content is visible
 * without crashing the MDX renderer.
 */
export const GenericBlock = ({ children }: { children?: React.ReactNode }) => (
  <div className="not-prose my-4 rounded-md border border-border bg-surface-light p-4 text-sm text-text-primary leading-relaxed [&>p]:m-0 [&>p+p]:mt-2 [&_strong]:font-semibold">
    {children}
  </div>
)

/** No-op stubs for self-closing reference tags already inlined in article text. */
export const SPP206RefServices = () => null
export const SPP207RefServices = () => null

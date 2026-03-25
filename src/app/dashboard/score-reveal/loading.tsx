// Layer 1 (0ms): Skeleton shown immediately while server fetches assessment data.
// Score ring placeholder pulses to signal loading state.

const Loading = () => (
  <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-[#F5F5F5]">
    <div className="mx-auto w-full max-w-lg px-6 py-16 text-center">
      {/* Eyebrow label placeholder */}
      <div className="mx-auto h-2 w-36 animate-pulse rounded-sm bg-muted" />

      {/* Score ring placeholder */}
      <div className="mx-auto mt-8 flex items-center justify-center">
        <div className="relative h-36 w-36 animate-pulse rounded-full bg-muted" />
      </div>

      {/* Zone context card placeholder */}
      <div className="mx-auto mt-6 max-w-[480px] space-y-2">
        <div className="mx-auto h-2 w-24 animate-pulse rounded-sm bg-muted" />
        <div className="mx-auto h-4 w-80 animate-pulse rounded-sm bg-muted" />
        <div className="mx-auto h-4 w-64 animate-pulse rounded-sm bg-muted" />
      </div>

      {/* Blurred heatmap placeholder */}
      <div className="mx-auto mt-10 h-28 w-full max-w-lg animate-pulse rounded-md border border-border bg-white" />

      {/* CTA placeholder */}
      <div className="mx-auto mt-10 h-11 w-full max-w-sm animate-pulse rounded-sm bg-muted" />
    </div>
  </div>
)

export default Loading

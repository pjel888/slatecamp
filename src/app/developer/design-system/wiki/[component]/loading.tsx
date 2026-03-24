export default function Loading() {
  return (
    <div className="max-w-4xl animate-pulse">
      {/* Breadcrumb */}
      <div className="h-3 w-[120px] bg-muted rounded-sm mb-3" />

      {/* Header */}
      <div className="mb-5 space-y-2">
        <div className="h-2 w-[80px] bg-muted rounded-sm" />
        <div className="h-6 w-[200px] bg-muted rounded-sm" />
        <div className="h-3 w-[400px] bg-muted rounded-sm" />
        <div className="mt-3 space-y-1.5">
          <div className="h-3 w-[250px] bg-muted rounded-sm" />
          <div className="h-2.5 w-[200px] bg-muted rounded-sm" />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 mb-4 border-b border-border pb-2">
        <div className="h-3 w-[60px] bg-muted rounded-sm" />
        <div className="h-3 w-[50px] bg-muted rounded-sm" />
        <div className="h-3 w-[45px] bg-muted rounded-sm" />
      </div>

      {/* Preview area */}
      <div className="border border-border rounded-md h-[200px] bg-muted/30" />
    </div>
  )
}

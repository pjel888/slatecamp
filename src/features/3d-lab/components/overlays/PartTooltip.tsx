'use client'

interface PartTooltipProps {
  style: React.CSSProperties
  label: string
  description?: string
  codeCitation?: string
}

export const PartTooltip = ({
  style,
  label,
  description,
  codeCitation,
}: PartTooltipProps) => {
  return (
    <div
      style={style}
      className="w-52 bg-card/95 backdrop-blur-sm border border-border rounded-md shadow-lg p-2.5"
      role="tooltip"
    >
      <div className="text-[11px] font-black uppercase tracking-widest text-muted-foreground mb-0.5">
        Part
      </div>
      <h4 className="text-xs font-bold text-foreground leading-snug mb-1">
        {label}
      </h4>
      {description && (
        <p className="text-[11px] text-text-secondary leading-relaxed mb-1.5">
          {description}
        </p>
      )}
      {codeCitation && (
        <div className="text-[11px] text-muted-foreground mb-1">
          {codeCitation}
        </div>
      )}
    </div>
  )
}

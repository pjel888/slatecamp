interface StudentViewWatermarkProps {
  label?: string
}

export const StudentViewWatermark = ({
  label = 'Student View — This is exactly what students see',
}: StudentViewWatermarkProps) => (
  <div className="shrink-0 border-b border-amber-200 bg-[#FFF8EB] px-4 py-1.5">
    <span className="font-mono text-[11px] font-medium uppercase tracking-wider text-amber-700">
      {label}
    </span>
  </div>
)

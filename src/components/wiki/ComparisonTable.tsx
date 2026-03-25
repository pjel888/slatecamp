export const ComparisonTable = ({ children }: { children: React.ReactNode }) => (
  <div className="not-prose my-6 overflow-x-auto rounded-md border border-border">
    <div
      className={[
        '[&_table]:w-full [&_table]:border-collapse [&_table]:text-sm',
        '[&_thead]:bg-camp-cobalt [&_th]:px-3.5 [&_th]:py-2.5 [&_th]:text-left [&_th]:text-xs [&_th]:font-semibold [&_th]:text-white [&_th]:border-b-0',
        '[&_tbody_tr:nth-child(even)]:bg-[#F5F7FA] [&_tbody_tr:nth-child(odd)]:bg-white',
        '[&_td]:px-3.5 [&_td]:py-[11px] [&_td]:text-sm [&_td]:text-text-primary [&_td]:border-b [&_td]:border-[#ECEAE4] [&_td]:align-top [&_td]:leading-relaxed',
        '[&_td_strong]:font-semibold [&_td_strong]:text-[#1A1A1A]',
        '[&_tbody_tr:last-child_td]:border-b-0',
      ].join(' ')}
    >
      {children}
    </div>
  </div>
)

export const ProcessFlow = ({ children }: { children: React.ReactNode }) => (
  <div
    className={[
      'not-prose my-6 pl-4 border-l-2 border-[camp-cobalt]/30',
      '[&>ol]:list-none [&>ol]:m-0 [&>ol]:p-0 [&>ol]:space-y-4',
      '[&>ol>li]:relative [&>ol>li]:pl-6 [&>ol>li]:text-sm [&>ol>li]:leading-relaxed [&>ol>li]:text-[text-primary]',
      '[&>ol>li_strong]:text-[camp-cobalt] [&>ol>li_strong]:font-semibold',
      // Circle marker on the timeline
      '[&>ol>li]:before:content-[""] [&>ol>li]:before:absolute [&>ol>li]:before:left-[-13px] [&>ol>li]:before:top-[7px]',
      '[&>ol>li]:before:w-2.5 [&>ol>li]:before:h-2.5 [&>ol>li]:before:rounded-full',
      '[&>ol>li]:before:bg-[camp-cobalt] [&>ol>li]:before:border-2 [&>ol>li]:before:border-white',
      '[&>ol>li]:before:shadow-[0_0_0_2px_rgba(27,63,196,0.3)]',
    ].join(' ')}
  >
    {children}
  </div>
)

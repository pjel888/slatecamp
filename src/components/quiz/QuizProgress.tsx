interface Props {
  current: number;
  total: number;
}

export function QuizProgress({ current, total }: Props) {
  const percentage = (current / total) * 100;

  return (
    <div className="fixed left-0 right-0 top-0 z-50 h-1 bg-border">
      <div
        className="h-full bg-color-signal-amber transition-all duration-300 ease-out"
        style={{ width: `${percentage}%` }}
      />
    </div>
  );
}

/**
 * Barra di avanzamento del quiz.
 * Mostra "N / M" e una progress bar.
 */
interface Props {
  current: number; // 1-based
  total: number;
}

export default function Progress({ current, total }: Props) {
  const pct = Math.min(100, Math.round((current / total) * 100));
  return (
    <div className="flex items-center gap-3">
      <span className="text-sm text-slate-600 tabular-nums">
        {current} / {total}
      </span>
      <div
        className="h-2 flex-1 overflow-hidden rounded-full bg-slate-200"
        role="progressbar"
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div
          className="h-full rounded-full bg-brand-500 transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

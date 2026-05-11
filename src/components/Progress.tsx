/**
 * Barra di avanzamento del quiz.
 * Editorial style: hairline rail + ink-filled bar with mono numerals.
 */
interface Props {
  current: number; // 1-based
  total: number;
}

export default function Progress({ current, total }: Props) {
  const pct = Math.min(100, Math.round((current / total) * 100));
  return (
    <div className="flex items-center gap-3">
      <span className="mono text-xs font-medium uppercase tracking-eyebrow tabular-nums text-muted">
        {String(current).padStart(2, "0")} / {total}
      </span>
      <div
        className="h-[3px] flex-1 overflow-hidden bg-[var(--line-soft)]"
        role="progressbar"
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`Progresso: domanda ${current} di ${total}`}
      >
        <div
          className="h-full bg-ink transition-[width] duration-300 ease-[var(--ease-out-expo)]"
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="mono text-xs font-medium tabular-nums text-ink">
        {pct}%
      </span>
    </div>
  );
}

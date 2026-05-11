/**
 * Timer per la simulazione esame.
 * Conta alla rovescia da `durationSec` e chiama `onTimeUp` allo zero.
 * Toni: paper (>10min) → warn (≤10min) → danger (≤2min).
 */
import { useEffect, useState } from "react";
import { formatDuration } from "@/lib/format";

interface Props {
  /** Durata totale in secondi. */
  durationSec: number;
  /** ms epoch in cui è iniziato il timer. */
  startedAt: number;
  /** Chiamata quando il tempo arriva a 0. */
  onTimeUp: () => void;
}

export default function Timer({ durationSec, startedAt, onTimeUp }: Props) {
  const [now, setNow] = useState<number>(Date.now());

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 500);
    return () => clearInterval(id);
  }, []);

  const elapsedSec = Math.floor((now - startedAt) / 1000);
  const remaining = Math.max(0, durationSec - elapsedSec);

  useEffect(() => {
    if (remaining <= 0) onTimeUp();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [remaining <= 0]);

  const tone =
    remaining <= 120
      ? "border-[var(--danger)] bg-[var(--danger-soft)] text-[var(--danger)]"
      : remaining <= 600
        ? "border-[var(--warn)] bg-[var(--warn-soft)] text-[var(--warn)]"
        : "border-[var(--line-paper)] bg-[var(--bg-paper)] text-ink";

  const pulse = remaining <= 120 && remaining > 0 ? "animate-pulse" : "";

  return (
    <span
      role="timer"
      aria-live="polite"
      aria-label={`Tempo rimanente: ${formatDuration(remaining)}`}
      className={`mono inline-flex items-center gap-2 rounded-md border px-3 py-1.5 text-sm font-medium tabular-nums ${tone} ${pulse}`}
    >
      <span aria-hidden="true">◷</span>
      {formatDuration(remaining)}
    </span>
  );
}

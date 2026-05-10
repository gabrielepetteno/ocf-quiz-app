/**
 * Timer per la simulazione esame.
 * Conta alla rovescia da `durationSec` e chiama `onTimeUp` allo zero.
 * Mostra in giallo gli ultimi 10 minuti, in rosso negli ultimi 2.
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

  // Effetto: chiama onTimeUp quando finisce. Usiamo un effect separato per
  // avere una unica chiamata per fine timer.
  useEffect(() => {
    if (remaining <= 0) onTimeUp();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [remaining <= 0]);

  const tone =
    remaining <= 120
      ? "bg-rose-100 text-rose-800 border-rose-300"
      : remaining <= 600
        ? "bg-amber-100 text-amber-800 border-amber-300"
        : "bg-slate-100 text-slate-800 border-slate-300";

  return (
    <span
      role="timer"
      aria-live="polite"
      className={`inline-flex items-center gap-2 rounded-lg border px-3 py-1.5 font-mono text-sm tabular-nums ${tone}`}
    >
      ⏱ {formatDuration(remaining)}
    </span>
  );
}

/**
 * Riepilogo del risultato di una sessione.
 *
 * Editorial banner: oversize numeral, pass/fail rule, tabular breakdown.
 */
import { Link } from "react-router-dom";
import type {
  PreparedQuestion,
  QuestionState,
  SessionResult,
} from "@/lib/types";
import { isCorrect } from "@/lib/scoring";
import { CATEGORY_SHORT_LABELS, EXAM_PASS_THRESHOLD } from "@/lib/config";
import { formatDuration, formatPercent } from "@/lib/format";

interface Props {
  result: SessionResult;
  questions: PreparedQuestion[];
  states: QuestionState[];
  /** Pulsante d'azione principale (es. "Torna alla home") */
  primaryAction?: { label: string; to: string };
}

export default function ResultSummary({
  result,
  questions,
  states,
  primaryAction,
}: Props) {
  // Lista delle domande sbagliate
  const reviewItems = questions
    .map((q, i) => ({ q, i, st: states[i] }))
    .filter(({ q, st }) => !isCorrect(q, st.selectedAnswerId));

  return (
    <div className="flex flex-col gap-12">
      {/* ── Banner risultato (oversize editorial numeral) ─────────── */}
      <section
        aria-labelledby="risultato"
        className={[
          "relative grid gap-6 border p-8 md:grid-cols-12 md:p-10",
          result.passed
            ? "border-[var(--success)] bg-[var(--success-soft)]"
            : "border-[var(--danger)] bg-[var(--danger-soft)]",
        ].join(" ")}
      >
        <div className="md:col-span-7">
          <p
            className={[
              "mono text-xs uppercase tracking-eyebrow",
              result.passed ? "text-[var(--success)]" : "text-[var(--danger)]",
            ].join(" ")}
          >
            {result.passed ? "✓ Promosso" : "✗ Non promosso"}
          </p>
          <h1
            id="risultato"
            className="font-display mt-3 text-3xl font-medium leading-tight text-ink md:text-4xl"
          >
            {result.passed
              ? "Hai superato la simulazione."
              : "Sotto la soglia di superamento."}
          </h1>
          <p className="mt-3 text-sm text-ink-soft md:text-base">
            Soglia:{" "}
            <strong className="text-ink">{EXAM_PASS_THRESHOLD}/100</strong>
            {" · "}
            {result.correctCount} corrette su {result.totalQuestions}
            {" · "}
            tempo {formatDuration(result.elapsedSec)}
          </p>
        </div>

        <div className="md:col-span-5 md:text-right">
          <p className="mono text-xs uppercase tracking-eyebrow text-muted">
            Punteggio
          </p>
          <p className="mono mt-1 text-[clamp(3.5rem,10vw,7.5rem)] font-semibold leading-none tracking-tightest text-ink">
            <span className="tabular-nums">{result.scaledScore}</span>
            <span className="text-muted">/100</span>
          </p>
        </div>
      </section>

      {/* ── Tile statistiche ─────────────────────────────────────── */}
      <section aria-labelledby="dettaglio" className="border-t border-ink pt-6">
        <p className="eyebrow">Dettaglio</p>
        <h2 id="dettaglio" className="sr-only">
          Dettaglio del risultato
        </h2>
        <div className="mt-4 grid grid-cols-2 md:grid-cols-4">
          <Tile
            label="Corrette"
            value={String(result.correctCount)}
            tone="success"
          />
          <Tile
            label="Sbagliate"
            value={String(result.wrongCount)}
            tone="danger"
          />
          <Tile
            label="Non risposte"
            value={String(result.unansweredCount)}
            tone="muted"
          />
          <Tile
            label="Punteggio grezzo"
            value={`${result.rawScore}/${result.rawMax}`}
            tone="accent"
          />
        </div>
      </section>

      {/* ── Performance per categoria ─────────────────────────────── */}
      {result.perCategory.length > 1 && (
        <section className="border-t border-ink pt-6">
          <p className="eyebrow">Performance per categoria</p>
          <ul className="mt-5 space-y-4">
            {result.perCategory.map((c) => (
              <li key={c.category}>
                <div className="flex items-baseline justify-between gap-3 text-sm">
                  <span className="font-medium text-ink">
                    {CATEGORY_SHORT_LABELS[c.category]}
                  </span>
                  <span className="mono tabular-nums text-muted">
                    {c.correct}/{c.total} · {formatPercent(c.accuracy)}
                  </span>
                </div>
                <div
                  className="mt-2 h-[3px] overflow-hidden bg-[var(--line-soft)]"
                  role="progressbar"
                  aria-valuenow={Math.round(c.accuracy * 100)}
                  aria-valuemin={0}
                  aria-valuemax={100}
                >
                  <div
                    className={
                      c.accuracy >= 0.8
                        ? "h-full bg-[var(--success)] transition-[width]"
                        : c.accuracy >= 0.6
                          ? "h-full bg-[var(--warn)] transition-[width]"
                          : "h-full bg-[var(--danger)] transition-[width]"
                    }
                    style={{ width: `${Math.round(c.accuracy * 100)}%` }}
                  />
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* ── Domande da rivedere ──────────────────────────────────── */}
      {reviewItems.length > 0 && (
        <section className="border-t border-ink pt-6">
          <p className="eyebrow">Da rivedere · {reviewItems.length}</p>
          <ol className="mt-5 space-y-4">
            {reviewItems.map(({ q, i, st }) => {
              const userPicked = q.displayAnswers.find(
                (a) => a.id === st.selectedAnswerId,
              );
              const correct = q.displayAnswers.find(
                (a) => a.id === q.correctAnswer,
              );
              return (
                <li key={q.id} className="card">
                  <p className="mono text-xs uppercase tracking-eyebrow text-muted">
                    Domanda {i + 1} · {CATEGORY_SHORT_LABELS[q.category]}
                  </p>
                  <p className="font-display mt-2 text-lg font-medium leading-snug text-ink">
                    {q.question}
                  </p>
                  <div className="mt-4 grid gap-3 text-sm md:grid-cols-2">
                    <div className="border border-[var(--danger)] bg-[var(--danger-soft)] p-3 text-[var(--danger)]">
                      <p className="mono text-[0.7rem] font-semibold uppercase tracking-eyebrow">
                        La tua risposta
                      </p>
                      <p className="mt-1 leading-snug">
                        {userPicked ? userPicked.text : "(nessuna risposta)"}
                      </p>
                    </div>
                    <div className="border border-[var(--success)] bg-[var(--success-soft)] p-3 text-[var(--success)]">
                      <p className="mono text-[0.7rem] font-semibold uppercase tracking-eyebrow">
                        Corretta
                      </p>
                      <p className="mt-1 leading-snug">
                        {correct ? correct.text : "(non disponibile)"}
                      </p>
                    </div>
                  </div>
                </li>
              );
            })}
          </ol>
        </section>
      )}

      <div className="flex flex-wrap items-center justify-end gap-2 border-t border-line-soft pt-6">
        <Link to="/history" className="btn btn-secondary">
          Vedi storico
        </Link>
        {primaryAction && (
          <Link to={primaryAction.to} className="btn btn-primary">
            {primaryAction.label}
          </Link>
        )}
      </div>
    </div>
  );
}

function Tile({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: "success" | "danger" | "muted" | "accent";
}) {
  const palettes: Record<typeof tone, string> = {
    success: "border-[var(--success)] text-[var(--success)]",
    danger: "border-[var(--danger)] text-[var(--danger)]",
    muted: "border-[var(--line)] text-ink-soft",
    accent: "border-[var(--accent)] text-[var(--accent)]",
  };
  return (
    <div
      className={`border-t-2 ${palettes[tone]} bg-transparent px-4 py-4 md:px-5`}
    >
      <p className="mono text-[0.7rem] font-medium uppercase tracking-eyebrow text-muted">
        {label}
      </p>
      <p className="mono mt-2 text-3xl font-semibold leading-none tabular-nums md:text-4xl">
        {value}
      </p>
    </div>
  );
}

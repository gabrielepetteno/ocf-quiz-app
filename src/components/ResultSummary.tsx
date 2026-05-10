/**
 * Riepilogo del risultato di una sessione.
 *
 * Mostra:
 *  - punteggio totale, percentuale, esito promosso/non promosso,
 *  - statistiche (corrette/sbagliate/non risposte/tempo),
 *  - performance per categoria,
 *  - elenco domande sbagliate con risposta data e risposta corretta.
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
  const passColor = result.passed
    ? "from-emerald-500 to-emerald-600"
    : "from-rose-500 to-rose-600";

  // Lista delle domande sbagliate (per la sezione "review")
  const reviewItems = questions
    .map((q, i) => ({ q, i, st: states[i] }))
    .filter(({ q, st }) => !isCorrect(q, st.selectedAnswerId));

  return (
    <div className="space-y-6">
      {/* Banner risultato */}
      <section
        className={`rounded-2xl bg-gradient-to-br ${passColor} p-6 text-white shadow-md`}
      >
        <p className="text-sm opacity-90">Risultato</p>
        <div className="mt-1 flex items-baseline gap-3">
          <h1 className="text-4xl font-bold tabular-nums">
            {result.scaledScore}
            <span className="text-xl font-medium opacity-80">/100</span>
          </h1>
          <span className="rounded-full bg-white/20 px-3 py-1 text-sm font-medium">
            {result.passed ? "✓ Promosso" : "✗ Non promosso"}
          </span>
        </div>
        <p className="mt-2 text-sm opacity-90">
          Soglia di superamento: {EXAM_PASS_THRESHOLD}/100 ·{" "}
          {result.correctCount} corrette su {result.totalQuestions} · tempo:{" "}
          {formatDuration(result.elapsedSec)}
        </p>
      </section>

      {/* Tile statistiche */}
      <section className="grid grid-cols-2 gap-3 md:grid-cols-4">
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
          tone="brand"
        />
      </section>

      {/* Performance per categoria */}
      {result.perCategory.length > 1 && (
        <section className="card">
          <h3 className="text-base font-semibold text-slate-900">
            Performance per categoria
          </h3>
          <ul className="mt-3 space-y-2">
            {result.perCategory.map((c) => (
              <li key={c.category}>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-700">
                    {CATEGORY_SHORT_LABELS[c.category]}
                  </span>
                  <span className="text-slate-500 tabular-nums">
                    {c.correct}/{c.total} · {formatPercent(c.accuracy)}
                  </span>
                </div>
                <div className="mt-1 h-2 overflow-hidden rounded-full bg-slate-200">
                  <div
                    className={`h-full rounded-full ${
                      c.accuracy >= 0.8
                        ? "bg-emerald-500"
                        : c.accuracy >= 0.6
                          ? "bg-amber-400"
                          : "bg-rose-500"
                    }`}
                    style={{ width: `${Math.round(c.accuracy * 100)}%` }}
                  />
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Elenco domande sbagliate */}
      {reviewItems.length > 0 && (
        <section className="card">
          <h3 className="text-base font-semibold text-slate-900">
            Domande da rivedere ({reviewItems.length})
          </h3>
          <ol className="mt-3 space-y-4">
            {reviewItems.map(({ q, i, st }) => {
              const userPicked = q.displayAnswers.find(
                (a) => a.id === st.selectedAnswerId,
              );
              const correct = q.displayAnswers.find(
                (a) => a.id === q.correctAnswer,
              );
              return (
                <li
                  key={q.id}
                  className="rounded-xl border border-slate-200 bg-white p-4"
                >
                  <p className="text-xs uppercase tracking-wide text-slate-500">
                    #{i + 1} · {CATEGORY_SHORT_LABELS[q.category]}
                  </p>
                  <p className="mt-1 font-medium text-slate-900">
                    {q.question}
                  </p>
                  <div className="mt-3 grid gap-2 text-sm md:grid-cols-2">
                    <div className="rounded-lg border border-rose-200 bg-rose-50 p-3 text-rose-900">
                      <p className="text-xs font-semibold uppercase">
                        La tua risposta
                      </p>
                      <p className="mt-0.5">
                        {userPicked ? userPicked.text : "(nessuna risposta)"}
                      </p>
                    </div>
                    <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-emerald-900">
                      <p className="text-xs font-semibold uppercase">
                        Risposta corretta
                      </p>
                      <p className="mt-0.5">
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

      <div className="flex flex-wrap items-center justify-end gap-2">
        <Link to="/history" className="btn-secondary">
          Vedi storico
        </Link>
        {primaryAction && (
          <Link to={primaryAction.to} className="btn-primary">
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
  tone: "success" | "danger" | "muted" | "brand";
}) {
  const palette: Record<typeof tone, string> = {
    success: "bg-emerald-50 text-emerald-800 border-emerald-200",
    danger: "bg-rose-50 text-rose-800 border-rose-200",
    muted: "bg-slate-50 text-slate-800 border-slate-200",
    brand: "bg-brand-50 text-brand-800 border-brand-200",
  };
  return (
    <div className={`rounded-2xl border p-4 ${palette[tone]}`}>
      <p className="text-xs font-medium uppercase tracking-wide opacity-70">
        {label}
      </p>
      <p className="mt-1 text-2xl font-bold tabular-nums">{value}</p>
    </div>
  );
}

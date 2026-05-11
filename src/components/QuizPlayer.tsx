/**
 * Player principale del quiz.
 *
 * Editorial layout: question on the left in a paper card, navigation
 * map on the right. Sticky toolbar at top with category/timer/progress.
 */
import { useMemo, useState } from "react";
import type { PreparedQuestion, QuestionState } from "@/lib/types";
import Timer from "./Timer";
import Progress from "./Progress";
import { CATEGORY_SHORT_LABELS } from "@/lib/config";

export interface QuizPlayerProps {
  questions: PreparedQuestion[];
  states: QuestionState[];
  startedAt: number;
  durationSec: number | null;
  modeLabel: string;
  showCategoryChip?: boolean;
  onStateChange: (idx: number, state: QuestionState) => void;
  onSubmit: () => void;
}

export default function QuizPlayer({
  questions,
  states,
  startedAt,
  durationSec,
  modeLabel,
  showCategoryChip = true,
  onStateChange,
  onSubmit,
}: QuizPlayerProps) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const current = questions[currentIdx];
  const currentState = states[currentIdx];

  const summary = useMemo(() => {
    let answered = 0;
    let flagged = 0;
    for (const s of states) {
      if (s.selectedAnswerId != null) answered++;
      if (s.flagged) flagged++;
    }
    return {
      answered,
      flagged,
      unanswered: states.length - answered,
    };
  }, [states]);

  function selectAnswer(id: QuestionState["selectedAnswerId"]) {
    onStateChange(currentIdx, { ...currentState, selectedAnswerId: id });
  }
  function toggleFlag() {
    onStateChange(currentIdx, {
      ...currentState,
      flagged: !currentState.flagged,
    });
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
      {/* COLONNA SINISTRA: domanda corrente */}
      <section className="flex flex-col gap-5">
        {/* Header sticky */}
        <div className="sticky top-[68px] z-20 -mx-4 border-y border-line-soft bg-[var(--bg)]/95 px-4 py-3 backdrop-blur md:mx-0 md:rounded-md md:border md:px-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="chip chip-accent">{modeLabel}</span>
              {showCategoryChip && (
                <span className="chip">
                  {CATEGORY_SHORT_LABELS[current.category]}
                </span>
              )}
              <span className="chip">
                {current.points} {current.points === 1 ? "punto" : "punti"}
              </span>
              {current.type === "pratica" && (
                <span className="chip chip-warn">Pratica</span>
              )}
            </div>
            {durationSec != null && (
              <Timer
                durationSec={durationSec}
                startedAt={startedAt}
                onTimeUp={onSubmit}
              />
            )}
          </div>
          <div className="mt-3">
            <Progress current={currentIdx + 1} total={questions.length} />
          </div>
        </div>

        {/* Card domanda */}
        <article className="card flex flex-col">
          <p className="mono text-xs uppercase tracking-eyebrow text-muted">
            Domanda {currentIdx + 1} di {questions.length}
          </p>
          <h2 className="font-display mt-2 text-xl font-medium leading-snug text-ink md:text-2xl">
            {current.question}
          </h2>

          <ul className="mt-7 space-y-2.5">
            {current.displayAnswers.map((a, idx) => {
              const isSelected = currentState.selectedAnswerId === a.id;
              const displayLabel = String.fromCharCode(65 + idx);
              return (
                <li key={a.id}>
                  <button
                    type="button"
                    className={
                      isSelected
                        ? "answer-row answer-selected"
                        : "answer-row answer-neutral"
                    }
                    onClick={() => selectAnswer(a.id)}
                    aria-pressed={isSelected}
                  >
                    <span className="answer-letter">{displayLabel}</span>
                    <span className="flex-1 leading-relaxed">{a.text}</span>
                  </button>
                </li>
              );
            })}
          </ul>

          <div className="mt-7 flex flex-wrap items-center justify-between gap-3 border-t border-line-soft pt-5">
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                className={
                  currentState.flagged
                    ? "btn border-[var(--warn)] bg-[var(--warn-soft)] text-[var(--warn)]"
                    : "btn btn-secondary"
                }
                onClick={toggleFlag}
                aria-pressed={currentState.flagged}
              >
                <span aria-hidden="true">
                  {currentState.flagged ? "★" : "☆"}
                </span>
                {currentState.flagged ? "Da rivedere" : "Segna da rivedere"}
              </button>
              <button
                type="button"
                className="btn btn-ghost"
                onClick={() => selectAnswer(null)}
                disabled={currentState.selectedAnswerId == null}
              >
                Pulisci
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setCurrentIdx((i) => Math.max(0, i - 1))}
                disabled={currentIdx === 0}
              >
                ← Indietro
              </button>
              {currentIdx === questions.length - 1 ? (
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => setConfirmOpen(true)}
                >
                  Consegna
                </button>
              ) : (
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() =>
                    setCurrentIdx((i) => Math.min(questions.length - 1, i + 1))
                  }
                >
                  Avanti →
                </button>
              )}
            </div>
          </div>
        </article>

        <div className="flex justify-center">
          <button
            type="button"
            className="btn btn-ghost text-[var(--danger)] hover:bg-[var(--danger-soft)] hover:text-[var(--danger)]"
            onClick={() => setConfirmOpen(true)}
          >
            Termina e consegna ora
          </button>
        </div>
      </section>

      {/* COLONNA DESTRA: mappa domande */}
      <aside className="card card-paper flex flex-col gap-4 lg:sticky lg:top-[68px] lg:self-start">
        <header>
          <p className="eyebrow">Mappa domande</p>
        </header>

        <ul className="grid grid-cols-2 gap-2 text-xs">
          <li className="flex items-center gap-2 text-ink-soft">
            <span className="inline-block h-2 w-2 rounded-full bg-ink" />
            <span>
              Risposte: <strong className="text-ink">{summary.answered}</strong>
            </span>
          </li>
          <li className="flex items-center gap-2 text-ink-soft">
            <span className="inline-block h-2 w-2 rounded-full bg-[var(--warn)]" />
            <span>
              Da rivedere:{" "}
              <strong className="text-ink">{summary.flagged}</strong>
            </span>
          </li>
          <li className="col-span-2 flex items-center gap-2 text-ink-soft">
            <span className="inline-block h-2 w-2 rounded-full bg-[var(--line-paper)]" />
            <span>
              Mancanti:{" "}
              <strong className="text-ink">{summary.unanswered}</strong>
            </span>
          </li>
        </ul>

        <div
          className="grid gap-1.5"
          style={{ gridTemplateColumns: "repeat(8, minmax(0, 1fr))" }}
        >
          {questions.map((_, i) => {
            const s = states[i];
            const base =
              "mono flex h-8 items-center justify-center rounded-sm text-[0.7rem] font-medium transition-colors";
            const cls =
              i === currentIdx
                ? `${base} bg-ink text-[var(--bg)] ring-2 ring-[var(--accent)] ring-offset-2 ring-offset-[var(--bg-paper)]`
                : s.flagged
                  ? `${base} bg-[var(--warn-soft)] text-[var(--warn)] border border-[var(--warn)]`
                  : s.selectedAnswerId != null
                    ? `${base} bg-ink text-[var(--bg)]`
                    : `${base} border border-[var(--line-paper)] bg-[var(--bg-elevated)] text-ink-soft hover:border-ink`;
            return (
              <button
                key={i}
                type="button"
                onClick={() => setCurrentIdx(i)}
                className={cls}
                aria-label={`Vai alla domanda ${i + 1}`}
                aria-current={i === currentIdx ? "true" : undefined}
                title={`Domanda ${i + 1}`}
              >
                {i + 1}
              </button>
            );
          })}
        </div>

        <button
          type="button"
          className="btn btn-primary w-full"
          onClick={() => setConfirmOpen(true)}
        >
          Consegna quiz
        </button>
      </aside>

      {/* MODALE CONFERMA CONSEGNA */}
      {confirmOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(26,23,21,0.55)] p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="confirm-title"
        >
          <div className="card w-full max-w-md">
            <p className="eyebrow">Conferma</p>
            <h3
              id="confirm-title"
              className="font-display mt-2 text-2xl font-medium text-ink"
            >
              Consegnare il quiz?
            </h3>
            <p className="mt-3 text-sm text-ink-soft">
              Hai risposto a{" "}
              <strong className="text-ink">{summary.answered}</strong> domande
              su {questions.length}.
              {summary.unanswered > 0 && (
                <>
                  {" "}
                  Le {summary.unanswered} non risposte saranno conteggiate come
                  errate.
                </>
              )}
            </p>
            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setConfirmOpen(false)}
                autoFocus
              >
                Annulla
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => {
                  setConfirmOpen(false);
                  onSubmit();
                }}
              >
                Sì, consegna
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

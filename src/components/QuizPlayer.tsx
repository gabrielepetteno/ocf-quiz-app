/**
 * Player principale del quiz.
 *
 * Gestisce:
 *  - rendering domanda corrente con risposte mescolate,
 *  - selezione, "flag da rivedere", navigazione avanti/indietro,
 *  - mappa di overview (jump rapido a una qualsiasi domanda),
 *  - timer opzionale,
 *  - conferma di consegna.
 *
 * Il componente è "controllato" dall'esterno: lo stato live (states) è
 * passato dal parent così che a fine sessione il parent possa salvare
 * tutto in un colpo (storia, errori, statistiche).
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
  /** Limite di tempo in secondi. null = nessun limite. */
  durationSec: number | null;
  /** Etichetta della modalità (mostrata nell'header del quiz). */
  modeLabel: string;
  /** Mostra a quale categoria appartiene la domanda (utile in simulazione). */
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

  // Statistiche live per il pannello "Mappa domande"
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
    <div className="grid gap-4 lg:grid-cols-[1fr_280px]">
      {/* COLONNA SINISTRA: domanda corrente */}
      <section className="flex flex-col gap-4">
        {/* Header sticky con modalità + timer + progress */}
        <div className="sticky top-[60px] z-20 -mx-4 bg-slate-50/90 px-4 py-3 backdrop-blur md:mx-0 md:rounded-2xl md:border md:border-slate-200 md:bg-white">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="chip">{modeLabel}</span>
              {showCategoryChip && (
                <span className="chip">
                  {CATEGORY_SHORT_LABELS[current.category]}
                </span>
              )}
              <span className="chip">
                {current.points} {current.points === 1 ? "punto" : "punti"}
              </span>
              {current.type === "pratica" && (
                <span className="chip bg-violet-50 text-violet-700 border-violet-200">
                  Pratica
                </span>
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
          <div className="mt-2">
            <Progress current={currentIdx + 1} total={questions.length} />
          </div>
        </div>

        {/* Card domanda */}
        <article className="card">
          <p className="text-sm text-slate-500">Domanda {currentIdx + 1}</p>
          <h2 className="mt-1 text-lg font-medium leading-relaxed text-slate-900">
            {current.question}
          </h2>

          <ul className="mt-5 space-y-2">
            {current.displayAnswers.map((a) => {
              const isSelected = currentState.selectedAnswerId === a.id;
              return (
                <li key={a.id}>
                  <button
                    type="button"
                    className={
                      isSelected ? "answer-selected" : "answer-neutral"
                    }
                    onClick={() => selectAnswer(a.id)}
                  >
                    <span className="mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-current text-xs font-semibold">
                      {a.id}
                    </span>
                    <span className="flex-1">{a.text}</span>
                  </button>
                </li>
              );
            })}
          </ul>

          <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4">
            <div className="flex items-center gap-2">
              <button
                type="button"
                className={
                  currentState.flagged
                    ? "btn bg-amber-100 text-amber-800 border border-amber-300"
                    : "btn-secondary"
                }
                onClick={toggleFlag}
                aria-pressed={currentState.flagged}
              >
                {currentState.flagged ? "★ Da rivedere" : "☆ Segna da rivedere"}
              </button>
              <button
                type="button"
                className="btn-ghost"
                onClick={() => selectAnswer(null)}
                disabled={currentState.selectedAnswerId == null}
              >
                Pulisci
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                className="btn-secondary"
                onClick={() => setCurrentIdx((i) => Math.max(0, i - 1))}
                disabled={currentIdx === 0}
              >
                ← Indietro
              </button>
              {currentIdx === questions.length - 1 ? (
                <button
                  type="button"
                  className="btn-primary"
                  onClick={() => setConfirmOpen(true)}
                >
                  Consegna
                </button>
              ) : (
                <button
                  type="button"
                  className="btn-primary"
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
            className="btn-ghost text-rose-700 hover:bg-rose-50"
            onClick={() => setConfirmOpen(true)}
          >
            Termina e consegna ora
          </button>
        </div>
      </section>

      {/* COLONNA DESTRA: mappa domande + summary */}
      <aside className="card lg:sticky lg:top-[60px] lg:self-start">
        <h3 className="text-sm font-semibold text-slate-700">Mappa domande</h3>
        <div className="mt-2 grid grid-cols-2 gap-2 text-xs text-slate-600">
          <span>
            <span className="inline-block h-2 w-2 rounded-full bg-brand-500" />{" "}
            Risposte: <strong>{summary.answered}</strong>
          </span>
          <span>
            <span className="inline-block h-2 w-2 rounded-full bg-amber-400" />{" "}
            Da rivedere: <strong>{summary.flagged}</strong>
          </span>
          <span className="col-span-2">
            <span className="inline-block h-2 w-2 rounded-full bg-slate-300" />{" "}
            Mancanti: <strong>{summary.unanswered}</strong>
          </span>
        </div>

        <div
          className="mt-4 grid gap-1.5"
          style={{ gridTemplateColumns: "repeat(8, minmax(0, 1fr))" }}
        >
          {questions.map((_, i) => {
            const s = states[i];
            const cls =
              i === currentIdx
                ? "ring-2 ring-brand-500 bg-white"
                : s.flagged
                  ? "bg-amber-300 text-amber-900"
                  : s.selectedAnswerId != null
                    ? "bg-brand-500 text-white"
                    : "bg-slate-200 text-slate-700";
            return (
              <button
                key={i}
                type="button"
                onClick={() => setCurrentIdx(i)}
                className={`flex h-8 items-center justify-center rounded-md text-xs font-medium transition ${cls}`}
                aria-label={`Vai alla domanda ${i + 1}`}
                title={`Domanda ${i + 1}`}
              >
                {i + 1}
              </button>
            );
          })}
        </div>

        <button
          type="button"
          className="btn-primary mt-5 w-full"
          onClick={() => setConfirmOpen(true)}
        >
          Consegna quiz
        </button>
      </aside>

      {/* MODALE CONFERMA CONSEGNA */}
      {confirmOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4"
          role="dialog"
          aria-modal="true"
        >
          <div className="card w-full max-w-md">
            <h3 className="text-lg font-semibold text-slate-900">
              Consegnare il quiz?
            </h3>
            <p className="mt-2 text-sm text-slate-600">
              Hai risposto a <strong>{summary.answered}</strong> domande su{" "}
              {questions.length}.
              {summary.unanswered > 0 && (
                <>
                  {" "}
                  Le {summary.unanswered} non risposte saranno conteggiate come
                  errate.
                </>
              )}
            </p>
            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                className="btn-secondary"
                onClick={() => setConfirmOpen(false)}
              >
                Annulla
              </button>
              <button
                type="button"
                className="btn-primary"
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

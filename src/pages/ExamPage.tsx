/**
 * Pagina simulazione esame OCF.
 *
 * Tre fasi:
 *  1) "intro": spiegazione della modalità + bottone per iniziare
 *  2) "playing": il quiz vero e proprio (60 domande, 85 minuti)
 *  3) "result": risultato + review domande sbagliate
 *
 * Il timer è gestito dal componente <Timer/>: quando arriva a 0 forza la
 * consegna automatica chiamando handleSubmit.
 */
import { useEffect, useMemo, useState } from "react";

import QuizPlayer from "@/components/QuizPlayer";
import ResultSummary from "@/components/ResultSummary";
import {
  EXAM_DURATION_MIN,
  EXAM_PASS_THRESHOLD,
  EXAM_TOTAL_QUESTIONS,
  EXAM_DISTRIBUTION,
  CATEGORY_SHORT_LABELS,
} from "@/lib/config";
import {
  generateExamQuestions,
  InsufficientQuestionsError,
} from "@/lib/examGenerator";
import { loadQuestions } from "@/lib/questions";
import { computeResult } from "@/lib/scoring";
import { appendHistory, updateErrorsFromSession } from "@/lib/storage";
import type {
  PreparedQuestion,
  QuestionState,
  QuizSession,
  SessionResult,
} from "@/lib/types";

type Phase = "intro" | "playing" | "result";

export default function ExamPage() {
  const [phase, setPhase] = useState<Phase>("intro");
  const [error, setError] = useState<string | null>(null);
  const [session, setSession] = useState<QuizSession | null>(null);
  const [states, setStates] = useState<QuestionState[]>([]);
  const [result, setResult] = useState<SessionResult | null>(null);

  /** Avvia una nuova simulazione: genera le 60 domande e parte il timer. */
  async function startExam() {
    setError(null);
    try {
      const bundle = await loadQuestions();
      const questions = generateExamQuestions(bundle);
      const startedAt = Date.now();
      const newStates: QuestionState[] = questions.map(() => ({
        selectedAnswerId: null,
        flagged: false,
      }));
      setSession({
        id: cryptoId(),
        mode: "exam",
        questions,
        states: newStates,
        startedAt,
        finishedAt: null,
        durationSec: EXAM_DURATION_MIN * 60,
      });
      setStates(newStates);
      setPhase("playing");
    } catch (e) {
      if (e instanceof InsufficientQuestionsError) {
        setError(
          `Dataset insufficiente per la categoria "${CATEGORY_SHORT_LABELS[e.category]}": servono ${e.need} domande, disponibili ${e.have}.`,
        );
      } else if (e instanceof Error) {
        setError(e.message);
      } else {
        setError("Errore sconosciuto.");
      }
    }
  }

  /** Aggiorna lo stato di una singola domanda (selezione/flag). */
  function updateState(idx: number, next: QuestionState) {
    setStates((prev) => {
      const out = prev.slice();
      out[idx] = next;
      return out;
    });
  }

  /** Consegna il quiz: calcola risultato, aggiorna errori e storico. */
  function handleSubmit() {
    if (!session) return;
    const finished: QuizSession = {
      ...session,
      states,
      finishedAt: Date.now(),
    };
    const r = computeResult(finished);
    appendHistory(r);
    updateErrorsFromSession(finished.questions, states);
    setResult(r);
    setPhase("result");
  }

  // Avviso se l'utente cerca di ricaricare/abbandonare durante l'esame
  useEffect(() => {
    if (phase !== "playing") return;
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [phase]);

  /* ------------------------ rendering ------------------------------- */

  if (phase === "intro") {
    return <Intro onStart={startExam} error={error} />;
  }

  if (phase === "playing" && session) {
    return (
      <QuizPlayer
        questions={session.questions}
        states={states}
        startedAt={session.startedAt}
        durationSec={session.durationSec}
        modeLabel="Simulazione esame"
        showCategoryChip
        onStateChange={updateState}
        onSubmit={handleSubmit}
      />
    );
  }

  if (phase === "result" && result && session) {
    return (
      <ResultSummary
        result={result}
        questions={session.questions}
        states={states}
        primaryAction={{ label: "Nuova simulazione", to: "/exam" }}
      />
    );
  }

  return null;
}

/* ------------------------------------------------------------------ */
/* Intro: spiega le regole prima di iniziare                          */
/* ------------------------------------------------------------------ */

function Intro({
  onStart,
  error,
}: {
  onStart: () => void;
  error: string | null;
}) {
  const distribution = useMemo(
    () =>
      Object.entries(EXAM_DISTRIBUTION) as Array<
        [keyof typeof EXAM_DISTRIBUTION, number]
      >,
    [],
  );

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-slate-900">
          Simulazione esame OCF
        </h1>
        <p className="mt-1 text-slate-600">
          Riproduce le regole dell'esame ufficiale per l'iscrizione all'Albo
          unico dei Consulenti Finanziari.
        </p>
      </header>

      <section className="grid gap-4 md:grid-cols-3">
        <Box
          title={`${EXAM_TOTAL_QUESTIONS} domande`}
          body="Selezionate casualmente dal dataset, senza ripetizioni."
        />
        <Box
          title={`${EXAM_DURATION_MIN} minuti`}
          body="Timer sempre visibile in alto. Allo zero il quiz viene consegnato automaticamente."
        />
        <Box
          title={`Soglia ${EXAM_PASS_THRESHOLD}/100`}
          body="Punteggio normalizzato. Promosso se ≥ soglia, non promosso altrimenti."
        />
      </section>

      <section className="card">
        <h3 className="text-base font-semibold text-slate-900">
          Distribuzione per macro-categoria
        </h3>
        <ul className="mt-3 space-y-2">
          {distribution.map(([cat, n]) => (
            <li key={cat} className="flex items-center justify-between text-sm">
              <span className="text-slate-700">
                {CATEGORY_SHORT_LABELS[cat]}
              </span>
              <span className="chip">{n} domande</span>
            </li>
          ))}
        </ul>
      </section>

      {error && (
        <div className="card border-rose-300 bg-rose-50 text-rose-800">
          <p className="text-sm font-medium">
            Impossibile avviare la simulazione
          </p>
          <p className="mt-1 text-sm">{error}</p>
        </div>
      )}

      <div className="flex justify-center">
        <button
          type="button"
          className="btn-primary px-6 py-3 text-base"
          onClick={onStart}
        >
          Inizia simulazione
        </button>
      </div>
    </div>
  );
}

function Box({ title, body }: { title: string; body: string }) {
  return (
    <div className="card">
      <p className="text-2xl font-bold text-slate-900">{title}</p>
      <p className="mt-1 text-sm text-slate-600">{body}</p>
    </div>
  );
}

/** ID di sessione semplice e portabile (usa crypto.randomUUID se disponibile). */
function cryptoId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

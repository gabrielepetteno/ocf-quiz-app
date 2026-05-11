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
import { useDocumentMeta } from "@/lib/useDocumentMeta";
import { breadcrumbJsonLd, getPageSeo } from "@/lib/seo";
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

  const seo = getPageSeo("exam")!;
  useDocumentMeta({
    slug: seo.slug,
    title: seo.title,
    description: seo.description,
    keywords: seo.keywords,
    // Quando l'utente è dentro la simulazione (phase != intro) marchiamo
    // noindex: non vogliamo che Google indicizzi gli stati transitori del
    // quiz, solo la pagina pubblica di introduzione.
    indexable: phase === "intro",
    jsonLd: [breadcrumbJsonLd("exam", "Simulazione esame OCF")],
  });

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
    <div className="flex flex-col gap-12">
      <header>
        <p className="eyebrow">Modalità esame</p>
        <h1 className="display-2 mt-3">Simulazione esame OCF.</h1>
        <p className="mt-3 max-w-prose text-ink-soft">
          Riproduce le regole dell'esame ufficiale per l'iscrizione all'Albo
          unico dei Consulenti Finanziari. Una volta avviata la simulazione, il
          timer parte e non si ferma — tratta la prova come quella vera.
        </p>
      </header>

      <section
        aria-labelledby="regole"
        className="grid gap-px bg-line-soft md:grid-cols-3"
      >
        <h2 id="regole" className="sr-only">
          Regole della simulazione
        </h2>
        <Box
          big={`${EXAM_TOTAL_QUESTIONS}`}
          unit="domande"
          body="Selezionate casualmente dal dataset, senza ripetizioni."
        />
        <Box
          big={`${EXAM_DURATION_MIN}'`}
          unit="minuti"
          body="Timer sempre visibile. Allo zero il quiz viene consegnato automaticamente."
        />
        <Box
          big={`${EXAM_PASS_THRESHOLD}`}
          unit="/100 soglia"
          body="Punteggio normalizzato. Promosso se ≥ soglia, non promosso altrimenti."
        />
      </section>

      <section className="section-rule" aria-labelledby="distribuzione">
        <p className="eyebrow">Distribuzione 24 / 19 / 6 / 6 / 5</p>
        <h2 id="distribuzione" className="font-display mt-3 text-2xl text-ink">
          Per macro-categoria
        </h2>
        <ul className="mt-5 divide-y divide-line-soft border-t border-line">
          {distribution.map(([cat, n]) => (
            <li
              key={cat}
              className="flex items-center justify-between gap-3 py-3 text-sm"
            >
              <span className="text-ink">{CATEGORY_SHORT_LABELS[cat]}</span>
              <span className="mono tabular-nums text-muted">{n} domande</span>
            </li>
          ))}
        </ul>
      </section>

      {error && (
        <div
          role="alert"
          className="border border-[var(--danger)] bg-[var(--danger-soft)] p-5 text-[var(--danger)]"
        >
          <p className="mono text-xs font-medium uppercase tracking-eyebrow">
            Impossibile avviare la simulazione
          </p>
          <p className="mt-2 text-sm">{error}</p>
        </div>
      )}

      <div className="flex justify-center border-t border-line-soft pt-8">
        <button
          type="button"
          className="btn btn-primary btn-lg"
          onClick={onStart}
        >
          Inizia simulazione
          <span aria-hidden="true">→</span>
        </button>
      </div>
    </div>
  );
}

function Box({ big, unit, body }: { big: string; unit: string; body: string }) {
  return (
    <div className="flex flex-col gap-3 bg-[var(--bg)] p-6 md:p-7">
      <p className="mono text-5xl font-semibold leading-none tracking-tight text-ink md:text-6xl">
        <span className="tabular-nums">{big}</span>
        <span className="ml-2 align-baseline text-xs font-medium uppercase tracking-eyebrow text-muted">
          {unit}
        </span>
      </p>
      <p className="text-sm text-ink-soft">{body}</p>
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

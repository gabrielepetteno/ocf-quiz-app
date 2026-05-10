/**
 * Esecuzione del quiz "pratica per categoria".
 * URL: /practice/:category?count=N&timer=M
 */
import { useEffect, useState } from "react";
import { Navigate, useParams, useSearchParams } from "react-router-dom";

import QuizPlayer from "@/components/QuizPlayer";
import ResultSummary from "@/components/ResultSummary";
import { CATEGORY_LABELS } from "@/lib/config";
import { generatePracticeQuestions } from "@/lib/examGenerator";
import { loadQuestions } from "@/lib/questions";
import { computeResult } from "@/lib/scoring";
import { appendHistory, updateErrorsFromSession } from "@/lib/storage";
import type {
  CategoryKey,
  PreparedQuestion,
  QuestionState,
  QuizSession,
  SessionResult,
} from "@/lib/types";
import { generateId } from "@/lib/utils";

const VALID_CATS: CategoryKey[] = [
  "diritto_mercato_intermediari",
  "matematica_economia_finanziaria",
  "diritto_tributario",
  "diritto_previdenziale_assicurativo",
  "diritto_privato_commerciale",
];

type Phase = "loading" | "playing" | "result";

export default function PracticeRunPage() {
  const params = useParams<{ category: string }>();
  const [search] = useSearchParams();
  const cat = params.category as CategoryKey | undefined;

  const [phase, setPhase] = useState<Phase>("loading");
  const [session, setSession] = useState<QuizSession | null>(null);
  const [states, setStates] = useState<QuestionState[]>([]);
  const [result, setResult] = useState<SessionResult | null>(null);
  const [err, setErr] = useState<string | null>(null);

  // Validazione URL
  if (!cat || !VALID_CATS.includes(cat)) {
    return <Navigate to="/practice" replace />;
  }

  const countParam = search.get("count") ?? "20";
  const timerParam = search.get("timer");
  const count: number | "all" =
    countParam === "all" ? "all" : Math.max(1, parseInt(countParam, 10) || 20);
  const timerMin = timerParam ? Math.max(1, parseInt(timerParam, 10)) : 0;

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const bundle = await loadQuestions();
        const qs = generatePracticeQuestions(bundle, cat, count);
        if (cancelled) return;
        if (qs.length === 0) {
          setErr("Nessuna domanda disponibile per questa categoria.");
          return;
        }
        const states0: QuestionState[] = qs.map(() => ({
          selectedAnswerId: null,
          flagged: false,
        }));
        setSession({
          id: generateId(),
          mode: "practice",
          category: cat,
          questions: qs,
          states: states0,
          startedAt: Date.now(),
          finishedAt: null,
          durationSec: timerMin > 0 ? timerMin * 60 : null,
        });
        setStates(states0);
        setPhase("playing");
      } catch (e) {
        if (!cancelled) {
          setErr(e instanceof Error ? e.message : "Errore sconosciuto.");
        }
      }
    })();
    return () => {
      cancelled = true;
    };
    // intenzionale: i parametri sono URL-driven, ricarica solo al cambio URL
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cat, countParam, timerParam]);

  function updateState(idx: number, next: QuestionState) {
    setStates((prev) => {
      const out = prev.slice();
      out[idx] = next;
      return out;
    });
  }

  function submit() {
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

  if (err) {
    return (
      <div className="card border-rose-300 bg-rose-50 text-rose-800">
        <p className="font-medium">Impossibile avviare la pratica</p>
        <p className="mt-1 text-sm">{err}</p>
      </div>
    );
  }

  if (phase === "loading" || !session) {
    return <div className="card text-slate-600">Sto caricando le domande…</div>;
  }

  if (phase === "result" && result) {
    return (
      <ResultSummary
        result={result}
        questions={session.questions}
        states={states}
        primaryAction={{ label: "Nuova pratica", to: "/practice" }}
      />
    );
  }

  return (
    <QuizPlayer
      questions={session.questions}
      states={states}
      startedAt={session.startedAt}
      durationSec={session.durationSec}
      modeLabel={`Pratica · ${CATEGORY_LABELS[cat]}`}
      showCategoryChip={false}
      onStateChange={updateState}
      onSubmit={submit}
    />
  );
}

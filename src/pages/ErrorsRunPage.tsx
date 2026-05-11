/**
 * Esecuzione del quiz "ripasso errori".
 * URL: /errors/run?ids=ID1,ID2,ID3
 *
 * Pesca le domande con quegli ID dal dataset, le mescola e le serve
 * come un normale quiz senza timer. Alla consegna aggiorna il registro
 * errori (le domande indovinate avvicinano lo stato "risolto").
 */
import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";

import QuizPlayer from "@/components/QuizPlayer";
import ResultSummary from "@/components/ResultSummary";
import { findByIds, prepareQuestions } from "@/lib/questions";
import { loadQuestions } from "@/lib/questions";
import { computeResult } from "@/lib/scoring";
import { appendHistory, updateErrorsFromSession } from "@/lib/storage";
import type {
  PreparedQuestion,
  QuestionState,
  QuizSession,
  SessionResult,
} from "@/lib/types";
import { generateId } from "@/lib/utils";
import { shuffle } from "@/lib/shuffle";
import { useDocumentMeta } from "@/lib/useDocumentMeta";

type Phase = "loading" | "playing" | "result" | "empty";

export default function ErrorsRunPage() {
  const [search] = useSearchParams();
  const ids = (search.get("ids") || "").split(",").filter(Boolean);

  const [phase, setPhase] = useState<Phase>("loading");
  const [session, setSession] = useState<QuizSession | null>(null);
  const [states, setStates] = useState<QuestionState[]>([]);
  const [result, setResult] = useState<SessionResult | null>(null);

  useDocumentMeta({
    slug: "errors/run",
    title: "Ripasso errori in corso · OCF Quiz",
    description: "Esecuzione del ripasso errori sull'esame OCF.",
    indexable: false,
  });

  useEffect(() => {
    if (ids.length === 0) {
      setPhase("empty");
      return;
    }
    let cancelled = false;
    (async () => {
      const bundle = await loadQuestions();
      const raws = findByIds(bundle, ids);
      if (cancelled) return;
      if (raws.length === 0) {
        setPhase("empty");
        return;
      }
      const qs: PreparedQuestion[] = prepareQuestions(shuffle(raws));
      const states0 = qs.map(() => ({
        selectedAnswerId: null,
        flagged: false,
      }));
      setSession({
        id: generateId(),
        mode: "review-errors",
        questions: qs,
        states: states0,
        startedAt: Date.now(),
        finishedAt: null,
        durationSec: null,
      });
      setStates(states0);
      setPhase("playing");
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search.get("ids")]);

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

  if (phase === "empty") {
    return (
      <div className="card flex flex-col items-start gap-3">
        <p className="eyebrow">Ripasso vuoto</p>
        <p className="text-ink-soft">
          Nessuna domanda da ripassare con questi parametri.
        </p>
        <Link to="/errors" className="btn btn-primary mt-2">
          Torna agli errori
          <span aria-hidden="true">→</span>
        </Link>
      </div>
    );
  }

  if (phase === "loading" || !session) {
    return (
      <div
        className="card flex items-center gap-3 text-ink-soft"
        aria-busy="true"
      >
        <span className="mono text-xs uppercase tracking-eyebrow text-muted">
          Caricamento
        </span>
        <span>Sto preparando il ripasso…</span>
      </div>
    );
  }

  if (phase === "result" && result) {
    return (
      <ResultSummary
        result={result}
        questions={session.questions}
        states={states}
        primaryAction={{ label: "Vedi errori", to: "/errors" }}
      />
    );
  }

  return (
    <QuizPlayer
      questions={session.questions}
      states={states}
      startedAt={session.startedAt}
      durationSec={null}
      modeLabel={`Ripasso errori (${session.questions.length})`}
      showCategoryChip
      onStateChange={updateState}
      onSubmit={submit}
    />
  );
}

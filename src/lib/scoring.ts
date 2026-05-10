/**
 * Calcolo del punteggio.
 *
 * Il sistema è flessibile per supportare:
 *  - domande con peso 1 o 2 punti (campo `points` della RawQuestion),
 *  - normalizzazione a 0-100 indipendentemente dal numero di domande,
 *  - aggregazione per categoria (per la dashboard di risultato).
 *
 * Convenzione: la risposta corretta è quella il cui id corrisponde a
 * `question.correctAnswer` (es. "A"). L'app mescola la posizione
 * visuale ma mantiene questo id intatto per il confronto.
 */

import { CATEGORY_LABELS, EXAM_MAX_SCORE, EXAM_PASS_THRESHOLD } from "./config";
import type {
  CategoryKey,
  PreparedQuestion,
  QuestionState,
  QuizSession,
  SessionResult,
} from "./types";

export interface ScoringInput {
  questions: PreparedQuestion[];
  states: QuestionState[];
}

export function isCorrect(
  q: PreparedQuestion,
  selected: QuestionState["selectedAnswerId"],
): boolean {
  if (selected == null || q.correctAnswer == null) return false;
  return selected === q.correctAnswer;
}

/**
 * Calcola il punteggio aggregato e per-categoria della sessione.
 */
export function computeResult(session: QuizSession): SessionResult {
  const { questions, states } = session;

  let rawScore = 0;
  let rawMax = 0;
  let correct = 0;
  let wrong = 0;
  let unanswered = 0;
  let answered = 0;

  // Buckets per categoria, lazy: crea solo per le categorie effettivamente
  // presenti nella sessione (in pratica per la simulazione esame ci sono
  // tutte e 5, in pratica per categoria solo una).
  type Bucket = {
    total: number;
    correct: number;
    wrong: number;
    unanswered: number;
  };
  const perCat = new Map<CategoryKey, Bucket>();
  const bucket = (cat: CategoryKey): Bucket => {
    let b = perCat.get(cat);
    if (!b) {
      b = { total: 0, correct: 0, wrong: 0, unanswered: 0 };
      perCat.set(cat, b);
    }
    return b;
  };

  for (let i = 0; i < questions.length; i++) {
    const q = questions[i];
    const st = states[i];
    rawMax += q.points;

    const b = bucket(q.category);
    b.total += 1;

    if (st.selectedAnswerId == null) {
      unanswered += 1;
      b.unanswered += 1;
      continue;
    }

    answered += 1;
    if (isCorrect(q, st.selectedAnswerId)) {
      correct += 1;
      rawScore += q.points;
      b.correct += 1;
    } else {
      wrong += 1;
      b.wrong += 1;
    }
  }

  // Normalizza a EXAM_MAX_SCORE (di default 100) per poter applicare la
  // soglia 80% in modo coerente sia in simulazione che in pratica.
  const scaledScore =
    rawMax === 0 ? 0 : Math.round((rawScore / rawMax) * EXAM_MAX_SCORE);

  const elapsedSec =
    session.finishedAt != null
      ? Math.max(0, Math.round((session.finishedAt - session.startedAt) / 1000))
      : 0;

  return {
    sessionId: session.id,
    mode: session.mode,
    category: session.category,
    startedAt: session.startedAt,
    finishedAt: session.finishedAt ?? Date.now(),
    elapsedSec,
    totalQuestions: questions.length,
    answeredCount: answered,
    correctCount: correct,
    wrongCount: wrong,
    unansweredCount: unanswered,
    rawScore,
    rawMax,
    scaledScore,
    passed: scaledScore >= EXAM_PASS_THRESHOLD,
    perCategory: Array.from(perCat.entries()).map(([cat, b]) => ({
      category: cat,
      label: CATEGORY_LABELS[cat],
      total: b.total,
      correct: b.correct,
      wrong: b.wrong,
      unanswered: b.unanswered,
      accuracy: b.total > 0 ? b.correct / b.total : 0,
    })),
  };
}

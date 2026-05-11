/**
 * Persistenza locale (localStorage).
 *
 * Salviamo qui:
 *  - lo storico delle sessioni completate (per pagina "Storico"),
 *  - il registro errori (per pagina "Ripasso errori"),
 *  - le preferenze utente (UI/UX).
 *
 * Tutto in localStorage perché l'app è 100% client-side e gratuita.
 * Per multi-device basterà aggiungere uno strato di sync futuro (Supabase
 * o simile) senza riscrivere la business logic.
 */

import { ERROR_RESOLVE_THRESHOLD, HISTORY_LIMIT } from "./config";
import type {
  ErrorEntry,
  PreparedQuestion,
  QuestionState,
  SessionResult,
  UserPreferences,
} from "./types";
import { isCorrect } from "./scoring";

const KEY_HISTORY = "ocfquiz.history.v1";
const KEY_ERRORS = "ocfquiz.errors.v1";
const KEY_PREFS = "ocfquiz.prefs.v1";

/* ----------------------------- helpers ------------------------------------ */

/**
 * Wrapper "safe" su localStorage. In modalità privacy/strict, getItem può
 * lanciare: la avvolgiamo in try/catch così l'app non crasha mai per la
 * persistenza.
 */
function readJSON<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (raw == null) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function writeJSON(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* localStorage può essere disabilitato: fail-soft */
  }
}

/* ----------------------------- history ------------------------------------ */

/**
 * Storico delle sessioni completate. Manteniamo solo le ultime
 * HISTORY_LIMIT per evitare di gonfiare localStorage.
 */
export function getHistory(): SessionResult[] {
  return readJSON<SessionResult[]>(KEY_HISTORY, []);
}

export function appendHistory(result: SessionResult): SessionResult[] {
  const history = getHistory();
  history.unshift(result);
  if (history.length > HISTORY_LIMIT) history.length = HISTORY_LIMIT;
  writeJSON(KEY_HISTORY, history);
  return history;
}

export function clearHistory(): void {
  writeJSON(KEY_HISTORY, []);
}

/**
 * Rimuove una singola sessione dallo storico, identificata dal suo sessionId.
 * Ritorna lo storico aggiornato. Usata dalla pagina /history quando l'utente
 * vuole cancellare una sola sessione senza svuotare tutto.
 */
export function removeHistoryEntry(sessionId: string): SessionResult[] {
  const history = getHistory().filter((h) => h.sessionId !== sessionId);
  writeJSON(KEY_HISTORY, history);
  return history;
}

/* ----------------------------- errors ------------------------------------- */

/**
 * Aggiorna il registro errori a partire dalle risposte di una sessione.
 * - se la domanda è sbagliata: incrementa wrongCount, segna lastSeenAt,
 *   eventualmente toglie lo stato "resolved".
 * - se la domanda è corretta MA era già nel registro: incrementa
 *   correctCount; quando supera la soglia diventa "resolved".
 * - se la domanda è corretta e non era nel registro: ignora (non è un errore).
 */
export function updateErrorsFromSession(
  questions: PreparedQuestion[],
  states: QuestionState[],
): ErrorEntry[] {
  const map = new Map<string, ErrorEntry>(
    getErrors().map((e) => [e.questionId, e]),
  );

  for (let i = 0; i < questions.length; i++) {
    const q = questions[i];
    const st = states[i];
    const correct = isCorrect(q, st.selectedAnswerId);
    const flagged = st.flagged;
    const existing = map.get(q.id);

    if (st.selectedAnswerId == null && !flagged) {
      // non risposta e non flaggata: non tocchiamo nulla
      continue;
    }

    if (!correct && st.selectedAnswerId != null) {
      // SBAGLIATA: aggiorna o crea
      if (existing) {
        existing.wrongCount += 1;
        existing.flagged = existing.flagged || flagged;
        existing.lastSeenAt = Date.now();
        existing.resolved = false;
      } else {
        map.set(q.id, {
          questionId: q.id,
          category: q.category,
          topic: q.topic,
          wrongCount: 1,
          correctCount: 0,
          flagged,
          lastSeenAt: Date.now(),
          resolved: false,
        });
      }
    } else if (correct && existing) {
      // CORRETTA ma già nel registro: avvicina la "risoluzione"
      existing.correctCount += 1;
      existing.lastSeenAt = Date.now();
      if (existing.correctCount >= ERROR_RESOLVE_THRESHOLD) {
        existing.resolved = true;
      }
    }

    // Se l'utente ha solo flaggato, registriamo comunque la flag.
    if (flagged && !existing) {
      map.set(q.id, {
        questionId: q.id,
        category: q.category,
        topic: q.topic,
        wrongCount: 0,
        correctCount: 0,
        flagged: true,
        lastSeenAt: Date.now(),
        resolved: false,
      });
    } else if (flagged && existing) {
      existing.flagged = true;
      existing.lastSeenAt = Date.now();
    }
  }

  const out = Array.from(map.values());
  writeJSON(KEY_ERRORS, out);
  return out;
}

export function getErrors(): ErrorEntry[] {
  return readJSON<ErrorEntry[]>(KEY_ERRORS, []);
}

export function setErrors(errors: ErrorEntry[]): void {
  writeJSON(KEY_ERRORS, errors);
}

export function removeError(questionId: string): void {
  setErrors(getErrors().filter((e) => e.questionId !== questionId));
}

export function clearErrors(): void {
  setErrors([]);
}

/* ----------------------------- prefs -------------------------------------- */

const DEFAULT_PREFS: UserPreferences = {
  showExplanations: true,
  examLayout: "one-by-one",
};

export function getPreferences(): UserPreferences {
  return {
    ...DEFAULT_PREFS,
    ...readJSON<UserPreferences>(KEY_PREFS, DEFAULT_PREFS),
  };
}

export function setPreferences(prefs: UserPreferences): void {
  writeJSON(KEY_PREFS, prefs);
}

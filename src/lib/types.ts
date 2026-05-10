/**
 * Tipi condivisi dell'app.
 *
 * Lo scopo è fissare in un unico posto la "forma" dei dati che girano tra
 * loader, generator, UI e localStorage, così che ogni cambiamento si propaghi
 * con il type-checker e nessun campo venga inventato a metà progetto.
 */

/** Chiavi canoniche delle 5 macro-categorie ufficiali OCF. */
export type CategoryKey =
  | "diritto_mercato_intermediari"
  | "matematica_economia_finanziaria"
  | "diritto_tributario"
  | "diritto_previdenziale_assicurativo"
  | "diritto_privato_commerciale";

/** Una singola risposta multiple-choice (id A/B/C/D + testo). */
export interface AnswerOption {
  id: "A" | "B" | "C" | "D";
  text: string;
}

/** Domanda nel formato originale, così come prodotta dal parser dei PDF. */
export interface RawQuestion {
  id: string;
  category: CategoryKey;
  topic: string;
  subcategory: string;
  numInFile: number;
  question: string;
  answers: AnswerOption[];
  /**
   * ID della risposta corretta nel materiale sorgente.
   * Per i PDF OCF forniti vale sempre "A": l'app si occupa di rimescolare
   * la posizione delle risposte a runtime per nascondere questa convenzione.
   */
  correctAnswer: "A" | "B" | "C" | "D" | null;
  explanation: string;
  points: 1 | 2;
  type: "teorica" | "pratica";
  source: string;
}

/** Metadati della categoria così come compaiono nel manifest del JSON. */
export interface CategoryMeta {
  key: CategoryKey;
  label: string;
  count: number;
}

/** Manifest dell'intero dataset, prodotto da scripts/parse_pdfs.py. */
export interface QuestionsBundle {
  version: number;
  generatedAt: string | null;
  categories: CategoryMeta[];
  totalQuestions: number;
  answersAvailable: boolean;
  answersConvention?: string;
  questions: RawQuestion[];
}

/**
 * Domanda "preparata" per la sessione corrente: ha le risposte mescolate
 * (displayAnswers) ma sa ancora quale ID era quello corretto in origine.
 */
export interface PreparedQuestion extends RawQuestion {
  /** Risposte nell'ordine effettivamente mostrato all'utente. */
  displayAnswers: AnswerOption[];
}

/** Stato di una singola domanda all'interno di una sessione di quiz. */
export interface QuestionState {
  /** id della risposta scelta dall'utente, oppure null se non ha risposto. */
  selectedAnswerId: AnswerOption["id"] | null;
  /** Domanda contrassegnata come "da rivedere" dall'utente. */
  flagged: boolean;
}

/** Modalità di sessione: simulazione esame o pratica libera. */
export type SessionMode = "exam" | "practice" | "review-errors";

/** Sessione completa, salvabile in localStorage. */
export interface QuizSession {
  id: string; // UUID-like
  mode: SessionMode;
  category?: CategoryKey; // valorizzato in pratica/ripasso per categoria
  questions: PreparedQuestion[]; // domande nell'ordine in cui sono state poste
  states: QuestionState[]; // stati paralleli (stesso indice)
  startedAt: number; // ms epoch
  finishedAt: number | null; // ms epoch (null se ancora in corso)
  durationSec: number | null; // limite di tempo (null = nessun limite)
}

/** Esito calcolato di una sessione completata. */
export interface SessionResult {
  sessionId: string;
  mode: SessionMode;
  category?: CategoryKey;
  startedAt: number;
  finishedAt: number;
  /** Tempo effettivamente impiegato dall'utente, in secondi. */
  elapsedSec: number;
  totalQuestions: number;
  answeredCount: number;
  correctCount: number;
  wrongCount: number;
  unansweredCount: number;
  /** Punteggio "grezzo" sommando i punti delle domande corrette. */
  rawScore: number;
  /** Massimo possibile date le domande della sessione. */
  rawMax: number;
  /** Punteggio normalizzato in scala 0-100 per essere confrontabile. */
  scaledScore: number;
  /** True se >= soglia di superamento (default 80). */
  passed: boolean;
  /** Performance per categoria. */
  perCategory: Array<{
    category: CategoryKey;
    label: string;
    total: number;
    correct: number;
    wrong: number;
    unanswered: number;
    accuracy: number; // 0..1
  }>;
}

/** Singolo errore tracciato nel "registro errori". */
export interface ErrorEntry {
  questionId: string;
  category: CategoryKey;
  topic: string;
  /** Numero di volte che l'utente ha sbagliato la domanda. */
  wrongCount: number;
  /** Numero di volte che l'utente l'ha indovinata dopo averla sbagliata. */
  correctCount: number;
  /** Domanda contrassegnata "da rivedere" almeno una volta. */
  flagged: boolean;
  lastSeenAt: number; // ms epoch
  /** Vera quando correctCount >= soglia config: la domanda è "risolta". */
  resolved: boolean;
}

/** Configurazione runtime persistita (preferenze utente). */
export interface UserPreferences {
  /** Mostra/nascondi spiegazioni in pratica. */
  showExplanations: boolean;
  /** Modalità una-domanda-per-schermata o tutte in lista. */
  examLayout: "one-by-one" | "list";
}

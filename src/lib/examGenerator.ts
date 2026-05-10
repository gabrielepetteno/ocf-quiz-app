/**
 * Generatore di sessioni d'esame.
 *
 * Costruisce le 60 domande della simulazione ufficiale rispettando la
 * proporzione 24/19/6/6/5 (vedi config.EXAM_DISTRIBUTION). Garantisce:
 *  - nessun duplicato all'interno della stessa simulazione,
 *  - errore esplicito se una categoria non ha abbastanza domande,
 *  - ordine finale mescolato così che le 5 categorie siano interlacciate.
 */

import { EXAM_DISTRIBUTION, EXAM_TOTAL_QUESTIONS } from "./config";
import { filterByCategory, prepareQuestions } from "./questions";
import { pickRandom, shuffle } from "./shuffle";
import type {
  CategoryKey,
  PreparedQuestion,
  QuestionsBundle,
  RawQuestion,
} from "./types";

/** Errore lanciato quando il dataset è insufficiente per la simulazione. */
export class InsufficientQuestionsError extends Error {
  constructor(
    public readonly category: CategoryKey,
    public readonly need: number,
    public readonly have: number,
  ) {
    super(
      `Categoria "${category}": servono ${need} domande ma ne sono disponibili solo ${have}.`,
    );
    this.name = "InsufficientQuestionsError";
  }
}

/**
 * Crea le 60 domande di una simulazione esame seguendo la distribuzione
 * ufficiale. Lancia InsufficientQuestionsError se una categoria è scarsa.
 */
export function generateExamQuestions(
  bundle: QuestionsBundle,
): PreparedQuestion[] {
  const distributionTotal = Object.values(EXAM_DISTRIBUTION).reduce(
    (a, b) => a + b,
    0,
  );
  if (distributionTotal !== EXAM_TOTAL_QUESTIONS) {
    // Sanity check: la distribuzione deve sommare al totale richiesto.
    throw new Error(
      `Configurazione invalida: EXAM_DISTRIBUTION somma ${distributionTotal}, atteso ${EXAM_TOTAL_QUESTIONS}.`,
    );
  }

  const picked: RawQuestion[] = [];
  for (const [cat, n] of Object.entries(EXAM_DISTRIBUTION) as Array<
    [CategoryKey, number]
  >) {
    const pool = filterByCategory(bundle, cat);
    if (pool.length < n) {
      throw new InsufficientQuestionsError(cat, n, pool.length);
    }
    picked.push(...pickRandom(pool, n));
  }

  // Interleaving finale: l'utente non deve trovarsi 24 domande della stessa
  // categoria di fila. Mescoliamo a livello globale.
  const interleaved = shuffle(picked);
  return prepareQuestions(interleaved);
}

/**
 * Genera N domande per la modalità "pratica per categoria" senza vincoli
 * di proporzione. Se richiesto > pool disponibile, restituisce tutte le
 * domande della categoria mescolate.
 */
export function generatePracticeQuestions(
  bundle: QuestionsBundle,
  category: CategoryKey,
  count: number | "all",
): PreparedQuestion[] {
  const pool = filterByCategory(bundle, category);
  const wanted = count === "all" ? pool.length : Math.min(count, pool.length);
  return prepareQuestions(pickRandom(pool, wanted));
}

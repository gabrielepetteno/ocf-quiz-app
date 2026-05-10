/**
 * Caricamento e accesso al database delle domande.
 *
 * Il dataset è un singolo JSON statico generato dallo script Python che
 * legge i PDF (vedi scripts/parse_pdfs.py). Lo carichiamo lazily al primo
 * accesso e lo teniamo in cache in memoria per il resto della sessione.
 */

import { QUESTIONS_DATA_URL } from "./config";
import type {
  CategoryKey,
  PreparedQuestion,
  QuestionsBundle,
  RawQuestion,
} from "./types";
import { shuffle } from "./shuffle";

let cache: QuestionsBundle | null = null;
let pending: Promise<QuestionsBundle> | null = null;

/**
 * Carica il bundle delle domande. Se è già stato caricato in precedenza,
 * restituisce immediatamente la versione in cache.
 */
export async function loadQuestions(): Promise<QuestionsBundle> {
  if (cache) return cache;
  if (pending) return pending;

  pending = (async () => {
    const res = await fetch(QUESTIONS_DATA_URL, { cache: "force-cache" });
    if (!res.ok) {
      throw new Error(
        `Impossibile caricare il dataset domande (HTTP ${res.status}).`,
      );
    }
    const data = (await res.json()) as QuestionsBundle;
    cache = data;
    return data;
  })();

  return pending;
}

/** Restituisce le domande filtrate per categoria. */
export function filterByCategory(
  bundle: QuestionsBundle,
  category: CategoryKey,
): RawQuestion[] {
  return bundle.questions.filter((q) => q.category === category);
}

/** Restituisce le domande il cui id è in `ids`, mantenendo l'ordine di `ids`. */
export function findByIds(
  bundle: QuestionsBundle,
  ids: string[],
): RawQuestion[] {
  const map = new Map(bundle.questions.map((q) => [q.id, q]));
  return ids.map((id) => map.get(id)).filter((q): q is RawQuestion => !!q);
}

/**
 * Trasforma una domanda "raw" in una domanda "preparata" per la sessione:
 * mescola l'ordine delle 4 risposte. La risposta corretta resta tracciata
 * tramite il campo correctAnswer (che contiene l'ID originale, non la
 * posizione mostrata).
 */
export function prepareQuestion(q: RawQuestion): PreparedQuestion {
  return {
    ...q,
    displayAnswers: shuffle(q.answers),
  };
}

export function prepareQuestions(qs: RawQuestion[]): PreparedQuestion[] {
  return qs.map(prepareQuestion);
}

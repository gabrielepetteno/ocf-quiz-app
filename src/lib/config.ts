/**
 * Configurazione centrale dell'app.
 *
 * Tutti i parametri "regolabili" — durata esame, soglia di superamento,
 * distribuzione delle domande, etc. — vivono qui, così che la logica di
 * business non sia hardcoded sparsa nel codice e per poterla aggiornare
 * facilmente in futuro (ad esempio se OCF cambia struttura).
 */

import type { CategoryKey } from "./types";

/** Durata della simulazione ufficiale OCF, in minuti. */
export const EXAM_DURATION_MIN = 85;

/** Numero di domande della simulazione ufficiale. */
export const EXAM_TOTAL_QUESTIONS = 60;

/** Punteggio massimo nominale dell'esame (per UI/risultati). */
export const EXAM_MAX_SCORE = 100;

/** Soglia di superamento (su 100). >= ⇒ promosso, < ⇒ non promosso. */
export const EXAM_PASS_THRESHOLD = 80;

/**
 * Distribuzione UFFICIALE delle 60 domande per macro-categoria.
 * La somma deve restare 60: una runtime check in examGenerator.ts lo verifica.
 */
export const EXAM_DISTRIBUTION: Record<CategoryKey, number> = {
  diritto_mercato_intermediari: 24,
  matematica_economia_finanziaria: 19,
  diritto_tributario: 6,
  diritto_previdenziale_assicurativo: 6,
  diritto_privato_commerciale: 5,
};

/**
 * Etichette user-friendly per categoria.
 * Tenute qui invece che nel JSON così che, anche se il parser cambia,
 * l'UI resti coerente.
 */
export const CATEGORY_LABELS: Record<CategoryKey, string> = {
  diritto_mercato_intermediari:
    "Diritto del mercato finanziario, intermediari e disciplina del consulente",
  matematica_economia_finanziaria:
    "Matematica finanziaria, economia, pianificazione e finanza comportamentale",
  diritto_tributario: "Diritto tributario del mercato finanziario",
  diritto_previdenziale_assicurativo: "Diritto previdenziale e assicurativo",
  diritto_privato_commerciale: "Diritto privato e commerciale",
};

/** Label brevi (per chip/grafici). */
export const CATEGORY_SHORT_LABELS: Record<CategoryKey, string> = {
  diritto_mercato_intermediari: "Mercato & Intermediari",
  matematica_economia_finanziaria: "Matematica & Economia",
  diritto_tributario: "Tributario",
  diritto_previdenziale_assicurativo: "Previdenza & Assicurazioni",
  diritto_privato_commerciale: "Privato & Commerciale",
};

/** Quante volte una domanda deve essere indovinata per essere "risolta". */
export const ERROR_RESOLVE_THRESHOLD = 2;

/** Numero massimo di sessioni storiche conservate in localStorage. */
export const HISTORY_LIMIT = 200;

/** Path al manifest dei dati. Servito da public/data/. */
export const QUESTIONS_DATA_URL = "/data/questions.json";

/** Numeri di domande proposti nella pratica per categoria. */
export const PRACTICE_SIZE_OPTIONS = [10, 20, 30, 50, "all"] as const;
export type PracticeSizeOption = (typeof PRACTICE_SIZE_OPTIONS)[number];

/**
 * Statistiche aggregate per la dashboard utente.
 *
 * Calcoliamo on-the-fly a partire dallo storico in localStorage: lo storico
 * è limitato (HISTORY_LIMIT = 200) quindi il costo è trascurabile.
 */

import type { CategoryKey, SessionResult } from "./types";
import { CATEGORY_LABELS } from "./config";

export interface UserStats {
  /** Numero totale di sessioni completate (esame + pratica). */
  totalSessions: number;
  /** Numero di simulazioni esame complete. */
  examSessions: number;
  /** Punteggio medio (0-100) su tutte le sessioni. */
  averageScore: number;
  /** Percentuale di sessioni in cui >= soglia di superamento. */
  successRate: number;
  /** Performance media per categoria, ordinata dalla più debole. */
  perCategory: Array<{
    category: CategoryKey;
    label: string;
    accuracy: number; // 0..1
    samples: number;
  }>;
}

export function computeStats(history: SessionResult[]): UserStats {
  const totalSessions = history.length;
  const examSessions = history.filter((h) => h.mode === "exam").length;

  const avg = totalSessions
    ? Math.round(history.reduce((s, h) => s + h.scaledScore, 0) / totalSessions)
    : 0;

  const passed = history.filter((h) => h.passed).length;
  const successRate = totalSessions ? passed / totalSessions : 0;

  // Aggrega per categoria sommando correct/total da ogni perCategory.
  const acc = new Map<CategoryKey, { correct: number; total: number }>();
  for (const h of history) {
    for (const c of h.perCategory) {
      const v = acc.get(c.category) ?? { correct: 0, total: 0 };
      v.correct += c.correct;
      v.total += c.total;
      acc.set(c.category, v);
    }
  }

  const perCategory = Array.from(acc.entries())
    .map(([cat, v]) => ({
      category: cat,
      label: CATEGORY_LABELS[cat],
      accuracy: v.total > 0 ? v.correct / v.total : 0,
      samples: v.total,
    }))
    // Mostriamo dalla più debole alla più forte: l'utente vede subito
    // dove conviene investire ripasso.
    .sort((a, b) => a.accuracy - b.accuracy);

  return {
    totalSessions,
    examSessions,
    averageScore: avg,
    successRate,
    perCategory,
  };
}

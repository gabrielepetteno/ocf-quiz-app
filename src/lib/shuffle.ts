/**
 * Utility di mescolamento.
 *
 * Usiamo un Fisher-Yates "in-place su copia" per evitare bias.
 * Per scopi non-crittografici Math.random() è sufficiente.
 */

/** Restituisce una copia mescolata dell'array passato. Non modifica l'originale. */
export function shuffle<T>(arr: readonly T[]): T[] {
  const out = arr.slice();
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

/**
 * Sceglie n elementi distinti dall'array. Se n >= length restituisce
 * una copia mescolata di tutti gli elementi.
 */
export function pickRandom<T>(arr: readonly T[], n: number): T[] {
  if (n >= arr.length) return shuffle(arr);
  return shuffle(arr).slice(0, n);
}

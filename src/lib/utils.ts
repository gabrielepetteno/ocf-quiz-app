/**
 * Mini-utility condivise.
 */

/** ID di sessione (UUID o fallback per ambienti vecchi). */
export function generateId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

/** clamp(x, min, max) */
export function clamp(x: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, x));
}

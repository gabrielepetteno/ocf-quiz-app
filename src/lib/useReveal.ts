/**
 * useReveal — IntersectionObserver-driven entrance animation.
 *
 * Ritorna una **callback ref** (non un RefObject). React la invoca al mount
 * del nodo DOM, anche per sezioni che montano in modo condizionale (es. dopo
 * una fetch). Questo evita il bug classico in cui useEffect parte prima che
 * il ref sia attaccato e l'observer non viene mai inizializzato.
 *
 * Aggiunge la classe `is-visible` al nodo quando entra nel viewport. Da usare
 * insieme a `.reveal` o `.reveal-stagger` definite in index.css.
 *
 * Honors `prefers-reduced-motion` automatically (CSS forza opacity:1).
 */
import { useCallback, useEffect, useRef } from "react";

export function useReveal<T extends HTMLElement>(options?: {
  threshold?: number;
  rootMargin?: string;
  once?: boolean;
}) {
  const observerRef = useRef<IntersectionObserver | null>(null);
  const threshold = options?.threshold ?? 0.05;
  const rootMargin = options?.rootMargin ?? "0px 0px -5% 0px";
  const once = options?.once ?? true;

  const setRef = useCallback(
    (node: T | null) => {
      // disconnetti eventuale observer precedente
      if (observerRef.current) {
        observerRef.current.disconnect();
        observerRef.current = null;
      }

      if (!node) return;

      // SSR / browser senza IntersectionObserver: mostra subito.
      if (typeof IntersectionObserver === "undefined") {
        node.classList.add("is-visible");
        return;
      }

      // Safety net: se l'elemento è già visibile al mount (es. above-the-fold)
      // applichiamo `is-visible` immediatamente, poi attacchiamo l'observer
      // per gestire scroll-into-view future (a meno che `once` sia true).
      const rect = node.getBoundingClientRect();
      const inView = rect.top < window.innerHeight && rect.bottom > 0;
      if (inView) {
        node.classList.add("is-visible");
        if (once) return;
      }

      const obs = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              node.classList.add("is-visible");
              if (once) {
                obs.disconnect();
                observerRef.current = null;
              }
            } else if (!once) {
              node.classList.remove("is-visible");
            }
          });
        },
        { threshold, rootMargin },
      );
      obs.observe(node);
      observerRef.current = obs;
    },
    [threshold, rootMargin, once],
  );

  return setRef;
}

/**
 * useCountUp — animates a numeric element from 0 to `target` when it enters
 * the viewport. No-op under prefers-reduced-motion.
 *
 * Anche qui usiamo callback ref per safety: l'elemento esiste subito al mount,
 * ma proteggiamo da remount/HMR senza compromessi.
 */
export function useCountUp(target: number, durationMs = 1200) {
  const ref = useRef<HTMLElement | null>(null);
  const fired = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const prefersReduced =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced || target === 0) {
      el.textContent = formatIt(target);
      return;
    }

    // Se già in viewport al mount, animiamo subito.
    const rect = el.getBoundingClientRect();
    const inView = rect.top < window.innerHeight && rect.bottom > 0;
    if (inView) {
      animate(el, target, durationMs);
      fired.current = true;
      return;
    }

    if (typeof IntersectionObserver === "undefined") {
      el.textContent = formatIt(target);
      return;
    }

    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !fired.current) {
            fired.current = true;
            animate(el, target, durationMs);
            obs.disconnect();
          }
        });
      },
      { threshold: 0.3 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [target, durationMs]);

  return ref;
}

function animate(el: HTMLElement, target: number, durationMs: number) {
  const start = performance.now();
  const frame = (now: number) => {
    const t = Math.min((now - start) / durationMs, 1);
    const eased = 1 - Math.pow(1 - t, 4);
    el.textContent = formatIt(Math.round(target * eased));
    if (t < 1) requestAnimationFrame(frame);
  };
  requestAnimationFrame(frame);
}

function formatIt(n: number): string {
  return n.toLocaleString("it-IT");
}

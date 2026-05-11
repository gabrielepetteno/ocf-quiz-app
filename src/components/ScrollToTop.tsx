/**
 * Reset dello scroll al cambio rotta.
 *
 * Senza questo componente, una SPA che cambia path mantiene la posizione di
 * scroll della pagina precedente — male per UX e per i Core Web Vitals
 * percepiti (l'utente atterra "a metà" sulla nuova pagina).
 */
import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export default function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" as ScrollBehavior });
  }, [pathname]);
  return null;
}

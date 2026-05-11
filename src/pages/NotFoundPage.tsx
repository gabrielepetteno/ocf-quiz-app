/** Pagina 404 — non indicizzata, editorial style. */
import { Link } from "react-router-dom";

import { useDocumentMeta } from "@/lib/useDocumentMeta";

export default function NotFoundPage() {
  useDocumentMeta({
    slug: "404",
    title: "Pagina non trovata · OCF Quiz",
    description:
      "La pagina che cercavi non esiste o è stata spostata. Torna alla home di OCF Quiz e scopri il simulatore esame consulenti finanziari.",
    indexable: false,
  });

  return (
    <div className="flex flex-col items-center gap-6 py-16 text-center md:py-24">
      <p
        className="mono text-[clamp(6rem,16vw,13rem)] font-semibold leading-none tracking-tightest tabular-nums text-ink"
        aria-hidden="true"
      >
        4<span className="text-accent">0</span>4
      </p>
      <p className="mono text-xs uppercase tracking-eyebrow text-muted">
        Errore 404 · Pagina non trovata
      </p>
      <h1 className="font-display max-w-prose text-3xl font-medium leading-tight text-ink md:text-4xl">
        Questo indirizzo non esiste, o non esiste più.
      </h1>
      <p className="max-w-prose text-ink-soft">
        Forse hai seguito un link vecchio, o l'URL contiene un refuso. Da qui
        puoi tornare alla home o leggere la guida all'esame.
      </p>
      <div className="mt-2 flex flex-wrap justify-center gap-2">
        <Link to="/" className="btn btn-primary">
          Torna alla home
          <span aria-hidden="true">→</span>
        </Link>
        <Link to="/guida-esame-ocf" className="btn btn-secondary">
          Vai alla guida OCF
        </Link>
      </div>
    </div>
  );
}

/** Pagina 404 — non indicizzata. */
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
    <div className="card text-center">
      <p className="text-5xl" aria-hidden="true">
        🔍
      </p>
      <h1 className="mt-3 text-xl font-semibold text-slate-900">
        Pagina non trovata
      </h1>
      <p className="mt-1 text-slate-600">
        L'indirizzo che cercavi non esiste o è stato spostato.
      </p>
      <div className="mt-4 flex flex-wrap justify-center gap-2">
        <Link to="/" className="btn-primary">
          Torna alla home
        </Link>
        <Link to="/guida-esame-ocf" className="btn-secondary">
          Vai alla guida OCF
        </Link>
      </div>
    </div>
  );
}

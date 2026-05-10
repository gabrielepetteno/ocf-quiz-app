/** Pagina 404. */
import { Link } from "react-router-dom";

export default function NotFoundPage() {
  return (
    <div className="card text-center">
      <p className="text-5xl">🔍</p>
      <h1 className="mt-3 text-xl font-semibold text-slate-900">
        Pagina non trovata
      </h1>
      <p className="mt-1 text-slate-600">
        L'indirizzo che cercavi non esiste o è stato spostato.
      </p>
      <Link to="/" className="btn-primary mt-4 inline-flex">
        Torna alla home
      </Link>
    </div>
  );
}

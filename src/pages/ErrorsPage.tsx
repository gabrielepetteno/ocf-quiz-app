/**
 * Pagina "Ripasso errori".
 *
 * Mostra il registro errori (alimentato da updateErrorsFromSession) con
 * filtri per categoria, contrassegno "da rivedere", numero di sbagli,
 * stato risolto/non risolto. L'utente può rifare solo gli errori filtrati.
 */
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { Link, useNavigate } from "react-router-dom";

import {
  CATEGORY_LABELS,
  CATEGORY_SHORT_LABELS,
  ERROR_RESOLVE_THRESHOLD,
} from "@/lib/config";
import { clearErrors, getErrors, removeError } from "@/lib/storage";
import type { CategoryKey, ErrorEntry } from "@/lib/types";
import { formatDateTime } from "@/lib/format";

type Filter =
  | "all"
  | "unresolved"
  | "flagged"
  | "frequent" // sbagliate >= 2 volte
  | "resolved"
  | CategoryKey;

const CATEGORIES: CategoryKey[] = [
  "diritto_mercato_intermediari",
  "matematica_economia_finanziaria",
  "diritto_tributario",
  "diritto_previdenziale_assicurativo",
  "diritto_privato_commerciale",
];

export default function ErrorsPage() {
  const nav = useNavigate();
  const [errors, setErrors] = useState<ErrorEntry[]>([]);
  const [filter, setFilter] = useState<Filter>("unresolved");

  useEffect(() => {
    setErrors(getErrors());
  }, []);

  const filtered = useMemo(() => {
    return errors
      .filter((e) => {
        switch (filter) {
          case "all":
            return true;
          case "unresolved":
            return !e.resolved;
          case "flagged":
            return e.flagged;
          case "frequent":
            return e.wrongCount >= 2;
          case "resolved":
            return e.resolved;
          default:
            return e.category === filter;
        }
      })
      .sort(
        (a, b) => b.wrongCount - a.wrongCount || b.lastSeenAt - a.lastSeenAt,
      );
  }, [errors, filter]);

  function startReview() {
    if (filtered.length === 0) return;
    const ids = filtered.map((e) => e.questionId).join(",");
    nav(`/errors/run?ids=${encodeURIComponent(ids)}`);
  }

  function reset() {
    if (
      confirm(
        "Cancellare l'intero registro errori? Questa azione non può essere annullata.",
      )
    ) {
      clearErrors();
      setErrors([]);
    }
  }

  function dropOne(id: string) {
    removeError(id);
    setErrors(getErrors());
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Ripasso errori</h1>
          <p className="mt-1 text-slate-600">
            {errors.length === 0
              ? "Non hai ancora errori da ripassare."
              : `${errors.length} domande nel registro · una domanda è 'risolta' dopo ${ERROR_RESOLVE_THRESHOLD} risposte corrette consecutive.`}
          </p>
        </div>

        {errors.length > 0 && (
          <div className="flex gap-2">
            <button
              type="button"
              className="btn-primary"
              onClick={startReview}
              disabled={filtered.length === 0}
            >
              Rifai {filtered.length > 0 ? filtered.length : ""} domande
            </button>
            <button type="button" className="btn-secondary" onClick={reset}>
              Svuota registro
            </button>
          </div>
        )}
      </header>

      {/* Filtri */}
      {errors.length > 0 && (
        <section className="flex flex-wrap gap-2 text-sm">
          <FilterPill
            on={filter === "unresolved"}
            onClick={() => setFilter("unresolved")}
          >
            Da risolvere
          </FilterPill>
          <FilterPill
            on={filter === "flagged"}
            onClick={() => setFilter("flagged")}
          >
            Contrassegnate
          </FilterPill>
          <FilterPill
            on={filter === "frequent"}
            onClick={() => setFilter("frequent")}
          >
            Sbagliate ≥ 2 volte
          </FilterPill>
          <FilterPill
            on={filter === "resolved"}
            onClick={() => setFilter("resolved")}
          >
            Risolte
          </FilterPill>
          <FilterPill on={filter === "all"} onClick={() => setFilter("all")}>
            Tutte
          </FilterPill>
          {CATEGORIES.map((c) => (
            <FilterPill key={c} on={filter === c} onClick={() => setFilter(c)}>
              {CATEGORY_SHORT_LABELS[c]}
            </FilterPill>
          ))}
        </section>
      )}

      {/* Lista */}
      {errors.length === 0 ? (
        <div className="card text-center text-slate-600">
          <p>
            Una volta che farai dei quiz, le domande sbagliate finiranno qui.
          </p>
          <Link to="/practice" className="btn-primary mt-4 inline-flex">
            Inizia una pratica
          </Link>
        </div>
      ) : filtered.length === 0 ? (
        <div className="card text-slate-600">
          Nessuna domanda corrisponde a questo filtro.
        </div>
      ) : (
        <ul className="space-y-2">
          {filtered.map((e) => (
            <li
              key={e.questionId}
              className="card flex items-start justify-between gap-3"
            >
              <div>
                <p className="text-xs uppercase tracking-wide text-slate-500">
                  {CATEGORY_LABELS[e.category]} · {e.topic}
                </p>
                <div className="mt-1 flex flex-wrap items-center gap-2 text-sm">
                  <span className="chip bg-rose-50 text-rose-700 border-rose-200">
                    {e.wrongCount} sbagli
                  </span>
                  {e.correctCount > 0 && (
                    <span className="chip bg-emerald-50 text-emerald-700 border-emerald-200">
                      {e.correctCount} corrette
                    </span>
                  )}
                  {e.flagged && (
                    <span className="chip bg-amber-50 text-amber-700 border-amber-200">
                      ★ Da rivedere
                    </span>
                  )}
                  {e.resolved && (
                    <span className="chip bg-emerald-50 text-emerald-700 border-emerald-200">
                      ✓ Risolta
                    </span>
                  )}
                  <span className="text-xs text-slate-400">
                    Ultima volta: {formatDateTime(e.lastSeenAt)}
                  </span>
                </div>
              </div>
              <button
                type="button"
                className="btn-ghost text-slate-500"
                onClick={() => dropOne(e.questionId)}
                aria-label="Rimuovi dal registro"
                title="Rimuovi dal registro"
              >
                ✕
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function FilterPill({
  children,
  on,
  onClick,
}: {
  children: ReactNode;
  on: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        on
          ? "rounded-full bg-brand-600 text-white px-3 py-1 text-xs font-medium"
          : "rounded-full bg-white border border-slate-300 text-slate-700 hover:bg-slate-100 px-3 py-1 text-xs font-medium"
      }
    >
      {children}
    </button>
  );
}

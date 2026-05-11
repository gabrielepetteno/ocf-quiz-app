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
import { useDocumentMeta } from "@/lib/useDocumentMeta";
import { breadcrumbJsonLd, getPageSeo } from "@/lib/seo";

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

  const seo = getPageSeo("errors")!;
  useDocumentMeta({
    slug: seo.slug,
    title: seo.title,
    description: seo.description,
    keywords: seo.keywords,
    jsonLd: [breadcrumbJsonLd("errors", "Ripasso errori")],
  });

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
    <div className="flex flex-col gap-10">
      <header className="flex flex-wrap items-end justify-between gap-4 border-b border-ink pb-6">
        <div>
          <p className="eyebrow">Ripasso mirato</p>
          <h1 className="display-2 mt-3">Sbagli che diventano lezioni.</h1>
          <p className="mt-3 max-w-prose text-ink-soft">
            {errors.length === 0
              ? "Non hai ancora errori da ripassare. Falli, e ricomparrai qui."
              : `${errors.length} domande nel registro · una domanda è 'risolta' dopo ${ERROR_RESOLVE_THRESHOLD} risposte corrette consecutive.`}
          </p>
        </div>

        {errors.length > 0 && (
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              className="btn btn-primary"
              onClick={startReview}
              disabled={filtered.length === 0}
            >
              Rifai {filtered.length > 0 ? filtered.length : ""} domande
              <span aria-hidden="true">→</span>
            </button>
            <button type="button" className="btn btn-secondary" onClick={reset}>
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
        <div className="card flex flex-col items-center gap-4 py-12 text-center">
          <p className="font-display text-xl text-ink">Il registro è vuoto.</p>
          <p className="max-w-prose text-sm text-ink-soft">
            Una volta fatti dei quiz, le domande sbagliate verranno raccolte qui
            per il ripasso mirato.
          </p>
          <Link to="/practice" className="btn btn-primary mt-2">
            Inizia una pratica
            <span aria-hidden="true">→</span>
          </Link>
        </div>
      ) : filtered.length === 0 ? (
        <div className="card text-ink-soft">
          Nessuna domanda corrisponde a questo filtro.
        </div>
      ) : (
        <ul className="divide-y divide-line-soft border-y border-line">
          {filtered.map((e) => (
            <li
              key={e.questionId}
              className="flex items-start justify-between gap-3 py-4"
            >
              <div className="min-w-0">
                <p className="mono text-[0.7rem] uppercase tracking-eyebrow text-muted">
                  {CATEGORY_LABELS[e.category]} · {e.topic}
                </p>
                <div className="mt-2 flex flex-wrap items-center gap-2 text-sm">
                  <span className="chip chip-danger">
                    {e.wrongCount} sbagli
                  </span>
                  {e.correctCount > 0 && (
                    <span className="chip chip-success">
                      {e.correctCount} corrette
                    </span>
                  )}
                  {e.flagged && (
                    <span className="chip chip-warn">★ Da rivedere</span>
                  )}
                  {e.resolved && (
                    <span className="chip chip-success">✓ Risolta</span>
                  )}
                  <span className="mono text-[0.7rem] uppercase tracking-eyebrow text-muted">
                    {formatDateTime(e.lastSeenAt)}
                  </span>
                </div>
              </div>
              <button
                type="button"
                className="btn btn-ghost shrink-0"
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
      aria-pressed={on}
      className={
        on
          ? "mono rounded-full bg-ink px-3 py-1.5 text-[0.7rem] font-medium uppercase tracking-eyebrow text-[var(--bg)]"
          : "mono rounded-full border border-line-paper bg-[var(--bg)] px-3 py-1.5 text-[0.7rem] font-medium uppercase tracking-eyebrow text-ink-soft hover:border-ink hover:text-ink"
      }
    >
      {children}
    </button>
  );
}

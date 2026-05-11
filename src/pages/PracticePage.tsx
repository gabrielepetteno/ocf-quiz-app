/**
 * Pagina di selezione "pratica per categoria".
 * Editorial three-step picker: categoria → numero → timer.
 */
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { CATEGORY_LABELS, PRACTICE_SIZE_OPTIONS } from "@/lib/config";
import { loadQuestions } from "@/lib/questions";
import type { CategoryKey, CategoryMeta } from "@/lib/types";
import { useDocumentMeta } from "@/lib/useDocumentMeta";
import { breadcrumbJsonLd, getPageSeo } from "@/lib/seo";

export default function PracticePage() {
  const nav = useNavigate();
  const [categories, setCategories] = useState<CategoryMeta[]>([]);
  const [chosen, setChosen] = useState<CategoryKey | null>(null);
  const [count, setCount] = useState<number | "all">(20);
  const [timerMin, setTimerMin] = useState<number>(0);

  const seo = getPageSeo("practice")!;
  useDocumentMeta({
    slug: seo.slug,
    title: seo.title,
    description: seo.description,
    keywords: seo.keywords,
    jsonLd: [breadcrumbJsonLd("practice", "Pratica per categoria")],
  });

  useEffect(() => {
    loadQuestions().then((b) => setCategories(b.categories));
  }, []);

  function start() {
    if (!chosen) return;
    const q = new URLSearchParams();
    q.set("count", String(count));
    if (timerMin > 0) q.set("timer", String(timerMin));
    nav(`/practice/${chosen}?${q.toString()}`);
  }

  return (
    <div className="flex flex-col gap-12">
      <header>
        <p className="eyebrow">Allenamento libero</p>
        <h1 className="display-2 mt-3">Costruisci la tua sessione.</h1>
        <p className="mt-3 max-w-prose text-ink-soft">
          Allenati su una macro-categoria specifica, senza vincoli di
          proporzione esame.
        </p>
      </header>

      {/* 1. Categoria */}
      <section className="section-rule">
        <p className="eyebrow">Scegli la categoria</p>
        <ul className="mt-6 grid gap-px bg-line-soft md:grid-cols-2">
          {categories.map((c) => {
            const isChosen = chosen === c.key;
            return (
              <li key={c.key}>
                <button
                  type="button"
                  onClick={() => setChosen(c.key)}
                  className={[
                    "flex w-full items-center justify-between gap-4 bg-[var(--bg)] p-5 text-left transition-colors",
                    isChosen
                      ? "bg-[var(--accent-tint)] outline outline-2 outline-[var(--accent)]"
                      : "hover:bg-[var(--bg-paper)]",
                  ].join(" ")}
                  aria-pressed={isChosen}
                >
                  <div>
                    <p className="font-display text-base font-medium text-ink">
                      {CATEGORY_LABELS[c.key]}
                    </p>
                    <p className="mono mt-1 text-xs uppercase tracking-eyebrow text-muted">
                      {c.count.toLocaleString("it-IT")} domande disponibili
                    </p>
                  </div>
                  <span
                    aria-hidden="true"
                    className={
                      isChosen ? "text-accent text-lg" : "text-muted text-lg"
                    }
                  >
                    {isChosen ? "●" : "○"}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </section>

      {/* 2. Numero domande */}
      <section className="section-rule">
        <p className="eyebrow">Quante domande</p>
        <div className="mt-5 flex flex-wrap gap-2">
          {PRACTICE_SIZE_OPTIONS.map((opt) => {
            const label = opt === "all" ? "Tutte" : String(opt);
            const isOn =
              opt === count ||
              (opt === "all" && count === "all") ||
              (opt !== "all" && count === opt);
            return (
              <button
                key={String(opt)}
                type="button"
                onClick={() => setCount(opt === "all" ? "all" : Number(opt))}
                className={isOn ? "btn btn-primary" : "btn btn-secondary"}
                aria-pressed={isOn}
              >
                {label}
              </button>
            );
          })}
        </div>
      </section>

      {/* 3. Timer */}
      <section className="section-rule">
        <p className="eyebrow">Timer (opzionale)</p>
        <div className="mt-5 flex flex-wrap items-center gap-2">
          {[0, 5, 10, 15, 30, 60].map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setTimerMin(m)}
              className={
                timerMin === m ? "btn btn-primary" : "btn btn-secondary"
              }
              aria-pressed={timerMin === m}
            >
              {m === 0 ? "Senza timer" : `${m} min`}
            </button>
          ))}
        </div>
      </section>

      <div className="flex flex-wrap items-center justify-end gap-2 border-t border-line-soft pt-6">
        <Link to="/" className="btn btn-ghost">
          Annulla
        </Link>
        <button
          type="button"
          className="btn btn-primary btn-lg"
          disabled={!chosen}
          onClick={start}
        >
          Inizia pratica
          <span aria-hidden="true">→</span>
        </button>
      </div>
    </div>
  );
}

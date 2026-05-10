/**
 * Pagina di selezione "pratica per categoria".
 * L'utente sceglie:
 *  - categoria (5 opzioni),
 *  - numero domande (10/20/30/50/all),
 *  - timer opzionale (in minuti).
 * Poi naviga a /practice/:category con i parametri come query string.
 */
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { CATEGORY_LABELS, PRACTICE_SIZE_OPTIONS } from "@/lib/config";
import { loadQuestions } from "@/lib/questions";
import type { CategoryKey, CategoryMeta } from "@/lib/types";

export default function PracticePage() {
  const nav = useNavigate();
  const [categories, setCategories] = useState<CategoryMeta[]>([]);
  const [chosen, setChosen] = useState<CategoryKey | null>(null);
  const [count, setCount] = useState<number | "all">(20);
  const [timerMin, setTimerMin] = useState<number>(0); // 0 = nessun timer

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
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-slate-900">
          Pratica per categoria
        </h1>
        <p className="mt-1 text-slate-600">
          Allenati su una macro-categoria specifica, senza vincoli di
          proporzione esame.
        </p>
      </header>

      {/* Scelta categoria */}
      <section>
        <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-slate-500">
          1. Categoria
        </h2>
        <ul className="grid gap-3 md:grid-cols-2">
          {categories.map((c) => {
            const isChosen = chosen === c.key;
            return (
              <li key={c.key}>
                <button
                  type="button"
                  onClick={() => setChosen(c.key)}
                  className={`w-full text-left card transition ${
                    isChosen
                      ? "ring-2 ring-brand-500 border-brand-300"
                      : "hover:border-slate-300"
                  }`}
                  aria-pressed={isChosen}
                >
                  <p className="font-medium text-slate-900">
                    {CATEGORY_LABELS[c.key]}
                  </p>
                  <p className="mt-1 text-sm text-slate-500">
                    {c.count.toLocaleString("it-IT")} domande disponibili
                  </p>
                </button>
              </li>
            );
          })}
        </ul>
      </section>

      {/* Scelta numero domande */}
      <section>
        <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-slate-500">
          2. Quante domande
        </h2>
        <div className="flex flex-wrap gap-2">
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
                className={isOn ? "btn-primary" : "btn-secondary"}
              >
                {label}
              </button>
            );
          })}
        </div>
      </section>

      {/* Timer opzionale */}
      <section>
        <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-slate-500">
          3. Timer (opzionale)
        </h2>
        <div className="flex flex-wrap items-center gap-2">
          {[0, 5, 10, 15, 30, 60].map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setTimerMin(m)}
              className={timerMin === m ? "btn-primary" : "btn-secondary"}
            >
              {m === 0 ? "Senza timer" : `${m} min`}
            </button>
          ))}
        </div>
      </section>

      <div className="flex flex-wrap items-center justify-end gap-2">
        <Link to="/" className="btn-ghost">
          Annulla
        </Link>
        <button
          type="button"
          className="btn-primary"
          disabled={!chosen}
          onClick={start}
        >
          Inizia pratica →
        </button>
      </div>
    </div>
  );
}

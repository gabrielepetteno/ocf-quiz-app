/**
 * Pagina "Storico".
 *
 * Editorial style: oversize numerals, hairline rule sparkline.
 */
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import { CATEGORY_SHORT_LABELS, EXAM_PASS_THRESHOLD } from "@/lib/config";
import { clearHistory, getHistory } from "@/lib/storage";
import { computeStats } from "@/lib/stats";
import { formatDateTime, formatDuration, formatPercent } from "@/lib/format";
import type { SessionResult } from "@/lib/types";
import { useDocumentMeta } from "@/lib/useDocumentMeta";
import { breadcrumbJsonLd, getPageSeo } from "@/lib/seo";

const MODE_LABELS = {
  exam: "Simulazione",
  practice: "Pratica",
  "review-errors": "Ripasso",
} as const;

export default function HistoryPage() {
  const [history, setHistory] = useState<SessionResult[]>([]);

  const seo = getPageSeo("history")!;
  useDocumentMeta({
    slug: seo.slug,
    title: seo.title,
    description: seo.description,
    keywords: seo.keywords,
    jsonLd: [breadcrumbJsonLd("history", "Storico simulazioni")],
  });

  useEffect(() => {
    setHistory(getHistory());
  }, []);

  const stats = useMemo(() => computeStats(history), [history]);

  function reset() {
    if (
      confirm(
        "Cancellare lo storico delle sessioni? L'azione non può essere annullata.",
      )
    ) {
      clearHistory();
      setHistory([]);
    }
  }

  return (
    <div className="flex flex-col gap-10">
      <header className="flex flex-wrap items-end justify-between gap-4 border-b border-ink pb-6">
        <div>
          <p className="eyebrow">Le tue sessioni</p>
          <h1 className="display-2 mt-3">A che punto sei.</h1>
          <p className="mt-3 max-w-prose text-ink-soft">
            Tutte le sessioni completate, salvate sul tuo dispositivo. Niente
            sale sui nostri server.
          </p>
        </div>
        {history.length > 0 && (
          <button type="button" className="btn btn-secondary" onClick={reset}>
            Svuota storico
          </button>
        )}
      </header>

      {history.length === 0 ? (
        <div className="card flex flex-col items-center gap-4 py-12 text-center">
          <p className="font-display text-xl text-ink">
            Nessuna sessione ancora.
          </p>
          <p className="max-w-prose text-sm text-ink-soft">
            Quando finirai un quiz, comparirà qui con punteggio, tempo e
            categoria.
          </p>
          <Link to="/exam" className="btn btn-primary mt-2">
            Inizia una simulazione
            <span aria-hidden="true">→</span>
          </Link>
        </div>
      ) : (
        <>
          {/* Statistiche aggregate */}
          <section
            aria-label="Statistiche aggregate"
            className="grid gap-px bg-line-soft md:grid-cols-4"
          >
            <Stat label="Sessioni" value={String(stats.totalSessions)} />
            <Stat label="Simulazioni" value={String(stats.examSessions)} />
            <Stat label="Media" value={`${stats.averageScore}/100`} />
            <Stat
              label="Tasso di successo"
              value={formatPercent(stats.successRate)}
            />
          </section>

          {/* Mini-grafico */}
          <ScoreChart history={history} />

          {/* Tabella sessioni */}
          <section
            className="section-rule overflow-x-auto"
            aria-labelledby="dettaglio-sessioni"
          >
            <p className="eyebrow">Dettaglio sessioni</p>
            <h2 id="dettaglio-sessioni" className="sr-only">
              Dettaglio sessioni
            </h2>
            <table className="mt-4 w-full text-sm">
              <thead>
                <tr className="border-b border-line text-left">
                  <th className="mono px-2 py-3 text-[0.7rem] font-medium uppercase tracking-eyebrow text-muted">
                    Data
                  </th>
                  <th className="mono px-2 py-3 text-[0.7rem] font-medium uppercase tracking-eyebrow text-muted">
                    Modalità
                  </th>
                  <th className="mono px-2 py-3 text-right text-[0.7rem] font-medium uppercase tracking-eyebrow text-muted">
                    Punteggio
                  </th>
                  <th className="mono px-2 py-3 text-right text-[0.7rem] font-medium uppercase tracking-eyebrow text-muted">
                    Corrette
                  </th>
                  <th className="mono px-2 py-3 text-right text-[0.7rem] font-medium uppercase tracking-eyebrow text-muted">
                    Tempo
                  </th>
                  <th className="mono px-2 py-3 text-right text-[0.7rem] font-medium uppercase tracking-eyebrow text-muted">
                    Esito
                  </th>
                </tr>
              </thead>
              <tbody>
                {history.map((h) => (
                  <tr
                    key={h.sessionId}
                    className="border-b border-line-soft last:border-0"
                  >
                    <td className="px-2 py-3 text-ink">
                      {formatDateTime(h.startedAt)}
                    </td>
                    <td className="px-2 py-3 text-ink">
                      {MODE_LABELS[h.mode]}
                      {h.category && (
                        <span className="ml-1 text-muted">
                          · {CATEGORY_SHORT_LABELS[h.category]}
                        </span>
                      )}
                    </td>
                    <td className="mono px-2 py-3 text-right text-ink tabular-nums">
                      {h.scaledScore}/100
                    </td>
                    <td className="mono px-2 py-3 text-right text-ink tabular-nums">
                      {h.correctCount}/{h.totalQuestions}
                    </td>
                    <td className="mono px-2 py-3 text-right tabular-nums text-muted">
                      {formatDuration(h.elapsedSec)}
                    </td>
                    <td className="px-2 py-3 text-right">
                      {h.mode === "exam" ? (
                        <span
                          className={
                            h.passed ? "chip chip-success" : "chip chip-danger"
                          }
                        >
                          {h.passed ? "Promosso" : "Non promosso"}
                        </span>
                      ) : (
                        <span className="text-muted">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>

          {/* Performance per categoria */}
          {stats.perCategory.length > 0 && (
            <section className="section-rule">
              <p className="eyebrow">Performance per categoria</p>
              <p className="mt-2 text-sm text-muted">
                Calcolata sull'intera storia. Le prime sono quelle dove conviene
                investire più ripasso.
              </p>
              <ul className="mt-5 space-y-4">
                {stats.perCategory.map((c) => (
                  <li key={c.category}>
                    <div className="flex items-baseline justify-between gap-3 text-sm">
                      <span className="font-medium text-ink">
                        {CATEGORY_SHORT_LABELS[c.category]}
                      </span>
                      <span className="mono tabular-nums text-muted">
                        {formatPercent(c.accuracy)} · {c.samples} risposte
                      </span>
                    </div>
                    <div
                      className="mt-2 h-[3px] overflow-hidden bg-[var(--line-soft)]"
                      role="progressbar"
                      aria-valuenow={Math.round(c.accuracy * 100)}
                      aria-valuemin={0}
                      aria-valuemax={100}
                    >
                      <div
                        className={
                          c.accuracy >= 0.8
                            ? "h-full bg-[var(--success)] transition-[width]"
                            : c.accuracy >= 0.6
                              ? "h-full bg-[var(--warn)] transition-[width]"
                              : "h-full bg-[var(--danger)] transition-[width]"
                        }
                        style={{ width: `${Math.round(c.accuracy * 100)}%` }}
                      />
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-[var(--bg)] px-5 py-5">
      <p className="mono text-[0.7rem] uppercase tracking-eyebrow text-muted">
        {label}
      </p>
      <p className="mono mt-3 text-3xl font-semibold leading-none tabular-nums text-ink">
        {value}
      </p>
    </div>
  );
}

/**
 * Sparkline editorial: hairline + ink path + crimson points for passes,
 * muted for fails. Threshold as dashed rule.
 */
function ScoreChart({ history }: { history: SessionResult[] }) {
  const series = history
    .slice()
    .sort((a, b) => a.startedAt - b.startedAt)
    .slice(-30);
  if (series.length < 2) return null;

  const W = 600;
  const H = 140;
  const PAD = 12;
  const innerW = W - PAD * 2;
  const innerH = H - PAD * 2;

  const xs = series.map((_, i) => PAD + (i / (series.length - 1)) * innerW);
  const ys = series.map((s) => PAD + (1 - s.scaledScore / 100) * innerH);

  const path = xs
    .map((x, i) => `${i === 0 ? "M" : "L"} ${x.toFixed(1)} ${ys[i].toFixed(1)}`)
    .join(" ");
  const yPass = PAD + (1 - EXAM_PASS_THRESHOLD / 100) * innerH;

  return (
    <section className="section-rule" aria-labelledby="andamento">
      <p className="eyebrow">Andamento punteggio</p>
      <h2 id="andamento" className="font-display mt-3 text-xl text-ink">
        Ultime {series.length} sessioni
      </h2>
      <p className="mt-1 text-sm text-muted">
        Linea tratteggiata = soglia {EXAM_PASS_THRESHOLD}/100
      </p>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="mt-4 h-36 w-full"
        preserveAspectRatio="none"
        aria-label="Grafico punteggi nel tempo"
        role="img"
      >
        {/* Threshold */}
        <line
          x1={PAD}
          x2={W - PAD}
          y1={yPass}
          y2={yPass}
          stroke="var(--line)"
          strokeWidth={1}
          strokeDasharray="3 4"
          opacity={0.4}
        />
        {/* Path */}
        <path d={path} fill="none" stroke="var(--ink)" strokeWidth={1.5} />
        {/* Points */}
        {xs.map((x, i) => (
          <circle
            key={i}
            cx={x}
            cy={ys[i]}
            r={3.5}
            fill={series[i].passed ? "var(--success)" : "var(--danger)"}
          />
        ))}
      </svg>
    </section>
  );
}

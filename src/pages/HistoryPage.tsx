/**
 * Pagina "Storico".
 *
 * Mostra l'elenco delle sessioni completate (esame + pratica + ripasso),
 * un mini-grafico dei progressi e la performance media per categoria.
 */
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import { CATEGORY_SHORT_LABELS, EXAM_PASS_THRESHOLD } from "@/lib/config";
import { clearHistory, getHistory } from "@/lib/storage";
import { computeStats } from "@/lib/stats";
import { formatDateTime, formatDuration, formatPercent } from "@/lib/format";
import type { SessionResult } from "@/lib/types";

const MODE_LABELS = {
  exam: "Simulazione",
  practice: "Pratica",
  "review-errors": "Ripasso",
} as const;

export default function HistoryPage() {
  const [history, setHistory] = useState<SessionResult[]>([]);

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
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Storico</h1>
          <p className="mt-1 text-slate-600">
            Tutte le sessioni che hai completato, salvate sul tuo dispositivo.
          </p>
        </div>
        {history.length > 0 && (
          <button type="button" className="btn-secondary" onClick={reset}>
            Svuota storico
          </button>
        )}
      </header>

      {history.length === 0 ? (
        <div className="card text-center text-slate-600">
          <p>Non hai ancora completato nessun quiz.</p>
          <Link to="/exam" className="btn-primary mt-4 inline-flex">
            Inizia una simulazione
          </Link>
        </div>
      ) : (
        <>
          {/* Statistiche aggregate */}
          <section className="grid gap-3 md:grid-cols-4">
            <Stat label="Totale sessioni" value={String(stats.totalSessions)} />
            <Stat label="Simulazioni" value={String(stats.examSessions)} />
            <Stat label="Punteggio medio" value={`${stats.averageScore}/100`} />
            <Stat
              label="Tasso di successo"
              value={formatPercent(stats.successRate)}
            />
          </section>

          {/* Mini-grafico (sparkline) */}
          <ScoreChart history={history} />

          {/* Tabella sessioni */}
          <section className="card overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-left text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-2 py-2">Data</th>
                  <th className="px-2 py-2">Modalità</th>
                  <th className="px-2 py-2 text-right">Punteggio</th>
                  <th className="px-2 py-2 text-right">Corrette</th>
                  <th className="px-2 py-2 text-right">Tempo</th>
                  <th className="px-2 py-2 text-right">Esito</th>
                </tr>
              </thead>
              <tbody>
                {history.map((h) => (
                  <tr key={h.sessionId} className="border-t border-slate-100">
                    <td className="px-2 py-2 text-slate-700">
                      {formatDateTime(h.startedAt)}
                    </td>
                    <td className="px-2 py-2 text-slate-700">
                      {MODE_LABELS[h.mode]}
                      {h.category && (
                        <span className="ml-1 text-slate-400">
                          · {CATEGORY_SHORT_LABELS[h.category]}
                        </span>
                      )}
                    </td>
                    <td className="px-2 py-2 text-right tabular-nums">
                      {h.scaledScore}/100
                    </td>
                    <td className="px-2 py-2 text-right tabular-nums">
                      {h.correctCount}/{h.totalQuestions}
                    </td>
                    <td className="px-2 py-2 text-right tabular-nums text-slate-600">
                      {formatDuration(h.elapsedSec)}
                    </td>
                    <td className="px-2 py-2 text-right">
                      {h.mode === "exam" ? (
                        <span
                          className={`chip ${
                            h.passed
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                              : "bg-rose-50 text-rose-700 border-rose-200"
                          }`}
                        >
                          {h.passed ? "Promosso" : "Non promosso"}
                        </span>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>

          {/* Performance per categoria */}
          {stats.perCategory.length > 0 && (
            <section className="card">
              <h3 className="text-base font-semibold text-slate-900">
                Performance per categoria
              </h3>
              <p className="mt-1 text-sm text-slate-500">
                Calcolata sull'intera storia. Le prime sono quelle dove conviene
                investire più ripasso.
              </p>
              <ul className="mt-3 space-y-2">
                {stats.perCategory.map((c) => (
                  <li key={c.category}>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-700">
                        {CATEGORY_SHORT_LABELS[c.category]}
                      </span>
                      <span className="tabular-nums text-slate-500">
                        {formatPercent(c.accuracy)}{" "}
                        <span className="text-slate-400">
                          ({c.samples} risposte)
                        </span>
                      </span>
                    </div>
                    <div className="mt-1 h-2 overflow-hidden rounded-full bg-slate-200">
                      <div
                        className={`h-full rounded-full ${
                          c.accuracy >= 0.8
                            ? "bg-emerald-500"
                            : c.accuracy >= 0.6
                              ? "bg-amber-400"
                              : "bg-rose-500"
                        }`}
                        style={{
                          width: `${Math.round(c.accuracy * 100)}%`,
                        }}
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
    <div className="stat-tile">
      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
        {label}
      </p>
      <p className="text-2xl font-bold tabular-nums text-slate-900">{value}</p>
    </div>
  );
}

/**
 * Mini-grafico dei punteggi nel tempo: sparkline SVG semplice senza
 * dipendenze esterne. Mostra le ultime 30 sessioni dalla più vecchia
 * alla più recente.
 */
function ScoreChart({ history }: { history: SessionResult[] }) {
  // Ordine cronologico, ultimi 30
  const series = history
    .slice()
    .sort((a, b) => a.startedAt - b.startedAt)
    .slice(-30);
  if (series.length < 2) return null;

  const W = 600;
  const H = 120;
  const PAD = 8;
  const innerW = W - PAD * 2;
  const innerH = H - PAD * 2;

  const xs = series.map((_, i) => PAD + (i / (series.length - 1)) * innerW);
  const ys = series.map((s) => PAD + (1 - s.scaledScore / 100) * innerH);

  const path = xs
    .map((x, i) => `${i === 0 ? "M" : "L"} ${x.toFixed(1)} ${ys[i].toFixed(1)}`)
    .join(" ");
  // Soglia di superamento (linea tratteggiata)
  const yPass = PAD + (1 - EXAM_PASS_THRESHOLD / 100) * innerH;

  return (
    <section className="card">
      <h3 className="text-base font-semibold text-slate-900">
        Andamento punteggio
      </h3>
      <p className="mt-1 text-sm text-slate-500">
        Ultime {series.length} sessioni. Linea tratteggiata = soglia{" "}
        {EXAM_PASS_THRESHOLD}/100.
      </p>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="mt-2 h-32 w-full"
        preserveAspectRatio="none"
        aria-label="Grafico punteggi nel tempo"
      >
        <line
          x1={PAD}
          x2={W - PAD}
          y1={yPass}
          y2={yPass}
          stroke="#94a3b8"
          strokeDasharray="4 4"
        />
        <path d={path} fill="none" stroke="#2563eb" strokeWidth={2} />
        {xs.map((x, i) => (
          <circle
            key={i}
            cx={x}
            cy={ys[i]}
            r={3}
            fill={series[i].passed ? "#10b981" : "#f43f5e"}
          />
        ))}
      </svg>
    </section>
  );
}

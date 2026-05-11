/**
 * Home page — editorial Swiss-minimalism layout.
 *
 * Sections:
 *   00 Hero — display headline, eyebrow, primary CTA + secondary
 *   01 Metrics — count-up stats on the banca dati
 *   02 Manifesto — three feature cards (Simulazione / Pratica / Errori)
 *   03 Statistiche — user-personal numbers if any
 *   04 Categorie — bank breakdown
 *   05 Risorse — SEO hub pages
 *   06 Editorial body — long-form SEO prose
 */
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { loadQuestions } from "@/lib/questions";
import { getHistory, getErrors } from "@/lib/storage";
import { computeStats, type UserStats } from "@/lib/stats";
import {
  CATEGORY_LABELS,
  CATEGORY_SHORT_LABELS,
  EXAM_DURATION_MIN,
  EXAM_PASS_THRESHOLD,
  EXAM_TOTAL_QUESTIONS,
} from "@/lib/config";
import type { CategoryMeta } from "@/lib/types";
import { formatPercent } from "@/lib/format";
import { useDocumentMeta } from "@/lib/useDocumentMeta";
import { breadcrumbJsonLd, getPageSeo } from "@/lib/seo";
import { useCountUp } from "@/lib/useReveal";

export default function HomePage() {
  const [stats, setStats] = useState<UserStats | null>(null);
  const [errorsCount, setErrorsCount] = useState(0);
  const [categories, setCategories] = useState<CategoryMeta[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);

  const seo = getPageSeo("")!;
  useDocumentMeta({
    slug: seo.slug,
    title: seo.title,
    description: seo.description,
    keywords: seo.keywords,
    jsonLd: [breadcrumbJsonLd("", "Home")],
  });

  useEffect(() => {
    setStats(computeStats(getHistory()));
    setErrorsCount(getErrors().filter((e) => !e.resolved).length);
    loadQuestions()
      .then((b) => setCategories(b.categories))
      .catch((e: Error) => setLoadError(e.message));
  }, []);

  const totalAvailable = categories.reduce((s, c) => s + c.count, 0);

  // Count-up refs
  const bankRef = useCountUp(totalAvailable, 1400);
  const durRef = useCountUp(EXAM_DURATION_MIN);
  const qRef = useCountUp(EXAM_TOTAL_QUESTIONS);
  const passRef = useCountUp(EXAM_PASS_THRESHOLD);

  return (
    <div className="flex flex-col gap-20 md:gap-28">
      {/* ── 00 · HERO ──────────────────────────────────────────────── */}
      <section className="reveal-stagger is-visible grid gap-10 md:grid-cols-12 md:gap-12">
        <div className="md:col-span-7">
          <p className="eyebrow">Esame OCF · Edizione 2026</p>
          <h1 className="display-1 mt-5">
            Preparati all'<em>esame OCF</em>, gratis e senza distrazioni.
          </h1>
          <p className="mt-6 max-w-prose text-lg leading-relaxed text-ink-soft">
            Simulazione fedele dell'esame ufficiale:{" "}
            <strong className="text-ink">
              {EXAM_TOTAL_QUESTIONS} domande in {EXAM_DURATION_MIN} minuti
            </strong>
            , distribuzione 24/19/6/6/5, soglia {EXAM_PASS_THRESHOLD}/100. Banca
            dati di oltre{" "}
            <strong className="text-ink">
              {totalAvailable.toLocaleString("it-IT") || "4.900"}
            </strong>{" "}
            quesiti, ripasso degli errori e statistiche personali — tutto in
            locale, senza account.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link to="/exam" className="btn btn-primary btn-lg">
              <span className="hidden sm:inline">Inizia simulazione esame</span>
              <span className="sm:hidden">Inizia simulazione</span>
              <span aria-hidden="true">→</span>
            </Link>
            <Link to="/practice" className="btn btn-secondary btn-lg">
              Pratica per categoria
            </Link>
            {errorsCount > 0 && (
              <Link to="/errors" className="btn btn-ghost btn-lg">
                Ripasso errori
                <span className="chip chip-accent ml-1">{errorsCount}</span>
              </Link>
            )}
          </div>
          <p className="mt-5 text-xs text-muted">
            Gratis · Open source · Senza registrazione · Senza tracciamento
          </p>

          {/* Mobile-only numerical stat row — preserves editorial moment under md */}
          <dl
            aria-label="Numeri chiave"
            className="mt-8 grid grid-cols-3 gap-px border-t border-line bg-line-soft md:hidden"
          >
            <div className="bg-[var(--bg)] px-3 py-3">
              <dt className="mono text-[0.65rem] uppercase tracking-eyebrow text-muted">
                Quesiti
              </dt>
              <dd className="mono mt-1 text-2xl font-semibold leading-none tabular-nums text-ink">
                {totalAvailable.toLocaleString("it-IT") || "4.900"}
              </dd>
            </div>
            <div className="bg-[var(--bg)] px-3 py-3">
              <dt className="mono text-[0.65rem] uppercase tracking-eyebrow text-muted">
                Domande
              </dt>
              <dd className="mono mt-1 text-2xl font-semibold leading-none tabular-nums text-ink">
                {EXAM_TOTAL_QUESTIONS}
              </dd>
            </div>
            <div className="bg-[var(--bg)] px-3 py-3">
              <dt className="mono text-[0.65rem] uppercase tracking-eyebrow text-muted">
                Minuti
              </dt>
              <dd className="mono mt-1 text-2xl font-semibold leading-none tabular-nums text-ink">
                {EXAM_DURATION_MIN}
              </dd>
            </div>
          </dl>
        </div>

        {/* Right column — typographic numeral as editorial moment */}
        <aside
          aria-hidden="true"
          className="hidden md:col-span-5 md:flex md:items-end md:justify-end"
        >
          <div className="text-right">
            <p className="mono text-[0.7rem] uppercase tracking-eyebrow text-muted">
              Quesiti ufficiali
            </p>
            <p className="mono text-[clamp(5rem,10vw,9rem)] font-semibold leading-none tracking-tightest tabular-nums text-ink">
              <span ref={bankRef as React.RefObject<HTMLSpanElement>}>
                {totalAvailable.toLocaleString("it-IT") || "4.900"}
              </span>
              <span className="text-accent">.</span>
            </p>
            <p className="mt-1 text-sm text-muted">
              banca dati importata da PDF OCF
            </p>
          </div>
        </aside>
      </section>

      {loadError && (
        <div
          role="alert"
          className="card border-danger bg-[var(--danger-soft)] text-[var(--danger)]"
        >
          <p className="text-sm">
            Errore nel caricamento del dataset: {loadError}. Verifica che il
            file{" "}
            <code className="rounded bg-white px-1 py-0.5">
              public/data/questions.json
            </code>{" "}
            sia presente. Generalo con{" "}
            <code className="rounded bg-white px-1 py-0.5">
              npm run import-data
            </code>
            .
          </p>
        </div>
      )}

      {/* ── 01 · METRICHE ─────────────────────────────────────────── */}
      <section aria-labelledby="metriche" className="section-rule">
        <div className="flex items-baseline justify-between gap-4">
          <p className="eyebrow">L'esame OCF, in cifre</p>
          <p className="hidden text-xs text-muted md:block">
            fonte: regolamento OCF
          </p>
        </div>
        <h2 id="metriche" className="sr-only">
          L'esame OCF in cifre
        </h2>
        <div className="mt-6 grid grid-cols-2 md:grid-cols-4">
          <Metric
            label="Domande"
            valueRef={qRef}
            display={`${EXAM_TOTAL_QUESTIONS}`}
          />
          <Metric
            label="Minuti"
            valueRef={durRef}
            display={`${EXAM_DURATION_MIN}'`}
          />
          <Metric
            label="Soglia"
            valueRef={passRef}
            display={`${EXAM_PASS_THRESHOLD}/100`}
          />
          <Metric label="Materie" display="5" staticValue />
        </div>
      </section>

      {/* ── 02 · MANIFESTO (3 features) ───────────────────────────── */}
      <section aria-labelledby="manifesto" className="section-rule">
        <p className="eyebrow">Tre modi per studiare</p>
        <h2 id="manifesto" className="display-2 mt-3">
          Simula. Allena. Correggi.
        </h2>
        <div className="reveal-stagger is-visible mt-10 grid gap-px bg-line-soft md:grid-cols-3">
          <Feature
            icon="target"
            title="Simulazione realistica"
            body={`${EXAM_TOTAL_QUESTIONS} domande in ${EXAM_DURATION_MIN} minuti con la distribuzione ufficiale 24/19/6/6/5. Soglia ${EXAM_PASS_THRESHOLD}/100, timer attivo, consegna a fine prova.`}
            cta={{ to: "/exam", label: "Avvia simulazione →" }}
          />
          <Feature
            icon="book"
            title="Pratica per categoria"
            body="Scegli materia e numero di quesiti (10, 20, 30, 50 o tutti). Senza timer di default — perfetto per ripasso quotidiano o focus mirato."
            cta={{ to: "/practice", label: "Apri pratica →" }}
          />
          <Feature
            icon="replay"
            title="Sbagli che diventano lezioni"
            body="Ogni errore entra nel registro personale. Quando rispondi correttamente più volte alla stessa domanda, l'app la marca come 'risolta'."
            cta={{ to: "/errors", label: "Ripassa errori →" }}
          />
        </div>
      </section>

      {/* ── 03 · STATISTICHE PERSONALI ────────────────────────────── */}
      {stats && stats.totalSessions > 0 && (
        <section aria-labelledby="tue-stat" className="section-rule">
          <p className="eyebrow">Le tue statistiche</p>
          <h2 id="tue-stat" className="display-2 mt-3">
            A che punto sei.
          </h2>
          <div className="mt-8 grid gap-px bg-line-soft md:grid-cols-4">
            <PersonalStat
              label="Quiz completati"
              value={`${stats.totalSessions}`}
            />
            <PersonalStat label="Simulazioni" value={`${stats.examSessions}`} />
            <PersonalStat label="Media" value={`${stats.averageScore}/100`} />
            <PersonalStat
              label="Tasso di successo"
              value={formatPercent(stats.successRate)}
            />
          </div>

          {stats.perCategory.length > 0 && (
            <div className="mt-8 grid gap-8 md:grid-cols-12">
              <div className="md:col-span-4">
                <p className="eyebrow">Categorie più deboli</p>
                <p className="mt-2 text-sm text-muted">
                  Su cui investire le prossime sessioni di pratica.
                </p>
              </div>
              <ul className="md:col-span-8 divide-y divide-line-soft border-t border-line">
                {stats.perCategory.slice(0, 3).map((c) => (
                  <li
                    key={c.category}
                    className="flex items-center justify-between gap-4 py-3"
                  >
                    <span className="text-ink">
                      {CATEGORY_SHORT_LABELS[c.category]}
                    </span>
                    <span
                      className={[
                        "mono text-sm font-medium tabular-nums",
                        c.accuracy >= 0.8
                          ? "text-[var(--success)]"
                          : c.accuracy >= 0.6
                            ? "text-[var(--warn)]"
                            : "text-[var(--danger)]",
                      ].join(" ")}
                    >
                      {formatPercent(c.accuracy)}{" "}
                      <span className="text-muted">({c.samples} risposte)</span>
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>
      )}

      {/* ── 04 · CATEGORIE ────────────────────────────────────────── */}
      {categories.length > 0 && (
        <section aria-labelledby="categorie" className="section-rule">
          <div className="flex flex-wrap items-baseline justify-between gap-4">
            <div>
              <p className="eyebrow">Banca dati per materia</p>
              <h2 id="categorie" className="display-2 mt-3">
                Le cinque materie.
              </h2>
            </div>
            <Link
              to="/materie-esame-ocf"
              className="text-sm font-medium text-accent underline decoration-1 underline-offset-4 hover:decoration-2"
            >
              Approfondisci i programmi →
            </Link>
          </div>
          <ul className="mt-8 grid gap-px bg-line-soft md:grid-cols-2">
            {categories.map((c) => (
              <li
                key={c.key}
                className="flex items-center justify-between gap-4 bg-[var(--bg)] p-5"
              >
                <div className="min-w-0">
                  <p className="font-display text-base font-medium text-ink">
                    {CATEGORY_LABELS[c.key]}
                  </p>
                  <p className="mono mt-1 text-xs uppercase tracking-eyebrow text-muted">
                    {c.count.toLocaleString("it-IT")} quesiti
                  </p>
                </div>
                <Link
                  to={`/practice/${c.key}`}
                  className="btn btn-ghost shrink-0 text-sm"
                  aria-label={`Pratica ${CATEGORY_LABELS[c.key]}`}
                >
                  Pratica →
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* ── 05 · RISORSE / HUB SEO ─────────────────────────────────── */}
      <section aria-labelledby="risorse-ocf" className="section-rule">
        <p className="eyebrow">Approfondisci l'esame</p>
        <h2 id="risorse-ocf" className="display-2 mt-3">
          Tutto sull'esame OCF.
        </h2>
        <div className="reveal-stagger is-visible mt-8 grid gap-6 md:grid-cols-3">
          <ResourceCard
            tag="Guida"
            title="Guida esame OCF"
            body="Cos'è, requisiti, struttura della prova, durata, soglia e quando si tiene. Il punto di partenza per chi parte da zero."
            to="/guida-esame-ocf"
          />
          <ResourceCard
            tag="Programma"
            title="Le 5 materie"
            body="Distribuzione 24/19/6/6/5 e dettaglio degli argomenti per ciascuna macro-categoria del programma."
            to="/materie-esame-ocf"
          />
          <ResourceCard
            tag="FAQ"
            title="FAQ esame OCF"
            body="Risposte rapide alle domande più frequenti: durata, soglia, costi, tentativi, banca dati."
            to="/faq-esame-ocf"
          />
        </div>
      </section>

      {/* ── 06 · COME GIRA / PRIVACY ────────────────────────────────── */}
      <section
        aria-labelledby="cos-e"
        className="section-rule grid gap-8 md:grid-cols-12"
      >
        <div className="md:col-span-4">
          <p className="eyebrow">Manifesto</p>
          <h2 id="cos-e" className="display-2 mt-3">
            Open. Locale. Senza pubblicità.
          </h2>
        </div>
        <div className="prose-editorial md:col-span-8">
          <p>
            <strong>OCF Quiz</strong> è un simulatore gratuito e open source
            dell'<strong>esame OCF</strong> per l'iscrizione all'
            <strong>Albo unico dei Consulenti Finanziari</strong>. Riproduce
            fedelmente le regole della prova ufficiale:{" "}
            <strong>60 domande</strong> a risposta multipla in{" "}
            <strong>85 minuti</strong>, con la{" "}
            <strong>distribuzione 24/19/6/6/5</strong> tra le cinque macro-aree
            e soglia di superamento <strong>80/100</strong>. La banca dati conta
            oltre <strong>4.900 quesiti</strong> importati dal materiale OCF.
          </p>
          <p>
            L'app è pensata per chi si prepara come{" "}
            <strong>
              consulente finanziario abilitato all'offerta fuori sede
            </strong>
            , <strong>consulente finanziario autonomo</strong> o{" "}
            <strong>società di consulenza finanziaria (SCF)</strong>. Puoi
            alternare <Link to="/exam">simulazioni a tempo</Link> e{" "}
            <Link to="/practice">pratica per categoria</Link>, ripassare le
            domande sbagliate e monitorare l'andamento del punteggio. Nessuna
            registrazione, nessun tracciamento, tutto in locale (
            <code>localStorage</code>).
          </p>
          <ul>
            <li>
              Le domande sono importate dal materiale ufficiale OCF tramite uno
              script <code>scripts/parse_pdfs.py</code>: non vengono inventate,
              mantengono categoria e peso originali.
            </li>
            <li>
              Il codice è disponibile su GitHub con licenza MIT — puoi forkarlo,
              modificarlo, usarlo per altri esami a quiz.
            </li>
          </ul>
        </div>
      </section>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Pieces                                                                     */
/* -------------------------------------------------------------------------- */

function Metric({
  label,
  display,
  valueRef,
  staticValue,
}: {
  label: string;
  display: string;
  valueRef?: React.RefObject<HTMLElement | null>;
  staticValue?: boolean;
}) {
  return (
    <div className="border-t border-ink py-5 pr-4 first:pl-0 md:border-l md:border-l-line-soft md:px-5 md:first:border-l-0 md:first:pl-0">
      <p className="mono text-[0.7rem] uppercase tracking-eyebrow text-muted">
        {label}
      </p>
      <p className="mono mt-3 text-4xl font-semibold leading-none tracking-tight tabular-nums text-ink md:text-5xl">
        {staticValue ? (
          display
        ) : (
          <span ref={valueRef as React.RefObject<HTMLSpanElement>}>
            {display}
          </span>
        )}
      </p>
    </div>
  );
}

function Feature({
  icon,
  title,
  body,
  cta,
}: {
  icon: "target" | "book" | "replay";
  title: string;
  body: string;
  cta: { to: string; label: string };
}) {
  return (
    <article className="flex flex-col gap-4 bg-[var(--bg)] p-6 md:p-8">
      <FeatureIcon name={icon} />
      <h3 className="font-display text-xl font-semibold leading-tight text-ink">
        {title}
      </h3>
      <p className="text-sm leading-relaxed text-ink-soft">{body}</p>
      <div className="mt-auto pt-4">
        <Link
          to={cta.to}
          className="text-sm font-semibold text-accent hover:text-accent-deep"
        >
          {cta.label}
        </Link>
      </div>
    </article>
  );
}

function FeatureIcon({ name }: { name: "target" | "book" | "replay" }) {
  const common = {
    width: 22,
    height: 22,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.6,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };
  return (
    <span
      aria-hidden="true"
      className="inline-flex h-10 w-10 items-center justify-center rounded-md bg-[var(--accent-soft)] text-accent"
    >
      {name === "target" && (
        <svg {...common}>
          <circle cx="12" cy="12" r="9" />
          <circle cx="12" cy="12" r="5" />
          <circle cx="12" cy="12" r="1.5" fill="currentColor" />
        </svg>
      )}
      {name === "book" && (
        <svg {...common}>
          <path d="M4 4h7a3 3 0 0 1 3 3v13a2 2 0 0 0-2-2H4z" />
          <path d="M20 4h-7a3 3 0 0 0-3 3v13a2 2 0 0 1 2-2h8z" />
        </svg>
      )}
      {name === "replay" && (
        <svg {...common}>
          <path d="M3 12a9 9 0 1 0 3.2-6.9" />
          <path d="M3 4v5h5" />
        </svg>
      )}
    </span>
  );
}

function PersonalStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-t border-ink bg-[var(--bg)] px-5 py-5 md:border-l md:border-l-line-soft md:first:border-l-0">
      <p className="mono text-[0.7rem] uppercase tracking-eyebrow text-muted">
        {label}
      </p>
      <p className="mono mt-3 text-3xl font-semibold leading-none tabular-nums text-ink">
        {value}
      </p>
    </div>
  );
}

function ResourceCard({
  tag,
  title,
  body,
  to,
}: {
  tag: string;
  title: string;
  body: string;
  to: string;
}) {
  return (
    <Link
      to={to}
      className="card card-hover group flex flex-col gap-3 transition-colors"
    >
      <span className="chip chip-accent self-start">{tag}</span>
      <h3 className="font-display text-xl font-semibold leading-tight text-ink group-hover:text-accent">
        {title}
      </h3>
      <p className="text-sm leading-relaxed text-ink-soft">{body}</p>
      <p className="mt-auto pt-4 text-sm font-semibold text-accent">Leggi →</p>
    </Link>
  );
}

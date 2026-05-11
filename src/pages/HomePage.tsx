/**
 * Home page.
 *
 * Spiega all'utente cos'è l'app e come funziona, mostra le statistiche
 * personali (se ci sono), e propone le tre azioni principali:
 *   1) Simulazione esame ufficiale (60 dom, 85 min, soglia 80)
 *   2) Pratica per categoria
 *   3) Ripasso errori
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

  return (
    <div className="space-y-10">
      {/* HERO ------------------------------------------------------------ */}
      <section className="text-center">
        <span className="chip mx-auto">
          Simulatore esame consulenti finanziari
        </span>
        <h1 className="mt-3 text-3xl md:text-4xl font-bold tracking-tight text-slate-900">
          Preparati all'esame OCF, gratis e open source.
        </h1>
        <p className="mx-auto mt-3 max-w-2xl text-slate-600">
          {EXAM_TOTAL_QUESTIONS} domande in {EXAM_DURATION_MIN} minuti,
          distribuite come nell'esame ufficiale. Più di{" "}
          {totalAvailable.toLocaleString("it-IT")} quesiti tratti dal materiale
          OCF, statistiche personali, ripasso mirato degli errori. Nessuna
          iscrizione, nessun pagamento, nessun tracciamento — i tuoi progressi
          restano sul tuo dispositivo.
        </p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <Link to="/exam" className="btn-primary">
            🎯 Simula esame OCF
          </Link>
          <Link to="/practice" className="btn-secondary">
            📚 Pratica per categoria
          </Link>
          <Link to="/errors" className="btn-secondary">
            🔁 Ripassa errori{errorsCount > 0 ? ` (${errorsCount})` : ""}
          </Link>
        </div>
      </section>

      {loadError && (
        <div className="card border-rose-300 bg-rose-50 text-rose-800">
          <p className="text-sm">
            Errore nel caricamento del dataset: {loadError}. Verifica che il
            file{" "}
            <code className="rounded bg-white px-1">
              public/data/questions.json
            </code>{" "}
            sia presente. Generalo con{" "}
            <code className="rounded bg-white px-1">npm run import-data</code>.
          </p>
        </div>
      )}

      {/* COME FUNZIONA --------------------------------------------------- */}
      <section className="grid gap-4 md:grid-cols-3">
        <FeatureCard
          icon="🎯"
          title="Simulazione realistica"
          body={`60 domande in ${EXAM_DURATION_MIN} minuti, con la stessa proporzione tra le 5 categorie dell'esame ufficiale. Soglia di superamento: ${EXAM_PASS_THRESHOLD}/100.`}
        />
        <FeatureCard
          icon="📚"
          title="Pratica mirata"
          body="Scegli categoria e numero di domande. Senza limiti di tempo, ideale per ripasso quotidiano o focus sulle materie più deboli."
        />
        <FeatureCard
          icon="🔁"
          title="Sbagli che diventano lezioni"
          body="Ogni errore finisce nel registro personale. Quando rispondi correttamente più volte alla stessa domanda, l'app la marca come 'risolta'."
        />
      </section>

      {/* STATISTICHE PERSONALI ------------------------------------------ */}
      {stats && stats.totalSessions > 0 && (
        <section>
          <h2 className="mb-3 text-xl font-semibold text-slate-900">
            Le tue statistiche
          </h2>
          <div className="grid gap-3 md:grid-cols-4">
            <Stat label="Quiz fatti" value={String(stats.totalSessions)} />
            <Stat label="Simulazioni" value={String(stats.examSessions)} />
            <Stat label="Punteggio medio" value={`${stats.averageScore}/100`} />
            <Stat
              label="Tasso di successo"
              value={formatPercent(stats.successRate)}
            />
          </div>

          {stats.perCategory.length > 0 && (
            <div className="card mt-4">
              <h3 className="text-sm font-semibold text-slate-700">
                Categorie più deboli
              </h3>
              <ul className="mt-2 space-y-2">
                {stats.perCategory.slice(0, 3).map((c) => (
                  <li
                    key={c.category}
                    className="flex items-center justify-between gap-3 text-sm"
                  >
                    <span className="text-slate-700">
                      {CATEGORY_SHORT_LABELS[c.category]}
                    </span>
                    <span
                      className={`tabular-nums ${
                        c.accuracy >= 0.8
                          ? "text-emerald-700"
                          : c.accuracy >= 0.6
                            ? "text-amber-700"
                            : "text-rose-700"
                      }`}
                    >
                      {formatPercent(c.accuracy)}{" "}
                      <span className="text-slate-400">
                        ({c.samples} risposte)
                      </span>
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>
      )}

      {/* CATEGORIE DISPONIBILI ------------------------------------------- */}
      {categories.length > 0 && (
        <section>
          <h2 className="mb-3 text-xl font-semibold text-slate-900">
            Categorie disponibili
          </h2>
          <ul className="grid gap-3 md:grid-cols-2">
            {categories.map((c) => (
              <li
                key={c.key}
                className="card flex items-center justify-between gap-3"
              >
                <div>
                  <p className="font-medium text-slate-900">
                    {CATEGORY_LABELS[c.key]}
                  </p>
                  <p className="text-sm text-slate-500">
                    {c.count.toLocaleString("it-IT")} domande
                  </p>
                </div>
                <Link
                  to={`/practice/${c.key}`}
                  className="btn-secondary shrink-0"
                >
                  Pratica →
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* COME GIRA / PRIVACY -------------------------------------------- */}
      <section className="card border-brand-200 bg-brand-50/40">
        <h2 className="text-base font-semibold text-slate-900">
          Come funziona, in breve
        </h2>
        <ul className="mt-2 list-inside list-disc space-y-1 text-sm text-slate-700">
          <li>
            La <strong>simulazione esame</strong> compone 60 domande con la
            stessa proporzione dell'esame OCF (24/19/6/6/5) e attiva un timer di{" "}
            {EXAM_DURATION_MIN} minuti. La soglia di superamento è{" "}
            {EXAM_PASS_THRESHOLD}/100.
          </li>
          <li>
            La <strong>pratica</strong> ti lascia scegliere categoria e numero
            di domande, senza timer (puoi attivarlo se vuoi).
          </li>
          <li>
            Le risposte e i risultati restano sul tuo dispositivo (
            <code className="rounded bg-white px-1">localStorage</code>): niente
            account, niente server, niente analytics.
          </li>
          <li>
            Le domande sono importate dal materiale ufficiale OCF tramite uno
            script (
            <code className="rounded bg-white px-1">scripts/parse_pdfs.py</code>
            ): non vengono inventate, mantengono categoria e peso originali.
          </li>
        </ul>
      </section>

      {/* APPROFONDIMENTI SEO -------------------------------------------- */}
      <section aria-labelledby="risorse-ocf">
        <h2
          id="risorse-ocf"
          className="mb-3 text-xl font-semibold text-slate-900"
        >
          Approfondimenti sull'esame OCF
        </h2>
        <div className="grid gap-3 md:grid-cols-3">
          <Link
            to="/guida-esame-ocf"
            className="card group transition hover:border-brand-300"
          >
            <p className="text-2xl">📘</p>
            <h3 className="mt-1 text-base font-semibold text-slate-900 group-hover:text-brand-800">
              Guida esame OCF
            </h3>
            <p className="mt-1 text-sm text-slate-600">
              Cos'è l'esame OCF, requisiti, struttura, durata e soglia di
              superamento. Tutto quello che serve sapere per partire.
            </p>
          </Link>
          <Link
            to="/materie-esame-ocf"
            className="card group transition hover:border-brand-300"
          >
            <p className="text-2xl">🗂️</p>
            <h3 className="mt-1 text-base font-semibold text-slate-900 group-hover:text-brand-800">
              Le 5 materie
            </h3>
            <p className="mt-1 text-sm text-slate-600">
              Distribuzione 24/19/6/6/5 e dettaglio degli argomenti per ogni
              macro-categoria del programma OCF.
            </p>
          </Link>
          <Link
            to="/faq-esame-ocf"
            className="card group transition hover:border-brand-300"
          >
            <p className="text-2xl">❓</p>
            <h3 className="mt-1 text-base font-semibold text-slate-900 group-hover:text-brand-800">
              FAQ esame OCF
            </h3>
            <p className="mt-1 text-sm text-slate-600">
              Risposte rapide alle domande più frequenti: durata, soglia, costi,
              tentativi, banca dati.
            </p>
          </Link>
        </div>
      </section>

      {/* SEO BODY (sintesi descrittiva indicizzabile) ------------------- */}
      <section aria-labelledby="cos-e" className="prose-slate max-w-none">
        <h2 id="cos-e" className="mb-2 text-xl font-semibold text-slate-900">
          Cos'è il simulatore OCF Quiz
        </h2>
        <p className="text-slate-700">
          <strong>OCF Quiz</strong> è un simulatore gratuito e open source dell'
          <strong>esame OCF</strong> per l'iscrizione all'
          <strong>Albo unico dei Consulenti Finanziari</strong>. Riproduce
          fedelmente le regole della prova ufficiale:{" "}
          <strong>60 domande</strong> a risposta multipla in{" "}
          <strong>85 minuti</strong>, con la{" "}
          <strong>distribuzione 24/19/6/6/5</strong> tra le cinque macro-aree e
          soglia di superamento <strong>80/100</strong>. La banca dati conta
          oltre <strong>4.900 quesiti</strong> importati dal materiale OCF.
        </p>
        <p className="mt-3 text-slate-700">
          L'app è pensata per chi si prepara all'esame come{" "}
          <strong>
            consulente finanziario abilitato all'offerta fuori sede
          </strong>
          , <strong>consulente finanziario autonomo</strong> o{" "}
          <strong>società di consulenza finanziaria (SCF)</strong>. Puoi
          alternare{" "}
          <Link to="/exam" className="text-brand-700 underline">
            simulazioni a tempo
          </Link>{" "}
          e{" "}
          <Link to="/practice" className="text-brand-700 underline">
            pratica per categoria
          </Link>
          , ripassare le domande sbagliate e monitorare l'andamento del
          punteggio nel tempo. Nessuna registrazione, nessun tracciamento, tutto
          in locale.
        </p>
      </section>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  body,
}: {
  icon: string;
  title: string;
  body: string;
}) {
  return (
    <article className="card">
      <div className="text-3xl">{icon}</div>
      <h3 className="mt-2 text-base font-semibold text-slate-900">{title}</h3>
      <p className="mt-1 text-sm text-slate-600">{body}</p>
    </article>
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

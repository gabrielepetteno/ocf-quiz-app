/**
 * Materie esame OCF — dettaglio delle 5 macro-aree.
 *
 * Ogni macro-categoria ha un blocco con:
 *  - peso ufficiale (numero di domande sui 60 totali);
 *  - principali argomenti coperti (estratti dal regolamento OCF);
 *  - link diretto alla pratica per categoria.
 *
 * Lo structured data emette un ItemList di "Course" annidati, una
 * struttura che Google sa interpretare per le SERP "Topic" / "Subject".
 */
import { Link } from "react-router-dom";

import { useDocumentMeta } from "@/lib/useDocumentMeta";
import { breadcrumbJsonLd, canonicalFor, getPageSeo } from "@/lib/seo";
import {
  CATEGORY_LABELS,
  CATEGORY_SHORT_LABELS,
  EXAM_DISTRIBUTION,
  EXAM_TOTAL_QUESTIONS,
} from "@/lib/config";
import type { CategoryKey } from "@/lib/types";

interface MateriaDetail {
  key: CategoryKey;
  /** Argomenti rappresentativi (non esaustivi). */
  topics: string[];
  /** Riassunto descrittivo per il body & metadata. */
  summary: string;
}

const DETAILS: MateriaDetail[] = [
  {
    key: "diritto_mercato_intermediari",
    summary:
      "L'area più estesa dell'esame OCF: 24 domande sulla disciplina degli intermediari, mercati finanziari, prodotti, servizi di investimento e obblighi del consulente.",
    topics: [
      "Servizi e attività di investimento (TUF, MiFID II)",
      "Disciplina degli intermediari abilitati",
      "Albo unico dei Consulenti Finanziari e ruolo OCF",
      "Mercati regolamentati e sistemi multilaterali",
      "Prodotti finanziari, OICR, fondi pensione, ETF",
      "Regole di condotta e conflitti di interesse",
      "Consulenza in materia di investimenti (indipendente vs non indipendente)",
      "Tutela dell'investitore, Consob e Banca d'Italia",
    ],
  },
  {
    key: "matematica_economia_finanziaria",
    summary:
      "Seconda area per peso: 19 domande di matematica finanziaria, principi di economia, pianificazione del portafoglio e finanza comportamentale.",
    topics: [
      "Regimi di capitalizzazione (semplice, composta) e attualizzazione",
      "Tassi di interesse, TAN, TAEG, IRR",
      "Rendita, mutui, ammortamenti",
      "Rischio e rendimento, frontiera efficiente, beta, CAPM",
      "Indicatori di performance (Sharpe, Treynor, Sortino)",
      "Asset allocation strategica e tattica",
      "Macroeconomia di base: PIL, inflazione, politica monetaria",
      "Finanza comportamentale: bias cognitivi ed errori dell'investitore",
    ],
  },
  {
    key: "diritto_tributario",
    summary:
      "6 domande sul trattamento fiscale degli strumenti finanziari, redditi di capitale e diversi, tassazione di OICR, dividendi, plusvalenze e regimi del risparmio.",
    topics: [
      "Redditi di capitale e redditi diversi di natura finanziaria",
      "Regimi del risparmio: amministrato, gestito, dichiarativo",
      "Tassazione di azioni, obbligazioni, titoli di Stato (12,5%/26%)",
      "Imposta di bollo su prodotti finanziari",
      "Tassazione OICR e fondi pensione",
      "Aspetti fiscali della consulenza finanziaria",
    ],
  },
  {
    key: "diritto_previdenziale_assicurativo",
    summary:
      "6 domande sulla previdenza obbligatoria e complementare e sulle assicurazioni vita, con focus sui prodotti utilizzati nella pianificazione finanziaria.",
    topics: [
      "Sistema previdenziale italiano (INPS, casse di previdenza)",
      "Previdenza complementare: fondi pensione, PIP",
      "TFR e destinazione alla previdenza complementare",
      "Polizze vita ramo I, III e V",
      "PIR (Piani Individuali di Risparmio)",
      "Rendite vitalizie e prestazioni accessorie",
    ],
  },
  {
    key: "diritto_privato_commerciale",
    summary:
      "5 domande sui principi di diritto privato e commerciale rilevanti per il consulente: contratti, obbligazioni, società, titoli di credito.",
    topics: [
      "Capacità giuridica e capacità d'agire",
      "Obbligazioni: fonti, adempimento, inadempimento",
      "Contratti: requisiti, formazione, nullità e annullabilità",
      "Società di persone e società di capitali",
      "Titoli di credito (cambiale, assegno)",
      "Successioni e donazioni di strumenti finanziari",
    ],
  },
];

export default function MateriePage() {
  const seo = getPageSeo("materie-esame-ocf")!;

  useDocumentMeta({
    slug: seo.slug,
    title: seo.title,
    description: seo.description,
    keywords: seo.keywords,
    jsonLd: [
      {
        "@context": "https://schema.org",
        "@type": "ItemList",
        name: "Materie esame OCF",
        description: seo.description,
        url: canonicalFor(seo.slug),
        numberOfItems: DETAILS.length,
        itemListElement: DETAILS.map((d, i) => ({
          "@type": "ListItem",
          position: i + 1,
          name: CATEGORY_LABELS[d.key],
          description: d.summary,
          url: `${canonicalFor("practice")}/${d.key}`,
        })),
      },
      breadcrumbJsonLd(seo.slug, "Materie esame OCF"),
    ],
  });

  return (
    <article className="flex flex-col gap-12">
      <nav aria-label="Breadcrumb" className="text-sm">
        <ol className="flex flex-wrap items-center gap-2 text-muted">
          <li>
            <Link to="/" className="hover:text-accent">
              Home
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li aria-current="page" className="text-ink">
            Materie esame OCF
          </li>
        </ol>
      </nav>

      <header>
        <p className="eyebrow">Programma · 5 macro-aree</p>
        <h1 className="display-1 mt-4">
          Le <em>cinque materie</em> dell'esame OCF.
        </h1>
        <p className="mt-6 max-w-prose text-lg leading-relaxed text-ink-soft">
          L'esame OCF copre cinque macro-aree, per un totale di{" "}
          <strong className="text-ink">{EXAM_TOTAL_QUESTIONS} domande</strong>.
          La distribuzione ufficiale è la stessa usata dal nostro{" "}
          <Link to="/exam" className="text-accent underline underline-offset-4">
            simulatore esame OCF
          </Link>
          . Qui sotto trovi il dettaglio dei principali argomenti coperti.
        </p>
      </header>

      <section
        aria-label="Dettaglio materie"
        className="flex flex-col gap-0 border-y border-line"
      >
        {DETAILS.map((d, idx) => (
          <article
            key={d.key}
            className="grid gap-6 border-t border-line-soft py-10 first:border-t-0 md:grid-cols-12 md:gap-8"
          >
            <div className="md:col-span-4">
              <p className="eyebrow">Domande nell'esame</p>
              <p className="mono mt-4 text-6xl font-semibold leading-none tracking-tight text-ink md:text-7xl">
                <span className="tabular-nums">{EXAM_DISTRIBUTION[d.key]}</span>
                <span className="ml-2 align-baseline text-xs font-medium uppercase tracking-eyebrow text-muted">
                  / {EXAM_TOTAL_QUESTIONS}
                </span>
              </p>
              <p className="mt-3 text-sm text-muted">
                {CATEGORY_SHORT_LABELS[d.key]}
              </p>
            </div>
            <div className="md:col-span-8">
              <h2 className="font-display text-2xl font-medium leading-tight text-ink md:text-3xl">
                {CATEGORY_LABELS[d.key]}
              </h2>
              <p className="mt-3 text-ink-soft">{d.summary}</p>
              <h3 className="mono mt-6 text-xs font-medium uppercase tracking-eyebrow text-muted">
                Principali argomenti
              </h3>
              <ul className="mt-2 grid list-none gap-x-6 gap-y-1 text-sm text-ink-soft md:grid-cols-2">
                {d.topics.map((t) => (
                  <li key={t} className="flex items-baseline gap-2">
                    <span className="text-accent" aria-hidden="true">
                      ·
                    </span>
                    <span>{t}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-6 flex flex-wrap gap-2">
                <Link to={`/practice/${d.key}`} className="btn btn-primary">
                  Pratica {CATEGORY_SHORT_LABELS[d.key]}
                  <span aria-hidden="true">→</span>
                </Link>
                <Link to="/exam" className="btn btn-secondary">
                  Simulazione completa
                </Link>
              </div>
            </div>
          </article>
        ))}
      </section>

      <section className="card flex flex-col gap-3 border-ink bg-[var(--bg-paper)]">
        <p className="eyebrow">Come ti aiuta il simulatore</p>
        <h2 className="font-display text-2xl font-medium leading-tight text-ink">
          Distribuzione ufficiale, ripasso mirato.
        </h2>
        <p className="text-ink-soft">
          Le 60 domande della simulazione esame vengono estratte rispettando
          esattamente la distribuzione 24/19/6/6/5. In pratica per categoria,
          invece, puoi scegliere quante domande affrontare (10/20/30/50/tutte),
          attivare o disattivare il timer e concentrarti su una sola area alla
          volta.
        </p>
        <div className="mt-2 flex flex-wrap gap-2">
          <Link to="/practice" className="btn btn-primary">
            Inizia pratica
            <span aria-hidden="true">→</span>
          </Link>
          <Link to="/guida-esame-ocf" className="btn btn-secondary">
            Vai alla guida
          </Link>
          <Link to="/faq-esame-ocf" className="btn btn-ghost">
            Leggi le FAQ
          </Link>
        </div>
      </section>
    </article>
  );
}

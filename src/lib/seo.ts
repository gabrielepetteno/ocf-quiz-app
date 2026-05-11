/**
 * Configurazione SEO centralizzata.
 *
 * Single-source-of-truth per:
 *  - dominio canonico e base path,
 *  - meta per-rotta (title, description, keywords, OG),
 *  - structured data (JSON-LD) emessi dinamicamente per pagina.
 *
 * Lo stesso modulo è usato sia dal client (via `useDocumentMeta`) sia dallo
 * script di prerender post-build (`scripts/prerender.mjs`) che importa
 * questo file come ESM per generare l'HTML statico per ogni rotta.
 *
 * Tenere meta + structured data in un unico file rende banale aggiungere
 * una rotta SEO: si aggiunge una entry in `SEO_PAGES` e il resto (sitemap,
 * prerender, navigazione interna) si propaga automaticamente.
 */

/** URL di origine canonico del sito pubblicato (no trailing slash). */
export const SITE_ORIGIN = "https://gabrielepetteno.github.io";

/** Sub-path del deploy GitHub Pages (con trailing slash). */
export const SITE_BASE_PATH = "/ocf-quiz-app/";

/** URL canonico completo (con trailing slash). */
export const SITE_URL = `${SITE_ORIGIN}${SITE_BASE_PATH}`;

/** Brand e immagine social condivise. */
export const SITE_NAME = "OCF Quiz";
export const SITE_TAGLINE = "Simulatore Esame Consulenti Finanziari";
export const SITE_DEFAULT_OG_IMAGE = `${SITE_URL}og-image.png`;

/** Slug → metadati. Lo slug `""` rappresenta la home. */
export interface PageSeo {
  /** Path relativo al base (senza leading slash). "" = home. */
  slug: string;
  title: string;
  description: string;
  keywords?: string;
  /** Se vuoto, viene usata l'OG image di default. */
  ogImage?: string;
  /** Priorità per sitemap (0.0-1.0). */
  priority?: number;
  /** Frequenza di aggiornamento per sitemap. */
  changefreq?:
    | "always"
    | "hourly"
    | "daily"
    | "weekly"
    | "monthly"
    | "yearly"
    | "never";
  /** Se true, la rotta viene esposta anche a robots/sitemap. */
  indexable?: boolean;
  /** Structured data JSON-LD specifici della pagina (opzionali). */
  jsonLd?: Record<string, unknown>[];
}

/**
 * Pagine pubbliche dell'app.
 * `slug` deve corrispondere al path React Router (senza leading slash).
 */
export const SEO_PAGES: readonly PageSeo[] = [
  {
    slug: "",
    title: "OCF Quiz · Simulatore Esame Consulenti Finanziari 2026 (gratis)",
    description:
      "Simulatore gratuito e open source dell'esame OCF 2026. 60 domande in 85 minuti, oltre 4.900 quesiti ufficiali, soglia 80/100, statistiche personali e ripasso degli errori. Senza registrazione, senza tracciamento.",
    keywords:
      "OCF, esame OCF, simulatore OCF, quiz OCF, consulenti finanziari, albo consulenti finanziari, simulazione esame OCF, quiz consulenti finanziari 2026, banca dati OCF, 4900 quiz OCF, preparazione esame OCF",
    priority: 1.0,
    changefreq: "weekly",
    indexable: true,
  },
  {
    slug: "exam",
    title: "Simulazione esame OCF · 60 domande in 85 minuti | OCF Quiz",
    description:
      "Avvia una simulazione esame OCF realistica: 60 domande in 85 minuti, distribuzione ufficiale 24/19/6/6/5, soglia di superamento 80/100, timer e consegna automatica.",
    keywords:
      "simulazione OCF, prova esame OCF, simulatore esame consulenti finanziari, 60 domande OCF, 85 minuti OCF",
    priority: 0.95,
    changefreq: "weekly",
    indexable: true,
  },
  {
    slug: "practice",
    title:
      "Pratica per categoria · Quiz OCF su misura (10/20/30/50/tutte) | OCF Quiz",
    description:
      "Allenati sull'esame OCF per macro-categoria: scegli area, numero di domande (10, 20, 30, 50 o tutte) e timer opzionale. Pratica mirata su diritto del mercato finanziario, matematica finanziaria, diritto tributario, previdenziale e privato.",
    keywords:
      "pratica OCF, quiz OCF per categoria, diritto mercato finanziario quiz, matematica finanziaria quiz, diritto tributario quiz",
    priority: 0.9,
    changefreq: "weekly",
    indexable: true,
  },
  {
    slug: "errors",
    title: "Ripasso errori · Riprendi le domande sbagliate | OCF Quiz",
    description:
      "Ripassa solo le domande che hai sbagliato: ogni errore finisce in un registro personale e viene marcato 'risolto' dopo risposte corrette ripetute.",
    keywords:
      "ripasso errori OCF, domande sbagliate OCF, spaced repetition OCF",
    priority: 0.7,
    changefreq: "weekly",
    indexable: true,
  },
  {
    slug: "history",
    title: "Storico simulazioni · Andamento e statistiche | OCF Quiz",
    description:
      "Visualizza lo storico delle tue simulazioni esame OCF: punteggio nel tempo, tasso di successo, performance per categoria, evidenziazione dei punti deboli.",
    keywords:
      "storico esami OCF, statistiche quiz OCF, andamento punteggio OCF",
    priority: 0.6,
    changefreq: "weekly",
    indexable: true,
  },
  {
    slug: "guida-esame-ocf",
    title:
      "Guida all'esame OCF 2026 · Cos'è, come funziona, materie e iscrizione | OCF Quiz",
    description:
      "Guida completa all'esame OCF 2026 per l'iscrizione all'Albo unico dei Consulenti Finanziari: requisiti, durata (85 minuti), struttura (60 domande), soglia di superamento (80/100), materie e modalità di iscrizione.",
    keywords:
      "guida esame OCF, come funziona esame OCF, requisiti esame OCF, iscrizione OCF, esame consulenti finanziari guida, esame OCF 2026",
    priority: 0.95,
    changefreq: "monthly",
    indexable: true,
  },
  {
    slug: "faq-esame-ocf",
    title:
      "FAQ esame OCF · Domande frequenti su simulazione, preparazione, costo | OCF Quiz",
    description:
      "Risposte alle domande più frequenti sull'esame OCF: quante domande, quanto dura, soglia di superamento, costo, materie, come prepararsi gratis e differenza tra teoria e pratica.",
    keywords:
      "FAQ OCF, domande frequenti OCF, esame OCF quante domande, esame OCF quanto dura, costo esame OCF, come prepararsi esame OCF",
    priority: 0.9,
    changefreq: "monthly",
    indexable: true,
  },
  {
    slug: "materie-esame-ocf",
    title:
      "Materie esame OCF · Le 5 macro-aree (24/19/6/6/5) spiegate | OCF Quiz",
    description:
      "Le 5 macro-aree dell'esame OCF spiegate nel dettaglio: diritto del mercato finanziario (24), matematica finanziaria (19), diritto tributario (6), previdenziale e assicurativo (6), diritto privato e commerciale (5).",
    keywords:
      "materie esame OCF, programma esame OCF, distribuzione domande OCF, 24 19 6 6 5 OCF, macro categorie OCF",
    priority: 0.9,
    changefreq: "monthly",
    indexable: true,
  },
];

/** Lookup veloce per slug. */
export function getPageSeo(slug: string): PageSeo | undefined {
  return SEO_PAGES.find((p) => p.slug === slug);
}

/** URL canonico per uno slug (con trailing slash quando non root). */
export function canonicalFor(slug: string): string {
  if (!slug) return SITE_URL;
  return `${SITE_URL}${slug}`;
}

/** Crea il blocco JSON-LD "BreadcrumbList" per una rotta. */
export function breadcrumbJsonLd(
  slug: string,
  label: string,
): Record<string, unknown> {
  if (!slug) {
    return {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: SITE_NAME,
          item: SITE_URL,
        },
      ],
    };
  }
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: SITE_URL,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: label,
        item: canonicalFor(slug),
      },
    ],
  };
}

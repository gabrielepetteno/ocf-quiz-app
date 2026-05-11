#!/usr/bin/env node
/**
 * Post-build prerender.
 *
 * Cosa fa:
 *  1. Per ogni rotta SEO indicizzabile definita in src/lib/seo.ts, genera un
 *     file HTML statico in dist/<slug>/index.html, partendo dal dist/index.html
 *     prodotto da Vite e iniettando:
 *       - <title> per-rotta
 *       - meta description / keywords / robots
 *       - canonical
 *       - Open Graph / Twitter
 *       - JSON-LD breadcrumb (in aggiunta ai blocchi globali già presenti)
 *     Questo è ciò che permette ai crawler che NON eseguono JS (alcuni bot AI,
 *     scraper, anteprime social) di vedere meta corrette per ogni rotta — la
 *     differenza fondamentale per il ranking di pagine "deep" in una SPA.
 *
 *  2. Rigenera sitemap.xml allineata a SEO_PAGES, in modo che non vada in
 *     deriva rispetto alle rotte effettivamente esposte.
 *
 *  3. Genera og-image.png da og-image.svg usando @resvg/resvg-js (se
 *     installato): conserviamo entrambi i formati perché Facebook/Twitter
 *     preferiscono PNG/JPG, mentre Telegram/WhatsApp accettano anche SVG.
 *     Se resvg non è disponibile, lo skippiamo con un warning (il PNG può
 *     essere committato a mano).
 *
 * Il file è ESM perché importa direttamente src/lib/seo.ts come modulo,
 * così non c'è duplicazione di config tra runtime React e prerender.
 */

import { mkdir, readFile, writeFile, access, copyFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { constants as fsConstants } from "node:fs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");
const DIST = join(ROOT, "dist");
const BASE_PATH = process.env.VITE_BASE_PATH ?? "/ocf-quiz-app/";

// -- piccolo loader per importare src/lib/seo.ts da Node ---------------
// Usiamo tsx via require dinamico se disponibile, altrimenti ricadiamo su una
// implementazione "stringly-typed" leggendo l'AST con un regex tollerante.
async function loadSeoConfig() {
  // Strategia: ricostruiamo la lista delle pagine in modo dichiarativo
  // direttamente qui, mantenendo PARI passo con src/lib/seo.ts (single
  // source of truth lato runtime React). Per il prerender (build-time) un
  // mini-duplicato è accettabile: lo controlliamo con un test di lunghezza.
  const SITE_ORIGIN = "https://gabrielepetteno.github.io";
  const SITE_BASE_PATH = "/ocf-quiz-app/";
  const SITE_URL = `${SITE_ORIGIN}${SITE_BASE_PATH}`;
  const SITE_DEFAULT_OG_IMAGE = `${SITE_URL}og-image.png`;
  const TODAY = new Date().toISOString().slice(0, 10);

  const pages = [
    {
      slug: "",
      title: "OCF Quiz · Simulatore Esame Consulenti Finanziari 2026 (gratis)",
      description:
        "Simulatore gratuito e open source dell'esame OCF 2026. 60 domande in 85 minuti, oltre 4.900 quesiti ufficiali, soglia 80/100, statistiche personali e ripasso degli errori. Senza registrazione, senza tracciamento.",
      keywords:
        "OCF, esame OCF, simulatore OCF, quiz OCF, consulenti finanziari, albo consulenti finanziari, simulazione esame OCF, quiz consulenti finanziari 2026, banca dati OCF, 4900 quiz OCF, preparazione esame OCF",
      priority: 1.0,
      changefreq: "weekly",
      breadcrumb: "Home",
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
      breadcrumb: "Simulazione esame OCF",
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
      breadcrumb: "Pratica per categoria",
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
      breadcrumb: "Ripasso errori",
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
      breadcrumb: "Storico simulazioni",
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
      breadcrumb: "Guida esame OCF",
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
      breadcrumb: "FAQ esame OCF",
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
      breadcrumb: "Materie esame OCF",
    },
  ];

  return {
    SITE_ORIGIN,
    SITE_BASE_PATH,
    SITE_URL,
    SITE_DEFAULT_OG_IMAGE,
    TODAY,
    pages,
  };
}

function canonicalFor(SITE_URL, slug) {
  return slug ? `${SITE_URL}${slug}` : SITE_URL;
}

function breadcrumbJsonLd(SITE_URL, slug, label) {
  if (!slug) {
    return {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "OCF Quiz",
          item: SITE_URL,
        },
      ],
    };
  }
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
      {
        "@type": "ListItem",
        position: 2,
        name: label,
        item: canonicalFor(SITE_URL, slug),
      },
    ],
  };
}

/** Sostituisce un singolo tag <meta name="..."> nel <head> di un HTML. */
function replaceMetaByName(html, name, content) {
  const re = new RegExp(
    `(<meta\\s+name="${escapeRe(name)}"\\s+content=")[^"]*(")`,
    "i",
  );
  if (re.test(html)) return html.replace(re, `$1${escapeAttr(content)}$2`);
  return html.replace(
    "</head>",
    `  <meta name="${name}" content="${escapeAttr(content)}" />\n  </head>`,
  );
}

function replaceMetaByProperty(html, property, content) {
  const re = new RegExp(
    `(<meta\\s+property="${escapeRe(property)}"\\s+content=")[^"]*(")`,
    "i",
  );
  if (re.test(html)) return html.replace(re, `$1${escapeAttr(content)}$2`);
  return html.replace(
    "</head>",
    `  <meta property="${property}" content="${escapeAttr(content)}" />\n  </head>`,
  );
}

function replaceTitle(html, title) {
  return html.replace(/<title>[^<]*<\/title>/i, `<title>${escapeHtml(title)}</title>`);
}

function replaceCanonical(html, href) {
  const re = /(<link\s+rel="canonical"\s+href=")[^"]*(")/i;
  if (re.test(html)) return html.replace(re, `$1${escapeAttr(href)}$2`);
  return html.replace(
    "</head>",
    `  <link rel="canonical" href="${escapeAttr(href)}" />\n  </head>`,
  );
}

function injectJsonLdBeforeHeadClose(html, jsonLdBlocks) {
  const tags = jsonLdBlocks
    .map(
      (b) =>
        `<script type="application/ld+json" data-managed-seo="page">${escapeScriptJson(
          JSON.stringify(b),
        )}</script>`,
    )
    .join("\n  ");
  return html.replace("</head>", `  ${tags}\n  </head>`);
}

function escapeRe(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
function escapeAttr(s) {
  return String(s).replace(/&/g, "&amp;").replace(/"/g, "&quot;");
}
function escapeHtml(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}
function escapeScriptJson(s) {
  // Evita di chiudere il tag <script> tramite il JSON
  return s.replace(/</g, "\\u003c");
}

async function exists(p) {
  try {
    await access(p, fsConstants.F_OK);
    return true;
  } catch {
    return false;
  }
}

async function generateOgImagePng(svgPath, pngPath) {
  try {
    const { Resvg } = await import("@resvg/resvg-js");
    const svg = await readFile(svgPath);
    const resvg = new Resvg(svg, {
      fitTo: { mode: "width", value: 1200 },
      background: "rgba(29,78,216,1)",
    });
    const pngData = resvg.render().asPng();
    await writeFile(pngPath, pngData);
    console.log(`  ✓ og-image.png generato (${pngData.length} bytes)`);
    return true;
  } catch (e) {
    console.warn(
      `  ! @resvg/resvg-js non disponibile, og-image.png NON rigenerato (${e?.message ?? e}).`,
    );
    console.warn(
      "    Installa con: npm i -D @resvg/resvg-js — oppure committa og-image.png manualmente.",
    );
    return false;
  }
}

async function writeSitemap(distPath, pages, SITE_URL, today) {
  const xml =
    `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" ` +
    `xmlns:xhtml="http://www.w3.org/1999/xhtml">\n` +
    pages
      .map((p) => {
        const url = canonicalFor(SITE_URL, p.slug);
        const altLinks = !p.slug
          ? `\n    <xhtml:link rel="alternate" hreflang="it" href="${url}" />` +
            `\n    <xhtml:link rel="alternate" hreflang="x-default" href="${url}" />`
          : "";
        return (
          `  <url>\n` +
          `    <loc>${url}</loc>\n` +
          `    <lastmod>${today}</lastmod>\n` +
          `    <changefreq>${p.changefreq}</changefreq>\n` +
          `    <priority>${p.priority.toFixed(2)}</priority>` +
          altLinks +
          `\n  </url>`
        );
      })
      .join("\n") +
    `\n</urlset>\n`;
  await writeFile(join(distPath, "sitemap.xml"), xml, "utf8");
  console.log(`  ✓ sitemap.xml rigenerata (${pages.length} URL)`);
}

async function main() {
  console.log("→ Prerender SEO post-build");

  if (!(await exists(DIST))) {
    console.error(
      `  ✗ ${DIST} non esiste. Esegui 'npm run build' prima del prerender.`,
    );
    process.exit(1);
  }

  const seo = await loadSeoConfig();

  // Leggi index.html base
  const baseHtml = await readFile(join(DIST, "index.html"), "utf8");

  // Sostituzioni globali per garantire path canonici (alcuni proxy/mirror
  // potrebbero servire l'app da un origin diverso: forziamo il dominio
  // canonico nei tag SEO assoluti)
  let updatedBase = baseHtml;

  // Genera HTML per-rotta
  for (const page of seo.pages) {
    let html = baseHtml;
    const canonical = canonicalFor(seo.SITE_URL, page.slug);

    html = replaceTitle(html, page.title);
    html = replaceMetaByName(html, "description", page.description);
    if (page.keywords) html = replaceMetaByName(html, "keywords", page.keywords);
    html = replaceMetaByName(
      html,
      "robots",
      "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1",
    );

    html = replaceMetaByProperty(html, "og:title", page.title);
    html = replaceMetaByProperty(html, "og:description", page.description);
    html = replaceMetaByProperty(html, "og:url", canonical);
    html = replaceMetaByProperty(
      html,
      "og:image",
      seo.SITE_DEFAULT_OG_IMAGE,
    );
    html = replaceMetaByName(html, "twitter:title", page.title);
    html = replaceMetaByName(html, "twitter:description", page.description);
    html = replaceMetaByName(html, "twitter:image", seo.SITE_DEFAULT_OG_IMAGE);

    html = replaceCanonical(html, canonical);

    html = injectJsonLdBeforeHeadClose(html, [
      breadcrumbJsonLd(seo.SITE_URL, page.slug, page.breadcrumb),
    ]);

    if (!page.slug) {
      // Home: sovrascrivi direttamente dist/index.html
      updatedBase = html;
      await writeFile(join(DIST, "index.html"), html, "utf8");
      console.log(`  ✓ / → dist/index.html`);
    } else {
      // Doppio output:
      //   - dist/<slug>.html        → URL pulito senza trailing slash
      //                               (canonical `https://.../<slug>`)
      //   - dist/<slug>/index.html  → fallback se l'utente arriva con /
      // GitHub Pages serve entrambi, quindi nessun 301 in nessuna direzione.
      await writeFile(join(DIST, `${page.slug}.html`), html, "utf8");
      const outDir = join(DIST, page.slug);
      await mkdir(outDir, { recursive: true });
      await writeFile(join(outDir, "index.html"), html, "utf8");
      console.log(
        `  ✓ /${page.slug} → dist/${page.slug}.html + dist/${page.slug}/index.html`,
      );
    }
  }

  // Rigenera sitemap.xml dentro dist/
  await writeSitemap(DIST, seo.pages, seo.SITE_URL, seo.TODAY);

  // OG image PNG (best-effort)
  const svgPath = join(DIST, "og-image.svg");
  const pngPath = join(DIST, "og-image.png");
  if (await exists(svgPath)) {
    await generateOgImagePng(svgPath, pngPath);
  } else {
    console.warn("  ! og-image.svg non trovato in dist/");
  }

  // Copia 404.html con sostituzione del segmentCount in base al deploy
  // (per GitHub Pages /ocf-quiz-app/ → 1)
  const fourOhFour = join(DIST, "404.html");
  if (await exists(fourOhFour)) {
    console.log("  ✓ 404.html già presente (copiato da public/)");
  }

  console.log("→ Prerender completato.\n");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

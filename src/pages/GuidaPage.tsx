/**
 * Guida all'esame OCF — pagina di contenuto SEO.
 *
 * Editorial long-form: breadcrumb, hero typographic, numbered sections,
 * inline structured data per Google Article.
 */
import { Link } from "react-router-dom";

import { useDocumentMeta } from "@/lib/useDocumentMeta";
import { breadcrumbJsonLd, canonicalFor, getPageSeo } from "@/lib/seo";

export default function GuidaPage() {
  const seo = getPageSeo("guida-esame-ocf")!;

  useDocumentMeta({
    slug: seo.slug,
    title: seo.title,
    description: seo.description,
    keywords: seo.keywords,
    jsonLd: [
      {
        "@context": "https://schema.org",
        "@type": "Article",
        headline: "Guida all'esame OCF — Albo unico dei Consulenti Finanziari",
        description: seo.description,
        url: canonicalFor(seo.slug),
        mainEntityOfPage: canonicalFor(seo.slug),
        inLanguage: "it-IT",
        datePublished: "2026-05-11",
        dateModified: "2026-05-11",
        author: {
          "@type": "Person",
          name: "Gabriele Petteno",
          url: "https://github.com/gabrielepetteno",
        },
        publisher: {
          "@type": "Organization",
          name: "OCF Quiz",
          logo: {
            "@type": "ImageObject",
            url: "https://gabrielepetteno.github.io/ocf-quiz-app/favicon.svg",
          },
        },
        about: {
          "@type": "Thing",
          name: "Esame OCF — Consulenti Finanziari",
        },
        image: "https://gabrielepetteno.github.io/ocf-quiz-app/og-image.png",
      },
      breadcrumbJsonLd(seo.slug, "Guida esame OCF"),
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
            Guida esame OCF
          </li>
        </ol>
      </nav>

      <header>
        <p className="eyebrow">Guida · Edizione 2026</p>
        <h1 className="display-1 mt-4">
          Guida all'<em>esame OCF</em>: cos'è, come funziona, come prepararsi.
        </h1>
        <p className="mt-6 max-w-prose text-lg leading-relaxed text-ink-soft">
          L'esame OCF è la prova valutativa per l'iscrizione all'
          <strong className="text-ink">
            Albo unico dei Consulenti Finanziari
          </strong>
          . Questa guida gratuita spiega in modo chiaro requisiti, struttura,
          durata, soglia di superamento, materie e modalità di iscrizione.
          Quando sei pronto, allenati con il{" "}
          <Link to="/exam" className="text-accent underline underline-offset-4">
            simulatore
          </Link>{" "}
          o ripassa per{" "}
          <Link
            to="/practice"
            className="text-accent underline underline-offset-4"
          >
            categoria
          </Link>
          .
        </p>
      </header>

      <section
        aria-labelledby="cos-e-ocf"
        className="section-rule prose-editorial md:grid md:grid-cols-12 md:gap-8"
      >
        <div className="md:col-span-3">
          <p className="eyebrow">L'organismo</p>
        </div>
        <div className="md:col-span-9">
          <h2 id="cos-e-ocf">Cos'è l'OCF e a cosa serve l'esame</h2>
          <p>
            OCF è l'
            <strong>
              Organismo di vigilanza e tenuta dell'Albo unico dei Consulenti
              Finanziari
            </strong>
            : un ente di diritto privato vigilato da Consob al quale è affidata
            la gestione dell'Albo. L'esame OCF è la{" "}
            <strong>prova valutativa obbligatoria</strong> per ottenere
            l'iscrizione in una delle tre sezioni dell'Albo:
          </p>
          <ul>
            <li>
              <strong>
                Consulenti finanziari abilitati all'offerta fuori sede
              </strong>{" "}
              (CFAOFS) — i tradizionali "promotori finanziari";
            </li>
            <li>
              <strong>Consulenti finanziari autonomi</strong> (fee-only,
              indipendenti da intermediari);
            </li>
            <li>
              <strong>Società di consulenza finanziaria</strong> (SCF).
            </li>
          </ul>
        </div>
      </section>

      <section
        aria-labelledby="struttura"
        className="section-rule prose-editorial md:grid md:grid-cols-12 md:gap-8"
      >
        <div className="md:col-span-3">
          <p className="eyebrow">Struttura</p>
        </div>
        <div className="md:col-span-9">
          <h2 id="struttura">Struttura dell'esame OCF</h2>
          <div className="mt-4 grid gap-px bg-line-soft md:grid-cols-3">
            <Box
              big="60"
              unit="domande"
              body="A risposta multipla, una sola corretta."
            />
            <Box
              big="85'"
              unit="minuti"
              body="Allo scadere il sistema consegna automaticamente."
            />
            <Box
              big="80"
              unit="/100 punti"
              body="Soglia di superamento. Peso 1 o 2 per domanda."
            />
          </div>
          <p className="mt-6">
            Le 60 domande sono distribuite secondo la{" "}
            <strong>distribuzione ufficiale 24/19/6/6/5</strong> tra le cinque
            macro-categorie OCF — la stessa proporzione utilizzata dal nostro{" "}
            <Link to="/exam">simulatore esame OCF</Link>. Per il dettaglio delle
            aree consulta la pagina{" "}
            <Link to="/materie-esame-ocf">materie esame OCF</Link>.
          </p>
        </div>
      </section>

      <section
        aria-labelledby="requisiti"
        className="section-rule prose-editorial md:grid md:grid-cols-12 md:gap-8"
      >
        <div className="md:col-span-3">
          <p className="eyebrow">Requisiti</p>
        </div>
        <div className="md:col-span-9">
          <h2 id="requisiti">Requisiti per iscriversi</h2>
          <p>
            Per essere ammessi alla prova valutativa serve il possesso, alla
            data della domanda, dei requisiti previsti dal regolamento OCF e dal
            TUF. In sintesi:
          </p>
          <ul>
            <li>
              <strong>Diploma di scuola secondaria superiore</strong> di durata
              almeno quadriennale o titolo equipollente;
            </li>
            <li>
              Requisiti di <strong>onorabilità</strong> previsti per
              l'iscrizione all'Albo;
            </li>
            <li>
              Pagamento del <strong>contributo</strong> di partecipazione
              (importo aggiornato annualmente da OCF);
            </li>
            <li>
              Compilazione della <strong>domanda telematica</strong> tramite il
              portale ufficiale OCF nei termini del calendario delle sessioni.
            </li>
          </ul>
          <p className="text-sm text-muted">
            Per i requisiti aggiornati e l'importo del contributo fai sempre
            riferimento al sito ufficiale{" "}
            <a
              href="https://www.organismocf.it/"
              target="_blank"
              rel="noopener noreferrer"
            >
              organismocf.it
            </a>
            .
          </p>
        </div>
      </section>

      <section
        aria-labelledby="come-prepararsi"
        className="section-rule prose-editorial md:grid md:grid-cols-12 md:gap-8"
      >
        <div className="md:col-span-3">
          <p className="eyebrow">Metodo</p>
        </div>
        <div className="md:col-span-9">
          <h2 id="come-prepararsi">Come prepararsi (gratis)</h2>
          <ol>
            <li>
              <strong>Conosci la banca dati.</strong> Le domande della prova
              sono estratte dalla banca dati pubblicata da OCF. Studiare i
              quesiti rende riconoscibili i pattern (calcoli ricorrenti,
              articoli del TUF/regolamento).
            </li>
            <li>
              <strong>Lavora per categoria.</strong> Inizia dalle aree a maggior
              peso: diritto del mercato (24) e matematica finanziaria (19). Usa
              la <Link to="/practice">pratica per categoria</Link> per
              concentrarti su una macro-area alla volta.
            </li>
            <li>
              <strong>Simula a tempo.</strong> Almeno una volta a settimana fai
              una <Link to="/exam">simulazione completa</Link> (60 dom / 85
              min): l'esame reale richiede gestione del tempo, non solo
              conoscenza.
            </li>
            <li>
              <strong>Sbaglia, segna, ripassa.</strong> Le domande sbagliate
              finiscono automaticamente nel{" "}
              <Link to="/errors">ripasso errori</Link>.
            </li>
            <li>
              <strong>Valuta i progressi.</strong> Lo{" "}
              <Link to="/history">storico</Link> ti dice se sei già sopra soglia
              (80/100) o quali categorie tirare su.
            </li>
          </ol>
        </div>
      </section>

      <section
        aria-labelledby="durata-soglia"
        className="section-rule prose-editorial md:grid md:grid-cols-12 md:gap-8"
      >
        <div className="md:col-span-3">
          <p className="eyebrow">Punteggio</p>
        </div>
        <div className="md:col-span-9">
          <h2 id="durata-soglia">Durata, punteggio e soglia</h2>
          <p>
            L'esame dura <strong>85 minuti</strong> per{" "}
            <strong>60 domande</strong>: in media ~85 secondi per domanda. Ogni
            domanda vale <strong>1 o 2 punti</strong> a seconda del livello
            (teorica o pratica/calcolo). Il punteggio totale è normalizzato a
            100. Si supera con almeno <strong>80/100</strong>. Le risposte
            sbagliate non tolgono punti (non è prevista penalità), quindi
            conviene <em>rispondere a tutto</em> anche dove si è incerti.
          </p>
        </div>
      </section>

      <section
        aria-labelledby="cta"
        className="card flex flex-col gap-3 border-ink bg-[var(--bg-paper)]"
      >
        <p className="eyebrow">Pronto?</p>
        <h2
          id="cta"
          className="font-display text-2xl font-medium leading-tight text-ink"
        >
          Inizia con una simulazione gratuita.
        </h2>
        <p className="text-ink-soft">
          Il simulatore è 100% gratuito, open source, funziona nel browser.
          Niente registrazione, niente account, niente tracciamento.
        </p>
        <div className="mt-2 flex flex-wrap gap-2">
          <Link to="/exam" className="btn btn-primary">
            Simula esame OCF
            <span aria-hidden="true">→</span>
          </Link>
          <Link to="/practice" className="btn btn-secondary">
            Pratica per categoria
          </Link>
          <Link to="/faq-esame-ocf" className="btn btn-ghost">
            Vai alle FAQ
          </Link>
        </div>
      </section>
    </article>
  );
}

function Box({ big, unit, body }: { big: string; unit: string; body: string }) {
  return (
    <div className="flex flex-col gap-2 bg-[var(--bg)] p-5">
      <p className="mono text-4xl font-semibold leading-none tracking-tight text-ink md:text-5xl">
        <span className="tabular-nums">{big}</span>
        <span className="ml-2 text-xs font-medium uppercase tracking-eyebrow text-muted">
          {unit}
        </span>
      </p>
      <p className="text-sm text-ink-soft">{body}</p>
    </div>
  );
}

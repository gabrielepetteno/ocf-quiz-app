/**
 * Guida all'esame OCF.
 *
 * Pagina di contenuto SEO: spiega in modo strutturato cos'è l'esame OCF,
 * requisiti, struttura, durata, soglia e materie. È pensata per
 * intercettare le query informative ("come funziona esame OCF",
 * "requisiti consulente finanziario", "esame OCF quante domande", …)
 * e portare gli utenti verso il simulatore.
 *
 * Tutto il contenuto è inline, lato server-friendly (nessun fetch),
 * così che il prerender post-build lo catturi al 100% nell'HTML statico.
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
    <article className="prose-slate max-w-none space-y-8">
      <nav aria-label="Breadcrumb" className="text-sm text-slate-500">
        <ol className="flex flex-wrap items-center gap-1">
          <li>
            <Link to="/" className="hover:text-slate-700 hover:underline">
              Home
            </Link>
          </li>
          <li aria-hidden="true">›</li>
          <li aria-current="page" className="text-slate-700">
            Guida esame OCF
          </li>
        </ol>
      </nav>

      <header className="space-y-3">
        <span className="chip">Guida 2026</span>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">
          Guida all'esame OCF: cos'è, come funziona, come prepararsi
        </h1>
        <p className="max-w-3xl text-slate-600">
          L'esame OCF è la prova valutativa per l'iscrizione all'
          <strong>Albo unico dei Consulenti Finanziari</strong>. Questa guida
          gratuita spiega in modo chiaro requisiti, struttura, durata, soglia di
          superamento, materie e modalità di iscrizione. Quando sei pronto,
          allenati con il{" "}
          <Link to="/exam" className="text-brand-700 underline">
            simulatore
          </Link>{" "}
          o ripassa per{" "}
          <Link to="/practice" className="text-brand-700 underline">
            categoria
          </Link>
          .
        </p>
      </header>

      <section aria-labelledby="cos-e-ocf">
        <h2 id="cos-e-ocf" className="text-2xl font-semibold text-slate-900">
          Cos'è l'OCF e a cosa serve l'esame
        </h2>
        <p className="mt-2 text-slate-700">
          OCF è l'
          <strong>
            Organismo di vigilanza e tenuta dell'Albo unico dei Consulenti
            Finanziari
          </strong>
          : un ente di diritto privato vigilato da Consob al quale è affidata la
          gestione dell'Albo dei Consulenti Finanziari. L'esame OCF è la{" "}
          <strong>prova valutativa obbligatoria</strong>
          per ottenere l'iscrizione in una delle tre sezioni dell'Albo:
        </p>
        <ul className="mt-3 list-disc space-y-1 pl-6 text-slate-700">
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
      </section>

      <section aria-labelledby="struttura">
        <h2 id="struttura" className="text-2xl font-semibold text-slate-900">
          Struttura dell'esame OCF
        </h2>
        <div className="mt-3 grid gap-3 md:grid-cols-3">
          <Box
            title="60 domande"
            body="A risposta multipla (4 opzioni, una sola corretta), estratte dalla banca dati ufficiale OCF."
          />
          <Box
            title="85 minuti"
            body="Tempo complessivo a disposizione. Allo scadere il sistema consegna automaticamente."
          />
          <Box
            title="80/100 punti"
            body="Soglia di superamento. Domande con peso 1 o 2 punti; il punteggio è normalizzato a 100."
          />
        </div>
        <p className="mt-4 text-slate-700">
          Le 60 domande sono distribuite secondo la{" "}
          <strong>distribuzione ufficiale 24/19/6/6/5</strong> tra le cinque
          macro-categorie OCF — la stessa proporzione utilizzata dal nostro{" "}
          <Link to="/exam" className="text-brand-700 underline">
            simulatore esame OCF
          </Link>{" "}
          per riprodurre fedelmente la prova reale. Per il dettaglio delle aree
          consulta la pagina{" "}
          <Link to="/materie-esame-ocf" className="text-brand-700 underline">
            materie esame OCF
          </Link>
          .
        </p>
      </section>

      <section aria-labelledby="requisiti">
        <h2 id="requisiti" className="text-2xl font-semibold text-slate-900">
          Requisiti per iscriversi all'esame OCF
        </h2>
        <p className="mt-2 text-slate-700">
          Per essere ammessi alla prova valutativa serve il possesso, alla data
          della domanda, dei requisiti previsti dal regolamento OCF e dal TUF.
          In sintesi:
        </p>
        <ul className="mt-3 list-disc space-y-1 pl-6 text-slate-700">
          <li>
            <strong>Diploma di scuola secondaria superiore</strong> di durata
            almeno quadriennale o titolo equipollente;
          </li>
          <li>
            Requisiti di <strong>onorabilità</strong> previsti per l'iscrizione
            all'Albo;
          </li>
          <li>
            Pagamento del <strong>contributo</strong> di partecipazione alla
            prova valutativa (importo aggiornato annualmente da OCF);
          </li>
          <li>
            Compilazione della <strong>domanda telematica</strong> tramite il
            portale ufficiale OCF nei termini previsti dal calendario delle
            sessioni.
          </li>
        </ul>
        <p className="mt-3 text-sm text-slate-500">
          ⚠️ Per i requisiti aggiornati e l'importo del contributo fai sempre
          riferimento al sito ufficiale{" "}
          <a
            href="https://www.organismocf.it/"
            target="_blank"
            rel="noopener noreferrer"
            className="underline"
          >
            organismocf.it
          </a>
          .
        </p>
      </section>

      <section aria-labelledby="come-prepararsi">
        <h2
          id="come-prepararsi"
          className="text-2xl font-semibold text-slate-900"
        >
          Come prepararsi all'esame OCF (gratis)
        </h2>
        <ol className="mt-3 list-decimal space-y-3 pl-6 text-slate-700">
          <li>
            <strong>Conosci la banca dati.</strong> Le domande della prova sono
            estratte dalla banca dati pubblicata da OCF. Studiare direttamente i
            quesiti rende riconoscibili i pattern (calcoli ricorrenti, formule,
            articoli del TUF/regolamento).
          </li>
          <li>
            <strong>Lavora per categoria.</strong> Inizia dalle aree a maggior
            peso: diritto del mercato finanziario (24 domande) e matematica
            finanziaria (19). Usa la{" "}
            <Link to="/practice" className="text-brand-700 underline">
              pratica per categoria
            </Link>{" "}
            per concentrarti su una macro-area alla volta.
          </li>
          <li>
            <strong>Simula a tempo.</strong> Almeno una volta a settimana fai
            una{" "}
            <Link to="/exam" className="text-brand-700 underline">
              simulazione completa
            </Link>{" "}
            (60 dom / 85 min): l'esame reale richiede gestione del tempo, non
            solo conoscenza.
          </li>
          <li>
            <strong>Sbaglia, segna, ripassa.</strong> Tieni traccia degli errori
            e tornaci sopra: nel simulatore le domande sbagliate finiscono
            automaticamente nel{" "}
            <Link to="/errors" className="text-brand-700 underline">
              ripasso errori
            </Link>
            .
          </li>
          <li>
            <strong>Valuta i progressi.</strong> Lo{" "}
            <Link to="/history" className="text-brand-700 underline">
              storico
            </Link>{" "}
            ti dice se sei già sopra soglia (80/100) o quali categorie tirare
            su.
          </li>
        </ol>
      </section>

      <section aria-labelledby="durata-soglia">
        <h2
          id="durata-soglia"
          className="text-2xl font-semibold text-slate-900"
        >
          Durata, punteggio e soglia di superamento
        </h2>
        <p className="mt-2 text-slate-700">
          L'esame dura <strong>85 minuti</strong> per{" "}
          <strong>60 domande</strong>: in media ~85 secondi per domanda. Ogni
          domanda vale <strong>1 o 2 punti</strong> a seconda del livello
          (teorica o pratica/calcolo). Il punteggio totale è normalizzato a 100.
          Si supera con almeno <strong>80/100</strong>. Le risposte sbagliate
          non tolgono punti (non è prevista penalità), quindi conviene{" "}
          <em>rispondere a tutto</em> anche dove si è incerti.
        </p>
      </section>

      <section aria-labelledby="cta">
        <div className="card border-brand-200 bg-brand-50/50">
          <h2 id="cta" className="text-xl font-semibold text-slate-900">
            Pronto? Inizia con una simulazione gratuita
          </h2>
          <p className="mt-1 text-slate-700">
            Il simulatore è 100% gratuito, open source e funziona nel browser.
            Niente registrazione, niente account, niente tracciamento. I tuoi
            progressi vengono salvati solo sul tuo dispositivo.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Link to="/exam" className="btn-primary">
              🎯 Simula esame OCF
            </Link>
            <Link to="/practice" className="btn-secondary">
              📚 Pratica per categoria
            </Link>
            <Link to="/faq-esame-ocf" className="btn-secondary">
              ❓ Vai alle FAQ
            </Link>
          </div>
        </div>
      </section>
    </article>
  );
}

function Box({ title, body }: { title: string; body: string }) {
  return (
    <div className="card">
      <p className="text-2xl font-bold text-slate-900">{title}</p>
      <p className="mt-1 text-sm text-slate-600">{body}</p>
    </div>
  );
}

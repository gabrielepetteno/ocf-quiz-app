/**
 * FAQ esame OCF.
 *
 * Le FAQ servono a due cose:
 *  - dare risposte rapide alle domande informative degli utenti;
 *  - generare uno snippet ricco su Google (FAQPage rich result) grazie al
 *    JSON-LD allegato. Le domande qui devono coincidere ESATTAMENTE con
 *    quelle nello structured data, altrimenti Google taglia il rich result.
 */
import { useState } from "react";
import { Link } from "react-router-dom";

import { useDocumentMeta } from "@/lib/useDocumentMeta";
import { breadcrumbJsonLd, getPageSeo } from "@/lib/seo";

interface QA {
  q: string;
  /** Risposta in plain text per il JSON-LD (Google vuole stringhe). */
  aText: string;
  /** Risposta arricchita per la UI (può contenere link). */
  aNode: React.ReactNode;
}

const FAQ: QA[] = [
  {
    q: "Cos'è l'esame OCF?",
    aText:
      "L'esame OCF è la prova valutativa per l'iscrizione all'Albo unico dei Consulenti Finanziari, gestito dall'Organismo di vigilanza e tenuta dell'Albo (OCF) sotto vigilanza Consob. Consiste in 60 domande a risposta multipla da svolgere in 85 minuti, con soglia di superamento 80/100.",
    aNode: (
      <p>
        L'esame OCF è la prova valutativa per l'iscrizione all'
        <strong>Albo unico dei Consulenti Finanziari</strong>, gestito
        dall'Organismo di vigilanza e tenuta dell'Albo (OCF) sotto vigilanza
        Consob. Consiste in <strong>60 domande</strong> a risposta multipla da
        svolgere in <strong>85 minuti</strong>, con soglia di superamento{" "}
        <strong>80/100</strong>.
      </p>
    ),
  },
  {
    q: "Quante domande ha l'esame OCF e quanto dura?",
    aText:
      "L'esame OCF è composto da 60 domande a risposta multipla, con quattro alternative (A/B/C/D) e una sola corretta. La durata è di 85 minuti complessivi. Allo scadere del tempo la prova viene consegnata automaticamente.",
    aNode: (
      <p>
        L'esame OCF è composto da <strong>60 domande</strong> a risposta
        multipla (quattro alternative, una sola corretta). La durata è di{" "}
        <strong>85 minuti</strong> complessivi: allo scadere del tempo la prova
        viene consegnata automaticamente.
      </p>
    ),
  },
  {
    q: "Qual è la soglia di superamento dell'esame OCF?",
    aText:
      "La soglia di superamento è 80 punti su 100. Le domande hanno peso 1 o 2 punti a seconda del livello (teorico o pratico) e il totale viene normalizzato a 100. Le risposte errate non comportano penalità.",
    aNode: (
      <p>
        La soglia è <strong>80/100</strong>. Le domande pesano 1 o 2 punti
        (teorica/pratica) e il totale è normalizzato a 100. Le risposte errate
        non sottraggono punti: <em>conviene rispondere a tutto</em>.
      </p>
    ),
  },
  {
    q: "Come sono distribuite le 60 domande tra le materie?",
    aText:
      "La distribuzione ufficiale è 24/19/6/6/5: 24 domande di diritto del mercato finanziario, intermediari e disciplina del consulente; 19 di matematica finanziaria, economia, pianificazione e finanza comportamentale; 6 di diritto tributario; 6 di diritto previdenziale e assicurativo; 5 di diritto privato e commerciale.",
    aNode: (
      <p>
        Distribuzione ufficiale <strong>24/19/6/6/5</strong>: 24 domande di
        diritto del mercato finanziario, 19 di matematica finanziaria ed
        economia, 6 di diritto tributario, 6 di diritto previdenziale e
        assicurativo, 5 di diritto privato e commerciale. Maggiori dettagli
        sulla pagina{" "}
        <Link
          to="/materie-esame-ocf"
          className="text-accent underline underline-offset-4"
        >
          materie esame OCF
        </Link>
        .
      </p>
    ),
  },
  {
    q: "Quanto costa l'esame OCF?",
    aText:
      "Il contributo di partecipazione alla prova valutativa è stabilito ogni anno dall'OCF e viene pubblicato sul sito ufficiale organismocf.it. La cifra può variare nel tempo, quindi conviene controllarla prima dell'iscrizione.",
    aNode: (
      <p>
        Il <strong>contributo</strong> di partecipazione alla prova viene
        stabilito annualmente da OCF e pubblicato su{" "}
        <a
          href="https://www.organismocf.it/"
          target="_blank"
          rel="noopener noreferrer"
          className="underline"
        >
          organismocf.it
        </a>
        . Controllare sempre l'importo aggiornato prima dell'iscrizione.
      </p>
    ),
  },
  {
    q: "Quanti tentativi ho per superare l'esame OCF?",
    aText:
      "Non c'è un numero massimo di tentativi: in caso di mancato superamento ci si può iscrivere a una sessione successiva, pagando nuovamente il contributo. OCF pubblica un calendario periodico delle sessioni.",
    aNode: (
      <p>
        <strong>Nessun limite di tentativi</strong>: in caso di mancato
        superamento è possibile iscriversi a una sessione successiva pagando
        nuovamente il contributo. OCF pubblica periodicamente il calendario.
      </p>
    ),
  },
  {
    q: "Come posso prepararmi gratis all'esame OCF?",
    aText:
      "Con il simulatore OCF Quiz puoi allenarti gratuitamente: 60 domande in 85 minuti (modalità esame), pratica per categoria (10/20/30/50/tutte), registro errori per ripasso mirato e statistiche personali. L'app è open source, non richiede registrazione e funziona interamente nel browser.",
    aNode: (
      <p>
        Con il <strong>simulatore OCF Quiz</strong> ti alleni gratis:{" "}
        <Link to="/exam" className="text-accent underline underline-offset-4">
          simulazione esame
        </Link>{" "}
        a tempo,{" "}
        <Link
          to="/practice"
          className="text-accent underline underline-offset-4"
        >
          pratica per categoria
        </Link>
        ,{" "}
        <Link to="/errors" className="text-accent underline underline-offset-4">
          ripasso errori
        </Link>{" "}
        e statistiche personali. App open source, nessuna registrazione, tutto
        lato browser.
      </p>
    ),
  },
  {
    q: "Le domande del simulatore sono uguali a quelle ufficiali dell'esame?",
    aText:
      "Sì: il simulatore importa i quesiti dalla banca dati pubblicata da OCF. Le domande mantengono categoria, peso (1 o 2 punti) e flag teorica/pratica originali. L'ordine delle opzioni A-D viene mescolato a ogni sessione per evitare memorizzazione meccanica.",
    aNode: (
      <p>
        Sì: il simulatore importa i quesiti dalla{" "}
        <strong>banca dati ufficiale OCF</strong>. Vengono mantenuti categoria,
        peso (1 o 2 punti) e flag teorica/pratica originali; le opzioni A-D
        vengono <strong>mescolate</strong> a ogni sessione per evitare
        memorizzazione meccanica.
      </p>
    ),
  },
  {
    q: "L'app salva i miei dati su un server?",
    aText:
      "No. Tutto resta sul tuo dispositivo tramite localStorage del browser. Non c'è registrazione, non c'è account, non c'è invio di dati a un backend, non ci sono analytics. Cancellando i dati del browser cancelli anche storico ed errori.",
    aNode: (
      <p>
        <strong>No.</strong> Tutto resta sul tuo dispositivo (
        <code className="rounded bg-[var(--bg-paper)] px-1">localStorage</code>
        ): nessun account, nessun backend, nessun analytics. Cancellando i dati
        del browser cancelli storico ed errori.
      </p>
    ),
  },
  {
    q: "L'esame OCF è in italiano? Posso farlo in inglese?",
    aText:
      "L'esame OCF si svolge in lingua italiana. Anche la banca dati ufficiale e il regolamento sono pubblicati esclusivamente in italiano.",
    aNode: (
      <p>
        L'esame si svolge in <strong>italiano</strong>; banca dati e regolamento
        sono pubblicati solo in italiano.
      </p>
    ),
  },
];

export default function FaqPage() {
  const seo = getPageSeo("faq-esame-ocf")!;

  useDocumentMeta({
    slug: seo.slug,
    title: seo.title,
    description: seo.description,
    keywords: seo.keywords,
    jsonLd: [
      {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: FAQ.map((item) => ({
          "@type": "Question",
          name: item.q,
          acceptedAnswer: {
            "@type": "Answer",
            text: item.aText,
          },
        })),
      },
      breadcrumbJsonLd(seo.slug, "FAQ esame OCF"),
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
            FAQ esame OCF
          </li>
        </ol>
      </nav>

      <header>
        <p className="eyebrow">Domande frequenti</p>
        <h1 className="display-1 mt-4">Risposte rapide sull'esame OCF.</h1>
        <p className="mt-6 max-w-prose text-lg leading-relaxed text-ink-soft">
          Le domande più comuni: struttura, durata, soglia, costo, materie,
          modalità di preparazione. Per una panoramica completa parti dalla{" "}
          <Link
            to="/guida-esame-ocf"
            className="text-accent underline underline-offset-4"
          >
            guida all'esame OCF
          </Link>
          .
        </p>
      </header>

      <section className="border-y border-line" aria-labelledby="faq-list">
        <h2 id="faq-list" className="sr-only">
          Elenco FAQ
        </h2>
        <ul className="divide-y divide-line-soft">
          {FAQ.map((item, idx) => (
            <FaqItem
              key={item.q}
              question={item.q}
              answer={item.aNode}
              defaultOpen={idx === 0}
            />
          ))}
        </ul>
      </section>

      <section className="card flex flex-col gap-3 border-ink bg-[var(--bg-paper)]">
        <p className="eyebrow">Manca qualcosa?</p>
        <h2 className="font-display text-2xl font-medium leading-tight text-ink">
          Hai un'altra domanda?
        </h2>
        <p className="text-ink-soft">
          OCF Quiz è un progetto open source: puoi suggerire nuove FAQ o
          contribuire al codice direttamente su GitHub.
        </p>
        <div className="mt-2 flex flex-wrap gap-2">
          <a
            href="https://github.com/gabrielepetteno/ocf-quiz-app/issues"
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-primary"
          >
            Apri una issue su GitHub
            <span aria-hidden="true">↗</span>
          </a>
          <Link to="/exam" className="btn btn-secondary">
            Inizia subito la simulazione
          </Link>
        </div>
      </section>
    </article>
  );
}

function FaqItem({
  question,
  answer,
  defaultOpen,
}: {
  question: string;
  answer: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(!!defaultOpen);
  return (
    <li>
      <details
        className="group cursor-pointer marker:hidden"
        open={open}
        onToggle={(e) => setOpen((e.target as HTMLDetailsElement).open)}
      >
        <summary className="flex items-center justify-between gap-4 py-5 text-left outline-none">
          <span className="font-display text-lg font-semibold leading-snug text-ink md:text-xl">
            {question}
          </span>
          <span
            aria-hidden="true"
            className={`ml-2 shrink-0 text-2xl font-light leading-none text-ink transition-transform duration-300 ease-out ${
              open ? "rotate-45" : ""
            }`}
          >
            +
          </span>
        </summary>
        <div className="prose-editorial pb-6 pl-0 text-ink-soft md:pl-12">
          {answer}
        </div>
      </details>
    </li>
  );
}

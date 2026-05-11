/**
 * Layout principale con header sticky, navigazione e footer SEO-friendly.
 * Usato come wrapper di ogni route in App.tsx.
 */
import { NavLink, Outlet, Link } from "react-router-dom";

/** Voci nel menu principale: solo quelle "app". Le pagine di contenuto stanno nel footer. */
const NAV = [
  { to: "/", label: "Home", end: true },
  { to: "/exam", label: "Simulazione" },
  { to: "/practice", label: "Pratica" },
  { to: "/errors", label: "Errori" },
  { to: "/history", label: "Storico" },
];

const SEO_LINKS = [
  { to: "/guida-esame-ocf", label: "Guida esame OCF" },
  { to: "/materie-esame-ocf", label: "Materie esame OCF" },
  { to: "/faq-esame-ocf", label: "FAQ esame OCF" },
];

export default function Layout() {
  return (
    <div className="flex min-h-full flex-col">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-2 focus:top-2 focus:z-50 focus:rounded focus:bg-brand-700 focus:px-3 focus:py-2 focus:text-white"
      >
        Salta al contenuto
      </a>

      <header
        role="banner"
        className="sticky top-0 z-30 border-b border-slate-200 bg-white/85 backdrop-blur"
      >
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          <NavLink
            to="/"
            className="flex items-center gap-2"
            aria-label="OCF Quiz — home"
          >
            <span
              aria-hidden="true"
              className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600 font-bold text-white"
            >
              Q
            </span>
            <span className="font-semibold text-slate-900">OCF Quiz</span>
          </NavLink>

          <nav
            aria-label="Navigazione principale"
            className="flex items-center gap-1 text-sm"
          >
            {NAV.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `rounded-lg px-3 py-1.5 transition-colors ${
                    isActive
                      ? "bg-brand-100 text-brand-800"
                      : "text-slate-600 hover:bg-slate-100"
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
        </div>
      </header>

      <main id="main" className="flex-1" role="main">
        <div className="mx-auto max-w-5xl px-4 py-6 md:py-10">
          <Outlet />
        </div>
      </main>

      <footer
        role="contentinfo"
        className="mt-auto border-t border-slate-200 bg-white"
      >
        <div className="mx-auto grid max-w-5xl gap-6 px-4 py-8 md:grid-cols-3">
          <section>
            <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
              Il simulatore
            </h2>
            <ul className="mt-2 space-y-1 text-sm text-slate-700">
              <li>
                <Link to="/exam" className="hover:underline">
                  Simulazione esame OCF (60 domande / 85 minuti)
                </Link>
              </li>
              <li>
                <Link to="/practice" className="hover:underline">
                  Pratica per categoria
                </Link>
              </li>
              <li>
                <Link to="/errors" className="hover:underline">
                  Ripasso errori
                </Link>
              </li>
              <li>
                <Link to="/history" className="hover:underline">
                  Storico e statistiche
                </Link>
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
              Risorse esame OCF
            </h2>
            <ul className="mt-2 space-y-1 text-sm text-slate-700">
              {SEO_LINKS.map((l) => (
                <li key={l.to}>
                  <Link to={l.to} className="hover:underline">
                    {l.label}
                  </Link>
                </li>
              ))}
              <li>
                <a
                  href="https://www.organismocf.it/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:underline"
                >
                  Sito ufficiale OCF ↗
                </a>
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
              Progetto
            </h2>
            <ul className="mt-2 space-y-1 text-sm text-slate-700">
              <li>
                <a
                  href="https://github.com/gabrielepetteno/ocf-quiz-app"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:underline"
                >
                  Codice sorgente su GitHub ↗
                </a>
              </li>
              <li>
                <a
                  href="https://github.com/gabrielepetteno/ocf-quiz-app/issues"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:underline"
                >
                  Segnala un problema ↗
                </a>
              </li>
              <li>
                <a
                  href="https://github.com/gabrielepetteno/ocf-quiz-app/blob/main/LICENSE"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:underline"
                >
                  Licenza MIT
                </a>
              </li>
            </ul>
          </section>
        </div>

        <div className="border-t border-slate-200 py-4 text-center text-xs text-slate-500">
          <p>
            OCF Quiz · open source ·{" "}
            <a
              href="https://github.com/gabrielepetteno/ocf-quiz-app"
              className="underline hover:text-slate-700"
              target="_blank"
              rel="noopener noreferrer"
            >
              github.com/gabrielepetteno/ocf-quiz-app
            </a>
          </p>
          <p className="mt-1 px-4">
            Le domande appartengono a OCF — Organismo di vigilanza e tenuta
            dell'Albo unico dei Consulenti Finanziari. Questo è un progetto
            didattico gratuito senza affiliazione ufficiale.
          </p>
        </div>
      </footer>
    </div>
  );
}

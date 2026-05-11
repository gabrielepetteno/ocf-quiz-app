/**
 * Layout principale.
 *
 * Editorial Swiss-minimalism shell: hairline navigation, numbered footer
 * sections, ink-only typography. Wraps every route in App.tsx.
 */
import { NavLink, Outlet, Link, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";

const NAV = [
  { to: "/", label: "Home", end: true },
  { to: "/exam", label: "Simulazione" },
  { to: "/practice", label: "Pratica" },
  { to: "/errors", label: "Errori" },
  { to: "/history", label: "Storico" },
];

const SEO_LINKS = [
  { to: "/guida-esame-ocf", label: "Guida esame OCF" },
  { to: "/materie-esame-ocf", label: "Le 5 materie" },
  { to: "/faq-esame-ocf", label: "FAQ esame OCF" },
];

export default function Layout() {
  const [navOpen, setNavOpen] = useState(false);
  const location = useLocation();

  // Chiudi il menu mobile a ogni cambio rotta
  useEffect(() => {
    setNavOpen(false);
  }, [location.pathname]);

  const year = new Date().getFullYear();

  return (
    <div className="flex min-h-full flex-col">
      <a href="#main" className="skip-link">
        Salta al contenuto principale
      </a>

      {/* ── HEADER ──────────────────────────────────────────────────── */}
      <header
        role="banner"
        className="sticky top-0 z-30 border-b border-ink bg-[var(--bg)]/95 backdrop-blur"
      >
        <div className="container-editorial flex items-center justify-between py-4">
          <NavLink
            to="/"
            className="group flex items-center gap-2.5"
            aria-label="OCF Quiz — torna alla home"
          >
            <span
              aria-hidden="true"
              className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-ink text-[var(--bg)]"
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 14 14"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="square"
              >
                <rect x="2" y="2" width="10" height="10" />
                <path d="M5 7h4M7 5v4" />
              </svg>
            </span>
            <span className="font-display text-base font-semibold tracking-tight text-ink">
              OCF<span className="text-accent">.</span>Quiz
            </span>
          </NavLink>

          <nav
            aria-label="Navigazione principale"
            className="hidden items-center gap-1 text-sm md:flex"
          >
            {NAV.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  [
                    "relative px-3 py-2 font-medium transition-colors",
                    isActive ? "text-accent" : "text-ink-soft hover:text-ink",
                  ].join(" ")
                }
              >
                {({ isActive }) => (
                  <>
                    {item.label}
                    {isActive && (
                      <span
                        aria-hidden="true"
                        className="absolute inset-x-3 -bottom-px h-px bg-accent"
                      />
                    )}
                  </>
                )}
              </NavLink>
            ))}
          </nav>

          <button
            type="button"
            className="btn btn-secondary md:hidden"
            aria-label={
              navOpen
                ? "Chiudi menu di navigazione"
                : "Apri menu di navigazione"
            }
            aria-expanded={navOpen}
            aria-controls="mobile-nav"
            onClick={() => setNavOpen((v) => !v)}
          >
            <span aria-hidden="true">{navOpen ? "✕" : "☰"}</span>
          </button>
        </div>

        {/* Mobile drawer */}
        {navOpen && (
          <div
            id="mobile-nav"
            className="border-t border-line-soft bg-[var(--bg)] md:hidden"
          >
            <nav
              aria-label="Navigazione mobile"
              className="container-editorial flex flex-col py-2"
            >
              {NAV.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  className={({ isActive }) =>
                    [
                      "flex items-center justify-between gap-3 border-b border-line-soft py-3 text-base font-medium last:border-0",
                      isActive ? "text-accent" : "text-ink-soft hover:text-ink",
                    ].join(" ")
                  }
                >
                  <span>{item.label}</span>
                  <span aria-hidden="true" className="text-muted">
                    →
                  </span>
                </NavLink>
              ))}
            </nav>
          </div>
        )}
      </header>

      {/* ── MAIN ────────────────────────────────────────────────────── */}
      <main id="main" role="main" className="flex-1">
        <div className="container-editorial py-10 md:py-16">
          <Outlet />
        </div>
      </main>

      {/* ── FOOTER ──────────────────────────────────────────────────── */}
      <footer
        role="contentinfo"
        className="mt-auto border-t border-ink bg-[var(--bg-paper)]"
      >
        <div className="container-editorial grid gap-10 py-12 md:grid-cols-12">
          <section className="md:col-span-5">
            <p className="eyebrow">OCF Quiz</p>
            <p className="font-display mt-3 text-2xl leading-tight text-ink">
              Simulatore gratuito e open source dell'esame di Stato per
              l'iscrizione all'Albo dei Consulenti Finanziari.
            </p>
            <p className="mt-3 max-w-prose text-sm text-muted">
              Nessuna registrazione, nessun tracciamento. I tuoi progressi
              restano nel browser. Le domande appartengono a OCF — progetto
              didattico senza affiliazione ufficiale.
            </p>
          </section>

          <section className="md:col-span-3">
            <p className="eyebrow">Studia</p>
            <ul className="mt-3 space-y-2 text-sm text-ink-soft">
              <li>
                <Link to="/exam" className="hover:text-accent">
                  Simulazione esame ↗
                </Link>
              </li>
              <li>
                <Link to="/practice" className="hover:text-accent">
                  Pratica per categoria
                </Link>
              </li>
              <li>
                <Link to="/errors" className="hover:text-accent">
                  Ripasso errori
                </Link>
              </li>
              <li>
                <Link to="/history" className="hover:text-accent">
                  Storico sessioni
                </Link>
              </li>
            </ul>
          </section>

          <section className="md:col-span-2">
            <p className="eyebrow">Risorse</p>
            <ul className="mt-3 space-y-2 text-sm text-ink-soft">
              {SEO_LINKS.map((l) => (
                <li key={l.to}>
                  <Link to={l.to} className="hover:text-accent">
                    {l.label}
                  </Link>
                </li>
              ))}
              <li>
                <a
                  href="https://www.organismocf.it/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-accent"
                >
                  Sito ufficiale OCF ↗
                </a>
              </li>
            </ul>
          </section>

          <section className="md:col-span-2">
            <p className="eyebrow">Progetto</p>
            <ul className="mt-3 space-y-2 text-sm text-ink-soft">
              <li>
                <a
                  href="https://github.com/gabrielepetteno/ocf-quiz-app"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-accent"
                >
                  Codice su GitHub ↗
                </a>
              </li>
              <li>
                <a
                  href="https://github.com/gabrielepetteno/ocf-quiz-app/issues"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-accent"
                >
                  Segnala problema ↗
                </a>
              </li>
              <li>
                <a
                  href="https://github.com/gabrielepetteno/ocf-quiz-app/blob/main/LICENSE"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-accent"
                >
                  Licenza MIT
                </a>
              </li>
            </ul>
          </section>
        </div>

        <div className="border-t border-line-paper">
          <div className="container-editorial flex flex-col items-start justify-between gap-3 py-5 text-xs text-muted md:flex-row md:items-center">
            <p className="flex flex-wrap items-center gap-x-2 gap-y-1">
              <span>Ideato da</span>
              <span className="font-medium text-ink">Cristian Arnini</span>
              <span aria-hidden="true">·</span>
              <span>Sviluppato da</span>
              <a
                href="https://www.linkedin.com/in/gabrielepetteno/"
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-ink hover:text-accent"
              >
                Gabriele Pettenò ↗
              </a>
            </p>
            <p className="mono uppercase tracking-eyebrow">
              © {year} · OCF Quiz · Open source · v0.1.0
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

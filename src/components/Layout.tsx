/**
 * Layout principale con header sticky e navigazione tra le pagine.
 * Usato come wrapper di ogni route in App.tsx.
 */
import { NavLink, Outlet } from "react-router-dom";

const NAV = [
  { to: "/", label: "Home", end: true },
  { to: "/exam", label: "Simulazione" },
  { to: "/practice", label: "Pratica" },
  { to: "/errors", label: "Errori" },
  { to: "/history", label: "Storico" },
];

export default function Layout() {
  return (
    <div className="flex min-h-full flex-col">
      <header className="sticky top-0 z-30 bg-white/85 backdrop-blur border-b border-slate-200">
        <div className="mx-auto max-w-5xl px-4 py-3 flex items-center justify-between">
          <NavLink to="/" className="flex items-center gap-2">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600 text-white font-bold">
              Q
            </span>
            <span className="font-semibold text-slate-900">OCF Quiz</span>
          </NavLink>

          <nav className="flex items-center gap-1 text-sm">
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

      <main className="flex-1">
        <div className="mx-auto max-w-5xl px-4 py-6 md:py-10">
          <Outlet />
        </div>
      </main>

      <footer className="mt-auto border-t border-slate-200 py-6 text-center text-xs text-slate-500">
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
        <p className="mt-1">
          Le domande appartengono a OCF — Organismo di vigilanza e tenuta
          dell'albo unico dei Consulenti Finanziari. Questo è un progetto
          didattico gratuito senza affiliazione ufficiale.
        </p>
      </footer>
    </div>
  );
}

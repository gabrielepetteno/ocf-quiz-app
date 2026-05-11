/**
 * Entry point dell'app.
 *
 * Monta React in #root e attiva il routing tramite BrowserRouter.
 *
 * Perché BrowserRouter (e non HashRouter)?
 * - Gli URL puliti sono fondamentali per la SEO: i motori di ricerca
 *   trattano i path dopo "#" come la stessa pagina, quindi con HashRouter
 *   nessuna sotto-pagina viene indicizzata distintamente.
 * - GitHub Pages è un hosting statico privo di rewrite, quindi un refresh
 *   su /exam darebbe 404. Aggiriamo il problema con la "SPA-trick":
 *     1) `public/404.html` salva il path corrente in una query string e
 *        rimanda a "/" del sub-path;
 *     2) lo snippet inline in `index.html` ripristina il path originale
 *        prima che React monti, così il router vede l'URL corretto.
 * - `basename` rispecchia il `base` configurato in vite.config.ts:
 *   in dev "/", in produzione "/ocf-quiz-app" (su GitHub Pages).
 */
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";

import App from "./App";
import "./index.css";

// `import.meta.env.BASE_URL` finisce con "/" — react-router vuole un
// basename SENZA trailing slash (o solo "/").
const rawBase = import.meta.env.BASE_URL ?? "/";
const basename = rawBase === "/" ? "/" : rawBase.replace(/\/$/, "");

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter basename={basename}>
      <App />
    </BrowserRouter>
  </React.StrictMode>,
);

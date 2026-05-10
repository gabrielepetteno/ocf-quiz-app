/**
 * Entry point dell'app.
 *
 * Monta React in #root e attiva il routing tramite HashRouter.
 *
 * Perché HashRouter e non BrowserRouter?
 * L'app viene deployata su GitHub Pages, che è un hosting statico privo
 * di rewrite. Con BrowserRouter un refresh su /exam darebbe 404 perché
 * il server cercherebbe un file fisico in quella path. HashRouter usa
 * gli URL del tipo "/#/exam": tutto resta lato client e ogni reload
 * funziona ovunque (inclusi GitHub Pages, Netlify, Vercel, hosting
 * statici "naïve" come S3/Cloudflare R2).
 */
import React from "react";
import ReactDOM from "react-dom/client";
import { HashRouter } from "react-router-dom";

import App from "./App";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <HashRouter>
      <App />
    </HashRouter>
  </React.StrictMode>,
);

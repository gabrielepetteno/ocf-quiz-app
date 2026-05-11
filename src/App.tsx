/**
 * App con routing.
 * Tutte le pagine condividono il componente <Layout/>.
 *
 * Le pagine "SEO content" (guida, FAQ, materie) servono a coprire le query
 * informative degli utenti e si appoggiano allo stesso layout: questo crea
 * una struttura a hub-and-spoke che aiuta i motori di ricerca a capire il
 * tema centrale del sito (esame OCF / consulenti finanziari).
 */
import { lazy, Suspense } from "react";
import { Route, Routes } from "react-router-dom";

import Layout from "./components/Layout";
import ScrollToTop from "./components/ScrollToTop";

import HomePage from "./pages/HomePage";
import ExamPage from "./pages/ExamPage";
import PracticePage from "./pages/PracticePage";
import PracticeRunPage from "./pages/PracticeRunPage";
import ErrorsPage from "./pages/ErrorsPage";
import ErrorsRunPage from "./pages/ErrorsRunPage";
import HistoryPage from "./pages/HistoryPage";
import NotFoundPage from "./pages/NotFoundPage";

// Pagine di contenuto SEO: lazy-loaded perché sono per lo più statiche e
// non vengono visitate ad ogni sessione.
const GuidaPage = lazy(() => import("./pages/GuidaPage"));
const FaqPage = lazy(() => import("./pages/FaqPage"));
const MateriePage = lazy(() => import("./pages/MateriePage"));

export default function App() {
  return (
    <>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="exam" element={<ExamPage />} />
          <Route path="practice" element={<PracticePage />} />
          <Route path="practice/:category" element={<PracticeRunPage />} />
          <Route path="errors" element={<ErrorsPage />} />
          <Route path="errors/run" element={<ErrorsRunPage />} />
          <Route path="history" element={<HistoryPage />} />
          <Route
            path="guida-esame-ocf"
            element={
              <Suspense fallback={<PageFallback />}>
                <GuidaPage />
              </Suspense>
            }
          />
          <Route
            path="faq-esame-ocf"
            element={
              <Suspense fallback={<PageFallback />}>
                <FaqPage />
              </Suspense>
            }
          />
          <Route
            path="materie-esame-ocf"
            element={
              <Suspense fallback={<PageFallback />}>
                <MateriePage />
              </Suspense>
            }
          />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </>
  );
}

function PageFallback() {
  return (
    <div className="py-16 text-center" aria-busy="true">
      <p className="mono text-xs uppercase tracking-eyebrow text-muted">
        Caricamento…
      </p>
    </div>
  );
}

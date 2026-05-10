/**
 * App con routing.
 * Tutte le pagine condividono il componente <Layout/>.
 */
import { Route, Routes } from "react-router-dom";
import Layout from "./components/Layout";

import HomePage from "./pages/HomePage";
import ExamPage from "./pages/ExamPage";
import PracticePage from "./pages/PracticePage";
import PracticeRunPage from "./pages/PracticeRunPage";
import ErrorsPage from "./pages/ErrorsPage";
import ErrorsRunPage from "./pages/ErrorsRunPage";
import HistoryPage from "./pages/HistoryPage";
import NotFoundPage from "./pages/NotFoundPage";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route path="exam" element={<ExamPage />} />
        <Route path="practice" element={<PracticePage />} />
        <Route path="practice/:category" element={<PracticeRunPage />} />
        <Route path="errors" element={<ErrorsPage />} />
        <Route path="errors/run" element={<ErrorsRunPage />} />
        <Route path="history" element={<HistoryPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}

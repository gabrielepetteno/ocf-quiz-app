import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "node:path";

/**
 * Configurazione Vite.
 *
 * In dev (`npm run dev`) `base` resta "/" per avere URL puliti su localhost.
 * In build di produzione (`npm run build`) `base` diventa "/ocf-quiz-app/"
 * perché l'app viene servita da GitHub Pages sotto quel sub-path
 * (https://gabrielepetteno.github.io/ocf-quiz-app/).
 *
 * Volendo deployare altrove con sub-path diverso, basta esportare
 * la variabile d'ambiente VITE_BASE_PATH.
 */
export default defineConfig(({ command }) => {
  const baseFromEnv = process.env.VITE_BASE_PATH;
  const isProd = command === "build";
  const base = baseFromEnv ?? (isProd ? "/ocf-quiz-app/" : "/");

  return {
    base,
    plugins: [react()],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    server: {
      port: 5173,
      open: true,
    },
  };
});

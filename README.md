# OCF Quiz · Simulatore esame Consulenti Finanziari

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
![Stato](https://img.shields.io/badge/stato-beta-orange.svg)
![Stack](https://img.shields.io/badge/stack-React%20%2B%20Vite%20%2B%20TypeScript%20%2B%20Tailwind-1d4ed8.svg)
[![Deploy](https://github.com/gabrielepetteno/ocf-quiz-app/actions/workflows/deploy.yml/badge.svg)](https://github.com/gabrielepetteno/ocf-quiz-app/actions/workflows/deploy.yml)

> 🌐 **Provala subito:** <https://gabrielepetteno.github.io/ocf-quiz-app/>
> Hosting gratuito su GitHub Pages, nessuna installazione, nessuna registrazione.

Simulatore **gratuito e open source** dell'esame OCF per l'iscrizione all'**Albo unico dei Consulenti Finanziari**.
60 domande in 85 minuti con la stessa proporzione dell'esame ufficiale, **oltre 4.900 quesiti** importati dal materiale OCF, statistiche personali, ripasso mirato degli errori. **Nessun account, nessun server, nessun tracciamento.**

> ℹ️ I tuoi progressi vengono salvati esclusivamente nel browser (`localStorage`). Le domande appartengono a OCF e sono incluse a fini di studio.

---

## ✨ Cosa fa l'app

- **🎯 Simulazione esame OCF** — 60 domande in 85 minuti, distribuite **24 / 19 / 6 / 6 / 5** come da regolamento ufficiale, soglia di superamento **80/100**.
- **📚 Pratica per categoria** — scegli macro-categoria, numero di domande (10/20/30/50/tutte) e timer opzionale.
- **🔁 Ripasso errori** — ogni domanda sbagliata finisce in un registro personale; quando rispondi correttamente più volte l'app la marca come _risolta_.
- **📊 Storico e statistiche** — andamento punteggio nel tempo, tasso di successo, performance per categoria, evidenziazione dei punti deboli.
- **♿ UX moderna** — UI responsive, mappa di overview delle domande, "segna da rivedere", barra di avanzamento, conferma prima della consegna.

---

## 📦 Struttura del progetto

```
ocf-quiz-app/
├── public/
│   ├── data/
│   │   └── questions.json         # dataset generato dai PDF (input dell'app)
│   └── favicon.svg
├── scripts/
│   ├── parse_pdfs.py              # estrae le domande dai PDF OCF
│   └── merge_answers.py           # opzionale: applica una chiave di risposta esterna
├── src/
│   ├── components/
│   │   ├── Layout.tsx             # header + footer + navigation
│   │   ├── QuizPlayer.tsx         # player del quiz (selezione, mappa, timer)
│   │   ├── ResultSummary.tsx      # esito + review domande sbagliate
│   │   ├── Timer.tsx
│   │   └── Progress.tsx
│   ├── lib/
│   │   ├── config.ts              # configurazione centrale (60 dom, 85 min, 80/100, distribuzione)
│   │   ├── types.ts               # tipi condivisi
│   │   ├── questions.ts           # caricamento e accesso al dataset
│   │   ├── examGenerator.ts       # composizione 24/19/6/6/5
│   │   ├── scoring.ts             # punteggio normalizzato + per-categoria
│   │   ├── stats.ts               # statistiche aggregate
│   │   ├── storage.ts             # persistenza in localStorage
│   │   ├── shuffle.ts             # mescolamento Fisher-Yates
│   │   ├── format.ts              # helper di formattazione
│   │   └── utils.ts
│   ├── pages/
│   │   ├── HomePage.tsx           # spiegazione app + dashboard utente
│   │   ├── ExamPage.tsx           # simulazione 60 dom / 85 min
│   │   ├── PracticePage.tsx       # selezione pratica
│   │   ├── PracticeRunPage.tsx
│   │   ├── ErrorsPage.tsx         # registro errori con filtri
│   │   ├── ErrorsRunPage.tsx
│   │   ├── HistoryPage.tsx        # storico + grafico
│   │   └── NotFoundPage.tsx
│   ├── App.tsx                    # routing
│   ├── main.tsx
│   └── index.css                  # Tailwind + utility @layer
├── index.html
├── tailwind.config.js
├── postcss.config.js
├── vite.config.ts
├── tsconfig.json
├── package.json
├── LICENSE                        # MIT
└── README.md
```

---

## 🚀 Avvio rapido

### 1. Prerequisiti

- **Node.js ≥ 18** (testato su Node 25)
- **Python 3** + **poppler** (per il parser dei PDF)

```bash
# macOS
brew install node python poppler
```

### 2. Installa le dipendenze

```bash
cd ocf-quiz-app
npm install
```

### 3. Importa il dataset domande

Lo script Python legge i PDF dalla cartella sorgente (default: `../pdfs-ocf`, cioè la sotto-cartella sorella `pdfs-ocf/` del workspace) e produce `public/data/questions.json`:

```bash
npm run import-data
# oppure direttamente
python3 scripts/parse_pdfs.py \
    --src "/percorso/alla/cartella/con/i/pdf" \
    --out "public/data/questions.json"
```

Lo script si aspetta sotto-cartelle nominate come le 5 macro-categorie OCF — riconosce le varianti maiuscole/minuscole e i piccoli typo. Per ogni PDF estrae numero domanda, testo, opzioni A–D, livello (peso 1 o 2 punti), sotto-contenuto e flag _teorica/pratica_.

> 🗝️ **Convenzione risposte corrette.** Nei PDF OCF forniti, la risposta corretta è **sempre** la lettera _A_. L'app **mescola** le opzioni in fase di rendering, mantenendo internamente l'ID della risposta giusta. Per cambiare convenzione (per es. usare un dataset con risposte randomizzate) usa `scripts/merge_answers.py` con una chiave esterna in formato JSON o CSV — vedi le istruzioni in testa allo script.

### 4. Avvia il server di sviluppo

```bash
npm run dev
```

L'app si apre su **<http://localhost:5173>**. Hot reload attivo.

### 5. Build di produzione

```bash
npm run build      # crea dist/
npm run preview    # serve dist/ in locale per testarlo
```

I file in `dist/` sono completamente statici → puoi deployarli su qualunque hosting statico (GitHub Pages, Netlify, Vercel, Cloudflare Pages, S3…).

---

## ⚙️ Configurazione

Tutta la business logic è regolabile da [`src/lib/config.ts`](src/lib/config.ts):

| Parametro                 | Default                   | Significato                                             |
| ------------------------- | ------------------------- | ------------------------------------------------------- |
| `EXAM_DURATION_MIN`       | `85`                      | Minuti totali della simulazione                         |
| `EXAM_TOTAL_QUESTIONS`    | `60`                      | Numero domande della simulazione                        |
| `EXAM_MAX_SCORE`          | `100`                     | Punteggio massimo nominale                              |
| `EXAM_PASS_THRESHOLD`     | `80`                      | Soglia di superamento (su 100)                          |
| `EXAM_DISTRIBUTION`       | `{ 24, 19, 6, 6, 5 }`     | Domande per macro-categoria                             |
| `ERROR_RESOLVE_THRESHOLD` | `2`                       | Risposte corrette consecutive per "risolvere" un errore |
| `HISTORY_LIMIT`           | `200`                     | Sessioni massime conservate in `localStorage`           |
| `PRACTICE_SIZE_OPTIONS`   | `[10, 20, 30, 50, "all"]` | Scelte per dimensione pratica                           |

Il sistema di punteggio **rispetta i pesi originali** (campo `points` 1 o 2 della singola domanda) e poi normalizza a 0–100 per applicare la soglia in modo coerente sia in simulazione che in pratica.

---

## 📂 Schema della singola domanda

```jsonc
{
  "id": "diritt-9be6bd2b6c", // hash deterministico
  "category": "diritto_privato_commerciale", // 1 di 5 chiavi canoniche
  "topic": "Beni e diritti reali nozione e disciplina",
  "subcategory": "Diritto di abitazione",
  "numInFile": 1,
  "question": "Il contratto che costituisce il diritto di abitazione:",
  "answers": [
    { "id": "A", "text": "deve sempre avere forma scritta" },
    { "id": "B", "text": "non può essere stipulato a favore di parenti…" },
    { "id": "C", "text": "non può avere durata superiore a un anno" },
    { "id": "D", "text": "può anche non richiedere la forma scritta" },
  ],
  "correctAnswer": "A", // ID originale (l'UI mescola la posizione)
  "explanation": "",
  "points": 2, // 1 o 2 punti
  "type": "teorica", // teorica | pratica
  "source": "Beni e diritti reali nozione e disciplina.pdf",
}
```

---

## 🛣️ Roadmap / TODO

- [ ] Spiegazioni testuali per ogni domanda (campo `explanation`)
- [ ] Modalità "lista" (tutte le 60 in una pagina con scroll, alternativa a "una alla volta")
- [ ] Sync opzionale via Supabase per usare l'app su più dispositivi
- [ ] Export PDF/CSV dei risultati
- [ ] Lingua inglese (i18n)
- [ ] Suono/notifica alla fine del timer
- [ ] PWA installabile + uso offline
- [ ] Dark mode

Pull request benvenute! 💙

---

## 📜 Licenza

[MIT](LICENSE) · le domande sono di OCF, vedi nota nella licenza.

---

## 🙏 Crediti

Costruito con [React](https://react.dev), [Vite](https://vitejs.dev), [TypeScript](https://www.typescriptlang.org/) e [Tailwind CSS](https://tailwindcss.com/). Parser dei PDF in Python con [poppler](https://poppler.freedesktop.org/).

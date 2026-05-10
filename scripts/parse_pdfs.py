#!/usr/bin/env python3
"""
Estrae le domande dei quiz OCF dai PDF della cartella sorgente
e produce un singolo file JSON normalizzato.

Uso:
    python3 parse_pdfs.py \
        --src "/Users/gabrielepetteno/Desktop/AppCris" \
        --out "../public/data/questions.json"

Richiede:
    - poppler installato (fornisce `pdftotext`):
      brew install poppler
"""

from __future__ import annotations

import argparse
import hashlib
import json
import re
import shutil
import subprocess
import sys
from pathlib import Path

# Mappa nome cartella -> categoria canonica usata nell'app.
# I nomi cartella possono variare per maiuscole/minuscole o piccoli typo
# (es. "dirizzo"); confrontiamo in lowercase con substring.
CATEGORY_MAP = [
    ("diritto del mercato finanziario", "diritto_mercato_intermediari"),
    ("matematica finanziaria", "matematica_economia_finanziaria"),
    ("diritto tributario", "diritto_tributario"),
    ("previdenziale", "diritto_previdenziale_assicurativo"),
    ("diritto privato", "diritto_privato_commerciale"),
]

CATEGORY_LABELS = {
    "diritto_mercato_intermediari": "Diritto del mercato finanziario, intermediari e disciplina del consulente",
    "matematica_economia_finanziaria": "Matematica finanziaria, economia, pianificazione e finanza comportamentale",
    "diritto_tributario": "Diritto tributario del mercato finanziario",
    "diritto_previdenziale_assicurativo": "Diritto previdenziale e assicurativo",
    "diritto_privato_commerciale": "Diritto privato e commerciale",
}

# Regex per i blocchi domanda nell'output di `pdftotext -layout`.
# Una riga di intestazione domanda: "  N    testo..." dove N è 1+ cifre,
# seguita da almeno 2 spazi.
RE_QUESTION_START = re.compile(r"^(?P<num>\d+)\s{2,}(?P<text>.+)$")
RE_ANSWER = re.compile(r"^\s*(?P<id>[A-D]):\s+(?P<text>.+)$")
RE_LIVELLO = re.compile(r"^\s*Livello:\s*(?P<lvl>\d+)\s*$")
RE_SUBCONT = re.compile(r"^\s*Sub-contenuto:\s*(?P<sub>.+)$")
RE_PRATICO = re.compile(r"^\s*Pratico:\s*(?P<pr>SI|NO|Sì|Si)\s*$", re.IGNORECASE)
RE_HEADER_SKIP = re.compile(
    r"^\s*(Materia:|Contenuto:|Pag\.|Copyright|\f)", re.IGNORECASE
)


def slugify_category(folder_name: str) -> str:
    """Restituisce la chiave canonica della categoria per un nome cartella."""
    n = folder_name.lower()
    for needle, key in CATEGORY_MAP:
        if needle in n:
            return key
    raise ValueError(f"Categoria non riconosciuta per la cartella: {folder_name}")


def run_pdftotext(pdf: Path) -> str:
    """Esegue `pdftotext -layout` e ritorna il testo estratto."""
    if shutil.which("pdftotext") is None:
        sys.exit(
            "ERRORE: pdftotext non trovato. Installa poppler (brew install poppler)."
        )
    out = subprocess.run(
        ["pdftotext", "-layout", "-enc", "UTF-8", str(pdf), "-"],
        capture_output=True,
        text=True,
        check=False,
    )
    if out.returncode != 0:
        print(f"  ! pdftotext fallito su {pdf}: {out.stderr.strip()}", file=sys.stderr)
        return ""
    return out.stdout


def make_id(category: str, topic: str, num_in_file: int, q_text: str) -> str:
    """ID stabile e deterministico: hash breve di (categoria, topic, num, testo)."""
    raw = f"{category}|{topic}|{num_in_file}|{q_text}"
    h = hashlib.sha1(raw.encode("utf-8")).hexdigest()[:10]
    return f"{category[:6]}-{h}"


def normalize_ws(s: str) -> str:
    return re.sub(r"\s+", " ", s).strip()


def parse_pdf(pdf_path: Path, category_key: str, topic: str) -> list[dict]:
    """
    Parsa un singolo PDF e restituisce la lista delle domande estratte.
    Ogni domanda è un dict che segue lo schema concordato.
    """
    text = run_pdftotext(pdf_path)
    if not text:
        return []

    raw_lines = text.splitlines()
    # Rimuovi righe header/footer ricorrenti
    lines = [ln for ln in raw_lines if not RE_HEADER_SKIP.match(ln)]

    questions: list[dict] = []
    cur: dict | None = None
    section: str = "before"  # before | question | answer | meta
    cur_answer_id: str | None = None
    seen_in_file: dict[int, int] = {}  # numero domanda nel file -> count

    def flush() -> None:
        nonlocal cur, section, cur_answer_id
        if cur and len(cur["answers"]) == 4:
            cur["question"] = normalize_ws(cur["question"])
            for a in cur["answers"]:
                a["text"] = normalize_ws(a["text"])
            questions.append(cur)
        cur = None
        section = "before"
        cur_answer_id = None

    for line in lines:
        if not line.strip():
            continue

        m_q = RE_QUESTION_START.match(line)
        if m_q:
            num = int(m_q.group("num"))
            # Falsi positivi: "1025", "184", ecc. sono numeri dentro il testo,
            # ma in pdftotext -layout il numero domanda è in colonna 0-12 e poi
            # ci sono 2+ spazi. Ulteriore guardia: numeri ragionevoli (1..9999)
            # e che il numero non si ripeta in modo crescente in modo strano.
            # Per filtrare "1025 del codice civile" lo distinguiamo dal fatto
            # che la riga inizia con il numero in colonna molto bassa (di solito
            # poche colonne, < 6) seguito da molti spazi: condizione già gestita
            # dal regex (\d+\s{2,}). Aggiungiamo guardia: accettiamo solo se la
            # numerazione è strettamente crescente o ricomincia da 1 (nuova pagina).
            text_after = m_q.group("text")
            # Eviiniamo righe come "1025  del codice civile" che però hanno un
            # solo spazio dopo il numero: già escluso da \s{2,}.
            # Inoltre escludiamo righe in cui dopo il numero compare ancora una
            # cifra subito (numerali tabellari).
            if text_after.lstrip()[:2].isdigit():
                # quasi certamente non è una domanda: prosegui come continuazione
                pass
            else:
                # Nuova domanda: chiudi quella precedente
                flush()
                cur = {
                    "id": make_id(category_key, topic, num, text_after),
                    "category": category_key,
                    "topic": topic,
                    "subcategory": "",
                    "numInFile": num,
                    "question": text_after,
                    "answers": [],
                    # Convenzione del materiale OCF fornito: la risposta
                    # corretta nei PDF sorgente è SEMPRE quella alla lettera A.
                    # L'UI mescola le opzioni a runtime; questo campo memorizza
                    # l'ID ORIGINALE della risposta giusta, non la posizione
                    # mostrata all'utente.
                    "correctAnswer": "A",
                    "explanation": "",
                    "points": 1,
                    "type": "teorica",
                    "source": pdf_path.name,
                }
                seen_in_file[num] = seen_in_file.get(num, 0) + 1
                section = "question"
                continue

        m_a = RE_ANSWER.match(line)
        if m_a and cur is not None:
            ans_id = m_a.group("id")
            # Accetta A,B,C,D una sola volta in ordine
            existing = [a["id"] for a in cur["answers"]]
            if ans_id not in existing:
                cur["answers"].append({"id": ans_id, "text": m_a.group("text")})
                cur_answer_id = ans_id
                section = "answer"
                continue

        m_l = RE_LIVELLO.match(line)
        if m_l and cur is not None:
            lvl = int(m_l.group("lvl"))
            cur["points"] = 2 if lvl == 2 else 1
            section = "meta"
            continue

        m_s = RE_SUBCONT.match(line)
        if m_s and cur is not None:
            cur["subcategory"] = normalize_ws(m_s.group("sub"))
            section = "meta"
            continue

        m_p = RE_PRATICO.match(line)
        if m_p and cur is not None:
            pr = m_p.group("pr").upper()
            cur["type"] = "pratica" if pr.startswith("S") else "teorica"
            section = "meta"
            continue

        # Continuazione di testo
        if cur is None:
            continue
        if section == "question":
            cur["question"] += " " + line.strip()
        elif section == "answer" and cur_answer_id is not None:
            # Aggiungi al testo dell'ultima risposta
            for a in cur["answers"]:
                if a["id"] == cur_answer_id:
                    a["text"] += " " + line.strip()
                    break
        # In sezione meta ignoriamo righe extra

    flush()
    return questions


def topic_from_filename(name: str) -> str:
    base = Path(name).stem
    base = base.replace("_", "'").replace("  ", " ")
    return base.strip()


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument(
        "--src",
        required=True,
        help="Cartella radice contenente le sotto-cartelle delle categorie",
    )
    ap.add_argument("--out", required=True, help="File JSON di output")
    args = ap.parse_args()

    src = Path(args.src).expanduser().resolve()
    out = Path(args.out).expanduser().resolve()
    out.parent.mkdir(parents=True, exist_ok=True)

    if not src.is_dir():
        sys.exit(f"Sorgente non trovata: {src}")

    all_questions: list[dict] = []
    per_category_count: dict[str, int] = {k: 0 for k in CATEGORY_LABELS}

    for entry in sorted(src.iterdir()):
        if not entry.is_dir():
            continue
        try:
            cat_key = slugify_category(entry.name)
        except ValueError:
            print(f"  - skip cartella ignota: {entry.name}", file=sys.stderr)
            continue

        print(f"==> Categoria '{entry.name}' -> {cat_key}")
        # glob case-insensitive: i nomi 8.3 (es. LATASS~1.PDF) hanno estensione maiuscola
        pdf_files = sorted(
            list(entry.glob("*.pdf")) + list(entry.glob("*.PDF")),
            key=lambda p: p.name.lower(),
        )
        for pdf in pdf_files:
            topic = topic_from_filename(pdf.name)
            qs = parse_pdf(pdf, cat_key, topic)
            print(f"   - {pdf.name}: {len(qs)} domande")
            all_questions.extend(qs)
            per_category_count[cat_key] += len(qs)

    # Deduplica per testo+categoria (alcuni PDF hanno duplicati interni)
    seen = set()
    deduped = []
    for q in all_questions:
        key = (q["category"], normalize_ws(q["question"]).lower())
        if key in seen:
            continue
        seen.add(key)
        deduped.append(q)

    payload = {
        "version": 1,
        "generatedAt": None,  # riempito a runtime se serve
        "categories": [
            {"key": k, "label": v, "count": per_category_count.get(k, 0)}
            for k, v in CATEGORY_LABELS.items()
        ],
        "totalQuestions": len(deduped),
        "answersAvailable": True,
        "answersConvention": (
            "Nei PDF sorgente la risposta corretta è SEMPRE alla lettera 'A'. "
            "L'app mescola le opzioni a runtime mantenendo traccia di quella corretta."
        ),
        "questions": deduped,
    }

    with out.open("w", encoding="utf-8") as f:
        json.dump(payload, f, ensure_ascii=False, indent=2)

    print()
    print(
        f"OK. Scritte {len(deduped)} domande (su {len(all_questions)} estratte) in {out}"
    )
    for k, lbl in CATEGORY_LABELS.items():
        print(f"  {k:42s} {per_category_count.get(k, 0):>5d}")
    print()
    print(
        "NB: 'correctAnswer' = 'A' per tutte le domande (convenzione del materiale sorgente)."
    )
    print("    L'app mescolerà le opzioni a runtime per nascondere la posizione fissa.")


if __name__ == "__main__":
    main()

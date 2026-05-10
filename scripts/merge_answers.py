#!/usr/bin/env python3
"""
Aggiorna il campo `correctAnswer` delle domande nel file questions.json
unendo una chiave di risposta esterna.

In questo dataset (PDF OCF originali) la convenzione è che la risposta
corretta sia SEMPRE alla lettera "A": il parser parse_pdfs.py la imposta
direttamente. Questo script serve per due scenari futuri:

  1) hai un dataset diverso (es. CSV) dove la risposta corretta varia,
  2) vuoi sovrascrivere la convenzione con dati più precisi.

Formati di chiave supportati:
  - JSON: {"<questionId>": "A|B|C|D", ...}
  - CSV con colonne: id,correctAnswer

Uso:
    python3 merge_answers.py \
        --questions ../public/data/questions.json \
        --key answers.json
"""

from __future__ import annotations

import argparse
import csv
import json
from pathlib import Path


def load_key(path: Path) -> dict[str, str]:
    """Carica la chiave da JSON o CSV in un dict {id: letter}."""
    if path.suffix.lower() == ".json":
        with path.open(encoding="utf-8") as f:
            data = json.load(f)
        if not isinstance(data, dict):
            raise SystemExit("Il JSON di chiave deve essere un oggetto {id: lettera}.")
        return {str(k): str(v).upper() for k, v in data.items()}

    if path.suffix.lower() == ".csv":
        out: dict[str, str] = {}
        with path.open(encoding="utf-8") as f:
            reader = csv.DictReader(f)
            id_field = next(
                (
                    n
                    for n in reader.fieldnames or []
                    if n.lower() in {"id", "questionid"}
                ),
                None,
            )
            ans_field = next(
                (
                    n
                    for n in reader.fieldnames or []
                    if n.lower() in {"answer", "correctanswer", "risposta"}
                ),
                None,
            )
            if not id_field or not ans_field:
                raise SystemExit(
                    "CSV non valido: servono colonne `id` e `correctAnswer` (o varianti)."
                )
            for row in reader:
                out[row[id_field]] = (row[ans_field] or "").strip().upper()
        return out

    raise SystemExit(f"Formato non supportato: {path.suffix}")


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument(
        "--questions", required=True, help="JSON con le domande generato dal parser"
    )
    ap.add_argument("--key", required=True, help="JSON o CSV con la chiave di risposta")
    args = ap.parse_args()

    qpath = Path(args.questions).expanduser().resolve()
    kpath = Path(args.key).expanduser().resolve()

    bundle = json.loads(qpath.read_text(encoding="utf-8"))
    key = load_key(kpath)

    matched = 0
    for q in bundle.get("questions", []):
        ans = key.get(q["id"])
        if ans in {"A", "B", "C", "D"}:
            q["correctAnswer"] = ans
            matched += 1

    bundle["answersAvailable"] = matched > 0
    qpath.write_text(json.dumps(bundle, ensure_ascii=False, indent=2), encoding="utf-8")

    total = len(bundle.get("questions", []))
    print(f"OK. Aggiornate {matched}/{total} risposte in {qpath}")


if __name__ == "__main__":
    main()

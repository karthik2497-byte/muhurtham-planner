"""
make_pdf.py — one PDF per city-year, the thing the email capture delivers.

    ./.venv/bin/python pipeline/make_pdf.py 2027 2028

Writes site/src/assets/pdf/<year>-<city>.pdf, which the build copies into
dist/pdf/. Committed artifacts (ARCHITECTURE): the email provider's links must
not depend on a build having run.

Deliberately plain: this gets printed, stuck on a fridge, and photographed for
a family WhatsApp group. Legibility beats design.
"""

from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

from fpdf import FPDF

ROOT = Path(__file__).resolve().parents[1]
OUT_DIR = ROOT / "site" / "src" / "assets" / "pdf"

PUROHIT = ("These are dates a family would normally consider - confirm the "
           "final date and the muhurtham time with your family purohit.")
INK = (38, 32, 26)
SOFT = (95, 84, 74)
ACCENT = (156, 61, 31)


class Doc(FPDF):
    def __init__(self, city_name: str, year: int):
        super().__init__(orientation="P", unit="mm", format="A4")
        self.city_name = city_name
        self.year = year
        self.set_auto_page_break(auto=True, margin=18)

    def header(self):
        self.set_font("Helvetica", "B", 15)
        self.set_text_color(*ACCENT)
        self.cell(0, 8, f"Muhurtham dates {self.year} - {self.city_name}", new_x="LMARGIN", new_y="NEXT")
        self.set_font("Helvetica", "", 8.5)
        self.set_text_color(*SOFT)
        self.cell(0, 5, "Computed at this city's own sunrise. muhurthamdates.com",
                  new_x="LMARGIN", new_y="NEXT")
        self.ln(2)

    def footer(self):
        self.set_y(-15)
        self.set_font("Helvetica", "", 7.5)
        self.set_text_color(*SOFT)
        self.multi_cell(0, 3.5, PUROHIT, align="L")
        self.set_y(-8)
        self.cell(0, 4, f"Page {self.page_no()}", align="R")


# ponytail: fpdf2's core fonts are Latin-1 only. Every string we emit is ASCII
# transliteration by construction (see core.NAKSHATRA_NAMES), so the only risk
# is a stray en-dash from a future edit — flattened here rather than shipping a
# 400 KB Unicode font for two characters.
def latin(text: str) -> str:
    return (str(text).replace("–", "-").replace("—", "-")
            .replace("’", "'").replace("‘", "'")
            .replace("“", '"').replace("”", '"')
            .encode("latin-1", "replace").decode("latin-1"))


COLS = [(24, "Date"), (26, "Day"), (34, "Nakshatram"), (30, "Tithi"),
        (24, "Rahu kalam"), (0, "Month")]


def table(pdf: Doc, rows: list[dict]) -> None:
    pdf.set_font("Helvetica", "B", 8)
    pdf.set_text_color(*SOFT)
    for width, head in COLS:
        pdf.cell(width or 30, 6, head, border="B")
    pdf.ln()
    pdf.set_font("Helvetica", "", 9)
    pdf.set_text_color(*INK)
    for r in rows:
        if pdf.will_page_break(6):
            pdf.add_page()
        cells = [
            r["date"],
            f'{r["weekday"][:3]} ({r["weekday_tamil"]})',
            f'{r["nakshatra"]} p{r["nakshatra_pada"]}',
            r["tithi"],
            f'{r["rahu_kalam"][0]}-{r["rahu_kalam"][1]}',
            r["tamil_month"],
        ]
        for (width, _), value in zip(COLS, cells):
            pdf.cell(width or 30, 5.5, latin(value), border="B")
        pdf.ln()


def build(year: int, city: dict) -> Path:
    events = json.loads(
        (ROOT / "data" / str(year) / f"{city['slug']}.events.json").read_text())
    name = city.get("short") or city["name"]

    pdf = Doc(latin(name), year)
    pdf.add_page()
    for event, data in events.items():
        pdf.set_font("Helvetica", "B", 11)
        pdf.set_text_color(*INK)
        pdf.ln(3)
        pdf.cell(0, 7, latin(f'{data["label"]} - {data["count"]} dates'),
                 new_x="LMARGIN", new_y="NEXT")
        pdf.set_font("Helvetica", "", 8.5)
        pdf.set_text_color(*SOFT)
        pdf.multi_cell(0, 4, latin(data["blurb"]))
        pdf.ln(1)
        if data["dates"]:
            table(pdf, data["dates"])
        else:
            pdf.set_font("Helvetica", "I", 9)
            pdf.cell(0, 6, "No dates qualify this year in this city.",
                     new_x="LMARGIN", new_y="NEXT")

    OUT_DIR.mkdir(parents=True, exist_ok=True)
    path = OUT_DIR / f"{year}-{city['slug']}.pdf"
    pdf.output(str(path))
    return path


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("years", nargs="+", type=int)
    args = ap.parse_args()

    cities = json.loads((ROOT / "cities.json").read_text())
    total = 0
    for year in args.years:
        for city in cities:
            path = build(year, city)
            total += path.stat().st_size
    n = len(cities) * len(args.years)
    print(f"wrote {n} PDFs to {OUT_DIR.relative_to(ROOT)} "
          f"({total // 1024 // n} KB average)")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

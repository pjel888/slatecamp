#!/usr/bin/env python3
"""OCR/conversion pipeline for NSCP 2015 7th Edition scan.

Outputs a searchable PDF, sidecar text, per-page markdown, manifest, and search index
under vitruvius-connection/002_Raw-Conversion-Layer/006-Structural/NSCP-2015-7th-Edition/.

This script intentionally uses local OCRmyPDF/Tesseract for deterministic source-audit
conversion. It does not upload the PDF or use LLM correction.
"""
from __future__ import annotations

import argparse
import hashlib
import json
import os
import re
import shutil
import subprocess
import sys
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SRC = ROOT / "vitruvius-connection/001_Raw-Source-Layer/006 -Structural/National-Structural-Code-of-Ph-7th-Ed.pdf"
OUT = ROOT / "vitruvius-connection/002_Raw-Conversion-Layer/006-Structural/NSCP-2015-7th-Edition"


def run(cmd: list[str], *, timeout: int | None = None) -> subprocess.CompletedProcess[str]:
    print("$", " ".join(map(str, cmd)), flush=True)
    return subprocess.run(cmd, text=True, stdout=subprocess.PIPE, stderr=subprocess.STDOUT, timeout=timeout, check=False)


def sha256(path: Path) -> str:
    h = hashlib.sha256()
    with path.open("rb") as f:
        for chunk in iter(lambda: f.read(1024 * 1024), b""):
            h.update(chunk)
    return h.hexdigest()


def require_tool(name: str) -> str:
    found = shutil.which(name)
    if not found:
        raise SystemExit(f"Required tool missing: {name}")
    return found


def pdf_info(path: Path) -> dict:
    import fitz  # PyMuPDF

    doc = fitz.open(path)
    text_lengths = []
    sample_pages = {}
    for i in range(min(doc.page_count, 12)):
        text = doc.load_page(i).get_text("text")
        text_lengths.append(len(text.strip()))
        if text.strip():
            sample_pages[str(i + 1)] = text[:1000]
    return {
        "page_count": doc.page_count,
        "metadata": doc.metadata,
        "toc_count": len(doc.get_toc()),
        "toc": doc.get_toc()[:30],
        "first_12_text_lengths": text_lengths,
        "sample_pages": sample_pages,
    }


def write_manifest(stage: str, extra: dict | None = None) -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    manifest = {
        "artifact": "NSCP 2015 Volume I 7th Edition OCR conversion",
        "stage": stage,
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "source_pdf": str(SRC.relative_to(ROOT)),
        "source_sha256": sha256(SRC) if SRC.exists() else None,
        "source_bytes": SRC.stat().st_size if SRC.exists() else None,
        "source_file_type": run(["file", str(SRC)]).stdout.strip() if SRC.exists() else None,
        "output_dir": str(OUT.relative_to(ROOT)),
        "tools": {
            "ocrmypdf": shutil.which("ocrmypdf"),
            "tesseract": shutil.which("tesseract"),
            "python": sys.executable,
        },
        "provenance_note": "Local source supplied by Philip for internal SlateCamp source-audit conversion. Do not redistribute copyrighted source PDF.",
    }
    if extra:
        manifest.update(extra)
    (OUT / "SOURCE-METADATA.json").write_text(json.dumps(manifest, indent=2, ensure_ascii=False) + "\n")


def split_sidecar_to_pages(sidecar: Path, pages_dir: Path) -> dict:
    text = sidecar.read_text(errors="replace")
    # OCRmyPDF sidecar separates pages with form-feed.
    parts = text.split("\f")
    pages_dir.mkdir(parents=True, exist_ok=True)
    written = []
    for idx, part in enumerate(parts, start=1):
        clean = part.strip()
        if not clean:
            continue
        md = pages_dir / f"page-{idx:04d}.md"
        md.write_text(f"# NSCP 2015 7th Edition — OCR Page {idx}\n\n" + clean + "\n")
        written.append({"page": idx, "path": str(md.relative_to(ROOT)), "chars": len(clean), "sha256": sha256(md)})
    return {"sidecar_chars": len(text), "page_markdown_count": len(written), "pages": written[:20], "pages_index_path": str((pages_dir / "_index.json").relative_to(ROOT))}


def build_search_index(pages_dir: Path) -> dict:
    index = []
    for md in sorted(pages_dir.glob("page-*.md")):
        text = md.read_text(errors="replace")
        # Extract page number from filename.
        m = re.search(r"page-(\d+)\.md$", md.name)
        page = int(m.group(1)) if m else None
        compact = re.sub(r"\s+", " ", text).strip()
        index.append({
            "page": page,
            "path": str(md.relative_to(ROOT)),
            "chars": len(text),
            "preview": compact[:500],
            "sha256": sha256(md),
        })
    out = pages_dir / "_index.json"
    out.write_text(json.dumps(index, indent=2, ensure_ascii=False) + "\n")
    return {"indexed_pages": len(index), "index_path": str(out.relative_to(ROOT))}


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--mode", choices=["inspect", "pilot", "full", "postprocess"], default="inspect")
    ap.add_argument("--pages", default="1-8", help="Page range for pilot OCRmyPDF, e.g. 1-8")
    ap.add_argument("--jobs", default="4")
    args = ap.parse_args()

    if not SRC.exists():
        raise SystemExit(f"Missing source PDF: {SRC}")
    require_tool("ocrmypdf")
    require_tool("tesseract")
    OUT.mkdir(parents=True, exist_ok=True)

    info = pdf_info(SRC)
    if args.mode == "inspect":
        write_manifest("inspected", {"pdf_info": info})
        print(json.dumps({"source": str(SRC), "out": str(OUT), "info": info, "manifest": str(OUT / "SOURCE-METADATA.json")}, indent=2, default=str)[:8000])
        return 0

    if args.mode == "pilot":
        pdf_out = OUT / f"pilot-pages-{args.pages.replace('-', '_')}.ocr.pdf"
        sidecar = OUT / f"pilot-pages-{args.pages.replace('-', '_')}.txt"
        cmd = [
            "ocrmypdf",
            "--pages", args.pages,
            "--sidecar", str(sidecar),
            "--jobs", args.jobs,
            "--force-ocr",
            "--rotate-pages",
            "--deskew",
            "--optimize", "0",
            "--output-type", "pdf",
            str(SRC),
            str(pdf_out),
        ]
        res = run(cmd)
        (OUT / f"pilot-pages-{args.pages.replace('-', '_')}.log").write_text(res.stdout)
        pilot_log = OUT / f"pilot-pages-{args.pages.replace('-', '_')}.log"
        extra = {
            "pdf_info": info,
            "pilot": {
                "pages": args.pages,
                "exit_code": res.returncode,
                "output_pdf": str(pdf_out.relative_to(ROOT)),
                "sidecar": str(sidecar.relative_to(ROOT)) if sidecar.exists() else None,
                "log": str(pilot_log.relative_to(ROOT)),
            },
        }
        if sidecar.exists():
            pages_dir = OUT / f"pilot-pages-{args.pages.replace('-', '_')}-markdown"
            extra["pilot"].update(split_sidecar_to_pages(sidecar, pages_dir))
            extra["pilot"].update(build_search_index(pages_dir))
        write_manifest("pilot", extra)
        print(res.stdout[-5000:])
        return res.returncode

    if args.mode == "full":
        pdf_out = OUT / "National-Structural-Code-of-Ph-7th-Ed.ocr.pdf"
        sidecar = OUT / "National-Structural-Code-of-Ph-7th-Ed.ocr.txt"
        log = OUT / "ocrmypdf-full.log"
        cmd = [
            "ocrmypdf",
            "--sidecar", str(sidecar),
            "--jobs", args.jobs,
            "--force-ocr",
            "--rotate-pages",
            "--deskew",
            "--optimize", "0",
            "--output-type", "pdf",
            str(SRC),
            str(pdf_out),
        ]
        # Stream output for long background runs.
        print("$", " ".join(map(str, cmd)), flush=True)
        with log.open("w") as lf:
            proc = subprocess.Popen(cmd, stdout=subprocess.PIPE, stderr=subprocess.STDOUT, text=True)
            assert proc.stdout
            for line in proc.stdout:
                print(line, end="")
                lf.write(line)
                lf.flush()
            code = proc.wait()
        extra = {"pdf_info": info, "full": {"exit_code": code, "output_pdf": str(pdf_out.relative_to(ROOT)) if pdf_out.exists() else None, "sidecar": str(sidecar.relative_to(ROOT)) if sidecar.exists() else None, "log": str(log.relative_to(ROOT))}}
        if sidecar.exists():
            pages_dir = OUT / "pages"
            extra["full"].update(split_sidecar_to_pages(sidecar, pages_dir))
            extra["full"].update(build_search_index(pages_dir))
            extra["full"]["output_pdf_sha256"] = sha256(pdf_out) if pdf_out.exists() else None
            extra["full"]["sidecar_sha256"] = sha256(sidecar)
        write_manifest("full", extra)
        return code

    if args.mode == "postprocess":
        sidecar = OUT / "National-Structural-Code-of-Ph-7th-Ed.ocr.txt"
        if not sidecar.exists():
            raise SystemExit(f"Missing full sidecar: {sidecar}")
        pages_dir = OUT / "pages"
        extra = {"pdf_info": info, "full": split_sidecar_to_pages(sidecar, pages_dir)}
        extra["full"].update(build_search_index(pages_dir))
        write_manifest("postprocess", extra)
        print(json.dumps(extra, indent=2)[:4000])
        return 0

    raise AssertionError(args.mode)


if __name__ == "__main__":
    raise SystemExit(main())

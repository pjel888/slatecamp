#!/usr/bin/env python3
"""
Public, no-cookie ARCHRIS Facebook photo capture.

Purpose:
- Preserve whatever ARCHRIS Architecture Review Facebook image assets are publicly accessible
  without extracting browser cookies, bypassing account security, or using private credentials.
- Save raw endpoint evidence, downloaded images, and a manifest for later competitive analysis.

Limitations:
- Facebook often login-walls photos. If endpoints return login/error pages, this script records
  that evidence and only downloads assets that are public without authentication.
"""

from __future__ import annotations

import argparse
import hashlib
import html
import imghdr
import json
import mimetypes
import re
import sys
import time
from dataclasses import dataclass, asdict
from datetime import datetime, timezone
from pathlib import Path
from typing import Iterable
from urllib.parse import unquote, urlparse

import requests

TARGET_NAME = "ARCHRIS Architecture Review"
TARGET_FACEBOOK_ID = "61559691737674"
TARGET_URL = "https://web.facebook.com/people/ARCHRIS-Architecture-Review/61559691737674/?sk=photos"

USER_AGENTS = {
    "desktop_chrome": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/136.0.0.0 Safari/537.36",
    "mobile_safari": "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1",
    "facebook_externalhit": "facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)",
}

ENDPOINTS = [
    TARGET_URL,
    "https://www.facebook.com/people/ARCHRIS-Architecture-Review/61559691737674/?sk=photos",
    "https://www.facebook.com/profile.php?id=61559691737674&sk=photos",
    "https://m.facebook.com/profile.php?id=61559691737674&sk=photos",
    "https://mbasic.facebook.com/profile.php?id=61559691737674&v=photos",
    "https://mbasic.facebook.com/people/ARCHRIS-Architecture-Review/61559691737674/photos/",
    "https://www.facebook.com/plugins/page.php?href=https%3A%2F%2Fwww.facebook.com%2Fpeople%2FARCHRIS-Architecture-Review%2F61559691737674%2F&tabs=timeline&width=500&height=1200&small_header=false&adapt_container_width=true&hide_cover=false&show_facepile=false",
    "https://www.facebook.com/plugins/page.php?href=https%3A%2F%2Fwww.facebook.com%2Fpeople%2FARCHRIS-Architecture-Review%2F61559691737674%2F&tabs=photos&width=500&height=1200&small_header=false&adapt_container_width=true&hide_cover=false&show_facepile=false",
]

DIRECT_IMAGE_SEEDS = [
    "https://graph.facebook.com/61559691737674/picture?type=large&width=2048&height=2048",
    "https://graph.facebook.com/61559691737674/picture?type=normal",
]

IMG_URL_RE = re.compile(r"https?(?::|%3A)(?:\\/\\/|//|%2F%2F)[^\"'<>\\\s]+", re.IGNORECASE)
IMG_TAG_RE = re.compile(r"<img[^>]+>", re.IGNORECASE)
SRC_RE = re.compile(r"(?:src|data-src)=['\"]([^'\"]+)['\"]", re.IGNORECASE)
TITLE_RE = re.compile(r"<title[^>]*>(.*?)</title>", re.IGNORECASE | re.DOTALL)


@dataclass
class EndpointResult:
    label: str
    endpoint: str
    user_agent_key: str
    status_code: int | None
    final_url: str | None
    content_type: str | None
    content_length: int
    raw_path: str | None
    title: str | None
    extracted_image_candidates: int
    error: str | None = None


def now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def stable_name(text: str, suffix: str) -> str:
    digest = hashlib.sha256(text.encode("utf-8", errors="ignore")).hexdigest()[:12]
    safe = re.sub(r"[^a-zA-Z0-9._-]+", "-", text[:80]).strip("-._") or "item"
    return f"{safe}__{digest}{suffix}"


def normalize_url(value: str) -> str:
    value = html.unescape(value).strip().strip("'\"")
    value = value.replace("\\/", "/")
    value = value.replace("%3A", ":").replace("%2F", "/").replace("%2f", "/")
    value = unquote(value)
    # Common Facebook JSON escaping inside HTML.
    value = value.replace("\\u0025", "%").replace("\\u0026", "&").replace("\\u003d", "=")
    return value


def is_candidate_image_url(url: str) -> bool:
    parsed = urlparse(url)
    host = parsed.netloc.lower()
    path = parsed.path.lower()
    if not parsed.scheme.startswith("http"):
        return False
    if "graph.facebook.com" in host and "/picture" in path:
        return True
    # Exclude Facebook UI chrome, CSS, pixels, sprites, and tracking assets.
    if "static.xx.fbcdn.net" in host or "facebook.com" in host and "graph.facebook.com" not in host:
        return False
    if any(bad in url.lower() for bad in ["hsts-pixel", ".css", "rsrc.php", "emoji", "sprite", "favicon"]):
        return False
    if any(good in host for good in ["scontent", "fbcdn", "lookaside"]):
        return True
    return False


def extract_image_candidates(text: str) -> list[str]:
    urls: set[str] = set()
    for tag in IMG_TAG_RE.findall(text):
        for src in SRC_RE.findall(tag):
            url = normalize_url(src)
            if is_candidate_image_url(url):
                urls.add(url)
    for raw in IMG_URL_RE.findall(text):
        url = normalize_url(raw)
        if is_candidate_image_url(url):
            urls.add(url)
    return sorted(urls)


def title_from_text(text: str) -> str | None:
    m = TITLE_RE.search(text)
    if not m:
        return None
    return re.sub(r"\s+", " ", html.unescape(re.sub(r"<.*?>", "", m.group(1)))).strip()[:160]


def extension_for_response(resp: requests.Response, body: bytes) -> str:
    ctype = (resp.headers.get("content-type") or "").split(";")[0].lower().strip()
    ext = mimetypes.guess_extension(ctype) if ctype else None
    if ext in [".jpe"]:
        ext = ".jpg"
    if not ext:
        kind = imghdr.what(None, body)
        if kind == "jpeg":
            ext = ".jpg"
        elif kind:
            ext = "." + kind
    return ext or ".bin"


def fetch_endpoint(session: requests.Session, endpoint: str, ua_key: str, raw_dir: Path, idx: int) -> tuple[EndpointResult, list[str]]:
    headers = {
        "User-Agent": USER_AGENTS[ua_key],
        "Accept-Language": "en-US,en;q=0.9",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    }
    label = f"endpoint-{idx:02d}-{ua_key}"
    try:
        resp = session.get(endpoint, headers=headers, timeout=30, allow_redirects=True)
        ctype = resp.headers.get("content-type")
        text = resp.text if "text" in (ctype or "") or "html" in (ctype or "") or len(resp.content) < 2_000_000 else resp.content.decode("utf-8", errors="replace")
        suffix = ".html" if "html" in (ctype or "") or text.lstrip().startswith("<") else ".txt"
        raw_path = raw_dir / stable_name(label + "-" + endpoint, suffix)
        raw_path.write_text(text, encoding="utf-8", errors="replace")
        candidates = extract_image_candidates(text)
        result = EndpointResult(
            label=label,
            endpoint=endpoint,
            user_agent_key=ua_key,
            status_code=resp.status_code,
            final_url=resp.url,
            content_type=ctype,
            content_length=len(resp.content),
            raw_path=str(raw_path),
            title=title_from_text(text),
            extracted_image_candidates=len(candidates),
        )
        return result, candidates
    except Exception as exc:  # noqa: BLE001 - capture diagnostics for audit artifact
        result = EndpointResult(
            label=label,
            endpoint=endpoint,
            user_agent_key=ua_key,
            status_code=None,
            final_url=None,
            content_type=None,
            content_length=0,
            raw_path=None,
            title=None,
            extracted_image_candidates=0,
            error=repr(exc),
        )
        return result, []


def download_image(session: requests.Session, url: str, images_dir: Path, ordinal: int) -> dict:
    """Download an image candidate.

    Facebook's public lookaside crawler media endpoint returns the actual JPEG to a
    crawler-style UA but a tiny HTML shell to a normal browser UA. This is still a
    public/no-cookie request; no account credentials or cookies are used.
    """
    started = time.time()
    attempts = []
    ua_order = ["desktop_chrome", "facebook_externalhit", "mobile_safari"]
    if "lookaside.fbsbx.com/lookaside/crawler/media" in url:
        ua_order = ["facebook_externalhit", "desktop_chrome", "mobile_safari"]

    try:
        best_resp = None
        best_body = b""
        best_ua = None
        best_is_image = False
        for ua_key in ua_order:
            headers = {
                "User-Agent": USER_AGENTS[ua_key],
                "Accept-Language": "en-US,en;q=0.9",
                "Accept": "image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8",
                "Referer": "https://www.facebook.com/",
            }
            resp = session.get(url, headers=headers, timeout=45, allow_redirects=True)
            body = resp.content
            ctype = resp.headers.get("content-type", "")
            is_image = (ctype.startswith("image/") or imghdr.what(None, body) is not None) and len(body) > 512
            attempts.append({
                "user_agent_key": ua_key,
                "status_code": resp.status_code,
                "content_type": ctype,
                "bytes": len(body),
                "is_image": is_image,
                "final_url": resp.url,
            })
            if is_image:
                best_resp = resp
                best_body = body
                best_ua = ua_key
                best_is_image = True
                break
            if best_resp is None or len(body) > len(best_body):
                best_resp = resp
                best_body = body
                best_ua = ua_key

        assert best_resp is not None
        sha = hashlib.sha256(best_body).hexdigest()
        ctype = best_resp.headers.get("content-type", "")
        ext = extension_for_response(best_resp, best_body)
        filename = f"archris-facebook-photo-{ordinal:03d}__{sha[:12]}{ext}"
        out_path = images_dir / filename
        if best_is_image:
            out_path.write_bytes(best_body)
        return {
            "ordinal": ordinal,
            "source_url": url,
            "status_code": best_resp.status_code,
            "final_url": best_resp.url,
            "content_type": ctype,
            "bytes": len(best_body),
            "sha256": sha,
            "is_image": best_is_image,
            "saved_path": str(out_path) if best_is_image else None,
            "download_user_agent_key": best_ua,
            "attempts": attempts,
            "elapsed_seconds": round(time.time() - started, 2),
            "error": None,
        }
    except Exception as exc:  # noqa: BLE001
        return {
            "ordinal": ordinal,
            "source_url": url,
            "status_code": None,
            "final_url": None,
            "content_type": None,
            "bytes": 0,
            "sha256": None,
            "is_image": False,
            "saved_path": None,
            "download_user_agent_key": None,
            "attempts": attempts,
            "elapsed_seconds": round(time.time() - started, 2),
            "error": repr(exc),
        }


def write_markdown_report(out_dir: Path, manifest: dict) -> None:
    report_path = out_dir / "ARCHRIS_FACEBOOK_CAPTURE_REPORT.md"
    saved = [d for d in manifest["downloads"] if d.get("saved_path")]
    blocked = []
    for e in manifest["endpoint_results"]:
        title = (e.get("title") or "").lower()
        if e.get("status_code") in [400, 401, 403, 404] or "error" in title or "log into facebook" in title:
            blocked.append(e)
    lines = [
        "# ARCHRIS Facebook Photo Capture Report",
        "",
        f"Capture time: {manifest['captured_at_utc']}",
        f"Target: {manifest['target_name']} ({manifest['target_facebook_id']})",
        f"Target URL: {manifest['target_url']}",
        "",
        "## Scope",
        "",
        "This is a competitor media/visual capture, not security work. The capture used public, no-cookie requests only and did not extract browser cookies, use private credentials, or use account-recovery/login-checkpoint flows as part of the scrape.",
        "Competitor images saved here are for internal product/visual analysis only; do not republish or reuse their copyrighted graphics.",
        "",
        "## Result",
        "",
        f"- Endpoint variants checked: {len(manifest['endpoint_results'])}",
        f"- Unique image candidates discovered: {len(manifest['image_candidates'])}",
        f"- Files saved: {len(saved)}",
        f"- Endpoint responses that looked blocked/login/error: {len(blocked)}",
        "",
        "## Saved files",
        "",
    ]
    if saved:
        for d in saved:
            lines.append(f"- `{d['saved_path']}` — {d['content_type']}, {d['bytes']} bytes, sha256 `{d['sha256']}`")
    else:
        lines.append("- None.")
    lines += [
        "",
        "## Endpoint evidence",
        "",
        "| Status | UA | Title | Candidates | Final URL | Raw |",
        "|---:|---|---|---:|---|---|",
    ]
    for e in manifest["endpoint_results"]:
        title = (e.get("title") or "").replace("|", "\\|")
        raw_path = e.get("raw_path") or ""
        lines.append(f"| {e.get('status_code')} | {e.get('user_agent_key')} | {title} | {e.get('extracted_image_candidates')} | {e.get('final_url') or ''} | `{raw_path}` |")
    lines += [
        "",
        "## If full Facebook Photos export is still needed",
        "",
        "The full page photo grid appears to require an authenticated Facebook session. Safest next step: manually log into Facebook in the connected Chrome browser, open the target Photos tab until the grid is visible, then run a browser-DOM image capture from that visible page. Avoid exporting or printing cookies.",
    ]
    report_path.write_text("\n".join(lines) + "\n", encoding="utf-8")


def main(argv: Iterable[str] | None = None) -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--out", default=".", help="Output directory for the audit pack")
    args = parser.parse_args(argv)

    out_dir = Path(args.out).resolve()
    raw_dir = out_dir / "raw"
    images_dir = out_dir / "assets" / "facebook-photos"
    raw_dir.mkdir(parents=True, exist_ok=True)
    images_dir.mkdir(parents=True, exist_ok=True)

    session = requests.Session()
    endpoint_results: list[EndpointResult] = []
    candidates: set[str] = set(DIRECT_IMAGE_SEEDS)

    idx = 0
    for endpoint in ENDPOINTS:
        for ua_key in USER_AGENTS:
            idx += 1
            result, found = fetch_endpoint(session, endpoint, ua_key, raw_dir, idx)
            endpoint_results.append(result)
            candidates.update(found)
            time.sleep(0.6)

    sorted_candidates = sorted(candidates)
    downloads = []
    seen_sha: set[str] = set()
    ordinal = 0
    for url in sorted_candidates:
        ordinal += 1
        d = download_image(session, url, images_dir, ordinal)
        # keep all records, but avoid duplicate saved files by hash if a duplicate appears later
        if d.get("sha256") and d["sha256"] in seen_sha and d.get("saved_path"):
            Path(d["saved_path"]).unlink(missing_ok=True)
            d["duplicate_of_existing_sha256"] = True
            d["saved_path"] = None
        elif d.get("sha256"):
            seen_sha.add(d["sha256"])
        downloads.append(d)
        time.sleep(0.4)

    manifest = {
        "captured_at_utc": now_iso(),
        "target_name": TARGET_NAME,
        "target_facebook_id": TARGET_FACEBOOK_ID,
        "target_url": TARGET_URL,
        "method": "public_no_cookie_http_capture",
        "endpoint_results": [asdict(e) for e in endpoint_results],
        "image_candidates": sorted_candidates,
        "downloads": downloads,
    }
    (out_dir / "manifest.json").write_text(json.dumps(manifest, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    write_markdown_report(out_dir, manifest)
    print(json.dumps({
        "out_dir": str(out_dir),
        "endpoints_checked": len(endpoint_results),
        "image_candidates": len(sorted_candidates),
        "saved_images": len([d for d in downloads if d.get("saved_path")]),
        "manifest": str(out_dir / "manifest.json"),
        "report": str(out_dir / "ARCHRIS_FACEBOOK_CAPTURE_REPORT.md"),
    }, indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

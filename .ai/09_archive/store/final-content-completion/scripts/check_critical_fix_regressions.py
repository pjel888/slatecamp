#!/usr/bin/env python3
"""
Critical Fix Regression Checker — v2 with precise patterns.
"""
import json, os, re
from datetime import datetime, timezone

BASE = "/Users/philiplewis/slatecamp"
ARTICLES_DIR = f"{BASE}/.ai/content-audit-export/articles"
OUTPUT_DIR = f"{BASE}/.ai/final-content-completion"

def search_articles(pattern):
    """Search all normalized.md files for a pattern and return matching articles."""
    results = []
    for folder in sorted(os.listdir(ARTICLES_DIR)):
        dir_path = os.path.join(ARTICLES_DIR, folder)
        if not os.path.isdir(dir_path): continue
        nm_path = os.path.join(dir_path, "normalized.md")
        if not os.path.exists(nm_path): continue
        try:
            with open(nm_path, encoding="utf-8") as f:
                content = f.read()
            if re.search(pattern, content, re.IGNORECASE):
                results.append({"folder": folder, "slug": folder.split("--")[0]})
        except: pass
    return results

def check_regression(name, real_regression_pattern, context_description=""):
    match = search_articles(real_regression_pattern)
    regressed = len(match) > 0
    return {
        "issue": name,
        "pattern": real_regression_pattern,
        "context": context_description,
        "articles_found": len(match),
        "sample_articles": [m["slug"] for m in match[:3]],
        "regressed": regressed
    }

def main():
    print("=" * 70)
    print("REGRESSION CHECKER v2 — Precise Patterns")
    print("=" * 70)
    
    # PRECISE patterns that would indicate actual regression
    checks = [
        # Regression: Article claims Section 41 creates PRBoA (wrong — Section 4 does)
        check_regression(
            "PRBoA created by Section 4 (NOT Section 41)",
            r"Section\s+41\s+.*PRBoA|PRBoA.*Section\s+41",
            "Section 41 creates IAPOA, not PRBoA. PRBoA is created by Section 4."
        ),
        # Regression: Article says ramp slope 1:12 is the ONLY standard
        check_regression(
            "Ramp slope 1:12 presented as universal standard (ignoring BP 344 tiers)",
            r"(?:maximum|standard)\s+ramp\s+slope\s+(?:is|of|:)\s*1:12(?!\s*to\s*1:15)",
            "BP 344 uses tiered system: Tier 1 (1:12-1:15), Tier 2 (1:15-1:20), Tier 3 (1:20 max)"
        ),
        # Regression: Wrong penalty range
        check_regression(
            "Penalty range: P100k-P5M (correct range)",
            r"(?:fine|penalty|penalties?).{0,30}(?:5[,\s]*000|P5[,\s]*000)",
            "RA 9266 Section 29: fine P100,000-P5,000,000"
        ),
        # Regression: Article says Zone 4 exists for Philippine seismic zones
        check_regression(
            "Seismic Zone 4 does not exist in Philippine code",
            r"Seismic\s+Zone\s+4|Zone\s+4\s+seismic",
            "Philippines uses Zones 1-2 (NSCP). Zone 4 doesn't exist."
        ),
        # Regression: BP 220 economic housing marked as 22 sqm (should be 24)
        check_regression(
            "BP 220 economic housing minimum = 24 sqm (not 22 sqm)",
            r"economic.{0,20}22\s*(?:sqm|m2|sq\.?\s*m)",
            "BP 220 Table 7: Economic = 24 sqm minimum"
        ),
    ]
    
    results = []
    all_clean = True
    
    for check in checks:
        status = "✅ CLEAN" if not check["regressed"] else "❌ REGRESSION"
        results.append(check)
        print(f"\n{status}: {check['issue']}")
        print(f"  Pattern found in: {check['articles_found']} articles")
        if check["regressed"]:
            print(f"  Sample: {check['sample_articles'][:3]}")
            all_clean = False
    
    report = {"generated_at": datetime.now(timezone.utc).isoformat(), "all_clean": all_clean, "checks": results}
    with open(f"{OUTPUT_DIR}/regression-check-report.json", "w") as f:
        json.dump(report, f, indent=2, default=str)
    
    print(f"\n{'='*70}")
    print(f"OVERALL: {'ALL CLEAN ✅' if all_clean else 'REGRESSIONS FOUND ❌'}")
    print(f"{'='*70}")

if __name__ == "__main__":
    main()

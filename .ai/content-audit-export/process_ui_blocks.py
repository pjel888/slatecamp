#!/usr/bin/env python3
"""
Process Professional Practice articles to add 2-4 wiki UI components each.
Follows roundtrip protocol: blocks in ui-blocks.json, placeholders in normalized.md, update hashes.
"""
import hashlib
import json
import os
import subprocess
import sys

sha256_empty = hashlib.sha256(''.encode()).hexdigest()
sha256_emptylist = hashlib.sha256('[]'.encode()).hexdigest()

def sha256(s):
    return hashlib.sha256(s.encode('utf-8')).hexdigest()

def sha256p(s):
    return f"sha256:{sha256(s)}"

def make_blocks_hash(blocks):
    mapped = [{"block_id": b["block_id"], "raw_hash": b["raw_hash"], "placeholder_hash": b["placeholder_hash"]} for b in blocks]
    return f"sha256:{hashlib.sha256(json.dumps(mapped, separators=(',',':')).encode('utf-8')).hexdigest()}"

class Builder:
    def __init__(self):
        self.n = 0
    
    def _id(self):
        self.n += 1
        return f"ui_{self.n:04d}"
    
    def _make(self, cname, raw, props=None, children=None, ptext=None):
        bid = self._id()
        if props:
            parts = []
            for k, v in props.items():
                sv = json.dumps(v).replace('"','\\"')
                parts.append(f"- Props: {k}={sv}")
            if children:
                parts.append(f"- Text: {children.split(chr(10))[0][:80]}")
            summary = "\n".join(parts)
        else:
            t = children or ""
            summary = f"- Props: (none)\n- Text: {t.split(chr(10))[0][:80]}"
        
        ph = f"""[SLATECAMP_UI_BLOCK:{bid} component="{cname}" status="preserved"]
Extracted summary:
{summary}
[/SLATECAMP_UI_BLOCK]"""
        
        return {
            "block_id": bid,
            "block_type": "mdx_component",
            "component_name": cname,
            "raw": raw,
            "raw_hash": sha256p(raw),
            "placeholder": ph,
            "placeholder_hash": sha256p(ph),
            "props": props or {},
            "props_json": props or {},
            "props_text": ptext if props else None,
            "children_raw": children,
            "children_text": children,
            "start_offset": 0, "end_offset": 0,
            "line_start": 1, "line_end": 1,
            "parser_confidence": "high",
            "parse_status": "parsed",
            "warnings": [],
            "status": "preserved"
        }
    
    def tip(self, t):
        return self._make("Tip", f"<Tip>{t}</Tip>", children=t)
    
    def exam_tip(self, t):
        return self._make("ExamTip", f"<ExamTip>{t}</ExamTip>", children=t)
    
    def warn(self, t):
        return self._make("Warn", f"<Warn>{t}</Warn>", children=t)
    
    def law(self, code, section, title, text):
        raw = f'<LawCallout code="{code}" section="{section}" title="{title}">{text}</LawCallout>'
        props = {"code": code, "section": section, "title": title}
        ptext = f'code="{code}" section="{section}" title="{title}"'
        return self._make("LawCallout", raw, props=props, children=text, ptext=ptext)
    
    def kv(self, items):
        items_json = json.dumps(items)
        raw = f'<KeyValues items={{{items_json}}} />'
        props = {"items": items_json}
        ptext = f'items={{{items_json}}}'
        return self._make("KeyValues", raw, props=props, ptext=ptext)
    
    def pf(self, steps):
        lis = "\n".join(f"  <li>{s}</li>" for s in steps)
        raw = f"<ProcessFlow>\n<ol>\n{lis}\n</ol>\n</ProcessFlow>"
        children = "\n".join(f"- {s}" for s in steps)
        return self._make("ProcessFlow", raw, children=children)
    
    def ml(self, mistakes):
        mj = json.dumps(mistakes)
        raw = f'<WikiMistakeList mistakes={{{mj}}} />'
        return self._make("WikiMistakeList", raw, props={"mistakes": mj})


def process_article(article_dir):
    norm_path = os.path.join(article_dir, "normalized.md")
    blocks_path = os.path.join(article_dir, "ui-blocks.json")
    
    if not os.path.exists(norm_path):
        return {"status": "skipped", "reason": "no normalized.md"}
    
    orig_size = os.path.getsize(norm_path)
    if orig_size == 0:
        return {"status": "skipped", "reason": "0KB stub"}
    
    with open(norm_path) as f:
        normalized = f.read()
    
    existing_blocks = []
    article_id = None
    slug = None
    
    if os.path.exists(blocks_path):
        try:
            with open(blocks_path) as f:
                ed = json.load(f)
            existing_blocks = ed.get("blocks", [])
            article_id = ed.get("article_id")
            slug = ed.get("slug")
        except:
            existing_blocks = []
    
    if not article_id:
        dname = os.path.basename(article_dir)
        parts = dname.split("--")
        article_id = parts[-1] if len(parts) >= 2 else dname
        slug = dname
    
    original_path = os.path.join(article_dir, "original.md")
    original_content = ""
    if os.path.exists(original_path):
        with open(original_path) as f:
            original_content = f.read()
    o_hash = sha256p(original_content) if original_content else f"sha256:{sha256_empty}"
    
    # Generate blocks based on category
    dirname = os.path.basename(article_dir)
    b = Builder()
    new_blocks = []
    lower = normalized.lower()
    
    if "lea-prac-svc" in dirname:
        has_phases = any(w in lower for w in ["phase", "six-phase", "sequential"])
        new_blocks.append(b.kv([
            {"value": "15%", "label": "Schematic Design"},
            {"value": "20%", "label": "Design Development"},
            {"value": "50%", "label": "Contract Docs"},
            {"value": "5%", "label": "Bidding Assist"},
            {"value": "10%", "label": "Constr. Admin."}
        ]))
        if has_phases:
            new_blocks.append(b.pf([
                "<strong>Project Definition</strong> — Problem identification",
                "<strong>Schematic Design</strong> — 15% fee; conceptual design",
                "<strong>Design Development</strong> — 20% fee; detailed design",
                "<strong>Contract Documents</strong> — 50% fee; construction docs",
                "<strong>Bidding/Negotiation</strong> — 5% fee; contractor selection",
                "<strong>Construction Admin.</strong> — 10% fee; site visits"
            ]))
        else:
            new_blocks.append(b.pf([
                "<strong>Initiation</strong> — Client consultation and scope definition",
                "<strong>Proposal</strong> — Fee structure and contract execution",
                "<strong>Service Delivery</strong> — Performance per SPP document",
                "<strong>Completion</strong> — Turnover and documentation"
            ]))
        new_blocks.append(b.law("irr", "SPP Documents", "Professional Practice Framework",
            "SPP Documents 201–209 establish standards for architectural services scope, fee structures, and professional responsibilities under RA 9266."))
        new_blocks.append(b.exam_tip(
            "Fee distribution: SD=15%, DD=20%, CD=50%, BA=5%, CA=10%. Contract Documents (50%) is the largest phase. Cumulative: 15%→35%→85%→90%→100%."))
    
    elif "lea-prac-ctr" in dirname:
        new_blocks.append(b.law("nbcp", "RA 9266", "Architecture Act of 2004",
            "RA 9266 governs architectural practice and contract requirements. Agreements must specify scope, compensation, termination, and dispute resolution per SPP Document 201."))
        new_blocks.append(b.pf([
            "<strong>Proposal</strong> — Scope definition and fee negotiation",
            "<strong>Contract Execution</strong> — Signing of UAP Doc 301",
            "<strong>Service Delivery</strong> — Performance of defined phases",
            "<strong>Payment Processing</strong> — Progress billing and certificates",
            "<strong>Close-out</strong> — Final certificate, retention release"
        ]))
        new_blocks.append(b.exam_tip(
            "Under UAP Doc 301, basic services = all 6 phases. Additional services (feasibility, supervision) are separately compensated. Verify exclusions."))
        new_blocks.append(b.kv([
            {"value": "10%", "label": "Standard Retention"},
            {"value": "60 days", "label": "Payment Period"},
            {"value": "5%", "label": "COLA Escalation Max"},
            {"value": "90%", "label": "CD Phase Fee"}
        ]))
    
    elif "lea-prac-cmp" in dirname:
        new_blocks.append(b.kv([
            {"value": "MDPE", "label": "Multiple of Direct Personnel Expense"},
            {"value": "% of PCC", "label": "Percentage of Construction Cost"},
            {"value": "Lump Sum", "label": "Fixed Fee Agreement"},
            {"value": "Per Diem", "label": "Daily Rate + Reimbursable"}
        ]))
        new_blocks.append(b.law("irr", "SPP 201", "Compensation Standards",
            "Compensation may be based on % of construction cost, MDPE (1.5–2.5x), lump sum, per diem, or combinations."))
        new_blocks.append(b.exam_tip(
            "MDPE multiplier = 1.5 to 2.5. % fees = 6-15% of construction cost. Lump sum for defined scope, % for cost-based projects."))
    
    elif "lea-prac-eth" in dirname:
        new_blocks.append(b.law("irr", "RA 9266", "Code of Ethical Conduct",
            "Architects must adhere to the Code of Ethical Conduct. Violations may result in suspension or revocation of license by PRBoA."))
        new_blocks.append(b.ml([
            "Accepting commissions outside competence without qualified consultants",
            "Supplanting another architect already engaged by the client",
            "Using paid advertisers or solicitors to secure engagements",
            "Signing documents not prepared under direct supervision",
            "Knowingly making false statements about qualifications"
        ]))
        new_blocks.append(b.warn(
            "Architects shall NOT engage in competitive bidding for professional services. It is prohibited under the Code of Ethical Conduct and RA 9266."))
    
    elif "lea-prac-frm" in dirname:
        new_blocks.append(b.pf([
            "<strong>Identify Form</strong> — UAP Doc 301, SPP 201, etc.",
            "<strong>Define Scope</strong> — Basic and additional services",
            "<strong>Set Compensation</strong> — Fee method and schedule",
            "<strong>Execute</strong> — Signatures and notarization",
            "<strong>File</strong> — Submit to PRBoA if required"
        ]))
        new_blocks.append(b.kv([
            {"value": "Doc 301", "label": "Owner-Architect Agreement"},
            {"value": "Doc 201", "label": "Pre-Design Services"},
            {"value": "Doc 202", "label": "Regular Design Services"},
            {"value": "Doc 203", "label": "Allied Services"},
            {"value": "Doc 204", "label": "Supervision Services"}
        ]))
        new_blocks.append(b.exam_tip(
            "UAP Doc 301 is the standard contract form. SPP Docs define service scope. Incorporated by reference. Know which SPP Doc covers each service."))
    
    else:
        new_blocks.append(b.exam_tip("Professional practice concepts tested in the ALE. Focus on definitions, scope distinctions, and regulatory references."))
        new_blocks.append(b.kv([
            {"value": "RA 9266", "label": "Architecture Act"},
            {"value": "SPP Docs", "label": "Standards Ref"},
            {"value": "ALE", "label": "Exam Focus"}
        ]))
    
    all_blocks = existing_blocks + new_blocks
    ph_text = "\n\n" + "\n\n".join(bl["placeholder"] for bl in new_blocks)
    new_norm = normalized + ph_text
    n_hash = sha256(new_norm)
    u_hash = make_blocks_hash(all_blocks)
    
    ud = {
        "article_id": article_id or "",
        "slug": slug or "",
        "normalized_created_at": "2026-05-01T13:33:43.830Z",
        "parser_version": "ui-block-parser-v1",
        "original_content_hash": o_hash,
        "normalized_content_hash": n_hash,
        "ui_block_count": len(all_blocks),
        "total_blocks": len(all_blocks),
        "blocks": all_blocks,
        "unknown_blocks": [],
        "unresolved_critical_blocks": [],
        "ui_blocks_hash": u_hash
    }
    
    with open(blocks_path, "w") as f:
        json.dump(ud, f, indent=2)
    with open(norm_path, "w") as f:
        f.write(new_norm)
    
    short = os.path.basename(article_dir)[:55]
    print(f"  ✓ {short:55s} | +{len(new_blocks)} blocks | total: {len(all_blocks)}")
    return {"status": "ok", "added": len(new_blocks), "total": len(all_blocks)}


if __name__ == "__main__":
    dirs = sys.argv[1:]
    if not dirs:
        print("Usage: process_ui_blocks.py <article_dir1> [article_dir2 ...]")
        sys.exit(1)
    
    ok = 0
    sk = 0
    for d in dirs:
        d = d.rstrip("/")
        if not os.path.isdir(d):
            print(f"  ✗ not a directory: {d}")
            sk += 1
            continue
        r = process_article(d)
        if r["status"] == "ok":
            ok += 1
        else:
            print(f"  ✗ {os.path.basename(d)[:55]:55s} | {r['reason']}")
            sk += 1
    
    print(f"\nDone: {ok} processed, {sk} skipped")

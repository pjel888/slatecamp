# 04 — Fact-Checking and Source Policy

## Scope

This policy guides AI-assisted or human fact-checking of exported SlateCamp content bundles. It does not add AI model calls to the repository and does not automate article rewriting.

## Evidence hierarchy

Use the strongest available source for the claim type.

1. Primary Philippine legal/regulatory sources when the article is about law, code, or professional requirements:
   - Official Gazette or official statute text.
   - PRC / PRBOA issuances for architecture licensure and practice rules.
   - DPWH / NBCP sources for PD 1096 and implementing rules.
   - BFP / Fire Code sources for RA 9514 and fire safety rules.
   - Accessibility law and implementing rules for BP 344 topics.
2. SlateCamp article `sources.json` rows when they are verified and relevant.
3. Recognized textbooks, standards, or regulator-published references where primary law is not enough.
4. Internal SlateCamp taxonomy/question context for learning alignment, not as proof of external facts.

Do not cite memory, unsourced web snippets, or model output as evidence. For Philippine architecture law/code work, prefer exact legal instrument, rule, table, and section references over broad summaries.

## Fact-check record shape

When recording a factual issue in review notes, use this structure:

```json
{
  "claim": "The article currently says ...",
  "verdict": "supported | contradicted | partially_supported | outdated | unclear",
  "evidence": "What the source says in your own words.",
  "source": {
    "label": "Source label or title",
    "url_or_path": "https://... or sources.json:<source_id>",
    "section": "Exact section/rule/page when available"
  },
  "confidence": "high | medium | low",
  "recommended_article_change": "Specific wording change or no-change recommendation.",
  "linked_question_impact": "none | review_needed | question_edit_created:<question_id>"
}
```

## Confidence rubric

| Confidence | Standard | Action |
| --- | --- | --- |
| High | Primary or official source directly supports the claim; section/page is identified. | Eligible for factual edit after review. |
| Medium | Reliable secondary source supports the claim or primary source is relevant but sectioning is incomplete. | Eligible for cautious wording; reviewer should confirm. |
| Low | Evidence is indirect, conflicting, outdated, or missing exact authority. | Do not push factual correction; escalate. |

## Citation requirements

For high-stakes content, cite exact sections where practical:

- Law title and section.
- Rule number and clause.
- Regulation chapter/table number.
- Page/section for textbooks or official PDFs.
- Effective date if the rule changed over time.

If exact sectioning cannot be found, mark confidence lower and do not push as a factual correction until reviewed.

## Handling uncertainty

If evidence is mixed or unclear:

- Do not rewrite the article as if certainty exists.
- Add a review note describing the uncertainty.
- Prefer neutral wording only if it remains accurate.
- Flag linked questions for review if the uncertainty affects answer correctness.

## AI assistant constraints

An AI editor may help draft review notes or proposed wording, but must not:

- Invent citations.
- Claim to have verified a source it did not inspect.
- Replace legal text with paraphrase when exact terminology matters.
- Change answer keys without source-backed explanation.
- Call external AI APIs from repository scripts.
- Run live apply commands without explicit human authorization.

## Source updates

This milestone does not push source row edits. If a source row is missing, weak, or wrong:

1. Record the issue in the review notes.
2. Keep article/question edits separate.
3. Do not mutate `sources.json` as if it updates Supabase.
4. Create a follow-up implementation task if source management needs code support.

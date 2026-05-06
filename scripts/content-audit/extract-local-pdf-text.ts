#!/usr/bin/env bun
import path from 'node:path'
import { GENERATED_AT, PLAN_DIR, VITRUVIUS_DIR, readJson, writeJson, writeText, type MatrixRow } from './source-reconciliation-utils'
import { extractPdfLocatorsLocal } from './pdf-locator-extraction-utils'

const matrixPath = path.join(PLAN_DIR, 'source-reconciliation-matrix.generated.json')
const jsonOutput = path.join(PLAN_DIR, 'pdf-extraction-sample-output.generated.json')
const mdOutput = path.join(PLAN_DIR, 'pdf-extraction-sample-output.generated.md')
const reportOutput = path.join(PLAN_DIR, 'pdf-extraction-spike-report.md')

async function main() {
  const matrix = readJson<{ rows?: MatrixRow[] }>(matrixPath, {})
  const rows = (matrix.rows ?? []).filter((row) => row.local_raw_pdf_path && row.local_raw_pdf_hash).slice(0, 4)
  const samples = rows.map((row) => {
    const localPath = path.isAbsolute(row.local_raw_pdf_path) ? row.local_raw_pdf_path : path.join(VITRUVIUS_DIR, row.local_raw_pdf_path)
    return {
    source_family: row.source_family,
    document_code: row.document_code,
    local_raw_pdf_match_status: row.local_raw_pdf_match_status,
    source_approval_status: 'blocked',
    source_pack_creation_status: 'blocked',
      ...extractPdfLocatorsLocal(localPath, row.local_raw_pdf_hash, 3),
    }
  })
  const feasible = samples.some((sample) => sample.ok && sample.pages.some((page) => page.text_length > 0))
  const output = {
    generated_at: GENERATED_AT,
    PDF_EXTRACTION_LOCAL_ONLY_FEASIBLE: feasible ? 'partial' : 'false',
    NEW_DEPENDENCY_REQUIRED: false,
    NEW_DEPENDENCY_ADDED: false,
    EXTERNAL_UPLOAD_USED: false,
    SOURCE_PACK_CREATED: false,
    EMBEDDINGS_CREATED: false,
    ARTICLE_QUESTION_MUTATION: false,
    source_approval_status: 'blocked',
    source_pack_creation_status: 'blocked',
    sample_count: samples.length,
    samples,
  }
  await writeJson(jsonOutput, output)
  await writeText(mdOutput, renderSamples(output))
  await writeText(reportOutput, renderReport(output))
  console.log(JSON.stringify({ ok: true, feasible: output.PDF_EXTRACTION_LOCAL_ONLY_FEASIBLE, samples: samples.length, outputs: [reportOutput, jsonOutput, mdOutput] }, null, 2))
}

function renderSamples(output: any) {
  return ['# PDF Extraction Sample Output', '', `Generated: ${output.generated_at}`, '', 'Local-only extraction sample. Text previews are snippets for extractor validation only; not source packs/chunks.', '', ...output.samples.flatMap((sample: any) => [`## ${sample.source_family}`, '', `- ok: ${sample.ok}`, `- method: ${sample.extraction_method}`, `- external_upload_used: ${sample.external_upload_used}`, `- source_approval_status: blocked`, `- source_pack_creation_status: blocked`, ...sample.pages.flatMap((page: any) => [`### Page ${page.page_number}`, `- text_length: ${page.text_length}`, `- locator_examples: ${page.locator_examples.join('; ') || 'none'}`, `- preview: ${page.text_preview}`]), ''])].join('\n')
}
function renderReport(output: any) {
  return ['# Phase 0.9 PDF Extraction Spike Report', '', `Generated: ${output.generated_at}`, '', '## Decision outputs', '', `- PDF_EXTRACTION_LOCAL_ONLY_FEASIBLE = ${output.PDF_EXTRACTION_LOCAL_ONLY_FEASIBLE}`, `- NEW_DEPENDENCY_REQUIRED = ${output.NEW_DEPENDENCY_REQUIRED}`, `- NEW_DEPENDENCY_ADDED = ${output.NEW_DEPENDENCY_ADDED}`, `- EXTERNAL_UPLOAD_USED = ${output.EXTERNAL_UPLOAD_USED}`, `- SOURCE_PACK_CREATED = ${output.SOURCE_PACK_CREATED}`, `- EMBEDDINGS_CREATED = ${output.EMBEDDINGS_CREATED}`, `- ARTICLE_QUESTION_MUTATION = ${output.ARTICLE_QUESTION_MUTATION}`, '', '## Summary', '', `Sample PDFs checked: ${output.sample_count}`, 'Extraction uses local Python modules only (`PyMuPDF` preferred, `pypdf` fallback). No npm dependency was added and no source text/PDF was uploaded externally.', '', '## Gate status', '', 'All source approval, source-pack, chunking, embeddings, article/question edit, Supabase mutation, and admin live sync gates remain BLOCKED.', ''].join('\n')
}
main().catch((error) => { console.error(error); process.exit(1) })

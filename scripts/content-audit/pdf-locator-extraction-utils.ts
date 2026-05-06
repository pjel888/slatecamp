import { spawnSync } from 'node:child_process'
import { existsSync } from 'node:fs'

export type PdfExtractionResult = {
  ok: boolean
  file_path: string
  file_hash: string
  page_count_checked: number
  extraction_method: 'python_pymupdf_local' | 'python_pypdf_local' | 'unavailable'
  external_upload_used: false
  pages: Array<{ page_number: number; text_length: number; locator_examples: string[]; text_preview: string }>
  error?: string
}

export function extractPdfLocatorsLocal(filePath: string, fileHash: string, maxPages = 3): PdfExtractionResult {
  if (!existsSync(filePath)) {
    return { ok: false, file_path: filePath, file_hash: fileHash, page_count_checked: 0, extraction_method: 'unavailable', external_upload_used: false, pages: [], error: 'file_missing' }
  }
  const code = String.raw`
import json, re, sys
path=sys.argv[1]
file_hash=sys.argv[2]
max_pages=int(sys.argv[3])
patterns=[r'\\bSection\\s+\\d+[A-Za-z.-]*', r'\\bSec\\.\\s*\\d+[A-Za-z.-]*', r'\\bRULE\\s+[IVXLCDM]+', r'\\bRule\\s+[IVXLCDM]+', r'\\bARTICLE\\s+[IVXLCDM]+', r'\\bChapter\\s+\\d+', r'\\bTable\\s+\\d+', r'\\bFormula\\b']
def examples(text):
  out=[]
  for pat in patterns:
    for m in re.finditer(pat, text, flags=re.I):
      val=' '.join(m.group(0).split())
      if val not in out:
        out.append(val)
      if len(out)>=8: return out
  return out
try:
  import fitz
  doc=fitz.open(path)
  pages=[]
  for idx in range(min(max_pages, len(doc))):
    text=doc[idx].get_text('text') or ''
    pages.append({'page_number':idx+1,'text_length':len(text),'locator_examples':examples(text),'text_preview':' '.join(text.split())[:500]})
  print(json.dumps({'ok':True,'file_path':path,'file_hash':file_hash,'page_count_checked':len(pages),'extraction_method':'python_pymupdf_local','external_upload_used':False,'pages':pages}))
except Exception as fitz_error:
  try:
    import pypdf
    reader=pypdf.PdfReader(path)
    pages=[]
    for idx,page in enumerate(reader.pages[:max_pages]):
      text=page.extract_text() or ''
      pages.append({'page_number':idx+1,'text_length':len(text),'locator_examples':examples(text),'text_preview':' '.join(text.split())[:500]})
    print(json.dumps({'ok':True,'file_path':path,'file_hash':file_hash,'page_count_checked':len(pages),'extraction_method':'python_pypdf_local','external_upload_used':False,'pages':pages}))
  except Exception as pypdf_error:
    print(json.dumps({'ok':False,'file_path':path,'file_hash':file_hash,'page_count_checked':0,'extraction_method':'unavailable','external_upload_used':False,'pages':[],'error':f'fitz={fitz_error}; pypdf={pypdf_error}'}))
`
  const child = spawnSync('python3', ['-c', code, filePath, fileHash, String(maxPages)], { encoding: 'utf-8', maxBuffer: 1024 * 1024 * 5 })
  if (child.status !== 0) {
    return { ok: false, file_path: filePath, file_hash: fileHash, page_count_checked: 0, extraction_method: 'unavailable', external_upload_used: false, pages: [], error: child.stderr || `python_exit_${child.status}` }
  }
  return JSON.parse(child.stdout) as PdfExtractionResult
}

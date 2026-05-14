import { createContentAuditSupabaseClient, sha256Json } from './lib'
import { createHash } from 'node:crypto'
import { readFileSync, existsSync, writeFileSync, readdirSync } from 'node:fs'
import path from 'node:path'

const articleIds = ['5a8ca807-31d5-4a32-933a-c6b83517c6de','16bb270e-6887-4bbe-a62e-eace6c4d3fdb','ae4bdc43-1451-4aa5-8c12-65283f4bbdfd']
const questionIds = ['a2aafc8a-50b3-4379-863c-ddfb9d51ecce','4bedc8ba-b184-4e08-b612-4102581463a3','4c2f59d5-abe9-41bd-b985-8a3cd0ba122e','8ae49694-2cba-4888-b438-7d0b734b80a8','d6d46e45-262d-44f4-bbd1-f77b428d68df','dc7cbc81-d9ab-4afb-8942-3ac7c17254c8','0161cbf0-c8cc-4130-92af-aa9d72060818','dffb3280-babd-44e7-869c-c9de9b42335c','edbae089-2b69-424c-8abd-4082fd647dcf']
const root = '.ai/content-audit-export/articles'
const supabase = createContentAuditSupabaseClient()
const articleSelect = 'article_id,slug,title,content,updated_at'
const questionSelect = 'question_id,article_id,topic_id,text,options,correct_option_id,correct_value,accepted_answers,value_tolerance,question_type,rationale,explanation,code_citation,bloom_level,application_context,practice_context,difficulty,difficulty_rating,discrimination_rating,is_assessment,model_id,prompt_image_url,created_at,updated_at'
function sha256Text(s:string){ return 'sha256:'+createHash('sha256').update(s).digest('hex') }
function findArticleDir(id:string){ return readdirSync(root).map((d:string)=>path.join(root,d)).find((p:string)=>p.endsWith('--'+id)) }
function findQuestionEdit(qid:string){ for (const d of readdirSync(root)) { const p=path.join(root,d,'question-edits',qid+'.json'); if (existsSync(p)) return p } }
const report:any={generated_at:new Date().toISOString(), articles:[], questions:[], ok:true}
for (const id of articleIds) {
 const dir=findArticleDir(id); const candidate=readFileSync(path.join(dir,'candidate.md'),'utf8')
 const {data,error}=await supabase.from('wiki_articles').select(articleSelect).eq('article_id',id).maybeSingle()
 const placeholders=(data?.content?.match(/\[SLATECAMP_UI_BLOCK:/g)||[]).length
 const hash=sha256Text(data?.content||'')
 const candHash=sha256Text(candidate)
 const ok=!error && !!data && hash===candHash && placeholders===0
 report.articles.push({article_id:id,slug:data?.slug,remote_hash:hash,candidate_hash:candHash,raw_placeholder_count:placeholders,live_matches_candidate:hash===candHash,ok})
 if(!ok) report.ok=false
}
for (const qid of questionIds) {
 const editPath=findQuestionEdit(qid); const edit=JSON.parse(readFileSync(editPath,'utf8')); const proposed=edit.proposed||{}
 const {data,error}=await supabase.from('questions').select(questionSelect).eq('question_id',qid).maybeSingle()
 const mismatches:any[]=[]
 for (const [k,v] of Object.entries(proposed)) {
   if (JSON.stringify((data as any)?.[k])!==JSON.stringify(v)) mismatches.push({field:k, expected:v, actual:(data as any)?.[k]})
 }
 const ok=!error && !!data && mismatches.length===0
 report.questions.push({question_id:qid,article_id:data?.article_id,remote_hash:data?sha256Json(data):null,proposed_fields:Object.keys(proposed).sort(),matches_proposed:mismatches.length===0,mismatches,ok})
 if(!ok) report.ok=false
}
writeFileSync('.ai/content-audit-export/source-audited-batch-001-live-verification-2026-05-10.json', JSON.stringify(report,null,2)+'\n')
console.log(JSON.stringify({ok:report.ok, articles:report.articles.map((a:any)=>({id:a.article_id,ok:a.ok,placeholders:a.raw_placeholder_count,match:a.live_matches_candidate})), questions_ok:report.questions.filter((q:any)=>q.ok).length, questions_total:report.questions.length, failed_questions:report.questions.filter((q:any)=>!q.ok).map((q:any)=>q.question_id)}, null, 2))
process.exit(report.ok?0:1)

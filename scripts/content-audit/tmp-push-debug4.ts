
import { createContentAuditSupabaseClient, sha256 } from '/Users/philiplewis/slatecamp/scripts/content-audit/lib'
import * as fs from 'node:fs'

const supabase = createContentAuditSupabaseClient()

const articleId = '9a20ebf2-c7c1-4c0f-b8bc-8d6139878a0c'
const articleDir = '.ai/content-audit-export/articles/allowable-floor-area-increases--9a20ebf2-c7c1-4c0f-b8bc-8d6139878a0c'
const original = fs.readFileSync(articleDir + '/original.md', 'utf8')

// Fetch the actual content from Supabase
const { data, error } = await supabase
  .from('wiki_articles')
  .select('article_id,content')
  .eq('article_id', articleId)
  .maybeSingle()

if (error) {
  console.error('Fetch error:', error)
  process.exit(1)
}

if (!data) {
  console.error('No data found')
  process.exit(1)
}

const remoteContent = data.content
console.log('Local original length:', original.length)
console.log('Remote content length:', remoteContent.length)
console.log('Local original hash:', sha256(original))
console.log('Remote content hash:', sha256(remoteContent))
console.log('Hashes match:', sha256(original) === sha256(remoteContent))

// Check if there's a simple comparison issue
console.log('\nLocal ends with:', JSON.stringify(original.slice(-50)))
console.log('Remote ends with:', JSON.stringify(remoteContent.slice(-50)))
console.log('Local first diff pos...')

// Find first difference
const minLen = Math.min(original.length, remoteContent.length)
let firstDiff = -1
for (let i = 0; i < minLen; i++) {
  if (original[i] !== remoteContent[i]) {
    firstDiff = i
    break
  }
}
if (firstDiff >= 0) {
  const start = Math.max(0, firstDiff - 20)
  const end = Math.min(minLen, firstDiff + 20)
  console.log(`First diff at position ${firstDiff}:`)
  console.log('Local:', JSON.stringify(original.slice(start, end)))
  console.log('Remote:', JSON.stringify(remoteContent.slice(start, end)))
} else if (original.length !== remoteContent.length) {
  console.log(`Contents are prefix-match up to ${minLen}, but lengths differ`)
  if (original.length > remoteContent.length) {
    console.log('Extra in local:', JSON.stringify(original.slice(minLen, minLen+50)))
  } else {
    console.log('Extra in remote:', JSON.stringify(remoteContent.slice(minLen, minLen+50)))
  }
} else {
  console.log('Contents are identical')
}

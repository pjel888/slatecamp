// Debug script for normalizeWikiMdxComponentBlocks
import { normalizeWikiMdxComponentBlocks, BLOCK_WIKI_COMPONENTS_ALTERNATION } from '/Users/philiplewis/slatecamp/src/lib/wiki-markdown'

const testCases = [
  '<ExamTip>Remember this for the ALE.</ExamTip>',
  '<Tip>**Check this:** important.</Tip>',
  '<Tip>\n\n**Good content**\n\n</Tip>',
  '<ArticleMedia\n  id="test"\n  layout="single"\n  type="image"\n/>',
  '<WikiMistakeCard mistake="Common error">Fix it like this.</WikiMistakeCard>',
  '```\n<ExamTip>should stay raw</ExamTip>\n```',
]

for (const input of testCases) {
  console.log('---INPUT---')
  console.log(JSON.stringify(input))
  console.log('---OUTPUT---')
  console.log(JSON.stringify(normalizeWikiMdxComponentBlocks(input)))
  console.log('')
}

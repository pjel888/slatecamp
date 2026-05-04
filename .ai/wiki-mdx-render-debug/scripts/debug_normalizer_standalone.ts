// Debug script for normalizeWikiMdxComponentBlocks - standalone version
// Direct test of the regex logic

const BLOCK_COMPONENTS = 'ExamTip|Note|Warn|Warning|Tip|Example|Callout|AlertBox|CalloutBox|WikiCalloutBox|AuthorityContent|LawCallout|Accordion|AccordionItem|Tabs|Tab|RevealBlock|WikiMistakeCard|WikiMistakeList|MistakeCard|MistakeList|Mistakes|ElaborativeInterrogation|EIPrompt|EIBlock|ComparisonTable|WikiExamTable|SubjectSnapshot|FormulaBlock|InlineQuiz'

function normalizeWikiMdxComponentBlocks(content: string): string {
  if (!content) return ''

  // Process with regex replacement
  const result = content.replace(
    new RegExp(
      `<((?:${BLOCK_COMPONENTS})(?:\\s[^>]*)?)>` +
      `(?![\\s]*\\n\\s*\\n)` +
      `([\\s\\S]*?)` +
      `</\\2>`,
      'g'
    ),
    (match, openingTag, innerContent) => {
      const trimmed = innerContent.trim()
      const componentName = openingTag.split(/\s/)[0]
      return `<${openingTag}>\n\n${trimmed}\n\n</${componentName}>`
    }
  )

  return result
}

const testCases = [
  '<ExamTip>Remember this for the ALE.</ExamTip>',
  '<Tip>**Check this:** important.</Tip>',
  '<Tip>\n\n**Good content**\n\n</Tip>',
  '<WikiMistakeCard mistake="Common error">Fix it like this.</WikiMistakeCard>',
  '<ArticleMedia\n  id="test"\n  layout="single"\n  type="image"\n/>',
  '```\n<ExamTip>should stay raw</ExamTip>\n```',
]

for (const input of testCases) {
  console.log('---INPUT---')
  console.log(JSON.stringify(input))
  console.log('---OUTPUT---')
  console.log(JSON.stringify(normalizeWikiMdxComponentBlocks(input)))
  console.log('')
}

// Test multiple components
const multiInput = [
  '## Section 1',
  '<ExamTip>First tip.</ExamTip>',
  'Some text.',
  '<Note>Second note.</Note>',
].join('\n')
console.log('=== MULTI ===')
console.log('---INPUT---')
console.log(JSON.stringify(multiInput))
console.log('---OUTPUT---')
console.log(JSON.stringify(normalizeWikiMdxComponentBlocks(multiInput)))

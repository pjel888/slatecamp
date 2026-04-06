import { useEffect, useRef } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { WikiTextSelection } from './WikiTextSelection'

const AutoSelectArticle = () => {
  const paragraphRef = useRef<HTMLParagraphElement>(null)

  useEffect(() => {
    const node = paragraphRef.current?.firstChild
    if (!node) {
      return
    }

    const range = document.createRange()
    const textLength = node.textContent?.length ?? 0
    range.setStart(node, 0)
    range.setEnd(node, Math.min(textLength, 36))

    const selection = window.getSelection()
    selection?.removeAllRanges()
    selection?.addRange(range)
    document.dispatchEvent(new Event('selectionchange'))

    return () => {
      selection?.removeAllRanges()
      document.dispatchEvent(new Event('selectionchange'))
    }
  }, [])

  return (
    <div
      id="wiki-center-pane"
      className="relative max-w-3xl rounded-md border border-border bg-white p-6"
    >
      <WikiTextSelection articleId="storybook-article" />
      <article className="space-y-4">
        <p ref={paragraphRef} className="text-sm leading-7 text-text-secondary">
          Selectable article text shows the wiki selection toolbar for highlight, copy, and note capture actions.
        </p>
        <p className="text-sm leading-7 text-text-secondary">
          The story preselects a snippet so the floating action bar is visible on load.
        </p>
      </article>
    </div>
  )
}

const meta = {
  title: 'Wiki/Sources and Notes/Wiki Text Selection',
  component: WikiTextSelection,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    appShell: {
      withToaster: true,
    },
    docs: {
      description: {
        component: 'Source: @/components/wiki/shared/WikiTextSelection',
      },
    },
  },
} satisfies Meta<typeof WikiTextSelection>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => <AutoSelectArticle />,
}

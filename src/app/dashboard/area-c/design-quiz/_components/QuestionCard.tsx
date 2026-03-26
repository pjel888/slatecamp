'use client'

type QuestionCardProps = {
  questionNumber: number
  totalQuestions: number
  questionStem: string
  options: string[]
  selectedIndex: number | null
  onSelect: (index: number) => void
  onCheck: () => void
  checked: boolean
}

export const QuestionCard = ({
  questionNumber,
  totalQuestions,
  questionStem,
  options,
  selectedIndex,
  onSelect,
  onCheck,
  checked,
}: QuestionCardProps) => (
  <div className='rounded-md border border-[#D4DAE3] bg-white p-4 flex flex-col gap-4'>
    {/* Question header */}
    <div className='flex items-center gap-2'>
      <span className='text-[10px] font-medium text-[#8896A7] uppercase tracking-wide'>
        Question {questionNumber} of {totalQuestions}
      </span>
    </div>

    {/* Stem */}
    <p className='text-sm text-[#1A2332] leading-relaxed'>{questionStem}</p>

    {/* Options */}
    <div className='flex flex-col gap-2'>
      {options.map((option, idx) => {
        const isSelected = selectedIndex === idx
        return (
          <button
            key={idx}
            type='button'
            disabled={checked}
            onClick={() => onSelect(idx)}
            className={[
              'flex items-start gap-3 rounded-sm border px-3 py-2.5 text-left text-xs transition-colors duration-150 ease-out',
              checked
                ? 'cursor-default'
                : 'cursor-pointer hover:border-[#1B3FC4]/40 hover:bg-[#F8F7F5]',
              isSelected && !checked
                ? 'border-[#1B3FC4] bg-[#EEF2FC]'
                : !checked
                ? 'border-[#D4DAE3]'
                : 'border-[#D4DAE3]',
            ]
              .filter(Boolean)
              .join(' ')}
          >
            <span
              className={[
                'shrink-0 w-5 h-5 rounded-sm border text-[10px] font-bold flex items-center justify-center transition-colors duration-150',
                isSelected && !checked
                  ? 'border-[#1B3FC4] bg-[#1B3FC4] text-white'
                  : 'border-[#D4DAE3] text-[#8896A7]',
              ].join(' ')}
            >
              {String.fromCharCode(65 + idx)}
            </span>
            <span className='text-[#1A2332] leading-relaxed'>{option}</span>
          </button>
        )
      })}
    </div>

    {/* Check button */}
    {!checked && (
      <div className='flex justify-end pt-1'>
        <button
          type='button'
          disabled={selectedIndex === null}
          onClick={onCheck}
          className='rounded-sm bg-[#1B3FC4] px-5 py-2 text-xs font-medium text-white hover:bg-[#1535A8] disabled:opacity-40 disabled:cursor-not-allowed transition-colors duration-150 ease-out'
        >
          Check Answer
        </button>
      </div>
    )}
  </div>
)

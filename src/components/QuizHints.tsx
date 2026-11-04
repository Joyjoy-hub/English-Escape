import { useState } from 'react'

import { useGameStore } from '../store/gameStore'
import type { HotspotHints } from '../types/mission'

const stepTitles = ['질문의 한글 뜻', '힌트', '정답'] as const
const buttonLabels = ['힌트', '다음 힌트', '정답 보기'] as const

type QuizHintsProps = {
  hints: HotspotHints
}

export function QuizHints({ hints }: QuizHintsProps) {
  const useHint = useGameStore((state) => state.useHint)
  const [shown, setShown] = useState(0)
  const done = shown >= hints.length

  function revealNext() {
    if (done) return
    useHint()
    setShown((count) => count + 1)
  }

  return (
    <div>
      <button type="button" className="hotspot-modal-hint" onClick={revealNext} disabled={done}>
        {done ? '힌트를 모두 봤어요' : buttonLabels[shown]}
      </button>
      {shown > 0 ? (
        <ol className="hotspot-modal-hints">
          {hints.slice(0, shown).map((hint, index) => (
            <li key={stepTitles[index]}>
              <span>{stepTitles[index]}</span>
              {hint}
            </li>
          ))}
        </ol>
      ) : null}
    </div>
  )
}

import { useState } from 'react'

import type { DepartureListenPuzzle as ListenPuzzleData } from '../../types/departureMission'
import { speakEnglish } from './speak'

type DepartureListenPuzzleProps = {
  puzzle: ListenPuzzleData
  onClear: (clueLabel: string, clueValue: string) => void
  onUseHint: () => void
}

function normalize(value: string) {
  return value.trim().toLowerCase().replace(/\s+/g, ' ')
}

export function DepartureListenPuzzleView({ puzzle, onClear, onUseHint }: DepartureListenPuzzleProps) {
  const [input, setInput] = useState('')
  const [feedback, setFeedback] = useState<string | null>(null)
  const [hintShown, setHintShown] = useState(false)
  const [cleared, setCleared] = useState(false)

  function play(rate = 1) {
    speakEnglish(puzzle.line, rate)
  }

  function submit() {
    if (cleared) return
    const ok = puzzle.accept.some((item) => normalize(item) === normalize(input))
    if (ok) {
      setCleared(true)
      setFeedback(`단서를 얻었어요: ${puzzle.clueLabel} = ${puzzle.clueValue}`)
      onClear(puzzle.clueLabel, puzzle.clueValue)
      return
    }
    setFeedback(puzzle.wrongExplain)
  }

  function showHint() {
    if (hintShown) return
    setHintShown(true)
    onUseHint()
    setFeedback(puzzle.hintKo)
  }

  return (
    <section className="departure-puzzle">
      <header className="departure-puzzle-head">
        <p className="departure-kicker">{puzzle.npcName}</p>
        <h2>{puzzle.title}</h2>
        <p>{puzzle.prompt}</p>
      </header>

      <div className="departure-actions">
        <button type="button" onClick={() => play(1)}>
          방송 듣기
        </button>
        <button type="button" onClick={() => play(puzzle.slowRate)}>
          {puzzle.askAgainChoice}
        </button>
      </div>

      <label className="departure-field">
        <span>정답 입력</span>
        <input
          value={input}
          onChange={(event) => setInput(event.target.value)}
          placeholder="예: 15"
          disabled={cleared}
        />
      </label>

      <div className="departure-actions">
        <button type="button" onClick={submit} disabled={cleared || input.trim() === ''}>
          제출
        </button>
        <button type="button" className="is-ghost" onClick={showHint} disabled={hintShown || cleared}>
          힌트 보기
        </button>
      </div>

      {feedback ? (
        <p className={cleared ? 'departure-feedback is-ok' : 'departure-feedback'} role="status">
          {feedback}
        </p>
      ) : null}
    </section>
  )
}

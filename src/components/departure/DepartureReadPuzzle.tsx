import { useState } from 'react'

import type { DepartureReadPuzzle as ReadPuzzleData } from '../../types/departureMission'

type DepartureReadPuzzleProps = {
  puzzle: ReadPuzzleData
  onClear: (clueLabel: string, clueValue: string) => void
  onUseHint: () => void
}

export function DepartureReadPuzzleView({ puzzle, onClear, onUseHint }: DepartureReadPuzzleProps) {
  const [input, setInput] = useState('')
  const [feedback, setFeedback] = useState<string | null>(null)
  const [hintShown, setHintShown] = useState(false)
  const [cleared, setCleared] = useState(false)

  function submit() {
    if (cleared) return
    if (input.trim().toUpperCase() === puzzle.answer.toUpperCase()) {
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
        <p className="departure-kicker">Read</p>
        <h2>{puzzle.title}</h2>
        <p>{puzzle.prompt}</p>
      </header>

      <article className="departure-document">
        <h3>{puzzle.documentTitle}</h3>
        <ul>
          {puzzle.documentLines.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
      </article>

      <label className="departure-field">
        <span>{puzzle.lockPrompt}</span>
        <input
          value={input}
          onChange={(event) => setInput(event.target.value)}
          placeholder="예: 15B"
          disabled={cleared}
        />
      </label>

      <div className="departure-actions">
        <button type="button" onClick={submit} disabled={cleared || input.trim() === ''}>
          자물쇠 열기
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

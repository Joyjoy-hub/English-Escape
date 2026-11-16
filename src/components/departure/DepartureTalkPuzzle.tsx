import { useState } from 'react'

import type { DepartureTalkPuzzle as TalkPuzzleData } from '../../types/departureMission'
import { speakEnglish } from './speak'

type DepartureTalkPuzzleProps = {
  puzzle: TalkPuzzleData
  onClear: (clueLabel: string, clueValue: string) => void
  onUseHint: () => void
}

export function DepartureTalkPuzzleView({ puzzle, onClear, onUseHint }: DepartureTalkPuzzleProps) {
  const [feedback, setFeedback] = useState<string | null>(null)
  const [hintShown, setHintShown] = useState(false)
  const [cleared, setCleared] = useState(false)

  function playNpc(rate = 1) {
    speakEnglish(puzzle.line, rate)
  }

  function choose(choiceId: string) {
    if (cleared) return
    const choice = puzzle.choices.find((item) => item.id === choiceId)
    if (!choice) return

    if (choice.id === puzzle.askAgainChoiceId) {
      speakEnglish(puzzle.line, puzzle.slowRate)
      setFeedback(`${choice.reply} / ${choice.explain}`)
      return
    }

    if (choice.quality === 'good') {
      setCleared(true)
      setFeedback(`${choice.reply} / ${choice.explain}`)
      onClear(puzzle.clueLabel, puzzle.clueValue)
      return
    }

    setFeedback(`${choice.reply} / ${choice.explain} 다시 골라 보세요.`)
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
        <p>{puzzle.situation}</p>
      </header>

      <article className="departure-npc-line">
        <p>{puzzle.line}</p>
        <button type="button" onClick={() => playNpc(1)}>
          NPC 대사 듣기
        </button>
      </article>

      <div className="departure-choice-list" role="group" aria-label="답변 선택">
        {puzzle.choices.map((choice) => (
          <button key={choice.id} type="button" disabled={cleared} onClick={() => choose(choice.id)}>
            {choice.text}
          </button>
        ))}
      </div>

      <button type="button" className="is-ghost" onClick={showHint} disabled={hintShown || cleared}>
        힌트 보기
      </button>

      {feedback ? (
        <p className={cleared ? 'departure-feedback is-ok' : 'departure-feedback'} role="status">
          {feedback}
        </p>
      ) : null}
    </section>
  )
}

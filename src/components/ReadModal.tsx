import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'

import type { ClueId, ReadHotspot } from '../types/mission'
import { QuizHints } from './QuizHints'
import './hotspot-modal.css'

type ReadModalProps = {
  hotspot: ReadHotspot | null
  onClose: () => void
  onCollect: (clueId: ClueId, value: string) => void
}

export function ReadModal({ hotspot, onClose, onCollect }: ReadModalProps) {
  const [solved, setSolved] = useState(false)
  const [feedback, setFeedback] = useState<string | null>(null)
  const [wrongId, setWrongId] = useState<string | null>(null)

  useEffect(() => {
    setSolved(false)
    setFeedback(null)
    setWrongId(null)
  }, [hotspot?.id])

  if (!hotspot) return null

  function choose(choiceId: string) {
    if (!hotspot || solved) return
    if (choiceId === hotspot.answer) {
      setSolved(true)
      setWrongId(null)
      setFeedback(`얻은 단서: ${hotspot.clueValue}`)
      onCollect(hotspot.clueId, hotspot.clueValue)
      return
    }
    setWrongId(choiceId)
    setFeedback('지문과 다른 답이에요. 다시 읽어 보세요.')
  }

  return createPortal(
    <div className="hotspot-modal-backdrop" onClick={onClose}>
      <div
        className="hotspot-modal-panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="read-modal-title"
        onClick={(event) => event.stopPropagation()}
      >
        <header className="hotspot-modal-header">
          <h2 id="read-modal-title">{hotspot.label}</h2>
          <button type="button" className="hotspot-modal-close" onClick={onClose}>
            닫기
          </button>
        </header>
        <div className="hotspot-modal-body">
          <p className="hotspot-modal-caption">지문</p>
          <p className="hotspot-modal-passage">{hotspot.text}</p>
          <p className="hotspot-modal-caption">질문</p>
          <p className="hotspot-modal-question">{hotspot.question}</p>
          <QuizHints key={hotspot.id} hints={hotspot.hints} />
          <div className="hotspot-modal-choices">
            {hotspot.choices.map((choice) => (
              <button
                key={choice.id}
                type="button"
                className={choice.id === wrongId ? 'hotspot-modal-choice is-wrong' : 'hotspot-modal-choice'}
                disabled={solved}
                onClick={() => choose(choice.id)}
              >
                {choice.text}
              </button>
            ))}
          </div>
          {feedback ? (
            <p className={solved ? 'hotspot-modal-feedback is-success' : 'hotspot-modal-feedback'} role="status">
              {feedback}
            </p>
          ) : null}
        </div>
      </div>
    </div>,
    document.body,
  )
}

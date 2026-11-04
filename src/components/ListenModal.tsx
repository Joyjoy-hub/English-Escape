import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'

import type { ClueId, ListenHotspot } from '../types/mission'
import { QuizHints } from './QuizHints'
import './hotspot-modal.css'

type ListenModalProps = {
  hotspot: ListenHotspot | null
  onClose: () => void
  onCollect: (clueId: ClueId, value: string) => void
}

function speakEnglish(text: string) {
  if (!('speechSynthesis' in window)) return false
  window.speechSynthesis.cancel()
  const utterance = new SpeechSynthesisUtterance(text)
  utterance.lang = 'en-US'
  window.speechSynthesis.speak(utterance)
  return true
}

export function ListenModal({ hotspot, onClose, onCollect }: ListenModalProps) {
  const [solved, setSolved] = useState(false)
  const [feedback, setFeedback] = useState<string | null>(null)
  const [wrongId, setWrongId] = useState<string | null>(null)
  const [speechError, setSpeechError] = useState<string | null>(null)

  useEffect(() => {
    setSolved(false)
    setFeedback(null)
    setWrongId(null)
    setSpeechError(null)
    return () => {
      if ('speechSynthesis' in window) window.speechSynthesis.cancel()
    }
  }, [hotspot?.id])

  if (!hotspot) return null

  function play() {
    if (!hotspot) return
    if (!speakEnglish(hotspot.text)) {
      setSpeechError('이 브라우저에서는 음성을 재생할 수 없어요.')
    }
  }

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
    setFeedback('방송과 다른 답이에요. 다시 들어 보세요.')
  }

  return createPortal(
    <div className="hotspot-modal-backdrop" onClick={onClose}>
      <div
        className="hotspot-modal-panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="listen-modal-title"
        onClick={(event) => event.stopPropagation()}
      >
        <header className="hotspot-modal-header">
          <h2 id="listen-modal-title">{hotspot.label}</h2>
          <button type="button" className="hotspot-modal-close" onClick={onClose}>
            닫기
          </button>
        </header>
        <div className="hotspot-modal-body">
          <button type="button" className="hotspot-modal-action" onClick={play}>
            듣기
          </button>
          {speechError ? (
            <p className="hotspot-modal-feedback" role="status">
              {speechError}
            </p>
          ) : null}
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

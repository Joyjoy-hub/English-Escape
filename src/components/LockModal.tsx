import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { createPortal } from 'react-dom'

import type { CollectedClue } from '../store/gameStore'
import type { LockHotspot } from '../types/mission'
import './hotspot-modal.css'

type LockModalProps = {
  hotspot: LockHotspot | null
  clues: CollectedClue[]
  onClose: () => void
  onUnlock: (lockId: string) => void
}

export function LockModal({ hotspot, clues, onClose, onUnlock }: LockModalProps) {
  const [code, setCode] = useState('')
  const [solved, setSolved] = useState(false)
  const [feedback, setFeedback] = useState<string | null>(null)

  useEffect(() => {
    setCode('')
    setSolved(false)
    setFeedback(null)
  }, [hotspot?.id])

  if (!hotspot) return null

  const ready = hotspot.requires.every((clueId) => clues.some((clue) => clue.id === clueId))

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!hotspot || !ready || solved) return
    if (code.length !== 3) {
      setFeedback('세 자리 코드를 입력해 주세요.')
      return
    }
    if (code !== hotspot.answer) {
      setFeedback('코드가 맞지 않아요. 단서를 다시 확인해 보세요.')
      return
    }
    setSolved(true)
    setFeedback('잠금이 풀렸어요.')
    onUnlock(hotspot.id)
  }

  return createPortal(
    <div className="hotspot-modal-backdrop" onClick={onClose}>
      <div
        className="hotspot-modal-panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="lock-modal-title"
        onClick={(event) => event.stopPropagation()}
      >
        <header className="hotspot-modal-header">
          <h2 id="lock-modal-title">{hotspot.label}</h2>
          <button type="button" className="hotspot-modal-close" onClick={onClose}>
            닫기
          </button>
        </header>
        <div className="hotspot-modal-body">
          <p className="hotspot-modal-prompt">{hotspot.prompt}</p>
          {ready ? (
            <form onSubmit={submit}>
              <label className="hotspot-modal-code">
                <span>세 자리 코드</span>
                <input
                  inputMode="numeric"
                  autoComplete="off"
                  maxLength={3}
                  value={code}
                  disabled={solved}
                  onChange={(event) => {
                    setCode(event.target.value.replace(/\D/g, '').slice(0, 3))
                    setFeedback(null)
                  }}
                />
              </label>
              <button type="submit" className="hotspot-modal-action" disabled={solved}>
                열기
              </button>
            </form>
          ) : (
            <p className="hotspot-modal-feedback" role="status">
              아직 단서가 부족해요
            </p>
          )}
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

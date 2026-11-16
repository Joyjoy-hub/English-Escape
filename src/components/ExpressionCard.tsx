import type { Expression } from '../types/mission'

import { useSettingsStore } from '../store/settingsStore'
import './ExpressionCard.css'

type ExpressionCardProps = {
  expression: Expression
  variant?: 'default' | 'journal'
  highlighted?: boolean
}

function speakEnglish(text: string) {
  if (!('speechSynthesis' in window)) return
  window.speechSynthesis.cancel()
  const utterance = new SpeechSynthesisUtterance(text)
  utterance.lang = 'en-US'
  window.speechSynthesis.speak(utterance)
}

export function ExpressionCard({ expression, variant = 'default', highlighted = false }: ExpressionCardProps) {
  const soundEnabled = useSettingsStore((state) => state.soundEnabled)

  function handleSpeak() {
    if (!soundEnabled) return
    speakEnglish(expression.en)
  }

  if (variant === 'journal') {
    return (
      <article className={highlighted ? 'expression-journal is-highlighted' : 'expression-journal'}>
        <span className="expression-journal-star" aria-hidden="true">
          {highlighted ? '★' : '☆'}
        </span>
        <div className="expression-journal-copy">
          <p className="expression-journal-en">{expression.en}</p>
          <p className="expression-journal-ko">{expression.ko}</p>
        </div>
        <button type="button" className="expression-journal-speak" aria-label="발음 듣기" onClick={handleSpeak}>
          🔊
        </button>
      </article>
    )
  }

  return (
    <article className="expression-card">
      <p className="expression-en">{expression.en}</p>
      <p className="expression-ko">{expression.ko}</p>
      <p className="expression-usage">{expression.usage}</p>
      <button type="button" className="expression-speak" onClick={handleSpeak}>
        발음 듣기
      </button>
    </article>
  )
}
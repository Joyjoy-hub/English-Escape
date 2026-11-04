import type { Expression } from '../types/mission'

import './ExpressionCard.css'

type ExpressionCardProps = {
  expression: Expression
}

function speakEnglish(text: string) {
  if (!('speechSynthesis' in window)) return
  window.speechSynthesis.cancel()
  const utterance = new SpeechSynthesisUtterance(text)
  utterance.lang = 'en-US'
  window.speechSynthesis.speak(utterance)
}

export function ExpressionCard({ expression }: ExpressionCardProps) {
  return (
    <article className="expression-card">
      <p className="expression-en">{expression.en}</p>
      <p className="expression-ko">{expression.ko}</p>
      <p className="expression-usage">{expression.usage}</p>
      <button type="button" className="expression-speak" onClick={() => speakEnglish(expression.en)}>
        발음 듣기
      </button>
    </article>
  )
}

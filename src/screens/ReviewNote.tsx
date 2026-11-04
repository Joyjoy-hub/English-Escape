import { useReviewStore } from '../store/reviewStore'
import './ReviewNote.css'

function speakEnglish(text: string) {
  if (!('speechSynthesis' in window)) return
  window.speechSynthesis.cancel()
  const utterance = new SpeechSynthesisUtterance(text)
  utterance.lang = 'en-US'
  window.speechSynthesis.speak(utterance)
}

export function ReviewNote() {
  const items = useReviewStore((state) => state.items)
  const removeReviewItem = useReviewStore((state) => state.removeReviewItem)
  const notes = [...items].sort((left, right) => right.createdAt.localeCompare(left.createdAt))

  return (
    <main className="review-note">
      <p className="page-kicker">English Escape</p>
      <h1>복습 노트</h1>
      {notes.length === 0 ? (
        <p className="review-empty">아직 저장된 표현이 없어요</p>
      ) : (
        <ul className="review-list">
          {notes.map((item) => (
            <li key={item.id}>
              <article className="review-card">
                <p className="review-label">내가 쓴 표현</p>
                <p className="review-mine">{item.mine}</p>
                <p className="review-label">더 자연스러운 표현</p>
                <p className="review-natural">{item.natural}</p>
                <div className="review-actions">
                  <button type="button" onClick={() => speakEnglish(item.natural)}>
                    발음 듣기
                  </button>
                  <button type="button" onClick={() => removeReviewItem(item.id)}>
                    삭제
                  </button>
                </div>
              </article>
            </li>
          ))}
        </ul>
      )}
    </main>
  )
}

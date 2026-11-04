import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router'

import { ExpressionCard } from '../components/ExpressionCard'
import { HomeButton } from '../components/HomeButton'
import { day1Mission } from '../data/missions/day1'
import { useGameStore } from '../store/gameStore'
import { useReviewStore } from '../store/reviewStore'
import { starRating } from '../utils/scoring'
import './ResultPage.css'

const hasNextMission = false

export function ResultPage() {
  const storedMission = useGameStore((state) => state.mission)
  const hintCount = useGameStore((state) => state.hintCount)
  const mistakes = useGameStore((state) => state.mistakes)
  const addReviewItems = useReviewStore((state) => state.addReviewItems)
  const navigate = useNavigate()
  const mission = !storedMission || storedMission.id === day1Mission.id ? day1Mission : storedMission
  const stars = starRating(hintCount, mistakes.length)
  const [reviewReady, setReviewReady] = useState(() => useReviewStore.persist.hasHydrated())

  useEffect(() => {
    if (useReviewStore.persist.hasHydrated()) {
      setReviewReady(true)
      return
    }
    return useReviewStore.persist.onFinishHydration(() => setReviewReady(true))
  }, [])

  useEffect(() => {
    if (!reviewReady) return
    addReviewItems(
      mistakes.map((mistake) => ({
        missionId: mission.id,
        mine: mistake.text,
        natural: mistake.naturalVersion,
      })),
    )
  }, [addReviewItems, mission.id, mistakes, reviewReady])

  return (
    <main className="result-page">
      <header>
        <HomeButton />
        <p className="page-kicker">English Escape</p>
        <h1>탈출 성공!</h1>
        <p className="result-stars" role="img" aria-label={`별 ${stars}개`}>
          {[1, 2, 3].map((value) => (
            <span key={value} className={value <= stars ? 'is-on' : undefined} aria-hidden="true">
              {value <= stars ? '★' : '☆'}
            </span>
          ))}
        </p>
      </header>

      <section className="result-section">
        <h2>이번 미션 핵심 표현</h2>
        {mission.expressions.map((expression) => (
          <ExpressionCard key={expression.en} expression={expression} />
        ))}
      </section>

      <section className="result-section">
        <h2>새로 배운 단어</h2>
        <ul className="result-words">
          {mission.vocabulary.map((item) => (
            <li key={item.word}>
              <strong>{item.word}</strong>
              <span>{item.meaning}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="result-section">
        <h2>교정</h2>
        {mistakes.length === 0 ? (
          <p className="result-perfect">완벽해요! 교정할 표현이 없어요</p>
        ) : (
          <div className="result-corrections">
            {mistakes.map((mistake) => (
              <article key={`${mistake.text}-${mistake.naturalVersion}`} className="result-correction">
                <span>내가 쓴 표현</span>
                <p>{mistake.text}</p>
                <span className="result-correction-arrow" aria-hidden="true">
                  →
                </span>
                <span>더 자연스러운 표현</span>
                <p>{mistake.naturalVersion}</p>
              </article>
            ))}
          </div>
        )}
      </section>

      <div className="result-actions">
        <button type="button" disabled={!hasNextMission}>
          다음 미션
        </button>
        {hasNextMission ? null : <p className="result-soon">곧 공개돼요</p>}
        <button type="button" onClick={() => navigate('/review')}>
          복습 노트 보기
        </button>
        <button type="button" disabled>
          오늘 경험을 영어로 써볼래요?
        </button>
      </div>
    </main>
  )
}

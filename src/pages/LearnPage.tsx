import { useState } from 'react'
import { useNavigate } from 'react-router'

import { ExpressionCard } from '../components/ExpressionCard'
import { countryMapPins } from '../data/countryMap'
import { day1Mission } from '../data/missions/day1'
import { useGameStore } from '../store/gameStore'
import './LearnPage.css'

export function LearnPage() {
  const navigate = useNavigate()
  const mission = useGameStore((state) => state.mission)
  const goToStep = useGameStore((state) => state.goToStep)
  const [index, setIndex] = useState(0)

  const activeMission = mission ?? day1Mission
  const expressions = activeMission.expressions
  const safeIndex = Math.min(index, Math.max(expressions.length - 1, 0))
  const current = expressions[safeIndex]
  const isLast = expressions.length > 0 && safeIndex === expressions.length - 1
  const countryPin =
    countryMapPins.find((pin) => pin.id === activeMission.country?.id) ??
    countryMapPins.find((pin) => pin.id === 'new-zealand') ??
    null

  function startExplore() {
    goToStep('explore')
    if (useGameStore.getState().step === 'explore') {
      navigate('/explore')
    }
  }

  return (
    <main className="learn-screen">
      <header className="learn-hero">
        {countryPin ? <img className="learn-hero-image" src={countryPin.landmark} alt="" /> : null}
        <div className="learn-hero-veil" aria-hidden="true" />
        <button type="button" className="learn-back" aria-label="이전 화면으로" onClick={() => navigate('/home')}>
          ←
        </button>
        <div className="learn-hero-copy">
          <p className="learn-brand">English Escape</p>
          <p className="learn-place">
            {activeMission.country?.name ?? '뉴질랜드'} · {activeMission.place?.name ?? '공항'}
          </p>
          <h1>학습</h1>
          <p>이번 미션에서 쓸 표현을 익히세요</p>
        </div>
      </header>

      <section className="learn-sheet">
        <div className="learn-progress">
          <p className="learn-progress-label">표현 카드</p>
          <p>
            {expressions.length === 0 ? '0 / 0' : `${safeIndex + 1} / ${expressions.length}`}
          </p>
        </div>

        {current ? <ExpressionCard expression={current} /> : <p className="learn-empty">학습할 표현이 없어요</p>}

        <div className="learn-controls">
          <button
            type="button"
            className="learn-nav"
            disabled={safeIndex === 0}
            onClick={() => setIndex((value) => Math.max(value - 1, 0))}
          >
            이전
          </button>
          <div className="learn-dots" aria-label="표현 진행">
            {expressions.map((expression, dotIndex) => (
              <button
                key={expression.en}
                type="button"
                className={dotIndex === safeIndex ? 'learn-dot is-active' : 'learn-dot'}
                aria-label={`${dotIndex + 1}번째 표현`}
                aria-current={dotIndex === safeIndex ? 'true' : undefined}
                onClick={() => setIndex(dotIndex)}
              />
            ))}
          </div>
          <button
            type="button"
            className="learn-nav"
            disabled={isLast || expressions.length === 0}
            onClick={() => setIndex((value) => Math.min(value + 1, expressions.length - 1))}
          >
            다음
          </button>
        </div>

        {isLast ? (
          <button type="button" className="learn-start" onClick={startExplore}>
            미션 시작
          </button>
        ) : null}
      </section>
    </main>
  )
}

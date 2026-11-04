import { useState } from 'react'
import { useNavigate } from 'react-router'

import { ExpressionCard } from '../components/ExpressionCard'
import { HomeButton } from '../components/HomeButton'
import { PageFrame } from '../components/PageFrame'
import { day1Mission } from '../data/missions/day1'
import { useGameStore } from '../store/gameStore'
import './LearnPage.css'

export function LearnPage() {
  const navigate = useNavigate()
  const mission = useGameStore((state) => state.mission)
  const goToStep = useGameStore((state) => state.goToStep)
  const [index, setIndex] = useState(0)

  const expressions = mission?.expressions ?? day1Mission.expressions
  const safeIndex = Math.min(index, Math.max(expressions.length - 1, 0))
  const current = expressions[safeIndex]
  const isLast = expressions.length > 0 && safeIndex === expressions.length - 1

  function startExplore() {
    goToStep('explore')
    if (useGameStore.getState().step === 'explore') {
      navigate('/explore')
    }
  }

  return (
    <PageFrame title="학습" description="이번 미션에서 쓸 표현을 익히세요." leading={<HomeButton />}>
      {current ? <ExpressionCard expression={current} /> : null}
      <div className="learn">
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
            disabled={isLast}
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
      </div>
    </PageFrame>
  )
}

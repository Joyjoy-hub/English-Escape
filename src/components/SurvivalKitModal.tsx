import { useState } from 'react'
import { createPortal } from 'react-dom'

import { useGameStore } from '../store/gameStore'
import { useSettingsStore } from '../store/settingsStore'
import { ExpressionCard } from './ExpressionCard'
import './SurvivalKitModal.css'

type SurvivalKitModalProps = {
  isOpen: boolean
  onClose: () => void
}

type SurvivalKitTab = 'expressions' | 'vocabulary' | 'memo'

const TAB_COPY: Record<
  SurvivalKitTab,
  { label: string; icon: string; title: string; intro: string }
> = {
  expressions: {
    label: '핵심 표현',
    icon: '💬',
    title: '핵심 표현',
    intro: '입국 심사에서 자주 사용하는 유용한 표현이에요.',
  },
  vocabulary: {
    label: '필수 어휘',
    icon: '📖',
    title: '필수 어휘',
    intro: '이번 미션에서 꼭 알아두면 좋은 단어예요.',
  },
  memo: {
    label: '메모',
    icon: '📋',
    title: '메모',
    intro: '미션 목표와 상황을 짧게 정리해 두었어요.',
  },
}

function speakEnglish(text: string) {
  if (!('speechSynthesis' in window)) return
  window.speechSynthesis.cancel()
  const utterance = new SpeechSynthesisUtterance(text)
  utterance.lang = 'en-US'
  window.speechSynthesis.speak(utterance)
}

export function SurvivalKitModal({ isOpen, onClose }: SurvivalKitModalProps) {
  const mission = useGameStore((state) => state.mission)
  const soundEnabled = useSettingsStore((state) => state.soundEnabled)
  const [tab, setTab] = useState<SurvivalKitTab>('expressions')

  if (!isOpen) return null

  const expressions = mission?.expressions ?? []
  const vocabulary = mission?.vocabulary ?? []
  const countryName = mission?.country.name ?? 'New Zealand'
  const tabMeta = TAB_COPY[tab]

  function playWord(word: string) {
    if (!soundEnabled) return
    speakEnglish(word)
  }

  return createPortal(
    <div className="survival-kit-backdrop" onClick={onClose}>
      <div
        className="survival-kit-journal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="survival-kit-title"
        onClick={(event) => event.stopPropagation()}
      >
        <aside className="survival-kit-spine">
          <div className="survival-kit-tag">
            <span className="survival-kit-tag-icon" aria-hidden="true">
              ✈
            </span>
            <p id="survival-kit-title" className="survival-kit-tag-title">
              Survival Kit
            </p>
            <p className="survival-kit-tag-sub">여행 영어 가이드</p>
          </div>

          <nav className="survival-kit-nav" aria-label="수첩 메뉴">
            {(Object.keys(TAB_COPY) as SurvivalKitTab[]).map((key) => (
              <button
                key={key}
                type="button"
                className={tab === key ? 'survival-kit-tab is-active' : 'survival-kit-tab'}
                onClick={() => setTab(key)}
              >
                <span className="survival-kit-tab-icon" aria-hidden="true">
                  {TAB_COPY[key].icon}
                </span>
                <span>{TAB_COPY[key].label}</span>
              </button>
            ))}
          </nav>

          <div className="survival-kit-polaroid" aria-hidden="true">
            <span className="survival-kit-polaroid-pin" />
            <div className="survival-kit-polaroid-photo">{countryName.toUpperCase()}</div>
            <p className="survival-kit-polaroid-label">{countryName}</p>
          </div>
        </aside>

        <section className="survival-kit-page">
          <button type="button" className="survival-kit-close-x" aria-label="닫기" onClick={onClose}>
            ×
          </button>

          <div className="survival-kit-stamp" aria-hidden="true">
            IMMIGRATION
            <span>✈</span>
          </div>

          <header className="survival-kit-page-head">
            <h2 className="survival-kit-page-title">
              <span aria-hidden="true">{tabMeta.icon}</span>
              {tabMeta.title}
            </h2>
            <p className="survival-kit-page-intro">{tabMeta.intro}</p>
          </header>

          <div className="survival-kit-scroll">
            {tab === 'expressions' ? (
              expressions.length === 0 ? (
                <p className="survival-kit-empty">이번 미션의 표현이 없습니다.</p>
              ) : (
                expressions.map((expression, index) => (
                  <ExpressionCard key={expression.en} expression={expression} variant="journal" highlighted={index === 0} />
                ))
              )
            ) : null}

            {tab === 'vocabulary' ? (
              vocabulary.length === 0 ? (
                <p className="survival-kit-empty">등록된 어휘가 없습니다.</p>
              ) : (
                <div className="survival-kit-vocab-list">
                  {vocabulary.map((item) => (
                    <div key={item.word} className="survival-kit-vocab-row">
                      <div>
                        <p className="survival-kit-vocab-word">{item.word}</p>
                        <p className="survival-kit-vocab-meaning">{item.meaning}</p>
                      </div>
                      <button
                        type="button"
                        className="expression-journal-speak"
                        aria-label={`${item.word} 발음 듣기`}
                        onClick={() => playWord(item.word)}
                      >
                        🔊
                      </button>
                    </div>
                  ))}
                </div>
              )
            ) : null}

            {tab === 'memo' ? (
              <div className="survival-kit-memo">
                <div className="survival-kit-memo-box">{mission?.intro ?? '미션 메모가 없습니다.'}</div>
              </div>
            ) : null}
          </div>
        </section>
      </div>
    </div>,
    document.body,
  )
}
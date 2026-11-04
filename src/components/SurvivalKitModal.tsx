import { createPortal } from 'react-dom'

import { useGameStore } from '../store/gameStore'
import { ExpressionCard } from './ExpressionCard'

type SurvivalKitModalProps = {
  isOpen: boolean
  onClose: () => void
}

export function SurvivalKitModal({ isOpen, onClose }: SurvivalKitModalProps) {
  const expressions = useGameStore((state) => state.mission?.expressions ?? [])

  if (!isOpen) return null

  return createPortal(
    <>
      <style>{survivalKitCss}</style>
      <div className="survival-kit-backdrop" onClick={onClose}>
        <div
          className="survival-kit-panel"
          role="dialog"
          aria-modal="true"
          aria-labelledby="survival-kit-title"
          onClick={(event) => event.stopPropagation()}
        >
          <header className="survival-kit-header">
            <h2 id="survival-kit-title">Survival Kit 수첩</h2>
            <button type="button" className="survival-kit-close" onClick={onClose}>
              닫기
            </button>
          </header>
          <div className="survival-kit-list">
            {expressions.length === 0 ? (
              <p className="survival-kit-empty">이번 미션의 표현이 없습니다.</p>
            ) : (
              expressions.map((expression) => (
                <ExpressionCard key={expression.en} expression={expression} />
              ))
            )}
          </div>
        </div>
      </div>
    </>,
    document.body,
  )
}

const survivalKitCss = `
.survival-kit-backdrop {
  position: fixed;
  inset: 0;
  z-index: 20;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  box-sizing: border-box;
  padding: 16px;
  background: rgba(18, 11, 7, 0.62);
}

.survival-kit-panel {
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  width: min(100%, 480px);
  max-height: min(85svh, 720px);
  padding: 16px 16px 20px;
  border-radius: 20px 20px 16px 16px;
  border: 1px solid var(--brass-edge);
  background: var(--cream);
}

.survival-kit-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.survival-kit-header h2 {
  margin: 0;
  color: var(--ink);
  font-family: Cinzel, 'Times New Roman', serif;
  font-size: 22px;
  line-height: 1.3;
  overflow-wrap: anywhere;
}

.survival-kit-close {
  flex: 0 0 auto;
  min-height: 48px;
  padding: 12px 16px;
  border: 0;
  border-radius: 12px;
  background: #e8dcc4;
  color: var(--ink);
  font: inherit;
  font-weight: 700;
  cursor: pointer;
}

.survival-kit-list {
  overflow-y: auto;
  min-height: 0;
  margin-top: 4px;
  padding-bottom: 4px;
}

.survival-kit-empty {
  margin: 16px 0 0;
  color: var(--muted);
  overflow-wrap: anywhere;
}

@media (max-width: 380px) {
  .survival-kit-backdrop {
    padding: 8px;
  }

  .survival-kit-header h2 {
    font-size: 20px;
  }
}
`

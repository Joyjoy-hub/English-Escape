import { createPortal } from 'react-dom'

import type { SceneInteractable } from '../types/mission'
import './hotspot-modal.css'

type ObjectStubModalProps = {
  target: SceneInteractable | null
  onClose: () => void
}

export function ObjectStubModal({ target, onClose }: ObjectStubModalProps) {
  if (!target) return null

  return createPortal(
    <div className="hotspot-modal-backdrop" role="presentation" onClick={onClose}>
      <div
        className="hotspot-modal-panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="object-stub-title"
        onClick={(event) => event.stopPropagation()}
      >
        <header className="hotspot-modal-header">
          <h2 id="object-stub-title">{target.label}</h2>
          <button type="button" className="hotspot-modal-close" onClick={onClose} aria-label="닫기">
            ×
          </button>
        </header>

        <div className="hotspot-modal-body">
          <p className="hotspot-modal-caption">미션 준비 중</p>
          <h3 className="object-stub-mission-title">{target.stubTitle}</h3>
          <p className="hotspot-modal-passage">{target.stubMessage}</p>
          <p className="object-stub-note">영어 퍼즐과 NPC 대화는 다음 단계에서 연결됩니다.</p>
        </div>

        <button type="button" className="hotspot-modal-action" onClick={onClose}>
          돌아가기
        </button>
      </div>
    </div>,
    document.body,
  )
}
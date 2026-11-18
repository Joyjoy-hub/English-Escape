import { createPortal } from 'react-dom'

import { getAppPortalRoot } from '../../appPortal'

import type { DeparturePuzzle } from '../../types/departureMission'
import '../hotspot-modal.css'
import '../../pages/DepartureMissionPage.css'
import { DepartureListenPuzzleView } from './DepartureListenPuzzle'
import { DepartureReadPuzzleView } from './DepartureReadPuzzle'
import { DepartureTalkPuzzleView } from './DepartureTalkPuzzle'

type DeparturePuzzleModalProps = {
  puzzle: DeparturePuzzle | null
  label: string
  onClose: () => void
  onClear: (clueLabel: string, clueValue: string) => void
  onUseHint: () => void
}

export function DeparturePuzzleModal({
  puzzle,
  label,
  onClose,
  onClear,
  onUseHint,
}: DeparturePuzzleModalProps) {
  if (!puzzle) return null

  return createPortal(
    <div className="hotspot-modal-backdrop" role="presentation" onClick={onClose}>
      <div
        className="hotspot-modal-panel"
        role="dialog"
        aria-modal="true"
        aria-label={label}
        onClick={(event) => event.stopPropagation()}
      >
        <header className="hotspot-modal-header">
          <h2>{label}</h2>
          <button type="button" className="hotspot-modal-close" onClick={onClose} aria-label="닫기">
            ×
          </button>
        </header>

        <div className="hotspot-modal-body departure-puzzle-modal-body">
          {puzzle.type === 'listen' ? (
            <DepartureListenPuzzleView puzzle={puzzle} onClear={onClear} onUseHint={onUseHint} />
          ) : null}
          {puzzle.type === 'talk' ? (
            <DepartureTalkPuzzleView puzzle={puzzle} onClear={onClear} onUseHint={onUseHint} />
          ) : null}
          {puzzle.type === 'read' ? (
            <DepartureReadPuzzleView puzzle={puzzle} onClear={onClear} onUseHint={onUseHint} />
          ) : null}
        </div>
      </div>
    </div>,
    getAppPortalRoot(),
  )
}

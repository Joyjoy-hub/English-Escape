import type { CollectedClue } from '../store/gameStore'
import type { ClueId } from '../types/mission'
import './ClueDockBar.css'

export type ClueDockSlot = {
  id: ClueId
  label: string
}

const CLUE_GLYPH: Record<string, string> = {
  computer: '💻',
  passport: '🛂',
  guide: '📋',
  phone: '☎',
  officer: '👮',
  drawer: '🗄',
}

type ClueDockBarProps = {
  clues: CollectedClue[]
  slots: ClueDockSlot[]
}

export function ClueDockBar({ clues, slots }: ClueDockBarProps) {
  const foundCount = slots.filter((slot) => clues.some((clue) => clue.id === slot.id)).length

  return (
    <footer className="clue-dock" aria-label="단서 수집">
      <div className="clue-dock-summary">
        <span className="clue-dock-bag" aria-hidden="true">
          <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M8 6V5a4 4 0 0 1 8 0v1" strokeLinecap="round" />
            <rect x="4" y="6" width="16" height="14" rx="3" />
            <path d="M4 11h16" />
          </svg>
        </span>
        <p className="clue-dock-count">
          <span className="visually-hidden">모은 단서</span>
          <strong>{foundCount}</strong>
          <span className="clue-dock-divider">/</span>
          {slots.length}
        </p>
      </div>

      <ul className="clue-dock-slots">
        {slots.map((slot) => {
          const clue = clues.find((item) => item.id === slot.id)
          const found = Boolean(clue)
          return (
            <li key={slot.id} className={found ? 'is-found' : 'is-empty'} title={found ? slot.label : '아직 없음'}>
              {found ? (
                <>
                  <span className="clue-dock-slot-glyph" aria-hidden="true">
                    {CLUE_GLYPH[slot.id] ?? '✦'}
                  </span>
                  <span className="visually-hidden">{slot.label}</span>
                </>
              ) : (
                <>
                  <span className="clue-dock-slot-placeholder" aria-hidden="true">
                    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.4">
                      <path d="M12 3L3 8v8l9 5 9-5V8l-9-5z" />
                    </svg>
                  </span>
                  <span className="visually-hidden">{slot.label} 미발견</span>
                </>
              )}
            </li>
          )
        })}
      </ul>
    </footer>
  )
}
import type { CollectedClue } from '../store/gameStore'
import type { ClueId, Hotspot } from '../types/mission'
import './ClueInventory.css'

type ClueInventoryProps = {
  clues: CollectedClue[]
  hotspots: Hotspot[]
  requiredClueIds: ClueId[]
}

export function ClueInventory({ clues, hotspots, requiredClueIds }: ClueInventoryProps) {
  const slots = requiredClueIds.map((clueId, index) => {
    const clue = clues.find((item) => item.id === clueId)
    const hotspot = hotspots.find(
      (item) => item.type !== 'lock' && 'clueId' in item && item.clueId === clueId,
    )
    return {
      id: clueId,
      index: index + 1,
      label: hotspot && hotspot.type !== 'lock' ? hotspot.label : `단서 ${index + 1}`,
      value: clue?.value ?? null,
    }
  })

  return (
    <section className="clue-inventory" aria-label="모은 단서">
      <div className="clue-inventory-head">
        <h2>단서 가방</h2>
        <p>{slots.filter((slot) => slot.value).length}/{slots.length}</p>
      </div>
      <ul>
        {slots.map((slot) => (
          <li key={slot.id} className={slot.value ? 'is-found' : 'is-hidden'}>
            {slot.value ? (
              <>
                <span>{slot.label}</span>
                <strong>{slot.value}</strong>
              </>
            ) : (
              <>
                <span>미발견</span>
                <strong>?</strong>
              </>
            )}
          </li>
        ))}
      </ul>
    </section>
  )
}

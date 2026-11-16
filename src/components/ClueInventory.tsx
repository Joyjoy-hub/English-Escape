import type { CollectedClue } from '../store/gameStore'
import type { ClueId } from '../types/mission'
import './ClueInventory.css'

export type ClueBagSlot = {
  id: ClueId
  label: string
}

type ClueInventoryProps = {
  clues: CollectedClue[]
  slots: ClueBagSlot[]
}

export function ClueInventory({ clues, slots }: ClueInventoryProps) {
  const rows = slots.map((slot, index) => {
    const clue = clues.find((item) => item.id === slot.id)
    return {
      id: slot.id,
      index: index + 1,
      label: slot.label,
      value: clue?.value ?? null,
    }
  })

  return (
    <section className="clue-inventory" aria-label="모은 단서">
      <div className="clue-inventory-head">
        <h2>단서 가방</h2>
        <p>
          {rows.filter((row) => row.value).length}/{rows.length}
        </p>
      </div>
      <ul>
        {rows.map((slot) => (
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
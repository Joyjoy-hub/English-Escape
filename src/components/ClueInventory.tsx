import type { CollectedClue } from '../store/gameStore'
import type { Hotspot } from '../types/mission'
import './ClueInventory.css'

type ClueInventoryProps = {
  clues: CollectedClue[]
  hotspots: Hotspot[]
}

export function ClueInventory({ clues, hotspots }: ClueInventoryProps) {
  const labeled = hotspots.flatMap((hotspot) => {
    if (hotspot.type === 'lock') return []
    const clue = clues.find((item) => item.id === hotspot.clueId)
    return clue ? [{ id: clue.id, label: hotspot.label, value: clue.value }] : []
  })
  const knownIds = new Set(labeled.map((item) => item.id))
  const items = [
    ...labeled,
    ...clues
      .filter((clue) => !knownIds.has(clue.id))
      .map((clue) => ({ id: clue.id, label: clue.id, value: clue.value })),
  ]

  return (
    <section className="clue-inventory" aria-label="모은 단서">
      <h2>단서</h2>
      {items.length === 0 ? (
        <p>아직 모은 단서가 없어요.</p>
      ) : (
        <ul>
          {items.map((item) => (
            <li key={item.id}>
              <span>{item.label}</span>
              <strong>{item.value}</strong>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}

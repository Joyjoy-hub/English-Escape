import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router'

import { ClueInventory } from '../components/ClueInventory'
import { HomeButton } from '../components/HomeButton'
import { ListenModal } from '../components/ListenModal'
import { LockModal } from '../components/LockModal'
import { PanoramaViewer } from '../components/PanoramaViewer'
import { ReadModal } from '../components/ReadModal'
import { SurvivalKitModal } from '../components/SurvivalKitModal'
import { day1Mission } from '../data/missions/day1'
import { useGameStore } from '../store/gameStore'
import type { Hotspot } from '../types/mission'
import './ExplorePage.css'

export function ExplorePage() {
  const mission = useGameStore((state) => state.mission)
  const clues = useGameStore((state) => state.clues)
  const unlockedLockIds = useGameStore((state) => state.unlockedLockIds)
  const collectClue = useGameStore((state) => state.collectClue)
  const unlockLock = useGameStore((state) => state.unlockLock)
  const goToStep = useGameStore((state) => state.goToStep)
  const navigate = useNavigate()
  const currentMission = mission && mission.id !== day1Mission.id ? mission : day1Mission
  const drawerOpen = unlockedLockIds.includes(currentMission.exit.requiredLockId)
  const [activeHotspot, setActiveHotspot] = useState<Hotspot | null>(null)
  const [kitOpen, setKitOpen] = useState(false)

  const completedIds = useMemo(
    () =>
      currentMission.scene.hotspots.flatMap((hotspot) => {
        if (hotspot.type === 'lock') {
          return unlockedLockIds.includes(hotspot.id) ? [hotspot.id] : []
        }
        return clues.some((clue) => clue.id === hotspot.clueId) ? [hotspot.id] : []
      }),
    [clues, currentMission, unlockedLockIds],
  )

  function goToDialogue() {
    goToStep('dialogue')
    if (useGameStore.getState().step === 'dialogue') {
      navigate('/dialogue')
    }
  }

  return (
    <>
      <PanoramaViewer
        imageUrl="/panorama-placeholder.jpg"
        hotspots={currentMission.scene.hotspots}
        completedIds={completedIds}
        onHotspotClick={setActiveHotspot}
      />
      <HomeButton className="is-fixed" />
      <button type="button" className="explore-kit-button" onClick={() => setKitOpen(true)}>
        Survival Kit 수첩
      </button>
      {drawerOpen ? (
        <section className="explore-call">
          <p>심사관이 부르고 있어요!</p>
          <button type="button" onClick={goToDialogue}>
            대화하러 가기
          </button>
        </section>
      ) : null}
      <ClueInventory clues={clues} hotspots={currentMission.scene.hotspots} />
      <SurvivalKitModal isOpen={kitOpen} onClose={() => setKitOpen(false)} />
      <ReadModal
        hotspot={activeHotspot?.type === 'read' ? activeHotspot : null}
        onClose={() => setActiveHotspot(null)}
        onCollect={collectClue}
      />
      <ListenModal
        hotspot={activeHotspot?.type === 'listen' ? activeHotspot : null}
        onClose={() => setActiveHotspot(null)}
        onCollect={collectClue}
      />
      <LockModal
        hotspot={activeHotspot?.type === 'lock' ? activeHotspot : null}
        clues={clues}
        onClose={() => setActiveHotspot(null)}
        onUnlock={unlockLock}
      />
    </>
  )
}

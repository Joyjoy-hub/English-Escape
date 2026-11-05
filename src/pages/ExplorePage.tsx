import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router'

import { ClueInventory } from '../components/ClueInventory'
import { ListenModal } from '../components/ListenModal'
import { LockModal } from '../components/LockModal'
import { MissionScene } from '../components/MissionScene'
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
  const useHint = useGameStore((state) => state.useHint)
  const goToStep = useGameStore((state) => state.goToStep)
  const navigate = useNavigate()
  const currentMission = mission && mission.id !== day1Mission.id ? mission : day1Mission
  const drawerOpen = unlockedLockIds.includes(currentMission.exit.requiredLockId)
  const [activeHotspot, setActiveHotspot] = useState<Hotspot | null>(null)
  const [kitOpen, setKitOpen] = useState(false)
  const [hintVisible, setHintVisible] = useState(false)

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

  useEffect(() => {
    if (!hintVisible) return
    const timer = window.setTimeout(() => setHintVisible(false), 3200)
    return () => window.clearTimeout(timer)
  }, [hintVisible])

  function goToDialogue() {
    goToStep('dialogue')
    if (useGameStore.getState().step === 'dialogue') {
      navigate('/dialogue')
    }
  }

  function showSearchHint() {
    useHint()
    setHintVisible(true)
  }

  function goBackToLearn() {
    goToStep('learn')
    if (useGameStore.getState().step === 'learn') {
      navigate('/learn')
    }
  }

  return (
    <div className="explore-screen">
      <MissionScene
        imageUrl="/airport-scene.jpg"
        hotspots={currentMission.scene.hotspots}
        completedIds={completedIds}
        hintVisible={hintVisible}
        onHotspotClick={setActiveHotspot}
      />

      <div className="explore-vignette" aria-hidden="true" />

      <header className="explore-top">
        <button type="button" className="explore-back" aria-label="이전 화면으로" onClick={goBackToLearn}>
          ←
        </button>
        <div className="explore-title-card">
          <p className="explore-brand">English Escape</p>
          <h1>{currentMission.title}</h1>
          <p>
            {currentMission.country.name} · {currentMission.place.name}
          </p>
        </div>
        <button type="button" className="explore-kit-button" onClick={() => setKitOpen(true)}>
          Survival Kit 수첩
        </button>
      </header>

      <section className="explore-briefing" aria-label="방탈출 브리핑">
        <p className="explore-briefing-label">상황</p>
        <p>여권이 잠긴 서랍 안에 있어요. 공항을 살펴 단서를 찾고 서랍을 여세요.</p>
        <button type="button" className="explore-hint-button" onClick={showSearchHint}>
          수상한 곳 비추기
        </button>
      </section>

      {drawerOpen ? (
        <section className="explore-call">
          <p>서랍이 열렸어요. 심사관이 부르고 있어요!</p>
          <button type="button" onClick={goToDialogue}>
            대화하러 가기
          </button>
        </section>
      ) : null}

      <ClueInventory
        clues={clues}
        hotspots={currentMission.scene.hotspots}
        requiredClueIds={currentMission.exit.requiredClueIds}
      />
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
    </div>
  )
}

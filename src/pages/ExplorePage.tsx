import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router'

import { ClueDockBar } from '../components/ClueDockBar'
import { ClueInventory } from '../components/ClueInventory'
import { ExploreSettingsModal } from '../components/ExploreSettingsModal'
import { DeparturePuzzleModal } from '../components/departure/DeparturePuzzleModal'
import { ListenModal } from '../components/ListenModal'
import { LockModal } from '../components/LockModal'
import { MissionScene } from '../components/MissionScene'
import type { SceneSpot } from '../components/MissionScene'
import { MissionScenePanels } from '../components/MissionScenePanels'
import { ObjectStubModal } from '../components/ObjectStubModal'
import { ReadModal } from '../components/ReadModal'
import { SurvivalKitModal } from '../components/SurvivalKitModal'
import { airportDepartureMission } from '../data/missions/airportDeparture'
import { resolveMission } from '../data/missions/resolveMission'
import { useGameStore } from '../store/gameStore'
import type { DeparturePuzzle } from '../types/departureMission'
import type { Hotspot, Mission, SceneInteractable } from '../types/mission'
import './ExplorePage.css'
import './DepartureMissionPage.css'

type ClueCard = {
  id: string
  label: string
  value: string
}

export function ExplorePage() {
  const storedMission = useGameStore((state) => state.mission)
  const currentMission = resolveMission(storedMission)

  if (currentMission.scene.panels && currentMission.scene.panels.length > 0) {
    return <GalleryExplore mission={currentMission} />
  }

  if (currentMission.scene.interactables && currentMission.scene.interactables.length > 0) {
    return <PointClickExplore mission={currentMission} />
  }

  return <LegacyExplore mission={currentMission} />
}

type GalleryExploreProps = {
  mission: Mission
}

function GalleryExplore({ mission }: GalleryExploreProps) {
  const clues = useGameStore((state) => state.clues)
  const goToStep = useGameStore((state) => state.goToStep)
  const navigate = useNavigate()
  const panels = mission.scene.panels ?? []
  const interactables = mission.scene.interactables ?? []
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [kitOpen, setKitOpen] = useState(false)

  const clueSlots = useMemo(
    () =>
      mission.exit.requiredClueIds.map((clueId) => {
        const object = interactables.find((item) => item.clueSlotId === clueId)
        return { id: clueId, label: object?.label ?? clueId }
      }),
    [interactables, mission.exit.requiredClueIds],
  )

  function goBackToLearn() {
    goToStep('learn')
    if (useGameStore.getState().step === 'learn') {
      navigate('/learn')
    }
  }

  return (
    <div className="explore-screen explore-screen--gallery">
      <div className="explore-stage-16x9">
      <MissionScenePanels panels={panels} contentCrop />
      <header className="explore-gallery-hud">
        <button type="button" className="explore-back explore-back--ghost" aria-label="이전 화면으로" onClick={goBackToLearn}>
          ←
        </button>
        <button
          type="button"
          className="explore-settings-button explore-settings-button--gallery"
          aria-label="설정"
          onClick={() => setSettingsOpen(true)}
        >
          <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.7">
            <circle cx="12" cy="12" r="3" />
            <path
              d="M12 2v2m0 16v2M4.93 4.93l1.41 1.41m11.32 11.32 1.41 1.41M2 12h2m16 0h2M4.93 19.07l1.41-1.41m11.32-11.32 1.41-1.41"
              strokeLinecap="round"
            />
          </svg>
        </button>
      </header>
      <ClueDockBar clues={clues} slots={clueSlots} />
      </div>
      <SurvivalKitModal isOpen={kitOpen} onClose={() => setKitOpen(false)} />
      <ExploreSettingsModal
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        onOpenSurvivalKit={() => {
          setSettingsOpen(false)
          setKitOpen(true)
        }}
      />
    </div>
  )
}

type PointClickExploreProps = {
  mission: Mission
}

function PointClickExplore({ mission }: PointClickExploreProps) {
  const clues = useGameStore((state) => state.clues)
  const useHint = useGameStore((state) => state.useHint)
  const goToStep = useGameStore((state) => state.goToStep)
  const navigate = useNavigate()
  const interactables = mission.scene.interactables ?? []

  const panels = mission.scene.panels ?? []
  const usePanelScene = panels.length > 0

  const [activeObject, setActiveObject] = useState<SceneInteractable | null>(null)
  const [kitOpen, setKitOpen] = useState(false)
  const [hintVisible, setHintVisible] = useState(false)
  const [panelIndex, setPanelIndex] = useState(0)

  const sceneSpots = useMemo<SceneSpot[]>(
    () =>
      interactables.map((item) => ({
        id: item.id,
        label: item.label,
        x: item.x,
        y: item.y,
        w: item.w,
        h: item.h,
      })),
    [interactables],
  )

  const completedIds = useMemo(
    () => interactables.filter((item) => clues.some((clue) => clue.id === item.clueSlotId)).map((item) => item.id),
    [clues, interactables],
  )

  const clueSlots = useMemo(
    () =>
      mission.exit.requiredClueIds.map((clueId) => {
        const object = interactables.find((item) => item.clueSlotId === clueId)
        return { id: clueId, label: object?.label ?? clueId }
      }),
    [interactables, mission.exit.requiredClueIds],
  )

  useEffect(() => {
    if (!hintVisible) return
    const timer = window.setTimeout(() => setHintVisible(false), 3200)
    return () => window.clearTimeout(timer)
  }, [hintVisible])

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

  function handleSpotClick(spot: SceneSpot) {
    const object = interactables.find((item) => item.id === spot.id) ?? null
    setActiveObject(object)
  }

  const panelLabel = usePanelScene ? panels[panelIndex]?.label : null

  return (
    <div className="explore-screen explore-screen--point-click">
      {usePanelScene ? (
        <MissionScenePanels panels={panels} onPanelIndexChange={setPanelIndex} />
      ) : (
        <MissionScene
          imageUrl={mission.scene.backgroundImage || '/airport-scene.jpg'}
          hotspots={sceneSpots}
          completedIds={completedIds}
          hintVisible={hintVisible}
          onHotspotClick={handleSpotClick}
        />
      )}

      <div className="explore-vignette" aria-hidden="true" />

      <div className="explore-hud" role="region" aria-label="미션 정보">
        <header className="explore-top explore-top--hud">
          <button type="button" className="explore-back" aria-label="이전 화면으로" onClick={goBackToLearn}>
            ←
          </button>
          <div className="explore-title-card">
            <p className="explore-brand">English Escape</p>
            <h1>{mission.title}</h1>
            <p>
              {mission.country.name} · {mission.place.name}
              {panelLabel ? ` · ${panelLabel}` : ''}
            </p>
          </div>
          <button type="button" className="explore-kit-button" onClick={() => setKitOpen(true)}>
            Survival Kit 수첩
          </button>
        </header>

        <section className="explore-briefing explore-briefing--hud" aria-label="방탈출 브리핑">
          <p className="explore-briefing-label">상황</p>
          <p>{mission.intro}</p>
          <button type="button" className="explore-hint-button" onClick={showSearchHint}>
            수상한 곳 비추기
          </button>
        </section>
      </div>

      <ClueInventory clues={clues} slots={clueSlots} />
      <SurvivalKitModal isOpen={kitOpen} onClose={() => setKitOpen(false)} />
      <ObjectStubModal target={activeObject} onClose={() => setActiveObject(null)} />
    </div>
  )
}

type LegacyExploreProps = {
  mission: Mission
}

function LegacyExplore({ mission: currentMission }: LegacyExploreProps) {
  const clues = useGameStore((state) => state.clues)
  const unlockedLockIds = useGameStore((state) => state.unlockedLockIds)
  const collectClue = useGameStore((state) => state.collectClue)
  const unlockLock = useGameStore((state) => state.unlockLock)
  const useHint = useGameStore((state) => state.useHint)
  const goToStep = useGameStore((state) => state.goToStep)
  const navigate = useNavigate()
  const departure = airportDepartureMission
  const drawerOpen = unlockedLockIds.includes(currentMission.exit.requiredLockId)

  const [activeHotspot, setActiveHotspot] = useState<Hotspot | null>(null)
  const [activePuzzleSpot, setActivePuzzleSpot] = useState<SceneSpot | null>(null)
  const [kitOpen, setKitOpen] = useState(false)
  const [hintVisible, setHintVisible] = useState(false)
  const [puzzleClues, setPuzzleClues] = useState<ClueCard[]>([])
  const [score, setScore] = useState(departure.maxScore)

  const puzzleById = useMemo(() => {
    const map = new Map<string, DeparturePuzzle>()
    for (const puzzle of departure.puzzles) map.set(puzzle.id, puzzle)
    return map
  }, [departure.puzzles])

  const sceneHotspots = useMemo<SceneSpot[]>(
    () => [
      ...currentMission.scene.hotspots.map((hotspot) => ({
        id: hotspot.id,
        label: hotspot.label,
        x: hotspot.x,
        y: hotspot.y,
      })),
      ...departure.scene.hotspots.map((hotspot) => ({
        id: `departure-${hotspot.id}`,
        label: hotspot.label,
        x: hotspot.x,
        y: hotspot.y,
      })),
    ],
    [currentMission.scene.hotspots, departure.scene.hotspots],
  )

  const completedIds = useMemo(() => {
    const immigrationDone = currentMission.scene.hotspots.flatMap((hotspot) => {
      if (hotspot.type === 'lock') {
        return unlockedLockIds.includes(hotspot.id) ? [hotspot.id] : []
      }
      return clues.some((clue) => clue.id === hotspot.clueId) ? [hotspot.id] : []
    })
    const departureDone = departure.scene.hotspots
      .filter((hotspot) => puzzleClues.some((clue) => clue.id === hotspot.puzzleId))
      .map((hotspot) => `departure-${hotspot.id}`)
    return [...immigrationDone, ...departureDone]
  }, [clues, currentMission, departure.scene.hotspots, puzzleClues, unlockedLockIds])

  const clueSlots = useMemo(
    () =>
      currentMission.exit.requiredClueIds.map((clueId) => {
        const hotspot = currentMission.scene.hotspots.find(
          (item) => item.type !== 'lock' && 'clueId' in item && item.clueId === clueId,
        )
        return {
          id: clueId,
          label: hotspot && hotspot.type !== 'lock' ? hotspot.label : clueId,
        }
      }),
    [currentMission],
  )

  const departureSlots = useMemo(
    () =>
      departure.scene.hotspots.map((hotspot) => ({
        id: hotspot.puzzleId,
        label: hotspot.label,
      })),
    [departure.scene.hotspots],
  )

  const inventoryClues = useMemo(
    () => [...clues, ...puzzleClues.map((clue) => ({ id: clue.id, value: clue.value }))],
    [clues, puzzleClues],
  )

  const activePuzzle = activePuzzleSpot
    ? puzzleById.get(activePuzzleSpot.id.replace(/^departure-/, '')) ?? null
    : null

  const departureCleared =
    departure.scene.hotspots.length > 0 &&
    departure.scene.hotspots.every((hotspot) => puzzleClues.some((clue) => clue.id === hotspot.puzzleId))

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

  function handleSpotClick(spot: SceneSpot) {
    if (spot.id.startsWith('departure-')) {
      setActiveHotspot(null)
      setActivePuzzleSpot(spot)
      return
    }
    const hotspot = currentMission.scene.hotspots.find((item) => item.id === spot.id) ?? null
    setActivePuzzleSpot(null)
    setActiveHotspot(hotspot)
  }

  function clearDeparturePuzzle(clueLabel: string, clueValue: string) {
    if (!activePuzzle) return
    setPuzzleClues((current) => {
      if (current.some((item) => item.id === activePuzzle.id)) return current
      return [...current, { id: activePuzzle.id, label: clueLabel, value: clueValue }]
    })
  }

  function useDepartureHint() {
    useHint()
    setScore((value) => Math.max(0, value - departure.hintPenalty))
  }

  return (
    <div className="explore-screen">
      <MissionScene
        imageUrl={currentMission.scene.backgroundImage || '/airport-scene.jpg'}
        hotspots={sceneHotspots}
        completedIds={completedIds}
        hintVisible={hintVisible}
        onHotspotClick={handleSpotClick}
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
            {currentMission.country.name} · {currentMission.place.name} · 점수 {score}
          </p>
        </div>
        <button type="button" className="explore-kit-button" onClick={() => setKitOpen(true)}>
          Survival Kit 수첩
        </button>
      </header>

      <section className="explore-briefing" aria-label="방탈출 브리핑">
        <p className="explore-briefing-label">상황</p>
        <p>공항을 살펴 단서를 모으세요. 반짝이는 지점을 누르면 듣기·대화·읽기 퍼즐이 열립니다.</p>
        <button type="button" className="explore-hint-button" onClick={showSearchHint}>
          수상한 곳 비추기
        </button>
      </section>

      {drawerOpen || departureCleared ? (
        <section className="explore-call">
          <p>
            {drawerOpen
              ? '서랍이 열렸어요. 심사관이 부르고 있어요!'
              : `${departure.clearMessage} 이어서 대화로 넘어갈 수 있어요.`}
          </p>
          <button type="button" onClick={goToDialogue}>
            대화하러 가기
          </button>
        </section>
      ) : null}

      <ClueInventory clues={inventoryClues} slots={[...clueSlots, ...departureSlots]} />
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
      <DeparturePuzzleModal
        puzzle={activePuzzle}
        label={activePuzzleSpot?.label ?? '퍼즐'}
        onClose={() => setActivePuzzleSpot(null)}
        onClear={clearDeparturePuzzle}
        onUseHint={useDepartureHint}
      />
    </div>
  )
}
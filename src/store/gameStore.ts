import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

import type { ClueId, DialogueSlotId, Hotspot, Mission } from '../types/mission'

export type GameStep = 'intro' | 'learn' | 'explore' | 'dialogue' | 'exit' | 'result'

export type CollectedClue = {
  id: ClueId
  value: string
}

export type MistakeRecord = {
  text: string
  naturalVersion: string
}

export type SlotProgress = Record<DialogueSlotId, boolean>

type GameState = {
  mission: Mission | null
  step: GameStep
  clues: CollectedClue[]
  unlockedLockIds: string[]
  slots: SlotProgress
  mistakes: MistakeRecord[]
  hintCount: number
}

type GameActions = {
  startMission: (mission: Mission) => void
  goToStep: (step: GameStep) => void
  collectClue: (clueId: ClueId, value: string) => void
  unlockLock: (lockId: string) => void
  fillSlot: (slotId: DialogueSlotId) => void
  recordMistake: (mistake: MistakeRecord) => void
  useHint: () => void
  resetMission: () => void
}

type GameStore = GameState & GameActions

function emptySlots(): SlotProgress {
  return { purpose: false, duration: false, lodging: false }
}

function freshProgress(): Omit<GameState, 'mission'> {
  return {
    step: 'intro',
    clues: [],
    unlockedLockIds: [],
    slots: emptySlots(),
    mistakes: [],
    hintCount: 0,
  }
}

function isClueHotspot(hotspot: Hotspot): hotspot is Extract<Hotspot, { type: 'read' | 'listen' }> {
  return hotspot.type === 'read' || hotspot.type === 'listen'
}

function hasClue(clues: CollectedClue[], clueId: ClueId): boolean {
  return clues.some((clue) => clue.id === clueId)
}

function allSlotsFilled(mission: Mission, slots: SlotProgress): boolean {
  return mission.dialogue.slots.length > 0 && mission.dialogue.slots.every((slot) => slots[slot.id])
}

function canGoTo(state: GameState, step: GameStep): boolean {
  const { mission } = state
  if (!mission) return false

  if (step === 'learn') return state.step === 'intro'
  if (step === 'explore') return state.step === 'learn'
  if (step === 'dialogue') {
    return state.step === 'explore' && state.unlockedLockIds.includes(mission.exit.requiredLockId)
  }
  if (step === 'exit') return state.step === 'dialogue' && allSlotsFilled(mission, state.slots)
  if (step === 'result') return state.step === 'exit'
  return false
}

export const useGameStore = create<GameStore>()(
  persist(
    (set) => ({
      mission: null,
      ...freshProgress(),

      startMission: (mission) => set({ mission, ...freshProgress() }),

      goToStep: (step) =>
        set((state) => {
          if (!canGoTo(state, step)) return state
          return { step }
        }),

      collectClue: (clueId, value) =>
        set((state) => {
          if (!state.mission || state.step !== 'explore' || hasClue(state.clues, clueId)) return state
          const hotspot = state.mission.scene.hotspots.find(
            (item) => isClueHotspot(item) && item.clueId === clueId,
          )
          if (!hotspot || !isClueHotspot(hotspot) || hotspot.clueValue !== value) return state
          return { clues: [...state.clues, { id: clueId, value }] }
        }),

      unlockLock: (lockId) =>
        set((state) => {
          if (!state.mission || state.step !== 'explore' || state.unlockedLockIds.includes(lockId)) {
            return state
          }
          const hotspot = state.mission.scene.hotspots.find((item) => item.id === lockId)
          if (!hotspot || hotspot.type !== 'lock') return state
          const ready = hotspot.requires.every((clueId) => hasClue(state.clues, clueId))
          if (!ready) return state
          return { unlockedLockIds: [...state.unlockedLockIds, lockId] }
        }),

      fillSlot: (slotId) =>
        set((state) => {
          if (!state.mission || state.step !== 'dialogue' || state.slots[slotId]) return state
          const known = state.mission.dialogue.slots.some((slot) => slot.id === slotId)
          if (!known) return state
          const slots: SlotProgress = { ...state.slots, [slotId]: true }
          return { slots }
        }),

      recordMistake: (mistake) =>
        set((state) => {
          if (!state.mission) return state
          return { mistakes: [...state.mistakes, mistake] }
        }),

      useHint: () =>
        set((state) => {
          if (!state.mission) return state
          return { hintCount: state.hintCount + 1 }
        }),

      resetMission: () =>
        set((state) => {
          if (!state.mission) return { mission: null, ...freshProgress() }
          return { mission: state.mission, ...freshProgress() }
        }),
    }),
    {
      name: 'english-escape-game',
      storage: createJSONStorage(() => localStorage),
      version: 1,
    },
  ),
)

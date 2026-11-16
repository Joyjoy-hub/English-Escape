import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

type SettingsState = {
  soundEnabled: boolean
  musicEnabled: boolean
  subtitlesEnabled: boolean
  hintSoundEnabled: boolean
}

type SettingsActions = {
  setSoundEnabled: (enabled: boolean) => void
  setMusicEnabled: (enabled: boolean) => void
  setSubtitlesEnabled: (enabled: boolean) => void
  setHintSoundEnabled: (enabled: boolean) => void
  resetSettings: () => void
}

type SettingsStore = SettingsState & SettingsActions

const defaults: SettingsState = {
  soundEnabled: true,
  musicEnabled: true,
  subtitlesEnabled: true,
  hintSoundEnabled: true,
}

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set) => ({
      ...defaults,

      setSoundEnabled: (soundEnabled) => set({ soundEnabled }),
      setMusicEnabled: (musicEnabled) => set({ musicEnabled }),
      setSubtitlesEnabled: (subtitlesEnabled) => set({ subtitlesEnabled }),
      setHintSoundEnabled: (hintSoundEnabled) => set({ hintSoundEnabled }),
      resetSettings: () => set(defaults),
    }),
    {
      name: 'english-escape-settings',
      storage: createJSONStorage(() => localStorage),
    },
  ),
)
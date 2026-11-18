import { createPortal } from 'react-dom'

import { getAppPortalRoot } from '../appPortal'

import { useSettingsStore } from '../store/settingsStore'
import './ExploreSettingsModal.css'

type ExploreSettingsModalProps = {
  isOpen: boolean
  onClose: () => void
  onOpenSurvivalKit?: () => void
}

type ToggleRowProps = {
  id: string
  label: string
  description: string
  checked: boolean
  onChange: (checked: boolean) => void
}

function ToggleRow({ id, label, description, checked, onChange }: ToggleRowProps) {
  return (
    <label className="explore-settings-row" htmlFor={id}>
      <span className="explore-settings-copy">
        <strong>{label}</strong>
        <small>{description}</small>
      </span>
      <span className="explore-settings-switch">
        <input
          id={id}
          type="checkbox"
          checked={checked}
          onChange={(event) => onChange(event.target.checked)}
        />
        <span className="explore-settings-switch-ui" aria-hidden="true" />
      </span>
    </label>
  )
}

export function ExploreSettingsModal({ isOpen, onClose, onOpenSurvivalKit }: ExploreSettingsModalProps) {
  const soundEnabled = useSettingsStore((state) => state.soundEnabled)
  const musicEnabled = useSettingsStore((state) => state.musicEnabled)
  const subtitlesEnabled = useSettingsStore((state) => state.subtitlesEnabled)
  const hintSoundEnabled = useSettingsStore((state) => state.hintSoundEnabled)
  const setSoundEnabled = useSettingsStore((state) => state.setSoundEnabled)
  const setMusicEnabled = useSettingsStore((state) => state.setMusicEnabled)
  const setSubtitlesEnabled = useSettingsStore((state) => state.setSubtitlesEnabled)
  const setHintSoundEnabled = useSettingsStore((state) => state.setHintSoundEnabled)
  const resetSettings = useSettingsStore((state) => state.resetSettings)

  if (!isOpen) return null

  return createPortal(
    <div className="explore-settings-backdrop" onClick={onClose}>
      <div
        className="explore-settings-panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="explore-settings-title"
        onClick={(event) => event.stopPropagation()}
      >
        <header className="explore-settings-header">
          <h2 id="explore-settings-title">설정</h2>
          <button type="button" className="explore-settings-close" onClick={onClose}>
            닫기
          </button>
        </header>

        <div className="explore-settings-body">
          <ToggleRow
            id="setting-sound"
            label="효과음"
            description="버튼·정답 등 게임 효과음"
            checked={soundEnabled}
            onChange={setSoundEnabled}
          />
          <ToggleRow
            id="setting-music"
            label="배경음"
            description="공항 분위기 배경 음악"
            checked={musicEnabled}
            onChange={setMusicEnabled}
          />
          <ToggleRow
            id="setting-subtitles"
            label="자막"
            description="영어 대사·안내 한글 자막"
            checked={subtitlesEnabled}
            onChange={setSubtitlesEnabled}
          />
          <ToggleRow
            id="setting-hint-sound"
            label="힌트 알림음"
            description="단서·힌트 표시 시 짧은 소리"
            checked={hintSoundEnabled}
            onChange={setHintSoundEnabled}
          />
        </div>

        <footer className="explore-settings-footer">
          {onOpenSurvivalKit ? (
            <button type="button" className="explore-settings-kit" onClick={onOpenSurvivalKit}>
              Survival Kit 수첩 열기
            </button>
          ) : null}
          <button type="button" className="explore-settings-reset" onClick={resetSettings}>
            설정 초기화
          </button>
        </footer>
      </div>
    </div>,
    getAppPortalRoot(),
  )
}
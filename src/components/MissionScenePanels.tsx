import { useEffect, useMemo, useRef, useState } from 'react'
import { flushSync } from 'react-dom'
import type { KeyboardEvent as ReactKeyboardEvent, PointerEvent as ReactPointerEvent, TransitionEvent } from 'react'

import { MissionPanelPanLayer } from './MissionPanelPanLayer'
import type { ScenePanel } from '../types/mission'
import './MissionScenePanels.css'

type MissionScenePanelsProps = {
  panels: ScenePanel[]
  panelIndex?: number
  onPanelIndexChange?: (index: number) => void
  /** 좌우 구역 이동 화살표 */
  showNav?: boolean
  /** 레퍼런스 JPG 상·하단 UI 잘라내기 */
  contentCrop?: boolean
}

type LoopedPanel = ScenePanel & { loopKey: string }
type PanPoint = { x: number; y: number }

const SLIDE_MS = 420

function panLimits(viewport?: DOMRect | null, tight = false) {
  const w = viewport?.width ?? (typeof window !== 'undefined' ? window.innerWidth : 390)
  const h = viewport?.height ?? (typeof window !== 'undefined' ? window.innerHeight : 720)
  if (tight) {
    return { x: w * 0.2, y: h * 0.14 }
  }
  return { x: w * 0.26, y: h * 0.22 }
}

function clampPan(offset: PanPoint, viewport?: DOMRect | null, tight = false): PanPoint {
  const limits = panLimits(viewport, tight)
  return {
    x: Math.max(-limits.x, Math.min(limits.x, offset.x)),
    y: Math.max(-limits.y, Math.min(limits.y, offset.y)),
  }
}

function motionSeedFromId(id: string, index: number) {
  let hash = index * 1.3
  for (let i = 0; i < id.length; i += 1) {
    hash += id.charCodeAt(i) * 0.13
  }
  return hash
}

function realPanelIndex(virtual: number, count: number) {
  if (count <= 1) return 0
  if (virtual === 0) return count - 1
  if (virtual === count + 1) return 0
  return virtual - 1
}

export function MissionScenePanels({
  panels,
  onPanelIndexChange,
  showNav = true,
  contentCrop = false,
}: MissionScenePanelsProps) {
  const viewportRef = useRef<HTMLDivElement>(null)
  const virtualIndexRef = useRef(panels.length > 1 ? 1 : 0)
  const animatingRef = useRef(false)
  const jumpingRef = useRef(false)
  const dragRef = useRef({
    active: false,
    startX: 0,
    startY: 0,
    originX: 0,
    originY: 0,
    panStartX: 0,
    panStartY: 0,
    panelId: '',
  })

  const looped = useMemo<LoopedPanel[]>(() => {
    if (panels.length <= 1) {
      return panels.map((panel) => ({ ...panel, loopKey: panel.id }))
    }
    const last = panels[panels.length - 1]
    const first = panels[0]
    return [
      { ...last, loopKey: `clone-before-${last.id}` },
      ...panels.map((panel) => ({ ...panel, loopKey: panel.id })),
      { ...first, loopKey: `clone-after-${first.id}` },
    ]
  }, [panels])

  const [virtualIndex, setVirtualIndex] = useState(() => (panels.length > 1 ? 1 : 0))
  const [transitionEnabled, setTransitionEnabled] = useState(true)
  const [panOffsets, setPanOffsets] = useState<Record<string, PanPoint>>({})
  const [dragging, setDragging] = useState(false)
  const [pointerTilt, setPointerTilt] = useState({ x: 0, y: 0 })
  const pointerTiltRef = useRef({ x: 0, y: 0 })

  useEffect(() => {
    virtualIndexRef.current = virtualIndex
  }, [virtualIndex])

  useEffect(() => {
    virtualIndexRef.current = panels.length > 1 ? 1 : 0
    animatingRef.current = false
    jumpingRef.current = false
    setVirtualIndex(panels.length > 1 ? 1 : 0)
    setTransitionEnabled(true)
    setPanOffsets({})
  }, [panels])

  useEffect(() => {
    function onMove(event: PointerEvent) {
      const drag = dragRef.current
      if (!drag.active) return
      const bounds = viewportRef.current?.getBoundingClientRect() ?? null
      const offset = clampPan(
        {
          x: drag.originX + (event.clientX - drag.startX),
          y: drag.originY + (event.clientY - drag.startY),
        },
        bounds,
        contentCrop,
      )
      setPanOffsets((previous) => ({ ...previous, [drag.panelId]: offset }))
    }

    function onUp() {
      if (!dragRef.current.active) return
      dragRef.current.active = false
      setDragging(false)
    }

    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', onUp)
    window.addEventListener('pointercancel', onUp)
    return () => {
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
      window.removeEventListener('pointercancel', onUp)
    }
  }, [contentCrop])

  function panelOffset(panelId: string): PanPoint {
    return panOffsets[panelId] ?? { x: 0, y: 0 }
  }

  function notifyRealIndex(virtual: number) {
    onPanelIndexChange?.(realPanelIndex(virtual, panels.length))
  }

  function beginSlide(nextVirtual: number) {
    if (panels.length <= 1) return
    if (animatingRef.current || jumpingRef.current || dragRef.current.active) return
    if (nextVirtual < 0 || nextVirtual > panels.length + 1) return

    animatingRef.current = true
    virtualIndexRef.current = nextVirtual
    setVirtualIndex(nextVirtual)
    notifyRealIndex(nextVirtual)

    window.setTimeout(() => {
      if (jumpingRef.current || !animatingRef.current) return
      const vi = virtualIndexRef.current
      if (vi === panels.length + 1) finishJump(1)
      else if (vi === 0) finishJump(panels.length)
      else animatingRef.current = false
    }, SLIDE_MS + 40)
  }

  function goPrev() {
    beginSlide(virtualIndexRef.current - 1)
  }

  function goNext() {
    beginSlide(virtualIndexRef.current + 1)
  }

  function finishJump(toIndex: number) {
    jumpingRef.current = true
    animatingRef.current = false
    flushSync(() => {
      setTransitionEnabled(false)
      virtualIndexRef.current = toIndex
      setVirtualIndex(toIndex)
    })
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setTransitionEnabled(true)
        jumpingRef.current = false
      })
    })
  }

  function handleTransitionEnd(event: TransitionEvent<HTMLDivElement>) {
    if (event.target !== event.currentTarget) return
    if (event.propertyName !== 'transform') return
    if (panels.length <= 1 || jumpingRef.current) return

    const vi = virtualIndexRef.current
    if (vi === panels.length + 1) {
      finishJump(1)
      return
    }
    if (vi === 0) {
      finishJump(panels.length)
      return
    }

    animatingRef.current = false
  }

  function onSceneKeyDown(event: ReactKeyboardEvent<HTMLDivElement>) {
    if (event.key === 'ArrowLeft') {
      event.preventDefault()
      goPrev()
    } else if (event.key === 'ArrowRight') {
      event.preventDefault()
      goNext()
    }
  }

  function updatePointerTilt(clientX: number, clientY: number) {
    if (!contentCrop || dragRef.current.active) return
    const rect = viewportRef.current?.getBoundingClientRect()
    if (!rect) return
    const nx = (clientX - rect.left) / rect.width - 0.5
    const ny = (clientY - rect.top) / rect.height - 0.5
    const next = { x: nx * 0.35, y: ny * 0.35 }
    const prev = pointerTiltRef.current
    if (Math.abs(prev.x - next.x) < 0.006 && Math.abs(prev.y - next.y) < 0.006) return
    pointerTiltRef.current = next
    setPointerTilt(next)
  }

  function onPointerDown(event: ReactPointerEvent<HTMLDivElement>) {
    if ((event.target as HTMLElement).closest('.mission-panel-nav')) return
    if (animatingRef.current || jumpingRef.current) return
    updatePointerTilt(event.clientX, event.clientY)

    const panel = looped[virtualIndexRef.current]
    if (!panel) return

    const origin = panelOffset(panel.id)
    dragRef.current = {
      active: true,
      startX: event.clientX,
      startY: event.clientY,
      originX: origin.x,
      originY: origin.y,
      panStartX: origin.x,
      panStartY: origin.y,
      panelId: panel.id,
    }
    setDragging(true)
    viewportRef.current?.setPointerCapture(event.pointerId)
  }

  function onPointerUp(event: ReactPointerEvent<HTMLDivElement>) {
    const drag = dragRef.current
    if (drag.panelId && !animatingRef.current && !jumpingRef.current) {
      const endPan = panelOffset(drag.panelId)
      const panMoved = Math.hypot(endPan.x - drag.panStartX, endPan.y - drag.panStartY)
      const dx = event.clientX - drag.startX
      const dy = event.clientY - drag.startY
      if (panMoved < 14 && Math.abs(dx) > 48 && Math.abs(dx) > Math.abs(dy) * 1.2) {
        if (dx < 0) goNext()
        else goPrev()
      }
    }

    if (viewportRef.current?.hasPointerCapture(event.pointerId)) {
      viewportRef.current.releasePointerCapture(event.pointerId)
    }
    dragRef.current.active = false
    setDragging(false)
  }

  const slideCount = looped.length

  return (
    <div
      ref={viewportRef}
      className={dragging ? 'mission-panels-viewport is-dragging' : 'mission-panels-viewport'}
      tabIndex={0}
      onKeyDown={onSceneKeyDown}
      onPointerDown={onPointerDown}
      onPointerMove={(event) => updatePointerTilt(event.clientX, event.clientY)}
      onPointerLeave={() => {
        pointerTiltRef.current = { x: 0, y: 0 }
        setPointerTilt({ x: 0, y: 0 })
      }}
      onPointerUp={onPointerUp}
      onPointerCancel={() => {
        dragRef.current.active = false
        setDragging(false)
      }}
    >
      <div
        className={transitionEnabled ? 'mission-panels-track' : 'mission-panels-track mission-panels-track--instant'}
        style={{
          width: `${slideCount * 100}%`,
          transform: `translate3d(-${(virtualIndex * 100) / slideCount}%, 0, 0)`,
        }}
        aria-live="polite"
        onTransitionEnd={handleTransitionEnd}
      >
        {looped.map((panel, index) => {
          const panelWidth = `${100 / slideCount}%`
          return (
            <div
              key={panel.loopKey}
              className="mission-panel"
              style={{ width: panelWidth, flexBasis: panelWidth }}
              aria-hidden={index !== virtualIndex}
              aria-label={panel.label}
            >
              <MissionPanelPanLayer
                src={panel.image}
                label={panel.label}
                offset={panelOffset(panel.id)}
                baseOffset={contentCrop ? { x: 0, y: -8 } : undefined}
                zoom={contentCrop ? 1.4 : 1.28}
                active={index === virtualIndex}
                subtleDepth={contentCrop}
                pointer={pointerTilt}
                motionSeed={motionSeedFromId(panel.id, index)}
              />
            </div>
          )
        })}
      </div>

      {showNav ? (
        <>
          <button type="button" className="mission-panel-nav is-prev" aria-label="이전 구역" onClick={goPrev}>
            {'<'}
          </button>
          <button type="button" className="mission-panel-nav is-next" aria-label="다음 구역" onClick={goNext}>
            {'>'}
          </button>
        </>
      ) : null}
    </div>
  )
}
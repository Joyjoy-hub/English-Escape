import { useEffect, useRef, useState } from 'react'
import type { KeyboardEvent as ReactKeyboardEvent, PointerEvent as ReactPointerEvent } from 'react'

import './MissionScene.css'

export type SceneSpot = {
  id: string
  label: string
  x: number
  y: number
  w?: number
  h?: number
}

type MissionSceneProps = {
  imageUrl: string
  hotspots: SceneSpot[]
  completedIds: string[]
  hintVisible: boolean
  onHotspotClick: (hotspot: SceneSpot) => void
}

type Point = { x: number; y: number }

export function MissionScene({
  imageUrl,
  hotspots,
  completedIds,
  hintVisible,
  onHotspotClick,
}: MissionSceneProps) {
  const viewportRef = useRef<HTMLDivElement>(null)
  const spotRefs = useRef<Array<HTMLButtonElement | null>>([])
  const dragRef = useRef<{ active: boolean; startX: number; startY: number; originX: number; originY: number }>({
    active: false,
    startX: 0,
    startY: 0,
    originX: 0,
    originY: 0,
  })
  const [offset, setOffset] = useState<Point>({ x: 0, y: 0 })
  const [spotlight, setSpotlight] = useState<Point | null>(null)
  const [focusIndex, setFocusIndex] = useState(0)
  const completed = new Set(completedIds)

  useEffect(() => {
    function onMove(event: PointerEvent) {
      const drag = dragRef.current
      if (!drag.active) return
      setOffset({
        x: drag.originX + (event.clientX - drag.startX),
        y: drag.originY + (event.clientY - drag.startY),
      })
    }

    function onUp() {
      dragRef.current.active = false
    }

    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', onUp)
    return () => {
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
    }
  }, [])

  useEffect(() => {
    setFocusIndex((value) => {
      if (hotspots.length === 0) return 0
      return Math.min(value, hotspots.length - 1)
    })
  }, [hotspots.length])

  function startDrag(event: ReactPointerEvent<HTMLDivElement>) {
    if ((event.target as HTMLElement).closest('.mission-spot')) return
    dragRef.current = {
      active: true,
      startX: event.clientX,
      startY: event.clientY,
      originX: offset.x,
      originY: offset.y,
    }
  }

  function trackSpotlight(event: ReactPointerEvent<HTMLDivElement>) {
    const viewport = viewportRef.current
    if (!viewport) return
    const rect = viewport.getBoundingClientRect()
    setSpotlight({
      x: ((event.clientX - rect.left) / rect.width) * 100,
      y: ((event.clientY - rect.top) / rect.height) * 100,
    })
  }

  function focusSpot(index: number) {
    const next = ((index % hotspots.length) + hotspots.length) % hotspots.length
    setFocusIndex(next)
    spotRefs.current[next]?.focus()
  }

  function onSceneKeyDown(event: ReactKeyboardEvent<HTMLDivElement>) {
    if (hotspots.length === 0) return
    const target = event.target as HTMLElement
    if (!target.closest('.mission-spot')) return

    if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
      event.preventDefault()
      focusSpot(focusIndex + 1)
    } else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
      event.preventDefault()
      focusSpot(focusIndex - 1)
    } else if (event.key === 'Home') {
      event.preventDefault()
      focusSpot(0)
    } else if (event.key === 'End') {
      event.preventDefault()
      focusSpot(hotspots.length - 1)
    }
  }

  return (
    <div
      ref={viewportRef}
      className="mission-scene"
      onPointerDown={startDrag}
      onPointerMove={trackSpotlight}
      onPointerLeave={() => setSpotlight(null)}
      onKeyDown={onSceneKeyDown}
    >
      <div
        className="mission-scene-world"
        style={{ transform: `translate3d(${offset.x}px, ${offset.y}px, 0) scale(1.35)` }}
      >
        <img className="mission-scene-image" src={imageUrl} alt="" draggable={false} />
        <div className="mission-scene-shade" aria-hidden="true" />

        {hotspots.map((hotspot, index) => {
          const done = completed.has(hotspot.id)
          const hasArea = Boolean(hotspot.w && hotspot.h)
          return (
            <button
              key={hotspot.id}
              ref={(node) => {
                spotRefs.current[index] = node
              }}
              type="button"
              className={[
                'mission-spot',
                hasArea ? 'has-area' : '',
                done ? 'is-done' : '',
                hintVisible && !done ? 'is-hint' : '',
              ]
                .filter(Boolean)
                .join(' ')}
              style={{
                left: `${hotspot.x}%`,
                top: `${hotspot.y}%`,
                ...(hasArea
                  ? {
                      width: `${hotspot.w}%`,
                      height: `${hotspot.h}%`,
                    }
                  : undefined),
              }}
              tabIndex={index === focusIndex ? 0 : -1}
              aria-label={done ? `${hotspot.label} 완료` : `${hotspot.label} 살펴보기`}
              onFocus={() => setFocusIndex(index)}
              onClick={() => onHotspotClick(hotspot)}
            >
              <span className="mission-spot-pulse" aria-hidden="true" />
              {hasArea ? <span className="mission-spot-label" aria-hidden="true">{hotspot.label}</span> : null}
            </button>
          )
        })}
      </div>

      <div
        className="mission-spotlight"
        aria-hidden="true"
        style={
          spotlight
            ? {
                background: `radial-gradient(circle 160px at ${spotlight.x}% ${spotlight.y}%, transparent 0%, transparent 28%, rgba(8, 5, 3, 0.55) 70%)`,
              }
            : undefined
        }
      />

      <p className="mission-drag-hint" aria-hidden="true">
        화면을 끌어서 주변을 살펴보세요 · Tab으로 사물 선택
      </p>
    </div>
  )
}
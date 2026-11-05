import { useEffect, useRef, useState } from 'react'
import type { PointerEvent as ReactPointerEvent } from 'react'

import type { Hotspot } from '../types/mission'
import './MissionScene.css'

type MissionSceneProps = {
  imageUrl: string
  hotspots: Hotspot[]
  completedIds: string[]
  hintVisible: boolean
  onHotspotClick: (hotspot: Hotspot) => void
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
  const dragRef = useRef<{ active: boolean; startX: number; startY: number; originX: number; originY: number }>({
    active: false,
    startX: 0,
    startY: 0,
    originX: 0,
    originY: 0,
  })
  const [offset, setOffset] = useState<Point>({ x: 0, y: 0 })
  const [spotlight, setSpotlight] = useState<Point | null>(null)
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

  return (
    <div
      ref={viewportRef}
      className="mission-scene"
      onPointerDown={startDrag}
      onPointerMove={trackSpotlight}
      onPointerLeave={() => setSpotlight(null)}
    >
      <div
        className="mission-scene-world"
        style={{ transform: `translate3d(${offset.x}px, ${offset.y}px, 0) scale(1.35)` }}
      >
        <img className="mission-scene-image" src={imageUrl} alt="" draggable={false} />
        <div className="mission-scene-shade" aria-hidden="true" />

        {hotspots.map((hotspot, index) => {
          const done = completed.has(hotspot.id)
          return (
            <button
              key={hotspot.id}
              type="button"
              className={[
                'mission-spot',
                done ? 'is-done' : '',
                hintVisible && !done ? 'is-hint' : '',
              ]
                .filter(Boolean)
                .join(' ')}
              style={{ left: `${hotspot.x}%`, top: `${hotspot.y}%` }}
              aria-label={done ? `${hotspot.label} 완료` : `살펴볼 곳 ${index + 1}`}
              onClick={() => onHotspotClick(hotspot)}
            >
              <span className="mission-spot-pulse" aria-hidden="true" />
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
        화면을 끌어서 주변을 살펴보세요
      </p>
    </div>
  )
}

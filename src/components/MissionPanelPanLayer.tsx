import { useEffect, useRef } from 'react'

type PanPoint = { x: number; y: number }

type MissionPanelPanLayerProps = {
  src: string
  label: string
  offset: PanPoint
  baseOffset?: PanPoint
  zoom?: number
  active?: boolean
  subtleDepth?: boolean
  pointer?: PanPoint
  motionSeed?: number
}

export function MissionPanelPanLayer({
  src,
  label,
  offset,
  baseOffset,
  zoom = 1.32,
  active = false,
  subtleDepth = false,
  pointer = { x: 0, y: 0 },
  motionSeed = 0,
}: MissionPanelPanLayerProps) {
  const worldRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const node = worldRef.current
    if (!node) return

    const ox = offset.x + (baseOffset?.x ?? 0)
    const oy = offset.y + (baseOffset?.y ?? 0)

    if (!active || !subtleDepth) {
      node.style.transform = `translate3d(${ox}px, ${oy}px, 0) scale(${zoom}) rotateX(0deg) rotateY(0deg)`
      return
    }

    let frame = 0
    const startedAt = performance.now()
    const media = window.matchMedia('(prefers-reduced-motion: reduce)')

    const tick = (now: number) => {
      if (media.matches) {
        node.style.transform = `translate3d(${ox}px, ${oy}px, 0) scale(${zoom})`
        return
      }

      const t = (now - startedAt) / 1000
      const driftX = Math.sin(t * 0.26 + motionSeed) * 3
      const driftY = Math.cos(t * 0.22 + motionSeed) * 2
      const rotateY = pointer.x * 0.55 + Math.sin(t * 0.18 + motionSeed) * 0.12
      const rotateX = -pointer.y * 0.4 + Math.cos(t * 0.16 + motionSeed) * 0.1

      node.style.transform = `translate3d(${ox + driftX + pointer.x * 6}px, ${oy + driftY + pointer.y * 4}px, 0) scale(${zoom}) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`
      frame = requestAnimationFrame(tick)
    }

    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [active, baseOffset?.x, baseOffset?.y, motionSeed, offset.x, offset.y, pointer.x, pointer.y, subtleDepth, zoom])

  return (
    <div className="mission-panel-stage">
      <div ref={worldRef} className="mission-panel-world">
        <img className="mission-panel-image" src={src} alt="" draggable={false} aria-label={label} />
      </div>
    </div>
  )
}
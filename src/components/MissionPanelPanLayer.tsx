type PanPoint = { x: number; y: number }

type MissionPanelPanLayerProps = {
  src: string
  label: string
  offset: PanPoint
  baseOffset?: PanPoint
  zoom?: number
}

export function MissionPanelPanLayer({ src, label, offset, baseOffset, zoom = 1.32 }: MissionPanelPanLayerProps) {
  const ox = offset.x + (baseOffset?.x ?? 0)
  const oy = offset.y + (baseOffset?.y ?? 0)

  return (
    <div className="mission-panel-stage">
      <div
        className="mission-panel-world"
        style={{ transform: `translate3d(${ox}px, ${oy}px, 0) scale(${zoom})` }}
      >
        <img className="mission-panel-image" src={src} alt="" draggable={false} aria-label={label} />
      </div>
    </div>
  )
}
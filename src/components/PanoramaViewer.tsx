import { useEffect, useRef, useState } from 'react'
import { Viewer } from '@photo-sphere-viewer/core'
import { MarkersPlugin } from '@photo-sphere-viewer/markers-plugin'
import '@photo-sphere-viewer/core/index.css'
import '@photo-sphere-viewer/markers-plugin/index.css'

import type { Hotspot } from '../types/mission'
import './PanoramaViewer.css'

type PanoramaViewerProps = {
  imageUrl: string
  hotspots: Hotspot[]
  completedIds: string[]
  onHotspotClick: (hotspot: Hotspot) => void
}

function hotspotPosition(hotspot: Hotspot) {
  const yaw = (hotspot.x / 100) * 360 - 180
  const pitch = (0.5 - hotspot.y / 100) * 180
  return { yaw: `${yaw}deg`, pitch: `${pitch}deg` }
}

function markerIcon(type: Hotspot['type']) {
  if (type === 'listen') return '🔊'
  if (type === 'lock') return '🔐'
  return '📋'
}

function markerHtml(hotspot: Hotspot, completed: boolean) {
  const state = completed ? ' is-done' : ''
  return `<button type="button" class="hotspot-pin${state}" aria-label="${hotspot.label}"><span class="hotspot-pin-icon">${completed ? '✓' : markerIcon(hotspot.type)}</span><span class="hotspot-pin-label">${hotspot.label}</span></button>`
}

function roundRect(
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
) {
  context.beginPath()
  context.moveTo(x + radius, y)
  context.arcTo(x + width, y, x + width, y + height, radius)
  context.arcTo(x + width, y + height, x, y + height, radius)
  context.arcTo(x, y + height, x, y, radius)
  context.arcTo(x, y, x + width, y, radius)
  context.closePath()
}

function paintAirportHall(canvas: HTMLCanvasElement) {
  const context = canvas.getContext('2d')
  if (!context) return
  const { width: w, height: h } = canvas

  const sky = context.createLinearGradient(0, 0, 0, h)
  sky.addColorStop(0, '#1d2a38')
  sky.addColorStop(0.28, '#4d6d86')
  sky.addColorStop(0.48, '#c9b48a')
  sky.addColorStop(0.62, '#8d7352')
  sky.addColorStop(1, '#3a2a1c')
  context.fillStyle = sky
  context.fillRect(0, 0, w, h)

  // Ceiling lights
  for (let i = 0; i < 10; i += 1) {
    const x = (i + 0.5) * (w / 10)
    const glow = context.createRadialGradient(x, h * 0.18, 4, x, h * 0.18, 90)
    glow.addColorStop(0, 'rgba(255, 236, 180, 0.85)')
    glow.addColorStop(1, 'rgba(255, 236, 180, 0)')
    context.fillStyle = glow
    context.beginPath()
    context.arc(x, h * 0.18, 90, 0, Math.PI * 2)
    context.fill()
  }

  // Floor reflection band
  context.fillStyle = 'rgba(58, 42, 28, 0.55)'
  context.fillRect(0, h * 0.62, w, h * 0.38)
  const floor = context.createLinearGradient(0, h * 0.62, 0, h)
  floor.addColorStop(0, 'rgba(214, 186, 140, 0.35)')
  floor.addColorStop(1, 'rgba(42, 28, 16, 0.75)')
  context.fillStyle = floor
  context.fillRect(0, h * 0.62, w, h * 0.38)

  // Glass wall / windows
  context.fillStyle = 'rgba(170, 205, 230, 0.22)'
  context.fillRect(0, h * 0.22, w, h * 0.28)
  context.strokeStyle = 'rgba(241, 212, 138, 0.28)'
  context.lineWidth = 4
  for (let i = 1; i < 8; i += 1) {
    const x = i * (w / 8)
    context.beginPath()
    context.moveTo(x, h * 0.22)
    context.lineTo(x, h * 0.5)
    context.stroke()
  }

  // Immigration desks
  for (let i = 0; i < 5; i += 1) {
    const x = w * 0.08 + i * (w * 0.18)
    context.fillStyle = '#5a3d24'
    roundRect(context, x, h * 0.52, w * 0.12, h * 0.12, 10)
    context.fill()
    context.fillStyle = '#c08938'
    roundRect(context, x + 8, h * 0.52, w * 0.12 - 16, 10, 4)
    context.fill()
    context.fillStyle = '#f6ead0'
    context.font = `bold ${Math.floor(h * 0.028)}px Cinzel, serif`
    context.fillText(`DESK ${i + 2}`, x + 18, h * 0.58)
  }

  // Wall signboard around x=18%
  const signX = w * 0.12
  const signY = h * 0.24
  context.fillStyle = '#2a1708'
  roundRect(context, signX, signY, w * 0.18, h * 0.16, 12)
  context.fill()
  context.strokeStyle = '#e8c67a'
  context.lineWidth = 3
  roundRect(context, signX, signY, w * 0.18, h * 0.16, 12)
  context.stroke()
  context.fillStyle = '#f1d48a'
  context.font = `bold ${Math.floor(h * 0.03)}px Cinzel, serif`
  context.fillText('WELCOME', signX + 24, signY + h * 0.055)
  context.fillStyle = '#f6ead0'
  context.font = `${Math.floor(h * 0.022)}px sans-serif`
  context.fillText('Study → Desk 4', signX + 24, signY + h * 0.1)

  // Arrival card counter around x=48%
  const cardX = w * 0.42
  const cardY = h * 0.58
  context.fillStyle = '#fff8ea'
  roundRect(context, cardX, cardY, w * 0.14, h * 0.12, 8)
  context.fill()
  context.strokeStyle = '#c08938'
  context.strokeRect(cardX + 10, cardY + 12, w * 0.14 - 20, h * 0.08)
  context.fillStyle = '#2a1708'
  context.font = `bold ${Math.floor(h * 0.02)}px sans-serif`
  context.fillText('Arrival Card', cardX + 22, cardY + h * 0.05)
  context.fillText('3 months · Desk ready', cardX + 22, cardY + h * 0.085)

  // Speaker around x=80%
  const speakerX = w * 0.76
  const speakerY = h * 0.2
  context.fillStyle = '#3d2616'
  roundRect(context, speakerX, speakerY, w * 0.08, h * 0.08, 16)
  context.fill()
  context.fillStyle = '#e8c67a'
  context.beginPath()
  context.arc(speakerX + w * 0.04, speakerY + h * 0.04, h * 0.018, 0, Math.PI * 2)
  context.fill()

  // Locked drawer around x=70%
  const drawerX = w * 0.64
  const drawerY = h * 0.68
  context.fillStyle = '#4a301c'
  roundRect(context, drawerX, drawerY, w * 0.12, h * 0.16, 8)
  context.fill()
  context.strokeStyle = '#f1d48a'
  context.lineWidth = 2
  for (let i = 0; i < 3; i += 1) {
    const y = drawerY + 18 + i * (h * 0.045)
    context.strokeRect(drawerX + 14, y, w * 0.12 - 28, h * 0.032)
  }
  context.fillStyle = '#c08938'
  context.beginPath()
  context.arc(drawerX + w * 0.1, drawerY + h * 0.08, 8, 0, Math.PI * 2)
  context.fill()

  // Soft vignette
  const vignette = context.createRadialGradient(w / 2, h / 2, h * 0.2, w / 2, h / 2, h * 0.75)
  vignette.addColorStop(0, 'rgba(0,0,0,0)')
  vignette.addColorStop(1, 'rgba(12, 8, 5, 0.35)')
  context.fillStyle = vignette
  context.fillRect(0, 0, w, h)
}

function createAirportPanorama(): string {
  const canvas = document.createElement('canvas')
  canvas.width = 2048
  canvas.height = 1024
  paintAirportHall(canvas)
  return canvas.toDataURL('image/jpeg', 0.9)
}

async function resolvePanorama(imageUrl: string): Promise<{ url: string; revoke: boolean }> {
  try {
    const painted = createAirportPanorama()
    if (painted.startsWith('data:image/')) {
      return { url: painted, revoke: false }
    }
  } catch {
    // Fall through to the image file.
  }

  try {
    const response = await fetch(imageUrl)
    const type = response.headers.get('content-type') ?? ''
    if (response.ok && type.startsWith('image/')) {
      return { url: imageUrl, revoke: false }
    }
  } catch {
    // The placeholder file is not available yet.
  }

  return { url: '', revoke: false }
}

export function PanoramaViewer({
  imageUrl,
  hotspots,
  completedIds,
  onHotspotClick,
}: PanoramaViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const markersRef = useRef<MarkersPlugin | null>(null)
  const hotspotsRef = useRef(hotspots)
  const onHotspotClickRef = useRef(onHotspotClick)
  const [viewerReady, setViewerReady] = useState(false)

  hotspotsRef.current = hotspots
  onHotspotClickRef.current = onHotspotClick

  useEffect(() => {
    const container = containerRef.current
    if (!container) return
    const element: HTMLElement = container

    let viewer: Viewer | null = null
    let blobUrl = ''
    let cancelled = false

    function selectMarker(event: { type: string; marker?: { id: string } }) {
      if (event.type !== 'select-marker' || !event.marker) return
      const hotspot = hotspotsRef.current.find((item) => item.id === event.marker?.id)
      if (hotspot) onHotspotClickRef.current(hotspot)
    }

    async function mount() {
      const panorama = await resolvePanorama(imageUrl)
      if (cancelled) {
        if (panorama.revoke) URL.revokeObjectURL(panorama.url)
        return
      }
      if (!panorama.url) return
      if (panorama.revoke) blobUrl = panorama.url

      try {
        viewer = new Viewer({
          container: element,
          panorama: panorama.url,
          navbar: false,
          loadingTxt: '공항을 불러오는 중',
          mousemove: true,
          mousewheel: true,
          touchmoveTwoFingers: false,
          size: { width: '100%', height: '100%' },
          plugins: [MarkersPlugin],
        })
      } catch {
        return
      }

      if (cancelled) {
        viewer.destroy()
        viewer = null
        return
      }

      const markersPlugin = viewer.getPlugin<MarkersPlugin>(MarkersPlugin)
      markersPlugin.addEventListener('select-marker', selectMarker)
      markersRef.current = markersPlugin
      viewer.addEventListener('ready', () => {
        if (!cancelled) setViewerReady(true)
      })
      // 일부 환경에서 ready 이벤트가 늦어 표식이 안 뜨는 경우를 대비한다.
      window.setTimeout(() => {
        if (!cancelled) setViewerReady(true)
      }, 800)
    }

    void mount()

    return () => {
      cancelled = true
      markersRef.current?.removeEventListener('select-marker', selectMarker)
      markersRef.current = null
      viewer?.destroy()
      viewer = null
      if (blobUrl) URL.revokeObjectURL(blobUrl)
      setViewerReady(false)
    }
  }, [imageUrl])

  useEffect(() => {
    const markersPlugin = markersRef.current
    if (!viewerReady || !markersPlugin) return

    const completed = new Set(completedIds)
    markersPlugin.setMarkers(
      hotspots.map((hotspot) => ({
        id: hotspot.id,
        position: hotspotPosition(hotspot),
        html: markerHtml(hotspot, completed.has(hotspot.id)),
        size: { width: 120, height: 72 },
        anchor: 'center center',
        tooltip: hotspot.label,
      })),
    )
  }, [completedIds, hotspots, viewerReady])

  return <div ref={containerRef} className="panorama-viewer" />
}

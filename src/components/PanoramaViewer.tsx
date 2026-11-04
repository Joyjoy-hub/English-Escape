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

function markerHtml(completed: boolean) {
  return completed
    ? '<span class="hotspot-pin is-done">✓</span>'
    : '<span class="hotspot-pin"></span>'
}

function paintGradient(canvas: HTMLCanvasElement) {
  const context = canvas.getContext('2d')
  if (!context) return

  const sky = context.createLinearGradient(0, 0, 0, canvas.height)
  sky.addColorStop(0, '#6aa6d8')
  sky.addColorStop(0.42, '#d7efe6')
  sky.addColorStop(0.7, '#ead7b4')
  sky.addColorStop(1, '#8f9b78')
  context.fillStyle = sky
  context.fillRect(0, 0, canvas.width, canvas.height)

  const sun = context.createRadialGradient(640, 260, 16, 640, 260, 240)
  sun.addColorStop(0, '#fff6d6')
  sun.addColorStop(1, 'rgba(255, 246, 214, 0)')
  context.fillStyle = sun
  context.beginPath()
  context.arc(640, 260, 240, 0, Math.PI * 2)
  context.fill()
}

function createGradientPanorama(): Promise<string> {
  const canvas = document.createElement('canvas')
  canvas.width = 2048
  canvas.height = 1024
  paintGradient(canvas)

  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      resolve(blob ? URL.createObjectURL(blob) : '')
    }, 'image/jpeg', 0.92)
  })
}

async function resolvePanorama(imageUrl: string): Promise<{ url: string; revoke: boolean }> {
  try {
    const response = await fetch(imageUrl)
    const type = response.headers.get('content-type') ?? ''
    if (response.ok && type.startsWith('image/')) {
      return { url: imageUrl, revoke: false }
    }
  } catch {
    // The placeholder file is not available yet.
  }

  return { url: await createGradientPanorama(), revoke: true }
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

      viewer = new Viewer({
        container: element,
        panorama: panorama.url,
        navbar: false,
        loadingTxt: '파노라마를 불러오는 중',
        mousemove: true,
        mousewheel: true,
        touchmoveTwoFingers: false,
        size: { width: '100%', height: '100%' },
        plugins: [MarkersPlugin],
      })

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
        html: markerHtml(completed.has(hotspot.id)),
        size: { width: 36, height: 36 },
        anchor: 'center center',
        tooltip: hotspot.label,
      })),
    )
  }, [completedIds, hotspots, viewerReady])

  return <div ref={containerRef} className="panorama-viewer" />
}

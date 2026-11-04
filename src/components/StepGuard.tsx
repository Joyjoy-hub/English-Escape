import { useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { useLocation, useNavigate } from 'react-router'

import { useGameStore } from '../store/gameStore'
import type { GameStep } from '../store/gameStore'

export const stepPath: Record<GameStep, string> = {
  intro: '/home',
  learn: '/learn',
  explore: '/explore',
  dialogue: '/dialogue',
  exit: '/dialogue',
  result: '/result',
}

const guardedPaths = new Set(['/learn', '/explore', '/dialogue', '/result'])

type StepGuardProps = {
  children: ReactNode
}

export function StepGuard({ children }: StepGuardProps) {
  const step = useGameStore((state) => state.step)
  const location = useLocation()
  const navigate = useNavigate()
  const [hydrated, setHydrated] = useState(() => useGameStore.persist.hasHydrated())

  useEffect(() => {
    if (useGameStore.persist.hasHydrated()) {
      setHydrated(true)
      return
    }
    return useGameStore.persist.onFinishHydration(() => setHydrated(true))
  }, [])

  useEffect(() => {
    if (!hydrated || !guardedPaths.has(location.pathname)) return
    const target = stepPath[step]
    if (location.pathname !== target) {
      navigate(target, { replace: true })
    }
  }, [hydrated, location.pathname, navigate, step])

  return children
}

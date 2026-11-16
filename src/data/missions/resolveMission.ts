import type { Mission } from '../../types/mission'

import { day1Mission } from './day1'
import { missions } from './index'

/** 저장된 미션에 최신 scene(패널·사물) 데이터를 반영합니다. */
export function resolveMission(stored: Mission | null): Mission {
  if (!stored) return day1Mission
  const latest = missions.find((mission) => mission.id === stored.id)
  if (!latest) return stored
  return latest
}
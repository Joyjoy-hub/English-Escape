import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router'

import { PageFrame } from '../components/PageFrame'
import { stepPath } from '../components/StepGuard'
import { destinations } from '../data/destinations'
import { missions } from '../data/missions'
import { useGameStore } from '../store/gameStore'
import type { Destination, Mission } from '../types/mission'
import './HomePage.css'

function missionFor(countryId: string, placeId: string): Mission | null {
  return missions.find((mission) => mission.country.id === countryId && mission.place.id === placeId) ?? null
}

function savedCountryId(mission: Mission) {
  return mission.country?.id ?? (mission.id === 'day1-immigration' ? 'new-zealand' : null)
}

const englishLabel: Record<string, string> = {
  'new-zealand': 'New Zealand',
  australia: 'Australia',
  'united-states': 'United States',
  'united-kingdom': 'United Kingdom',
  canada: 'Canada',
  ireland: 'Ireland',
  singapore: 'Singapore',
  airport: 'Airport',
  school: 'School',
  lodging: 'Lodging',
  restaurant: 'Restaurant',
  cafe: 'Cafe',
  mart: 'Market',
  hospital: 'Hospital',
  bank: 'Bank',
}

export function HomePage() {
  const navigate = useNavigate()
  const savedMission = useGameStore((state) => state.mission)
  const step = useGameStore((state) => state.step)
  const startMission = useGameStore((state) => state.startMission)
  const goToStep = useGameStore((state) => state.goToStep)
  const [hydrated, setHydrated] = useState(() => useGameStore.persist.hasHydrated())
  const [countryId, setCountryId] = useState<string | null>(null)
  const [closedPlaceId, setClosedPlaceId] = useState<string | null>(null)
  const country = destinations.countries.find((item) => item.id === countryId) ?? null
  const canContinue = Boolean(
    hydrated &&
      country &&
      savedMission &&
      step !== 'intro' &&
      savedCountryId(savedMission) === country.id,
  )

  useEffect(() => {
    if (useGameStore.persist.hasHydrated()) {
      setHydrated(true)
      return
    }
    return useGameStore.persist.onFinishHydration(() => setHydrated(true))
  }, [])

  function chooseCountry(nextCountryId: string) {
    setClosedPlaceId(null)
    setCountryId(nextCountryId)
  }

  function choosePlace(place: Destination) {
    if (!country) return
    const mission = missionFor(country.id, place.id)
    if (!mission) {
      setClosedPlaceId(place.id)
      return
    }
    startMission(mission)
    goToStep('learn')
    if (useGameStore.getState().step === 'learn') {
      navigate('/learn')
    }
  }

  if (!country) {
    return (
      <PageFrame title="국가 선택" description="여행할 국가를 고르세요.">
        <div className="home-choices">
          {destinations.countries.map((item) => (
            <button key={item.id} type="button" className="home-choice" onClick={() => chooseCountry(item.id)}>
              <span className="home-choice-copy">
                <span className="home-choice-en">{englishLabel[item.id] ?? item.id}</span>
                <span>{item.name}</span>
              </span>
            </button>
          ))}
        </div>
      </PageFrame>
    )
  }

  return (
    <PageFrame title="장소 선택" description={`${country.name}에서 갈 장소를 고르세요.`}>
      {canContinue ? (
        <div className="home-continue">
          <p>이어서 할 진행이 있어요</p>
          <button type="button" onClick={() => navigate(stepPath[step])}>
            이어하기
          </button>
        </div>
      ) : null}
      <div className="home-choices">
        {destinations.places.map((place) => {
          const open = missionFor(country.id, place.id) !== null
          return (
            <button key={place.id} type="button" className="home-choice" onClick={() => choosePlace(place)}>
              <span className="home-choice-copy">
                <span className="home-choice-en">{englishLabel[place.id] ?? place.id}</span>
                <span>{place.name}</span>
              </span>
              {open ? null : <span className="home-choice-note">곧 공개돼요</span>}
            </button>
          )
        })}
      </div>
      {closedPlaceId ? (
        <p className="home-soon" role="status">
          이 장소의 미션은 곧 공개돼요
        </p>
      ) : null}
      <button
        type="button"
        className="home-back"
        onClick={() => {
          setClosedPlaceId(null)
          setCountryId(null)
        }}
      >
        이전
      </button>
    </PageFrame>
  )
}

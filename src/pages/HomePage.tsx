import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router'

import { stepPath } from '../components/StepGuard'
import { countryMapPins } from '../data/countryMap'
import { destinations } from '../data/destinations'
import { placeCards } from '../data/placeMap'
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

export function HomePage() {
  const navigate = useNavigate()
  const savedMission = useGameStore((state) => state.mission)
  const step = useGameStore((state) => state.step)
  const startMission = useGameStore((state) => state.startMission)
  const goToStep = useGameStore((state) => state.goToStep)
  const [hydrated, setHydrated] = useState(() => useGameStore.persist.hasHydrated())
  const [countryId, setCountryId] = useState<string | null>(null)
  const [focusedCountryId, setFocusedCountryId] = useState<string | null>('new-zealand')
  const [closedPlaceId, setClosedPlaceId] = useState<string | null>(null)
  const country = destinations.countries.find((item) => item.id === countryId) ?? null
  const countryPin = countryMapPins.find((pin) => pin.id === countryId) ?? null
  const focusedPin = countryMapPins.find((pin) => pin.id === focusedCountryId) ?? null
  const focusedCountry = destinations.countries.find((item) => item.id === focusedCountryId) ?? null
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
      <main className="dest-screen">
        <div className="dest-map-scroll">
          <div className="dest-map" role="group" aria-label="세계 지도">
            <img className="dest-map-image" src="/world-map.jpg" alt="" />
            <div className="dest-map-veil" aria-hidden="true" />

            {focusedPin ? (
              <span
                className="dest-plane"
                style={{ left: `${focusedPin.x}%`, top: `${focusedPin.y}%` }}
                aria-hidden="true"
              >
                ✈
              </span>
            ) : null}

            {countryMapPins.map((pin) => {
              const label = destinations.countries.find((item) => item.id === pin.id)?.name ?? pin.en
              const selected = pin.id === focusedCountryId
              return (
                <button
                  key={pin.id}
                  type="button"
                  className={selected ? 'dest-pin is-selected' : 'dest-pin'}
                  style={{ left: `${pin.x}%`, top: `${pin.y}%` }}
                  aria-pressed={selected}
                  aria-label={label}
                  onClick={() => setFocusedCountryId(pin.id)}
                >
                  <span className="dest-pin-ring" aria-hidden="true">
                    <img src={pin.landmark} alt="" />
                  </span>
                  <span className="dest-pin-name">{label}</span>
                </button>
              )
            })}
          </div>
        </div>

        <header className="dest-top">
          <p className="dest-brand">English Escape</p>
          <div className="dest-top-copy">
            <h1>국가 선택</h1>
            <p>지도의 나라를 눌러 여행을 시작하세요</p>
          </div>
        </header>

        {focusedPin && focusedCountry ? (
          <section className="dest-panel" aria-live="polite">
            <div className="dest-panel-photo">
              <img src={focusedPin.landmark} alt="" />
            </div>
            <div className="dest-panel-body">
              <p className="dest-panel-en">{focusedPin.en}</p>
              <h2>{focusedCountry.name}</h2>
              <p className="dest-panel-tag">{focusedPin.tagline}</p>
              <p className="dest-panel-blurb">{focusedPin.blurb}</p>
              <button type="button" className="dest-panel-cta" onClick={() => chooseCountry(focusedPin.id)}>
                모험 시작하기
              </button>
            </div>
          </section>
        ) : null}
      </main>
    )
  }

  return (
    <main className="place-screen">
      <header className="place-hero">
        {countryPin ? <img className="place-hero-image" src={countryPin.landmark} alt="" /> : null}
        <div className="place-hero-veil" aria-hidden="true" />
        <button
          type="button"
          className="place-back"
          aria-label="지도로 돌아가기"
          onClick={() => {
            setClosedPlaceId(null)
            setCountryId(null)
          }}
        >
          ←
        </button>
        <div className="place-hero-copy">
          <p className="place-brand">English Escape</p>
          <p className="place-country-en">{countryPin?.en ?? country.id}</p>
          <h1>장소 선택</h1>
          <p>{country.name}에서 갈 장소를 고르세요</p>
        </div>
      </header>

      <div className="place-sheet">
        {canContinue ? (
          <div className="place-continue">
            <div>
              <p className="place-continue-label">진행 중</p>
              <p>이어서 할 미션이 있어요</p>
            </div>
            <button type="button" onClick={() => navigate(stepPath[step])}>
              이어하기
            </button>
          </div>
        ) : null}

        <div className="place-grid">
          {destinations.places.map((place) => {
            const card = placeCards.find((item) => item.id === place.id)
            const open = missionFor(country.id, place.id) !== null
            return (
              <button
                key={place.id}
                type="button"
                className={open ? 'place-card is-open' : 'place-card is-locked'}
                onClick={() => choosePlace(place)}
              >
                <span className="place-card-icon" aria-hidden="true">
                  {card?.icon ?? '•'}
                </span>
                <span className="place-card-copy">
                  <span className="place-card-en">{card?.en ?? place.id}</span>
                  <span className="place-card-name">{place.name}</span>
                  <span className="place-card-blurb">{card?.blurb ?? ''}</span>
                </span>
                <span className="place-card-status">{open ? '열림' : '곧 공개'}</span>
              </button>
            )
          })}
        </div>

        {closedPlaceId ? (
          <p className="place-soon" role="status">
            이 장소의 미션은 곧 공개돼요
          </p>
        ) : null}
      </div>
    </main>
  )
}

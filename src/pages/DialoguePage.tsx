import { useEffect, useRef, useState } from 'react'
import type { AnimationEvent } from 'react'
import { useNavigate } from 'react-router'

import { ChoiceInput } from '../components/ChoiceInput'
import { HomeButton } from '../components/HomeButton'
import { SurvivalKitModal } from '../components/SurvivalKitModal'
import { day1Mission } from '../data/missions/day1'
import { useGameStore } from '../store/gameStore'
import type { DialogueChoice } from '../types/mission'
import './DialoguePage.css'

const RETRY_LINE = 'Sorry, could you say that again?'

type ChatMessage = {
  id: string
  speaker: 'npc' | 'user'
  text: string
}

function speakEnglish(text: string) {
  if (!('speechSynthesis' in window)) return
  window.speechSynthesis.cancel()
  const utterance = new SpeechSynthesisUtterance(text)
  utterance.lang = 'en-US'
  window.speechSynthesis.speak(utterance)
}

export function DialoguePage() {
  const storedMission = useGameStore((state) => state.mission)
  const slots = useGameStore((state) => state.slots)
  const step = useGameStore((state) => state.step)
  const fillSlot = useGameStore((state) => state.fillSlot)
  const recordMistake = useGameStore((state) => state.recordMistake)
  const goToStep = useGameStore((state) => state.goToStep)
  const navigate = useNavigate()
  const mission = !storedMission || storedMission.id === day1Mission.id ? day1Mission : storedMission
  const dialogue = mission.dialogue
  const [turnIndex, setTurnIndex] = useState(0)
  const [showStamp, setShowStamp] = useState(false)
  const [kitOpen, setKitOpen] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    const first = dialogue.turns[0]
    return first ? [{ id: `${first.id}-npc`, speaker: 'npc', text: first.npcText }] : []
  })
  const messageId = useRef(0)
  const advanced = useRef(false)
  const chatEndRef = useRef<HTMLLIElement>(null)

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ block: 'end' })
  }, [messages, showStamp])

  useEffect(() => {
    return () => {
      if ('speechSynthesis' in window) window.speechSynthesis.cancel()
    }
  }, [])

  function nextId(prefix: string) {
    messageId.current += 1
    return `${prefix}-${messageId.current}`
  }

  function finishDialogue() {
    if (advanced.current) return
    advanced.current = true
    goToStep('exit')
  }

  useEffect(() => {
    if (!showStamp) return
    const timer = window.setTimeout(finishDialogue, 1000)
    return () => window.clearTimeout(timer)
  }, [showStamp])

  useEffect(() => {
    if (step !== 'exit') return
    const timer = window.setTimeout(() => {
      goToStep('result')
      navigate('/result')
    }, 1400)
    return () => window.clearTimeout(timer)
  }, [goToStep, navigate, step])

  function selectChoice(choice: DialogueChoice) {
    if (showStamp) return
    const turn = dialogue.turns[turnIndex]
    if (!turn) return

    const userMessage: ChatMessage = { id: nextId('user'), speaker: 'user', text: choice.text }

    if (choice.quality === 'wrong') {
      setMessages((current) => [
        ...current,
        userMessage,
        { id: nextId('npc'), speaker: 'npc', text: RETRY_LINE },
        { id: nextId('npc'), speaker: 'npc', text: turn.npcText },
      ])
      return
    }

    if (choice.quality === 'awkward') {
      recordMistake({ text: choice.text, naturalVersion: choice.naturalVersion })
    }
    fillSlot(choice.slot)

    const nextTurn = dialogue.turns[turnIndex + 1]
    if (!nextTurn) {
      setMessages((current) => [...current, userMessage])
      setShowStamp(true)
      return
    }

    setTurnIndex((current) => current + 1)
    setMessages((current) => [
      ...current,
      userMessage,
      { id: nextId('npc'), speaker: 'npc', text: nextTurn.npcText },
    ])
  }

  const currentTurn = dialogue.turns[turnIndex]

  function onStampAnimationEnd(event: AnimationEvent<HTMLDivElement>) {
    if (event.animationName !== 'dialogue-stamp-in') return
    finishDialogue()
  }

  return (
    <main className="dialogue-page">
      <header className="dialogue-header">
        <HomeButton />
        <div className="dialogue-heading">
          <p className="page-kicker">English Escape</p>
          <h1>{dialogue.npcName}</h1>
          <p className="dialogue-goal">{dialogue.goal}</p>
        </div>
        <button type="button" className="dialogue-kit" onClick={() => setKitOpen(true)}>
          Survival Kit 수첩
        </button>
      </header>
      <ul className="dialogue-goals" aria-label="대화 목표">
        {dialogue.slots.map((slot) => {
          const done = slots[slot.id]
          return (
            <li key={slot.id} className={done ? 'is-done' : undefined}>
              <span aria-hidden="true">{done ? '✓' : '○'}</span>
              {slot.label}
            </li>
          )
        })}
      </ul>
      {messages.length === 0 ? (
        <p className="dialogue-empty">이번 미션의 대화가 없습니다.</p>
      ) : (
        <ol className="dialogue-chat" aria-label="대화">
          {messages.map((message) => (
            <li
              key={message.id}
              className={message.speaker === 'npc' ? 'dialogue-bubble is-npc' : 'dialogue-bubble is-user'}
            >
              {message.speaker === 'npc' ? <span className="dialogue-speaker">{dialogue.npcName}</span> : null}
              <p>{message.text}</p>
              {message.speaker === 'npc' ? (
                <button type="button" className="dialogue-speak" onClick={() => speakEnglish(message.text)}>
                  발음 듣기
                </button>
              ) : null}
            </li>
          ))}
          <li ref={chatEndRef} />
        </ol>
      )}
      {currentTurn && !showStamp ? (
        <div className="dialogue-composer">
          <ChoiceInput choices={currentTurn.choices} onSelect={selectChoice} />
        </div>
      ) : null}
      {showStamp && step !== 'exit' ? (
        <div className="dialogue-stamp" role="status" onAnimationEnd={onStampAnimationEnd}>
          통과
        </div>
      ) : null}
      {step === 'exit' ? (
        <div className="dialogue-exit" role="status">
          <p>탈출 성공!</p>
        </div>
      ) : null}
      <SurvivalKitModal isOpen={kitOpen} onClose={() => setKitOpen(false)} />
    </main>
  )
}

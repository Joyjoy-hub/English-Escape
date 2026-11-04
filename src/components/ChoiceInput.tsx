import type { DialogueChoice } from '../types/mission'
import './ChoiceInput.css'

type ChoiceInputProps = {
  choices: DialogueChoice[]
  onSelect: (choice: DialogueChoice) => void
}

export function ChoiceInput({ choices, onSelect }: ChoiceInputProps) {
  return (
    <div className="choice-input" role="group" aria-label="답변 선택">
      {choices.map((choice) => (
        <button key={choice.id} type="button" onClick={() => onSelect(choice)}>
          {choice.text}
        </button>
      ))}
    </div>
  )
}

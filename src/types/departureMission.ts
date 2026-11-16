export type DepartureExpression = {
  en: string
  ko: string
  usage: string
}

export type DepartureChoice = {
  id: string
  text: string
  quality: 'good' | 'awkward' | 'wrong'
  reply: string
  explain: string
}

export type DepartureListenPuzzle = {
  id: string
  type: 'listen'
  title: string
  npcName: string
  line: string
  prompt: string
  answer: string
  accept: string[]
  slowRate: number
  askAgainChoice: string
  wrongExplain: string
  hintKo: string
  clueLabel: string
  clueValue: string
}

export type DepartureTalkPuzzle = {
  id: string
  type: 'talk'
  title: string
  npcName: string
  situation: string
  line: string
  choices: DepartureChoice[]
  askAgainChoiceId: string
  slowRate: number
  hintKo: string
  clueLabel: string
  clueValue: string
}

export type DepartureReadPuzzle = {
  id: string
  type: 'read'
  title: string
  prompt: string
  documentTitle: string
  documentLines: string[]
  lockPrompt: string
  answer: string
  wrongExplain: string
  hintKo: string
  clueLabel: string
  clueValue: string
}

export type DeparturePuzzle = DepartureListenPuzzle | DepartureTalkPuzzle | DepartureReadPuzzle

export type DepartureSceneHotspot = {
  id: string
  label: string
  /** 배경 이미지 기준 가로 위치. 0~100 */
  x: number
  /** 배경 이미지 기준 세로 위치. 0~100 */
  y: number
  puzzleId: string
}

export type DepartureMission = {
  id: string
  title: string
  place: string
  intro: string
  clearMessage: string
  maxScore: number
  hintPenalty: number
  scene: {
    backgroundImage: string
    hotspots: DepartureSceneHotspot[]
  }
  expressions: DepartureExpression[]
  puzzles: DeparturePuzzle[]
}

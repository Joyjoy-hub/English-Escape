export type MissionId = string;

export type Destination = {
  id: string;
  name: string;
};

export type ClueId = string;

export type Expression = {
  en: string;
  ko: string;
  usage: string;
};

export type VocabularyItem = {
  word: string;
  meaning: string;
};

export type QuizChoice = {
  id: string;
  text: string;
};

/** [질문의 한글 뜻, 정답 첫 글자 또는 힌트 문장, 정답] */
export type HotspotHints = [string, string, string];

type HotspotBase = {
  id: string;
  label: string;
  /** 배경 이미지 기준 가로 위치. 0~100 */
  x: number;
  /** 배경 이미지 기준 세로 위치. 0~100 */
  y: number;
};

export type ReadHotspot = HotspotBase & {
  type: "read";
  text: string;
  question: string;
  choices: QuizChoice[];
  /** 정답 선택지의 id */
  answer: string;
  clueId: ClueId;
  clueValue: string;
  hints: HotspotHints;
};

export type ListenHotspot = HotspotBase & {
  type: "listen";
  text: string;
  question: string;
  choices: QuizChoice[];
  /** 정답 선택지의 id */
  answer: string;
  clueId: ClueId;
  clueValue: string;
  hints: HotspotHints;
};

export type LockHotspot = HotspotBase & {
  type: "lock";
  prompt: string;
  /** 세 자리 코드 */
  answer: string;
  /** 코드를 만들 단서 id. 배열 순서가 코드 자릿수 순서 */
  requires: ClueId[];
};

export type Hotspot = ReadHotspot | ListenHotspot | LockHotspot;

export type Scene = {
  backgroundImage: string;
  hotspots: Hotspot[];
};

export type DialogueSlotId = "purpose" | "duration" | "lodging";

export type DialogueSlot = {
  id: DialogueSlotId;
  label: string;
};

export type ChoiceQuality = "good" | "awkward" | "wrong";

export type DialogueChoice = {
  id: string;
  text: string;
  slot: DialogueSlotId;
  quality: ChoiceQuality;
  naturalVersion: string;
};

export type DialogueTurn = {
  id: string;
  npcText: string;
  choices: DialogueChoice[];
};

export type Dialogue = {
  npcName: string;
  goal: string;
  slots: DialogueSlot[];
  turns: DialogueTurn[];
};

export type MissionExit = {
  requiredClueIds: ClueId[];
  requiredLockId: string;
  requireDialogue: boolean;
  message: string;
};

export type Mission = {
  id: MissionId;
  title: string;
  country: Destination;
  place: Destination;
  intro: string;
  expressions: Expression[];
  vocabulary: VocabularyItem[];
  scene: Scene;
  dialogue: Dialogue;
  exit: MissionExit;
};

export type PlaceCard = {
  id: string
  en: string
  blurb: string
  icon: string
}

export const placeCards: PlaceCard[] = [
  {
    id: 'airport',
    en: 'Airport',
    blurb: '입국과 출국부터 시작해요',
    icon: '✈',
  },
  {
    id: 'school',
    en: 'School',
    blurb: '수업과 캠퍼스 장면',
    icon: '🎓',
  },
  {
    id: 'lodging',
    en: 'Lodging',
    blurb: '숙소 체크인과 생활',
    icon: '⌂',
  },
  {
    id: 'restaurant',
    en: 'Restaurant',
    blurb: '주문하고 대화하기',
    icon: '🍽',
  },
  {
    id: 'cafe',
    en: 'Cafe',
    blurb: '카페에서 쓰는 표현',
    icon: '☕',
  },
  {
    id: 'mart',
    en: 'Market',
    blurb: '장을 보며 말하기',
    icon: '🛒',
  },
  {
    id: 'hospital',
    en: 'Hospital',
    blurb: '증상 설명과 진료',
    icon: '+',
  },
  {
    id: 'bank',
    en: 'Bank',
    blurb: '계좌와 환전 장면',
    icon: '＄',
  },
]

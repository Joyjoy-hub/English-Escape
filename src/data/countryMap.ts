export type CountryMapPin = {
  id: string
  en: string
  tagline: string
  blurb: string
  /** 지도 가로 위치. 0~100 */
  x: number
  /** 지도 세로 위치. 0~100 */
  y: number
}

export const countryMapPins: CountryMapPin[] = [
  {
    id: 'canada',
    en: 'Canada',
    tagline: '북미의 넓은 자연',
    blurb: '넓은 자연과 친절한 도시에서 영어로 여행을 시작해요.',
    x: 20,
    y: 26,
  },
  {
    id: 'united-states',
    en: 'United States',
    tagline: '다양한 도시의 영어',
    blurb: '뉴욕부터 서부까지, 생생한 미국 영어를 만나보세요.',
    x: 22,
    y: 40,
  },
  {
    id: 'ireland',
    en: 'Ireland',
    tagline: '초록 섬의 이야기',
    blurb: '따뜻한 아일랜드 영어와 여행 장면을 배워 보세요.',
    x: 42,
    y: 34,
  },
  {
    id: 'united-kingdom',
    en: 'United Kingdom',
    tagline: '클래식 브리티시',
    blurb: '런던과 영국식 표현으로 여행을 준비해요.',
    x: 49,
    y: 26,
  },
  {
    id: 'singapore',
    en: 'Singapore',
    tagline: '아시아의 허브',
    blurb: '다문화 도시에서 쓰는 실용 영어를 익혀 보세요.',
    x: 76,
    y: 58,
  },
  {
    id: 'australia',
    en: 'Australia',
    tagline: '남반구의 모험',
    blurb: '호주 억양과 여행 장면에서 쓰는 표현을 배워요.',
    x: 84,
    y: 72,
  },
  {
    id: 'new-zealand',
    en: 'New Zealand',
    tagline: '모험이 기다려요',
    blurb: '입국 심사부터 시작하는 뉴질랜드 미션에 도전해 보세요.',
    x: 92,
    y: 82,
  },
]

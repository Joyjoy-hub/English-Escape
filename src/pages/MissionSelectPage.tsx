import { Link } from 'react-router'

import { PageFrame } from '../components/PageFrame'

export function MissionSelectPage() {
  return (
    <PageFrame title="미션 선택" description="플레이할 미션을 고르는 화면입니다.">
      <Link className="back" to="/home">
        홈
      </Link>
    </PageFrame>
  )
}

import { useNavigate } from 'react-router'

import './Title.css'

export function Title() {
  const navigate = useNavigate()

  return (
    <main className="title-screen">
      <img className="title-bg" src="/title-opening.jpg" alt="" />
      <div className="title-veil" />
      <div className="title-main">
        <header className="title-plaque">
          <div className="title-plaque-inner">
            <p className="title-kicker">여행의 문을 여는 영어</p>
            <h1>English Escape</h1>
            <span className="title-rule" aria-hidden="true" />
            <p className="title-slogan">영어로 탈출하라!</p>
          </div>
        </header>
        <div className="title-actions">
          <button type="button" onClick={() => navigate('/home')}>
            Start
          </button>
        </div>
      </div>
    </main>
  )
}

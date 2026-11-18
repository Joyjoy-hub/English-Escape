import { Route, Routes } from 'react-router'

import { StepGuard } from './components/StepGuard'
import { DialoguePage } from './pages/DialoguePage'
import { ExplorePage } from './pages/ExplorePage'
import { HomePage } from './pages/HomePage'
import { LearnPage } from './pages/LearnPage'
import { MissionSelectPage } from './pages/MissionSelectPage'
import { ResultPage } from './pages/ResultPage'
import { ReviewNote } from './screens/ReviewNote'
import { Title } from './screens/Title'
import './LandscapeViewport.css'

export default function App() {
  return (
    <StepGuard>
      <div className="app-landscape-root">
        <div id="app-landscape-stage" className="app-landscape-stage">
          <div className="app-route-outlet">
          <Routes>
            <Route path="/" element={<Title />} />
            <Route path="/home" element={<HomePage />} />
            <Route path="/mission-select" element={<MissionSelectPage />} />
            <Route path="/learn" element={<LearnPage />} />
            <Route path="/explore" element={<ExplorePage />} />
            <Route path="/dialogue" element={<DialoguePage />} />
            <Route path="/result" element={<ResultPage />} />
            <Route path="/review" element={<ReviewNote />} />
          </Routes>
          </div>
        </div>
      </div>
    </StepGuard>
  )
}

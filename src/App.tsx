import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Home } from './pages/Home'
import { Chat } from './pages/Chat'
import { ChatMobile } from './pages/ChatMobile'
import { Settings } from './pages/Settings'
import AnalyzerHome from './features/job-analyzer/AnalyzerHome'
import AgreementPage from './features/job-analyzer/AgreementPage'
import ResumePage from './features/job-analyzer/Resume'
import SettingsPage from './features/job-analyzer/Settings'
import { DesktopGuard, MobileGuard } from './components/DeviceGuard'
import './App.css'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />

        {/* Desktop chat — redirects mobile users to /chat-mobile */}
        <Route
          path="/chat"
          element={
            <DesktopGuard>
              <Chat />
            </DesktopGuard>
          }
        />

        {/* Mobile chat — redirects desktop users to /chat */}
        <Route
          path="/chat-mobile"
          element={
            <MobileGuard>
              <ChatMobile />
            </MobileGuard>
          }
        />

        <Route path="/settings" element={<Settings />} />

        {/* Job Analyzer Routes */}
        <Route path="/job-analyzer" element={<AnalyzerHome />} />
        <Route path="/job-analyzer/agreement" element={<AgreementPage />} />
        <Route path="/job-analyzer/resume" element={<ResumePage />} />
        <Route path="/job-analyzer/settings" element={<SettingsPage />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App

import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Chat } from './pages/Chat'
import { ChatMobile } from './pages/ChatMobile'
import { DesktopGuard, MobileGuard } from './components/DeviceGuard'
import './App.css'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Root goes directly to Chat — redirects mobile users to /chat-mobile */}
        <Route
          path="/"
          element={
            <DesktopGuard>
              <Chat />
            </DesktopGuard>
          }
        />

        {/* Mobile chat — redirects desktop users to / */}
        <Route
          path="/chat-mobile"
          element={
            <MobileGuard>
              <ChatMobile />
            </MobileGuard>
          }
        />
      </Routes>
    </BrowserRouter>
  )
}

export default App

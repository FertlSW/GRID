// App-Root: Routing zwischen den drei Seiten.

import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { LandingPage } from '@/pages/LandingPage'
import { WizardPage } from '@/pages/WizardPage'
import { ResultsPage } from '@/pages/ResultsPage'
import { ProjektProvider } from '@/state/ProjektContext'
import { ChatThreadsProvider } from '@/state/ChatThreadsContext'

export default function App() {
  return (
    <ProjektProvider>
      <ChatThreadsProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/wizard" element={<WizardPage />} />
            <Route path="/ergebnisse" element={<ResultsPage />} />
            <Route path="*" element={<LandingPage />} />
          </Routes>
        </BrowserRouter>
      </ChatThreadsProvider>
    </ProjektProvider>
  )
}

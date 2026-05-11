// Einstiegspunkt: hängt die React-App an das <div id="root" /> in index.html.

import React from 'react'
import ReactDOM from 'react-dom/client'
import App from '@/App'
import '@/styles/globals.css'
import { runDevChecks } from '@/lib/rules/devChecks'

runDevChecks()

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)

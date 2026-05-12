// Ergebnis-Seite: oben View-Toggle, darunter wechselnd „Nachschlagen" oder „Dashboard".
// App-Layout: keine Page-Scroll, der Inhaltsbereich scrollt intern.
// Nachschlagen ist die kombinierte Lookup+Chat-Ansicht (ehemals View A + View C);
// Chat-Verlauf erscheint dort, sobald eine Frage gestellt wurde.
//
// Wechsel-Verhalten:
//   • NachschlagenView ist IMMER gemountet (nur via CSS ein-/ausgeblendet),
//     damit Scroll-Position, Filter-Pills, Such-State und Hero-Collapse
//     den Tab-Wechsel überleben.
//   • ViewB (Dashboard) wird bewusst nur dann gemountet, wenn aktiv — die
//     9 Layout-Animationen und LLM-Hooks sind teuer; jeder Re-Mount holt
//     sich aus dem persistenten Cache, blockiert aber den Render-Pfad mit
//     vielen Frames. Vorigerer `AnimatePresence mode="wait"` blockierte
//     gelegentlich den Tab-Wechsel, deshalb jetzt entfernt.

import { useState } from 'react'
import { useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'

import { Shell } from '@/components/Shell'
import { ProjektMenu } from '@/components/ProjektMenu'
import { ViewToggle, type ViewMode } from '@/components/shared/ViewToggle'
import { ViewB } from '@/components/viewB/ViewB'
import { NachschlagenView } from '@/components/lookup/NachschlagenView'
import { ChatHeaderActions } from '@/components/viewC/ChatHeaderActions'
import { ViewC } from '@/components/viewC/ViewC'
import { MotionReveal } from '@/components/shared/MotionReveal'
import { useChat } from '@/hooks/useChat'
import { cn } from '@/lib/cn'

export function ResultsPage() {
  const location = useLocation()
  const initialView: ViewMode =
    (location.state as { initialView?: ViewMode } | null)?.initialView ===
    'dashboard'
      ? 'dashboard'
      : 'lookup'
  const [view, setView] = useState<ViewMode>(initialView)

  return (
    <Shell
      appLayout
      headerProject={<ProjektMenu />}
      headerRight={view === 'lookup' ? <ChatHeaderActions /> : null}
    >
      <div className="h-full flex flex-col">
        {/* View-Toggle-Bar — fest unter dem Header */}
        <div className="shrink-0 bg-paper border-b border-line-soft">
          <div className="mx-auto max-w-[1400px] px-6 md:px-10 py-3 flex justify-center">
            <ViewToggle
              value={view}
              onChange={(next) => {
                setView(next)
              }}
            />
          </div>
        </div>

        {/* Content-Bereich. Beide Views liegen im Layer übereinander; der
            inaktive ist via `hidden` deaktiviert (kein Render-Cycle, kein
            Tab-Stop, kein Scroll-Reset). NachschlagenView bleibt dadurch im
            Hintergrund alive — Scroll- und Filter-State überleben Wechsel. */}
        <div className="flex-1 min-h-0 overflow-hidden relative">
          <motion.div
            key="view-lookup"
            initial={false}
            animate={{ opacity: view === 'lookup' ? 1 : 0 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className={cn(
              'absolute inset-0 h-full',
              view === 'lookup' ? '' : 'pointer-events-none',
            )}
            aria-hidden={view !== 'lookup'}
            style={{ visibility: view === 'lookup' ? 'visible' : 'hidden' }}
          >
            <NachschlagenView onOpenChat={() => setView('chat')} />
          </motion.div>

          <motion.div
            key="view-chat"
            initial={false}
            animate={{ opacity: view === 'chat' ? 1 : 0 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className={cn(
              'absolute inset-0 h-full',
              view === 'chat' ? '' : 'pointer-events-none',
            )}
            aria-hidden={view !== 'chat'}
            style={{ visibility: view === 'chat' ? 'visible' : 'hidden' }}
          >
            <ViewC withSidebar />
          </motion.div>

          {view === 'dashboard' && (
            <motion.div
              key="view-dashboard"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
              className="absolute inset-0 h-full overflow-y-auto"
            >
              <div className="mx-auto max-w-[1400px] px-6 md:px-10 py-10">
                <MotionReveal>
                  <div className="mb-8">
                    <h1 className="text-2xl font-medium tracking-tight">
                      Architekten-Dashboard
                    </h1>
                    <p className="text-sm text-muted mt-1">
                      Nach räumlichem Maßstab und Planungsphase — zeigt in jeder
                      Phase nur das, was du gerade brauchst.
                    </p>
                  </div>
                </MotionReveal>
                <ViewB />
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </Shell>
  )
}

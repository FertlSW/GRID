// Ergebnis-Seite: oben View-Toggle, darunter wechselnd View A / B / C.
// App-Layout: keine Page-Scroll, der Inhaltsbereich scrollt intern.
// View C bekommt den vollen Bereich ohne Padding (Sidebar + Chat füllen ihn);
// View A und B scrollen in einem padded Container.

import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'

import { Shell } from '@/components/Shell'
import { ProjektMenu } from '@/components/ProjektMenu'
import { ViewToggle, type ViewMode } from '@/components/shared/ViewToggle'
import { ViewA } from '@/components/viewA/ViewA'
import { ViewB } from '@/components/viewB/ViewB'
import { ViewC } from '@/components/viewC/ViewC'
import { ChatHeaderActions } from '@/components/viewC/ChatHeaderActions'
import { MotionReveal } from '@/components/shared/MotionReveal'
import { cn } from '@/lib/cn'

export function ResultsPage() {
  const navigate = useNavigate()
  const [view, setView] = useState<ViewMode>('A')

  const istChat = view === 'C'

  return (
    <Shell
      appLayout
      headerProject={<ProjektMenu />}
      headerRight={
        <div className="flex items-center gap-3">
          {istChat && (
            <>
              <ChatHeaderActions />
              <span className="h-3 w-px bg-line-soft" aria-hidden />
            </>
          )}
          <button
            onClick={() => navigate('/wizard')}
            className="group inline-flex items-center gap-1 text-xxs text-muted hover:text-ink transition-colors"
          >
            <ArrowLeft size={12} />
            Parameter ändern
          </button>
        </div>
      }
    >
      <div className="h-full flex flex-col">
        {/* View-Toggle-Bar — fest unter dem Header */}
        <div className="shrink-0 bg-paper border-b border-line-soft">
          <div className="mx-auto max-w-[1400px] px-6 md:px-10 py-3 flex justify-center">
            <ViewToggle value={view} onChange={setView} />
          </div>
        </div>

        {/* Content-Bereich. Bei View A/B scrollt er intern und hat Padding,
            bei View C füllt er ohne Padding und ohne eigenen Scroll. */}
        <div
          className={cn(
            'flex-1 min-h-0',
            istChat ? 'overflow-hidden' : 'overflow-y-auto',
          )}
        >
          {istChat ? (
            <ViewC />
          ) : (
            <div className="mx-auto max-w-[1400px] px-6 md:px-10 py-10">
              <AnimatePresence mode="wait">
                {view === 'A' && (
                  <motion.div
                    key="view-a"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <MotionReveal>
                      <div className="mb-8">
                        <h1 className="text-2xl font-medium tracking-tight">
                          Nachschlage-Ansicht
                        </h1>
                        <p className="text-sm text-muted mt-1">
                          Alle geltenden Vorschriften, sortiert nach juristischer Struktur.
                          Regel anklicken → Erklärung → Originalzitat.
                        </p>
                      </div>
                    </MotionReveal>
                    <ViewA />
                  </motion.div>
                )}
                {view === 'B' && (
                  <motion.div
                    key="view-b"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                  >
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
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>
    </Shell>
  )
}

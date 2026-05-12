// Landing-Seite: großflächig weiß, zentriertes Logo + CTA.
// Motion: gestaffeltes Einblenden (Logo → Untertitel → Buttons → Disclaimer).

import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { ArrowRight, ChevronDown } from 'lucide-react'
import { Shell } from '@/components/Shell'
import { useProjekte } from '@/state/ProjekteContext'
import { projektUntertitel, type Projekt } from '@/lib/projekt/projekteStorage'
import { cn } from '@/lib/cn'

export function LandingPage() {
  const navigate = useNavigate()
  const { legeNeuesProjektAn, projekte, wechselZuProjekt } = useProjekte()

  const startenNeu = () => {
    legeNeuesProjektAn()
    navigate('/wizard')
  }

  const oeffneBestehendes = (p: Projekt) => {
    wechselZuProjekt(p.id)
    if (p.istKomplett) {
      navigate('/ergebnisse', { state: { initialView: 'dashboard' } })
    } else {
      navigate('/wizard')
    }
  }

  return (
    <Shell minimal>
      <div className="mx-auto max-w-3xl px-6 md:px-10 py-24 md:py-36 flex flex-col items-center text-center">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="text-xxs text-muted font-mono tracking-widest uppercase mb-8"
        >
          Built on solid ground.
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          className="text-5xl md:text-7xl font-medium tracking-tight text-ink leading-[1.05]"
        >
          Grid<span className="text-muted">.legal</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
          className="mt-6 text-lg md:text-xl text-muted max-w-xl leading-relaxed"
        >
          Bauvorschriften für Wien. Strukturiert.
          <br />
          Auf einen Blick.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="mt-12 flex flex-wrap items-center justify-center gap-3"
        >
          <button
            onClick={startenNeu}
            className="group inline-flex items-center gap-2 bg-ink text-paper px-6 py-3 rounded-chip text-sm font-medium hover:bg-ink-soft transition-colors"
          >
            Neues Projekt starten
            <ArrowRight
              size={16}
              className="transition-transform group-hover:translate-x-0.5"
            />
          </button>
          {projekte.length > 0 && (
            <ProjektDropdown
              projekte={projekte}
              onWaehlen={oeffneBestehendes}
            />
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.7, delay: 0.55, ease: [0.22, 1, 0.36, 1] }}
          className="mt-16 w-full max-w-xl space-y-3"
        >
          <div className="rounded-card border-[0.5px] border-line-soft bg-paper-soft px-5 py-4 text-left text-xs leading-relaxed text-muted">
            <span className="font-medium text-ink">Keine Rechtsberatung.</span>{' '}
            Grid.legal ist ein Prototyp und ersetzt keine juristische Beratung.
            Die Inhalte werden teils KI-gestützt aufbereitet und können Fehler
            enthalten.
          </div>
          <div className="rounded-card border-[0.5px] border-line-soft bg-paper-soft px-5 py-4 text-left text-xs leading-relaxed text-muted">
            <span className="font-medium text-ink">Aktueller Umfang:</span>{' '}
            nur Standort Wien — Bauordnung Wien (BO Wien) und OIB-Richtlinien 1–6.
          </div>
        </motion.div>
      </div>
    </Shell>
  )
}

function ProjektDropdown({
  projekte,
  onWaehlen,
}: {
  projekte: Projekt[]
  onWaehlen: (p: Projekt) => void
}) {
  const [offen, setOffen] = useState(false)
  const wrapRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (!offen) return
    const onDown = (e: MouseEvent) => {
      if (!wrapRef.current) return
      if (!wrapRef.current.contains(e.target as Node)) setOffen(false)
    }
    document.addEventListener('mousedown', onDown)
    return () => document.removeEventListener('mousedown', onDown)
  }, [offen])

  return (
    <div ref={wrapRef} className="relative">
      <button
        onClick={() => setOffen((o) => !o)}
        aria-expanded={offen}
        aria-haspopup="menu"
        className="inline-flex items-center gap-2 bg-paper text-ink px-6 py-3 rounded-chip text-sm font-medium border-[0.5px] border-line hover:border-line-strong hover:bg-paper-soft transition-colors"
      >
        Bestehendes öffnen
        <ChevronDown
          size={14}
          className={cn(
            'text-muted transition-transform',
            offen && 'rotate-180',
          )}
        />
      </button>

      <AnimatePresence initial={false}>
        {offen && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
            className="absolute top-full mt-2 left-1/2 -translate-x-1/2 w-80 max-h-[28rem] overflow-y-auto bg-paper border-[0.5px] border-line rounded-card shadow-lift z-50 text-left"
            role="menu"
          >
            <div className="px-3 py-2 text-xxs font-mono uppercase tracking-widest text-muted-soft border-b-[0.5px] border-line-soft">
              Bestehende Projekte
            </div>
            <ul className="flex flex-col">
              {projekte.map((p) => (
                <li key={p.id}>
                  <button
                    onClick={() => {
                      setOffen(false)
                      onWaehlen(p)
                    }}
                    className="w-full flex items-start gap-2 px-3 py-2.5 text-left border-b-[0.5px] border-line-soft last:border-b-0 hover:bg-paper-soft transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="text-sm text-ink">{p.name}</div>
                      <div className="text-xxs text-muted-soft mt-0.5">
                        {projektUntertitel(p)}
                      </div>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// Header rechts auf der Landing: „Projektarchiv“ — Panel optisch wie ProjektMenu
// (Typo, Zeilen, Häkchen für aktiv, Footer „Neues Projekt“).

import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { Check, ChevronDown, Plus } from 'lucide-react'
import { cn } from '@/lib/cn'
import { useProjekte } from '@/state/ProjekteContext'
import { projektUntertitel, type Projekt } from '@/lib/projekt/projekteStorage'

export function Projektarchiv() {
  const navigate = useNavigate()
  const { projekte, aktivesProjekt, wechselZuProjekt, legeNeuesProjektAn } =
    useProjekte()
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

  const oeffneProjekt = (p: Projekt) => {
    wechselZuProjekt(p.id)
    setOffen(false)
    navigate(p.istKomplett ? '/ergebnisse' : '/wizard')
  }

  const handleNeu = () => {
    legeNeuesProjektAn()
    setOffen(false)
    navigate('/wizard')
  }

  return (
    <div ref={wrapRef} className="relative flex items-center gap-2">
      <button
        type="button"
        onClick={() => setOffen((o) => !o)}
        className="inline-flex items-center gap-1.5 text-[15px] tracking-tight text-ink hover:opacity-70 transition-opacity"
        aria-expanded={offen}
        aria-haspopup="menu"
      >
        <span className="font-medium">Projektarchiv</span>
        <ChevronDown
          size={13}
          className={cn(
            'text-muted-soft transition-transform',
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
            className="absolute top-full right-0 mt-2 w-80 max-h-[28rem] overflow-y-auto bg-paper border-[0.5px] border-line rounded-card shadow-lift z-50"
            role="menu"
          >
            <div className="px-3 py-2 text-xxs font-mono uppercase tracking-widest text-muted-soft border-b-[0.5px] border-line-soft">
              Projekte
            </div>

            {projekte.length === 0 ? (
              <p className="px-3 py-2.5 text-sm text-muted border-b-[0.5px] border-line-soft">
                Noch keine gespeicherten Projekte.
              </p>
            ) : (
              <ul className="flex flex-col">
                {projekte.map((p) => {
                  const aktiv = p.id === aktivesProjekt?.id
                  return (
                    <li key={p.id}>
                      <button
                        type="button"
                        onClick={() => oeffneProjekt(p)}
                        className={cn(
                          'group flex w-full items-start gap-2 px-3 py-2.5 text-left border-b-[0.5px] border-line-soft last:border-b-0 transition-colors',
                          aktiv
                            ? 'bg-paper-muted'
                            : 'hover:bg-paper-soft cursor-pointer',
                        )}
                      >
                        <span className="shrink-0 w-4 mt-0.5 text-state-ok">
                          {aktiv && <Check size={13} />}
                        </span>
                        <div className="flex-1 min-w-0">
                          <div
                            className={cn(
                              'text-sm',
                              aktiv ? 'text-ink font-medium' : 'text-ink',
                            )}
                          >
                            {p.name}
                          </div>
                          <div className="text-xxs text-muted-soft mt-0.5">
                            {projektUntertitel(p)}
                          </div>
                        </div>
                      </button>
                    </li>
                  )
                })}
              </ul>
            )}

            <button
              type="button"
              onClick={handleNeu}
              className="w-full flex items-center gap-2 px-3 py-2.5 border-t-[0.5px] border-line-soft text-sm text-ink hover:bg-paper-soft transition-colors"
            >
              <Plus size={14} className="text-muted" />
              <span>Neues Projekt</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// Eine aufklappbare Kategorie (A, B, C, …) in View A.
// Zeigt den Buchstaben in Monospace, Titel, Anzahl Regeln und eine Liste der Regeln gruppiert nach Unterkategorien.

import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ChevronDown } from 'lucide-react'
import type { Regel, ViewAKategorie } from '@/lib/types'
import { RuleRow } from '@/components/viewA/RuleRow'
import { cn } from '@/lib/cn'

interface CategoryAccordionProps {
  kategorie: ViewAKategorie
  regeln: Regel[]
  defaultOpen?: boolean
  /** Wenn beide gesetzt sind, läuft das Accordion controlled. */
  open?: boolean
  onToggle?: (next: boolean) => void
}

export function CategoryAccordion({
  kategorie,
  regeln,
  defaultOpen = false,
  open: openProp,
  onToggle,
}: CategoryAccordionProps) {
  const [internalOpen, setInternalOpen] = useState(defaultOpen)
  const controlled = openProp !== undefined && onToggle !== undefined
  const open = controlled ? (openProp as boolean) : internalOpen
  const toggleOpen = () => {
    if (controlled) onToggle?.(!open)
    else setInternalOpen((o) => !o)
  }

  // Regeln pro Unterkategorie gruppieren (aber Untekategorien ohne Regeln ausblenden).
  const grouped = kategorie.unterkategorien.map((u) => ({
    unter: u,
    regeln: regeln.filter((r) => r.viewAUnterkategorie === u.id),
  }))
  const gefuellteGruppen = grouped.filter((g) => g.regeln.length > 0)
  const ungetaggte = regeln.filter((r) => !r.viewAUnterkategorie)

  return (
    <section
      id={`cat-${kategorie.id}`}
      className="border-b-[0.5px] border-line scroll-mt-28"
    >
      <button
        onClick={toggleOpen}
        className="w-full flex items-center gap-4 px-4 py-5 text-left hover:bg-paper-soft transition-colors"
      >
        <span className="font-mono text-xs text-muted-soft tracking-widest">{kategorie.letter}</span>
        <div className="flex-1 min-w-0">
          <div className="text-base font-medium text-ink tracking-tight">
            {kategorie.name}
          </div>
          <div className="text-xxs text-muted mt-0.5">{kategorie.kurzbeschreibung}</div>
        </div>
        <span className="text-xxs text-muted-soft font-mono tabular-nums">
          {regeln.length} {regeln.length === 1 ? 'Regel' : 'Regeln'}
        </span>
        <motion.div
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.3 }}
          className="text-muted-soft"
        >
          <ChevronDown size={16} />
        </motion.div>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <div className="border-t-[0.5px] border-line-soft">
              {regeln.length === 0 ? (
                <div className="px-4 py-8 text-center text-xxs text-muted-soft">
                  Noch keine Regeln in dieser Kategorie.
                </div>
              ) : (
                <>
                  {gefuellteGruppen.map((g) => (
                    <div key={g.unter.id}>
                      <div className="px-4 py-2 bg-paper-muted border-b-[0.5px] border-line-soft flex items-baseline justify-between gap-3">
                        <span className="text-xs text-ink font-medium">{g.unter.name}</span>
                        <span className="text-xxs text-muted-soft font-mono tabular-nums">
                          {g.regeln.length} {g.regeln.length === 1 ? 'Regel' : 'Regeln'}
                        </span>
                      </div>
                      {g.regeln.map((r) => (
                        <RuleRow key={r.id} regel={r} />
                      ))}
                    </div>
                  ))}
                  {ungetaggte.length > 0 && (
                    <div>
                      {ungetaggte.map((r) => (
                        <RuleRow key={r.id} regel={r} />
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  )
}

/** Verdeutlichung für Kategorien ohne Regeln */
export function EmptyCategoryAccordion({ kategorie }: { kategorie: ViewAKategorie }) {
  return (
    <section className={cn('border-b-[0.5px] border-line opacity-60')}>
      <div className="w-full flex items-center gap-4 px-4 py-5">
        <span className="font-mono text-xs text-muted-soft tracking-widest">{kategorie.letter}</span>
        <div className="flex-1 min-w-0">
          <div className="text-base font-medium text-muted tracking-tight">{kategorie.name}</div>
          <div className="text-xxs text-muted-soft mt-0.5">{kategorie.kurzbeschreibung}</div>
        </div>
        <span className="text-xxs text-muted-soft">Inhalte folgen</span>
      </div>
    </section>
  )
}

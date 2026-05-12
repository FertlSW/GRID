// Eine aufklappbare Kategorie als eigene Card.
// Stil orientiert sich am Mockup „Mutiger" (KategorieListe):
//   • Kategorie ist eine eigene weiße Card mit Border + rounded.
//   • Header zeigt Name + Kurzbeschreibung; rechts „X Regeln"-Pille + Chevron.
//   • Beim Aufklappen: paperSoft-Hintergrund, darin die Regel-Cards mit Gap.
// Cards selbst werden vom Parent mit `gap-3` aneinandergereiht — diese
// Komponente hat KEINEN border-bottom mehr.
//
// Letter (A/B/...) wird visuell nicht mehr angezeigt: die horizontale
// Kategorie-Pill-Leiste oberhalb übernimmt diese Aufgabe.

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
  /** Bei aktiver Suche werden alle Unterkategorien automatisch offen gerendert. */
  searchActive?: boolean
}

export function CategoryAccordion({
  kategorie,
  regeln,
  defaultOpen = false,
  open: openProp,
  onToggle,
  searchActive = false,
}: CategoryAccordionProps) {
  const [internalOpen, setInternalOpen] = useState(defaultOpen)
  const controlled = openProp !== undefined && onToggle !== undefined
  const open = controlled ? (openProp as boolean) : internalOpen
  const toggleOpen = () => {
    if (controlled) onToggle?.(!open)
    else setInternalOpen((o) => !o)
  }

  // Welche Unterkategorien sind aktuell aufgeklappt? (per Subcategory-Id)
  const [openUnter, setOpenUnter] = useState<Set<string>>(new Set())
  const toggleUnter = (id: string) => {
    setOpenUnter((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  // Regeln nach Unterkategorie gruppieren (Untergruppen ohne Regeln ausblenden).
  const grouped = kategorie.unterkategorien.map((u) => ({
    unter: u,
    regeln: regeln.filter((r) => r.viewAUnterkategorie === u.id),
  }))
  const gefuellteGruppen = grouped.filter((g) => g.regeln.length > 0)
  const ungetaggte = regeln.filter((r) => !r.viewAUnterkategorie)
  const istLeer = regeln.length === 0

  // Empty-State: ausgegraute Card, nicht klickbar.
  if (istLeer) {
    return (
      <section
        id={`cat-${kategorie.id}`}
        className="rounded-card border-[0.5px] border-line-soft bg-paper-soft px-6 py-5 opacity-60"
      >
        <div className="flex items-center gap-4">
          <div className="flex-1 min-w-0">
            <div className="text-[15px] font-medium text-muted tracking-tight">
              {kategorie.name}
            </div>
            <div className="text-xxs text-muted-soft mt-0.5">
              {kategorie.kurzbeschreibung}
            </div>
          </div>
          <span className="text-xxs text-muted-soft">Inhalte folgen</span>
        </div>
      </section>
    )
  }

  return (
    <section
      id={`cat-${kategorie.id}`}
      className={cn(
        'rounded-card border-[0.5px] bg-paper overflow-hidden scroll-mt-28 transition-colors duration-200',
        open ? 'border-line-strong' : 'border-line',
      )}
    >
      <button
        onClick={toggleOpen}
        className={cn(
          'w-full flex items-center gap-4 px-6 py-5 text-left transition-colors',
          open ? 'bg-paper-soft' : 'hover:bg-paper-soft',
        )}
      >
        <div className="flex-1 min-w-0">
          <div
            className={cn(
              'text-[15px] text-ink tracking-[-0.005em]',
              open ? 'font-semibold' : 'font-medium',
            )}
          >
            {kategorie.name}
          </div>
          <div className="text-xs text-muted mt-0.5">
            {kategorie.kurzbeschreibung}
          </div>
        </div>
        <span className="rounded-chip bg-paper-muted px-2.5 py-1 text-[11px] font-medium text-muted">
          {regeln.length} {regeln.length === 1 ? 'Regel' : 'Regeln'}
        </span>
        <motion.div
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          className="text-muted-soft"
        >
          <ChevronDown size={18} />
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
            <div className="border-t-[0.5px] border-line-soft bg-paper-soft px-5 py-5">
              {gefuellteGruppen.length > 0 ? (
                <div className={cn('flex flex-col gap-3')}>
                  {gefuellteGruppen.map((g) => {
                    const istOffen = searchActive || openUnter.has(g.unter.id)
                    return (
                      <div key={g.unter.id} className="flex flex-col gap-2">
                        <button
                          onClick={() => toggleUnter(g.unter.id)}
                          aria-expanded={istOffen}
                          className={cn(
                            'w-full flex items-center gap-3 border-[0.5px] px-3 py-2 text-left transition-colors',
                            istOffen
                              ? 'rounded-md bg-paper-muted border-line'
                              : 'rounded-md bg-paper border-line-soft hover:bg-paper-muted',
                          )}
                        >
                          <span
                            className={cn(
                              'flex-1 text-xs text-ink',
                              istOffen ? 'font-semibold' : 'font-medium',
                            )}
                          >
                            {g.unter.name}
                          </span>
                          <span className="text-xxs text-muted-soft font-mono tabular-nums">
                            {g.regeln.length}{' '}
                            {g.regeln.length === 1 ? 'Regel' : 'Regeln'}
                          </span>
                          <motion.div
                            animate={{ rotate: istOffen ? 180 : 0 }}
                            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                            className="text-muted-soft flex shrink-0"
                          >
                            <ChevronDown size={14} />
                          </motion.div>
                        </button>
                        <AnimatePresence initial={false}>
                          {istOffen && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                              className="overflow-hidden"
                            >
                              <div className="flex flex-col gap-2 pt-1">
                                {g.regeln.map((r) => (
                                  <RuleRow
                                    key={r.id}
                                    regel={r}
                                    kategorieName={kategorie.name}
                                  />
                                ))}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    )
                  })}
                  {ungetaggte.length > 0 && (
                    <div className="flex flex-col gap-2">
                      {ungetaggte.map((r) => (
                        <RuleRow
                          key={r.id}
                          regel={r}
                          kategorieName={kategorie.name}
                        />
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  {regeln.map((r) => (
                    <RuleRow
                      key={r.id}
                      regel={r}
                      kategorieName={kategorie.name}
                    />
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  )
}

export function EmptyCategoryAccordion({
  kategorie,
}: {
  kategorie: ViewAKategorie
}) {
  return <CategoryAccordion kategorie={kategorie} regeln={[]} />
}

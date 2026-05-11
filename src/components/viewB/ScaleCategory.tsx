// Eine der 9 räumlichen Kategorien in View B.
// Aufbau: Klick-Header (ein-/ausklappbar) → Kennzahlen-Grid → Regel-Karten → "Nicht erforderlich"-Pills.
//
// WICHTIG: Der LLM-Hook läuft hier oben — nicht in LLMCategoryContent —, damit
// der OpenAI-Call unabhängig vom Auf-/Zuklapp-Zustand sofort beim Mount startet.
// So feuern alle Kategorien parallel und nicht erst beim Aufklappen.

import { useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ChevronDown } from 'lucide-react'
import type { Regel, ViewBKategorie } from '@/lib/types'
import { MetricCard } from '@/components/viewB/MetricCard'
import { LLMCategoryContent } from '@/components/viewB/LLMCategoryContent'
import { useLLMSummary } from '@/hooks/useLLMSummary'

interface ScaleCategoryProps {
  kategorie: ViewBKategorie
  regeln: Regel[]
}

export function ScaleCategory({ kategorie, regeln }: ScaleCategoryProps) {
  const [open, setOpen] = useState(true)

  const kennzahlen = useMemo(() => regeln.filter((r) => r.kennzahl), [regeln])
  const nichtErforderlich = useMemo(
    () => regeln.filter((r) => r.status === 'nicht_erforderlich'),
    [regeln]
  )
  const normale = useMemo(
    () => regeln.filter((r) => r.status !== 'nicht_erforderlich'),
    [regeln]
  )

  // Hook läuft immer, unabhängig von `open` → alle Kategorien feuern parallel
  // beim Mount von View B. Cache im Hook verhindert Doppelcalls.
  const { summary, loading, error, reload } = useLLMSummary(kategorie.id, normale)

  if (regeln.length === 0) {
    return (
      <section className="mb-12 opacity-40">
        <Header kategorie={kategorie} count={0} open={false} collapsible={false} />
        <div className="border-t-[0.5px] border-line-soft pt-6 text-xxs text-muted">
          Noch keine Regeln in dieser Kategorie.
        </div>
      </section>
    )
  }

  return (
    <motion.section
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="mb-12"
    >
      <Header
        kategorie={kategorie}
        count={regeln.length}
        open={open}
        collapsible
        onToggle={() => setOpen((o) => !o)}
      />
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="body"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <div className="border-t-[0.5px] border-line-soft pt-4 space-y-6">
              {kennzahlen.length > 0 && (
                <div>
                  <div className="text-xxs font-medium text-muted mb-2 px-0.5">Kennzahlen</div>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-1.5">
                    <AnimatePresence>
                      {kennzahlen.map((r) => (
                        <motion.div
                          key={r.id}
                          layout
                          initial={{ opacity: 0, y: 4 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -4 }}
                          transition={{ duration: 0.3 }}
                        >
                          <MetricCard
                            label={r.kennzahl!.label}
                            value={r.kennzahl!.wert}
                            hint={r.kennzahl!.anmerkung}
                          />
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                </div>
              )}
              {normale.length > 0 && (
                <LLMCategoryContent
                  summary={summary}
                  loading={loading}
                  error={error}
                  onReload={reload}
                />
              )}
              {nichtErforderlich.length > 0 && <NichtErforderlichLeiste regeln={nichtErforderlich} />}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.section>
  )
}

interface HeaderProps {
  kategorie: ViewBKategorie
  count: number
  open: boolean
  collapsible: boolean
  onToggle?: () => void
}

function Header({ kategorie, count, open, collapsible, onToggle }: HeaderProps) {
  const content = (
    <>
      <span className="font-mono text-xxs text-muted-soft tracking-widest tabular-nums">
        {kategorie.nummer}
      </span>
      <span className="text-base font-medium text-ink tracking-tight">{kategorie.name}</span>
      <span className="text-xxs text-muted-soft">{kategorie.untertitel}</span>
      <span className="ml-auto flex items-center gap-2">
        <span className="text-xxs text-muted-soft font-mono tabular-nums">{count}</span>
        {collapsible && (
          <motion.span
            animate={{ rotate: open ? 0 : -90 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="text-muted-soft flex"
          >
            <ChevronDown size={14} />
          </motion.span>
        )}
      </span>
    </>
  )

  if (!collapsible) {
    return <div className="flex items-baseline gap-3 mb-3">{content}</div>
  }

  return (
    <button
      type="button"
      onClick={onToggle}
      className="w-full flex items-baseline gap-3 mb-3 text-left group focus:outline-none focus-visible:ring-2 focus-visible:ring-line rounded-sm"
    >
      {content}
    </button>
  )
}

function NichtErforderlichLeiste({ regeln }: { regeln: Regel[] }) {
  return (
    <div>
      <div className="text-xxs font-medium text-muted-soft mb-2">Nicht erforderlich</div>
      <div className="flex flex-wrap gap-1.5">
        {regeln.map((r) => (
          <NichtErforderlichPill key={r.id} regel={r} />
        ))}
      </div>
    </div>
  )
}

function NichtErforderlichPill({ regel }: { regel: Regel }) {
  const [open, setOpen] = useState(false)
  return (
    <div>
      <button
        onClick={() => setOpen((o) => !o)}
        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-chip text-xxs text-muted-soft bg-paper-muted hover:text-muted transition-colors"
      >
        <span>{regel.headline}</span>
        {regel.nichtErforderlichHinweis && (
          <span className="text-muted-soft opacity-70">— {regel.nichtErforderlichHinweis}</span>
        )}
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="text-xxs text-muted bg-paper-muted rounded-md px-3 py-2 mt-1 max-w-md">
              {regel.erklaerung}
              <div className="text-muted-soft font-mono mt-1">{regel.originalReferenz}</div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

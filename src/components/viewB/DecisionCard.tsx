// Regel-Karte in View B: Headline + Beschreibung + aufklappbare Quelle.

import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import type { Regel } from '@/lib/types'

interface DecisionCardProps {
  regel: Regel
}

export function DecisionCard({ regel }: DecisionCardProps) {
  const [open, setOpen] = useState(false)
  return (
    <button
      onClick={() => setOpen((o) => !o)}
      className="text-left bg-paper border-[0.5px] border-line rounded-card px-4 py-3 hover:border-line-strong transition-colors"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="text-sm text-ink font-medium leading-snug">{regel.headline}</div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {regel.quelleKurz && (
            <span className="text-xxs font-mono text-muted-soft">
              {regel.quelleKurz}
            </span>
          )}
        </div>
      </div>
      {regel.varianteHeadline && (
        <div className="mt-1 text-xxs font-mono text-muted-soft">
          {regel.varianteHeadline}
        </div>
      )}
      <p className="mt-1.5 text-xs text-muted leading-relaxed line-clamp-3">
        {regel.erklaerung}
      </p>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0, marginTop: 0 }}
            animate={{ opacity: 1, height: 'auto', marginTop: 10 }}
            exit={{ opacity: 0, height: 0, marginTop: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <div className="flex flex-col gap-2">
              <div className="text-xxs text-muted bg-paper-muted rounded-md px-3 py-2 leading-relaxed">
                <span className="font-mono text-muted-soft">Quelle: </span>
                {regel.originalReferenz}
              </div>
              {regel.hinweise && regel.hinweise.length > 0 && (
                <ul className="text-xxs text-muted italic leading-relaxed list-disc pl-4 space-y-0.5">
                  {regel.hinweise.map((h, i) => (
                    <li key={i}>{h}</li>
                  ))}
                </ul>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </button>
  )
}

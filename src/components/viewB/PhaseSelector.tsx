// Phasen-Auswahl oben in View B — 4 gleich breite Pills in einer Zeile
// mit Format: „{nummer} {label} / {kurzbeschreibung}".

import { motion } from 'framer-motion'
import { phasen } from '@/data/phases'
import type { Phase } from '@/lib/types'
import { cn } from '@/lib/cn'

interface PhaseSelectorProps {
  value: Phase
  onChange: (v: Phase) => void
}

export function PhaseSelector({ value, onChange }: PhaseSelectorProps) {
  return (
    <div className="bg-paper border-[0.5px] border-line rounded-card p-1 grid grid-cols-4 gap-1 w-full max-w-5xl">
      {phasen.map((p) => (
        <button
          key={p.id}
          onClick={() => onChange(p.id)}
          className={cn(
            'relative px-3 py-2.5 rounded-md text-left transition-colors',
            value === p.id ? 'text-ink' : 'text-muted hover:text-ink'
          )}
        >
          {value === p.id && (
            <motion.span
              layoutId="phase-selector-active"
              className="absolute inset-0 bg-paper-soft rounded-md border-[0.5px] border-line"
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            />
          )}
          <span className="relative flex items-baseline gap-2 whitespace-nowrap">
            <span className="font-mono text-xxs text-muted-soft tabular-nums">
              {p.nummer}
            </span>
            <span className="text-xs font-medium">{p.label}</span>
            <span className="text-xxs text-muted-soft">/</span>
            <span className="text-xxs text-muted truncate">
              {p.kurzbeschreibung}
            </span>
          </span>
        </button>
      ))}
    </div>
  )
}

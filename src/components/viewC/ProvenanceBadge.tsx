// Provenienz-Marker für einen Chat-Block.
// Drei Varianten:
//   datenbasis → grün (verlässlich, mit Quellen-Liste klickbar)
//   modell     → akzent-blau-soft (Hintergrundwissen, mit Begründung)
//   web        → orange (Phase 2 — externe Suche)
//
// Klickbar: öffnet/schließt einen Popover mit Details (z.B. Quellenliste).

import { Database, Brain, Globe } from 'lucide-react'
import { cn } from '@/lib/cn'
import type { Provenance } from '@/lib/llm/chatTypes'

interface ProvenanceBadgeProps {
  provenance: Provenance
  open?: boolean
  onClick?: () => void
}

const labels = {
  datenbasis: 'Aus Datenbasis',
  modell: 'Modellwissen',
  web: 'Web',
} as const

const farben = {
  datenbasis: 'bg-state-okBg text-state-ok hover:bg-state-okBg/70',
  modell: 'bg-accent-soft text-accent hover:bg-accent-soft/70',
  web: 'bg-state-depBg text-state-dep hover:bg-state-depBg/70',
} as const

const icons = {
  datenbasis: Database,
  modell: Brain,
  web: Globe,
} as const

export function ProvenanceBadge({ provenance, open, onClick }: ProvenanceBadgeProps) {
  const q = provenance.quelle
  const Icon = icons[q]
  const anzahl =
    q === 'datenbasis'
      ? provenance.regelIds.length
      : q === 'web'
        ? provenance.urls.length
        : null

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'inline-flex items-center gap-1.5 px-2 py-0.5 rounded-chip text-xxs font-medium transition-colors',
        farben[q],
        onClick && 'cursor-pointer',
      )}
      aria-expanded={open}
    >
      <Icon size={11} />
      <span>
        {labels[q]}
        {anzahl !== null && (
          <span className="ml-1 opacity-70">· {anzahl}</span>
        )}
      </span>
    </button>
  )
}

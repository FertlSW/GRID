// Kennzahlen-Grid für die vom LLM extrahierten konkreten Werte.
// Optik an MetricCard angelehnt, damit das Layout in View B konsistent bleibt.

import type { LLMKennzahl } from '@/lib/llm/types'

interface LLMKennzahlenGridProps {
  kennzahlen: LLMKennzahl[]
}

export function LLMKennzahlenGrid({ kennzahlen }: LLMKennzahlenGridProps) {
  if (kennzahlen.length === 0) return null
  return (
    <div>
      <div className="text-xxs font-medium text-muted mb-2 px-0.5">LLM-Kennzahlen</div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-1.5">
        {kennzahlen.map((k, i) => (
          <div
            key={`${k.label}-${i}`}
            className="bg-paper-soft rounded-card px-4 py-3 border-[0.5px] border-line-soft"
          >
            <div className="text-xxs text-muted leading-tight">{k.label}</div>
            <div className="text-lg font-medium text-ink mt-0.5 tabular-nums tracking-tight leading-tight">
              {k.wert}
            </div>
            {k.kontext && (
              <div className="text-xxs text-muted-soft mt-1 leading-tight">{k.kontext}</div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

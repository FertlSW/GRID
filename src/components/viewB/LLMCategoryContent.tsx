// Kapselt Loading/Error/Success pro Kategorie und rendert LLM-Kennzahlen + Blöcke.
// Wird in ScaleCategory anstelle der bisherigen DecisionCard-Liste verwendet.
//
// WICHTIG: Diese Komponente ruft den Hook nicht mehr selbst auf — sie kriegt
// Loading/Error/Summary als Props vom Parent (ScaleCategory). So kann der Hook
// im Parent laufen, unabhängig davon, ob die Kategorie gerade offen oder
// zugeklappt ist — alle Kategorien feuern dadurch parallel beim Mount.

import { LLMBlock } from '@/components/viewB/LLMBlock'
import { LLMKennzahlenGrid } from '@/components/viewB/LLMKennzahlenGrid'
import type { LLMSummary } from '@/lib/llm/types'

interface LLMCategoryContentProps {
  summary: LLMSummary | null
  loading: boolean
  error: Error | null
  onReload: () => void
}

export function LLMCategoryContent({
  summary,
  loading,
  error,
  onReload,
}: LLMCategoryContentProps) {
  if (loading) {
    return (
      <div className="space-y-1.5">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="bg-paper-soft border-[0.5px] border-line-soft rounded-card px-4 py-3 animate-pulse"
          >
            <div className="h-3 w-1/3 bg-line-soft rounded" />
            <div className="mt-2 h-2.5 w-full bg-line-soft rounded" />
            <div className="mt-1.5 h-2.5 w-4/5 bg-line-soft rounded" />
          </div>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-paper-muted border-[0.5px] border-line rounded-card px-4 py-3 text-xs text-muted leading-relaxed">
        <div className="font-medium text-ink mb-1">LLM-Zusammenfassung fehlgeschlagen</div>
        <div>{error.message}</div>
        <button
          onClick={onReload}
          className="mt-2 text-xxs text-ink hover:underline font-mono"
        >
          Erneut versuchen →
        </button>
      </div>
    )
  }

  if (!summary) return null

  return (
    <div className="space-y-6">
      {summary.kennzahlen.length > 0 && <LLMKennzahlenGrid kennzahlen={summary.kennzahlen} />}
      {summary.bloecke.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-1.5">
          {summary.bloecke.map((b, i) => (
            <LLMBlock key={`${b.titel}-${i}`} block={b} />
          ))}
        </div>
      )}
    </div>
  )
}

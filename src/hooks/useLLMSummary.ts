// React-Hook, der pro Kategorie genau dann eine LLM-Zusammenfassung lädt,
// wenn sich entweder die Regel-Menge oder die Projekt-Parameter geändert haben.
// Nutzt einen projekt-gebundenen, persistenten Cache (src/lib/llm/cache.ts).
//
// Im Normalfall ist der Cache nach dem Wizard-Abschluss bereits durch den
// Prefetch (src/lib/llm/prefetch.ts) gefüllt — der Hook liefert dann sofort
// die gespeicherte Zusammenfassung ohne neuen API-Call.

import { useCallback, useEffect, useState } from 'react'
import type { Regel } from '@/lib/types'
import { useProjekte } from '@/state/ProjekteContext'
import { buildCacheKey, getCached, setCached } from '@/lib/llm/cache'
import { erstelleLLMZusammenfassung } from '@/lib/llm/llmSummaryService'
import type { LLMSummary } from '@/lib/llm/types'

interface UseLLMSummaryResult {
  summary: LLMSummary | null
  loading: boolean
  error: Error | null
  reload: () => void
}

export function useLLMSummary(kategorieId: string, regeln: Regel[]): UseLLMSummaryResult {
  const { aktivesProjekt, params } = useProjekte()
  const projektId = aktivesProjekt?.id ?? ''
  const regelIds = regeln.map((r) => r.id)
  const cacheKey = buildCacheKey(kategorieId, regelIds, params)

  const [summary, setSummary] = useState<LLMSummary | null>(() =>
    projektId ? getCached(projektId, cacheKey) ?? null : null,
  )
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  // Reload-Trigger: jede Inkrementierung erzwingt einen neuen Effect-Lauf, ohne
  // den Cache-Key zu verändern — damit `reload()` auch dann funktioniert, wenn
  // sich nichts an Params/Regeln geändert hat.
  const [reloadToken, setReloadToken] = useState(0)

  useEffect(() => {
    if (!projektId || regeln.length === 0) {
      setSummary(null)
      setLoading(false)
      setError(null)
      return
    }

    const cached = getCached(projektId, cacheKey)
    if (cached && reloadToken === 0) {
      setSummary(cached)
      setLoading(false)
      setError(null)
      return
    }

    let cancelled = false
    const controller = new AbortController()
    setLoading(true)
    setError(null)

    erstelleLLMZusammenfassung(kategorieId, regeln, params, { signal: controller.signal })
      .then((result) => {
        if (cancelled) return
        setCached(projektId, cacheKey, result)
        setSummary(result)
        setLoading(false)
      })
      .catch((err: unknown) => {
        if (cancelled) return
        setError(err instanceof Error ? err : new Error(String(err)))
        setLoading(false)
      })

    return () => {
      cancelled = true
      controller.abort()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projektId, cacheKey, reloadToken])

  const reload = useCallback(() => setReloadToken((t) => t + 1), [])

  return { summary, loading, error, reload }
}

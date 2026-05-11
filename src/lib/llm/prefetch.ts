// Eager-Prefetch nach Wizard-Abschluss.
//
// Lädt für ein Projekt einmalig alle View-B-Inhalte (4 Phasen × 9 Kategorien)
// im Hintergrund parallel und schreibt sie in den persistenten Cache. Damit
// erscheinen Daten beim View-Wechsel und nach Browser-Reload sofort, ohne
// erneuten OpenAI-Call.
//
// Idempotenz: Wenn der Hash der Projekt-Parameter unverändert ist, wird
// nichts neu geladen. Hat sich auch nur ein Parameter geändert, wird der
// alte Cache verworfen und vollständig neu prefetched.
//
// Race-Schutz: Pro Projekt wird ein AbortController gehalten. Startet
// während eines laufenden Prefetches ein neuer (z.B. weil der User mehrfach
// schnell durch den Wizard klickt), wird der alte abgebrochen.

import type { ProjektParameter } from '@/lib/types'
import { phasen } from '@/data/phases'
import { viewBKategorien } from '@/data/categoriesViewB'
import {
  filterRegeln,
  regelnFuerPhase,
  regelnFuerViewBKategorie,
} from '@/lib/filter'
import {
  buildCacheKey,
  getParamsHash,
  hashParams,
  loescheProjektCache,
  setCached,
  setParamsHash,
} from '@/lib/llm/cache'
import { erstelleLLMZusammenfassung } from '@/lib/llm/llmSummaryService'

const laufendeController = new Map<string, AbortController>()

export async function prefetcheAlleKategorien(
  projektId: string,
  params: ProjektParameter,
): Promise<void> {
  const neuerHash = hashParams(params)

  // Wenn sich nichts geändert hat → keine Calls.
  if (getParamsHash(projektId) === neuerHash) {
    if (import.meta.env.DEV) {
      console.log(`[Prefetch] Übersprungen für ${projektId} — Params unverändert.`)
    }
    return
  }

  // Vorigen Lauf abbrechen, falls vorhanden.
  laufendeController.get(projektId)?.abort()
  const controller = new AbortController()
  laufendeController.set(projektId, controller)

  // Alten Cache verwerfen, neuen Hash setzen.
  loescheProjektCache(projektId)
  setParamsHash(projektId, neuerHash)

  const alle = filterRegeln(params)

  // Pro Phase × Kategorie eine Promise vorbereiten.
  const aufgaben: Array<Promise<void>> = []
  for (const phase of phasen) {
    const phasenRegeln = regelnFuerPhase(alle, phase.id)
    for (const kategorie of viewBKategorien) {
      const kategorieRegeln = regelnFuerViewBKategorie(phasenRegeln, kategorie.id)
      // Gleiche Filterung wie in ScaleCategory.tsx — nur "normale" Regeln
      // gehen ans LLM, "nicht_erforderlich" wird als Pill gerendert.
      const normale = kategorieRegeln.filter((r) => r.status !== 'nicht_erforderlich')
      if (normale.length === 0) continue

      const cacheKey = buildCacheKey(
        kategorie.id,
        normale.map((r) => r.id),
        params,
      )

      aufgaben.push(
        erstelleLLMZusammenfassung(kategorie.id, normale, params, {
          signal: controller.signal,
        })
          .then((summary) => {
            if (controller.signal.aborted) return
            setCached(projektId, cacheKey, summary)
          })
          .catch((err: unknown) => {
            // AbortError ist erwartetes Verhalten beim Wechsel — leise.
            if (controller.signal.aborted) return
            if (import.meta.env.DEV) {
              console.warn(
                `[Prefetch] ${kategorie.id}/${phase.id} fehlgeschlagen:`,
                err,
              )
            }
          }),
      )
    }
  }

  if (import.meta.env.DEV) {
    console.log(
      `[Prefetch] ${projektId}: ${aufgaben.length} Calls gestartet (4 Phasen × ${viewBKategorien.length} Kategorien, Leere übersprungen)`,
    )
  }

  await Promise.allSettled(aufgaben)

  // Controller aufräumen, sofern nicht zwischenzeitlich ersetzt.
  if (laufendeController.get(projektId) === controller) {
    laufendeController.delete(projektId)
  }

  if (import.meta.env.DEV && !controller.signal.aborted) {
    console.log(`[Prefetch] ${projektId}: fertig.`)
  }
}

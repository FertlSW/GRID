// Dev-Only-Checks, die beim App-Start einmalig laufen:
// · validiert jede aktive Quelle gegen Schema + Parameter-Registry
// · prüft, ob alle Chat-Szenario-IDs im Rechtssatz-Pool existieren.
// In Produktion passiert nichts.

import { aktiveQuellen } from '@/data/rules/sources'
import { validiereGesetzestext, logValidateResult } from '@/lib/rules/validate'
import { chatScenarios } from '@/data/chatScenarios'
import { rechtssatzById } from '@/lib/rules'

let bereitsGelaufen = false

export function runDevChecks(): void {
  if (!import.meta.env.DEV) return
  if (bereitsGelaufen) return
  bereitsGelaufen = true

  for (const q of aktiveQuellen()) {
    const result = validiereGesetzestext(
      { meta: q.meta, rechtssaetze: q.rechtssaetze },
      q.id,
    )
    logValidateResult(q.id, result)
  }

  const fehlendeIds: Array<{ szenarioId: string; regelId: string }> = []
  for (const s of chatScenarios) {
    for (const id of s.regelIds) {
      if (!rechtssatzById(id)) {
        fehlendeIds.push({ szenarioId: s.id, regelId: id })
      }
    }
  }
  if (fehlendeIds.length > 0) {
    // eslint-disable-next-line no-console
    console.warn(
      `[rules:chat] ${fehlendeIds.length} Chat-Szenario-IDs zeigen auf unbekannte Rechtssätze:`,
    )
    for (const { szenarioId, regelId } of fehlendeIds) {
      // eslint-disable-next-line no-console
      console.warn(`  · ${szenarioId} → ${regelId}`)
    }
  }
}

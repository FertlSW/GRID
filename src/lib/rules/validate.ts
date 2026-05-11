// Leichtgewichtige Schema- und Parameter-Validierung für Gesetzestext-JSONs.
// Läuft nur im Dev-Modus, gibt Warnungen in die Browser-Konsole aus.
// In Produktion: silent pass (keine Performance-Kosten, keine User-Irritation).

import type { GesetzestextDatei, Rechtssatz } from '@/lib/rules/schema'
import { istEinzel } from '@/lib/rules/schema'
import { istBekannterParameter } from '@/lib/rules/parameterRegistry'
import { bekannteUnterkategorien } from '@/lib/rules/mapping'

const ERLAUBTE_SCHEMA_VERSIONEN = ['0.2', '0.3']
const ERLAUBTE_HAUPTKATEGORIEN = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I']
const ERLAUBTE_PHASEN = ['vorentwurf', 'entwurf', 'genehmigung', 'ausfuehrung']
const ERLAUBTE_OPERATOREN = [
  'ist',
  'ist_nicht',
  'ist_eines_von',
  'ist_keines_von',
  'groesser_als',
  'kleiner_als',
  'groesser_gleich',
  'kleiner_gleich',
]

export interface ValidateResult {
  ok: boolean
  warnings: string[]
}

export function validiereGesetzestext(
  datei: GesetzestextDatei,
  quelleId: string,
): ValidateResult {
  const warnings: string[] = []

  // Meta
  const schemaVersion = datei.meta?.schema_version
  if (!schemaVersion) {
    warnings.push(`[${quelleId}] meta.schema_version fehlt`)
  } else if (!ERLAUBTE_SCHEMA_VERSIONEN.includes(schemaVersion)) {
    warnings.push(
      `[${quelleId}] unbekannte schema_version "${schemaVersion}" — erlaubt: ${ERLAUBTE_SCHEMA_VERSIONEN.join(', ')}`,
    )
  }

  if (!Array.isArray(datei.rechtssaetze)) {
    warnings.push(`[${quelleId}] rechtssaetze ist kein Array`)
    return { ok: false, warnings }
  }

  const bekannteUK = new Set(bekannteUnterkategorien())

  for (const rs of datei.rechtssaetze) {
    validiereRechtssatz(rs, quelleId, warnings, bekannteUK)
  }

  return { ok: warnings.length === 0, warnings }
}

function validiereRechtssatz(
  rs: Rechtssatz,
  quelleId: string,
  warnings: string[],
  bekannteUK: Set<string>,
): void {
  const prefix = `[${quelleId}] ${rs.id ?? '?'}`

  if (!rs.id) warnings.push(`${prefix}: id fehlt`)
  if (!rs.headline) warnings.push(`${prefix}: headline fehlt`)
  if (!rs.fundstelle) warnings.push(`${prefix}: fundstelle fehlt`)

  if (!ERLAUBTE_HAUPTKATEGORIEN.includes(rs.hauptkategorie)) {
    warnings.push(
      `${prefix}: unbekannte hauptkategorie "${rs.hauptkategorie}" (erlaubt: A–I)`,
    )
  }

  if (rs.unterkategorie && !bekannteUK.has(rs.unterkategorie)) {
    warnings.push(
      `${prefix}: Unterkategorie "${rs.unterkategorie}" fehlt im ViewB-Mapping → Fallback auf 'staedtebau'`,
    )
  }

  if (rs.planungsphase && !ERLAUBTE_PHASEN.includes(rs.planungsphase)) {
    warnings.push(
      `${prefix}: unbekannte Phase "${rs.planungsphase}" — erlaubt: ${ERLAUBTE_PHASEN.join(', ')}`,
    )
  }

  for (const b of rs.bedingungen ?? []) {
    if (istEinzel(b)) {
      if (!ERLAUBTE_OPERATOREN.includes(b.operator)) {
        warnings.push(
          `${prefix}: unbekannter Operator "${b.operator}" in Bedingung`,
        )
      }
      if (!istBekannterParameter(b.parameter)) {
        warnings.push(
          `${prefix}: Parameter "${b.parameter}" in Bedingung ist nicht im parameterRegistry registriert`,
        )
      }
    }
  }

  for (const v of rs.varianten ?? []) {
    const hatWenn = !!v.wenn
    const hatWennAlle = Array.isArray(v.wenn_alle) && v.wenn_alle.length > 0
    if ((!hatWenn && !hatWennAlle) || !v.headline) {
      warnings.push(`${prefix}: Variante unvollständig (wenn/wenn_alle / headline fehlt)`)
      continue
    }
    if (hatWenn && v.wenn) {
      if (!ERLAUBTE_OPERATOREN.includes(v.wenn.operator)) {
        warnings.push(
          `${prefix}: Variante mit unbekanntem Operator "${v.wenn.operator}"`,
        )
      }
      if (!istBekannterParameter(v.wenn.parameter)) {
        warnings.push(
          `${prefix}: Variante referenziert unbekannten Parameter "${v.wenn.parameter}"`,
        )
      }
    }
    if (hatWennAlle && v.wenn_alle) {
      for (const b of v.wenn_alle) {
        if (!ERLAUBTE_OPERATOREN.includes(b.operator)) {
          warnings.push(
            `${prefix}: Variante (wenn_alle) mit unbekanntem Operator "${b.operator}"`,
          )
        }
        if (!istBekannterParameter(b.parameter)) {
          warnings.push(
            `${prefix}: Variante (wenn_alle) referenziert unbekannten Parameter "${b.parameter}"`,
          )
        }
      }
    }
  }
}

/** Gibt Warnungen aus — nur im Dev-Modus. */
export function logValidateResult(quelleId: string, result: ValidateResult): void {
  if (!import.meta.env.DEV) return
  if (result.warnings.length === 0) {
    // eslint-disable-next-line no-console
    console.info(`[rules:validate] ${quelleId} ok`)
    return
  }
  // eslint-disable-next-line no-console
  console.warn(
    `[rules:validate] ${quelleId}: ${result.warnings.length} Warnung(en)`,
  )
  for (const w of result.warnings) {
    // eslint-disable-next-line no-console
    console.warn('  · ' + w)
  }
}

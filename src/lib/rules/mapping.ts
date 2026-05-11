// Zentrale Mapping-Tabellen — erweiterbar, aber an einer Stelle sichtbar.

import type { ProjektParameter } from '@/lib/types'

// ──────────────────────────── Parameter-Aliase (Name) ────────────────────────────

// JSON-Parameter (snake_case oder Schema-v0.3-Schreibweise) → ProjektParameter-Key.
// Beispiel: JSON nennt das Feld `oberirdische_geschosse`, intern heißt es
// `oberirdischeGeschosse` — der Alias hält die Wizard-Frage stabil.
const parameterAlias: Record<string, keyof ProjektParameter> = {
  neubau_oder_bestand: 'bauart',
  oberirdische_geschosse: 'oberirdischeGeschosse',
  unterirdische_geschosse: 'unterirdischeGeschosse',
}

export function leseParameterWert(
  p: ProjektParameter,
  name: string,
): unknown {
  const aliasKey = parameterAlias[name]
  if (aliasKey !== undefined) return p[aliasKey]
  return (p as unknown as Record<string, unknown>)[name]
}

// ──────────────────────────── Wert-Aliase ────────────────────────────

// JSON kann Werte in v0.3-Schreibweise liefern (`GK_1`), während die App
// intern die ältere kompakte Form führt (`GK1`). Diese Tabelle normalisiert
// JSON-Werte auf die App-internen Werte vor dem Bedingungs-Vergleich.
const wertAlias: Record<string, Record<string, string | number>> = {
  gebaeudeklasse: {
    GK_1: 'GK1',
    GK_2: 'GK2',
    GK_3: 'GK3',
    GK_4: 'GK4',
    GK_5: 'GK5',
  },
}

/** Übersetzt einen JSON-Wert in die App-interne Form (Identität, falls kein Alias). */
export function normalisiereJsonWert(
  parameter: string,
  wert: string | number | undefined,
): string | number | undefined {
  if (wert === undefined) return undefined
  const tabelle = wertAlias[parameter]
  if (!tabelle) return wert
  if (typeof wert !== 'string') return wert
  return tabelle[wert] ?? wert
}

// ──────────────────────────── ViewB-Mapping ────────────────────────────

// Schema v0.3 kennt lange ViewB-IDs (`staedtebau_grundstueck` …),
// die UI verwendet weiterhin die kurzen IDs aus `categoriesViewB.ts`.
// Diese Tabelle übersetzt v0.3-IDs → UI-IDs.
const viewBNeuZuAlt: Record<string, string> = {
  staedtebau_grundstueck: 'staedtebau',
  baukoerper_volumen: 'baukoerper',
  erschliessung_vertikal: 'erschliessung',
  geschoss_grundriss: 'geschoss',
  bauteile_konstruktion: 'bauteile',
  technik_sonderraeume: 'technik',
  aussenraum_verkehr: 'aussenraum',
  stellplaetze_garagen: 'stellplaetze',
  gebaeudehuelle_energie: 'huelle',
}

export function mappeRaeumlicheKategorieZuViewB(
  raeumlicheKategorie: string | undefined,
): string | undefined {
  if (!raeumlicheKategorie) return undefined
  return viewBNeuZuAlt[raeumlicheKategorie] ?? raeumlicheKategorie
}

// Unterkategorie (z.B. "H.02") → View-B-Kategorie (räumlich).
// Bleibt als Fallback für Quellen, die noch kein `raeumliche_kategorie` haben.
const viewBMapping: Record<string, string> = {
  // BO Wien Teil 8 — Bauplatz & Bebauung
  'H.01': 'staedtebau',
  'H.02': 'baukoerper',
  'H.03': 'staedtebau',
  // Vorbereitung OIB-RL 2 — Brandschutz
  'B.01': 'baukoerper',
  'B.02': 'geschoss',
  'B.03': 'baukoerper',
  'B.04': 'staedtebau',
  'B.05': 'erschliessung',
  'B.06': 'erschliessung',
  'B.07': 'huelle',
  'B.08': 'technik',
  'B.09': 'erschliessung',
  'B.10': 'technik',
  'B.11': 'technik',
  'B.12': 'technik',
  'B.13': 'technik',
  'B.14': 'technik',
  'B.15': 'technik',
  'B.16': 'staedtebau',
  'B.17': 'staedtebau',
  'B.18': 'technik',
}

/** Liefert die ViewB-Kategorie für eine Unterkategorie. Fallback: 'staedtebau'. */
export function mappeUnterkategorieZuViewB(unterkategorie: string): string {
  return viewBMapping[unterkategorie] ?? 'staedtebau'
}

/** Alle bekannten Unterkategorie-Präfixe (für Dev-Checks). */
export function bekannteUnterkategorien(): string[] {
  return Object.keys(viewBMapping)
}

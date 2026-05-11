// Quellenunabhängige Regel-Engine.
// Alle Funktionen arbeiten auf Rechtssatz-Arrays und Projekt-Parametern —
// ohne zu wissen, aus welcher JSON-Datei die Rechtssätze stammen.

import type { ProjektParameter, Regel, RegelStatus } from '@/lib/types'
import {
  type Rechtssatz,
  type Bedingung,
  type BedingungEinzel,
  type Variante,
  type Anforderung,
  istImmer,
} from '@/lib/rules/schema'
import {
  leseParameterWert,
  mappeUnterkategorieZuViewB,
  mappeRaeumlicheKategorieZuViewB,
  normalisiereJsonWert,
} from '@/lib/rules/mapping'

// ──────────────────────────── Bedingungen ────────────────────────────

function pruefeOperator(
  operator: BedingungEinzel['operator'],
  wert: unknown,
  bWert: unknown,
  bWerte: unknown,
): boolean {
  switch (operator) {
    case 'ist':
      return wert === bWert
    case 'ist_nicht':
      return wert !== bWert
    case 'ist_eines_von':
      return Array.isArray(bWerte) && bWerte.includes(wert as string | number)
    case 'ist_keines_von':
      return Array.isArray(bWerte) && !bWerte.includes(wert as string | number)
    case 'groesser_als':
      return typeof wert === 'number' && typeof bWert === 'number' && wert > bWert
    case 'kleiner_als':
      return typeof wert === 'number' && typeof bWert === 'number' && wert < bWert
    case 'groesser_gleich':
      return typeof wert === 'number' && typeof bWert === 'number' && wert >= bWert
    case 'kleiner_gleich':
      return typeof wert === 'number' && typeof bWert === 'number' && wert <= bWert
    default:
      return false
  }
}

function normalisiereBedingung(b: BedingungEinzel): {
  wert: string | number | undefined
  werte: Array<string | number> | undefined
} {
  const wert = normalisiereJsonWert(b.parameter, b.wert)
  const werte = Array.isArray(b.werte)
    ? (b.werte
        .map((w) => normalisiereJsonWert(b.parameter, w))
        .filter((w) => w !== undefined) as Array<string | number>)
    : undefined
  return { wert, werte }
}

function pruefeEinzel(b: BedingungEinzel, p: ProjektParameter): boolean {
  const wert = leseParameterWert(p, b.parameter)
  if (wert === undefined) {
    // Konservativ: unbeantwortete Parameter → Regel bleibt sichtbar.
    return true
  }
  const { wert: bWert, werte: bWerte } = normalisiereBedingung(b)
  return pruefeOperator(b.operator, wert, bWert, bWerte)
}

/** Strenge Variante: liefert bei fehlendem Parameter `false` (für Varianten-Auswahl). */
function pruefeEinzelStreng(b: BedingungEinzel, p: ProjektParameter): boolean {
  const wert = leseParameterWert(p, b.parameter)
  if (wert === undefined) return false
  const { wert: bWert, werte: bWerte } = normalisiereBedingung(b)
  return pruefeOperator(b.operator, wert, bWert, bWerte)
}

export function pruefeBedingung(b: Bedingung, p: ProjektParameter): boolean {
  if (istImmer(b)) return true
  return pruefeEinzel(b, p)
}

export function matchtAlleBedingungen(
  rs: Rechtssatz,
  p: ProjektParameter,
): boolean {
  if (!rs.bedingungen || rs.bedingungen.length === 0) return true
  return rs.bedingungen.every((b) => pruefeBedingung(b, p))
}

// ──────────────────────────── Varianten ────────────────────────────

function pruefeVarianteBedingung(v: Variante, p: ProjektParameter): boolean {
  if (v.wenn_alle && v.wenn_alle.length > 0) {
    return v.wenn_alle.every((b) => pruefeEinzelStreng(b, p))
  }
  if (v.wenn) {
    return pruefeEinzelStreng(v.wenn, p)
  }
  return false
}

export function waehleVariante(
  rs: Rechtssatz,
  p: ProjektParameter,
): Variante | null {
  if (!rs.varianten || rs.varianten.length === 0) return null
  const treffer = rs.varianten.find((v) => pruefeVarianteBedingung(v, p))
  return treffer ?? rs.varianten[0]
}

// ──────────────────────────── Status-Heuristik ────────────────────────────

export function leiteStatusAb(rs: Rechtssatz): RegelStatus {
  if (rs.pruefhinweise && rs.pruefhinweise.length > 0) return 'pruefen'
  if (rs.anforderung && rs.anforderung.typ === 'prosa') return 'pruefen'
  if (rs.bedingungen && rs.bedingungen.length > 1) return 'abhaengig'
  if (rs.varianten && rs.varianten.length > 1) return 'abhaengig'
  return 'erforderlich'
}

// ──────────────────────────── Kennzahl ────────────────────────────

export function kennzahlAus(
  a: Anforderung | null | undefined,
): Regel['kennzahl'] | undefined {
  if (!a) return undefined

  if (a.typ === 'grenzwert') {
    const einheit = a.einheit ?? ''
    let wert = ''
    if (typeof a.exakt === 'number') {
      wert = `${a.exakt} ${einheit}`.trim()
    } else if (typeof a.min === 'number' && typeof a.max === 'number') {
      wert = `${a.min}–${a.max} ${einheit}`.trim()
    } else if (typeof a.max === 'number') {
      wert = `max. ${a.max} ${einheit}`.trim()
    } else if (typeof a.min === 'number') {
      wert = `min. ${a.min} ${einheit}`.trim()
    }
    if (!wert) return undefined
    return { label: kenngroesseLabel(a.kenngroesse), wert }
  }

  if (a.typ === 'klassifizierung' && a.klasse) {
    return { label: a.system ?? 'Klasse', wert: a.klasse }
  }

  if (a.typ === 'formel' && a.formel) {
    const einheit = a.einheit ?? ''
    return {
      label: kenngroesseLabel(a.kenngroesse),
      wert: `${a.formel} ${einheit}`.trim(),
    }
  }

  return undefined
}

function kenngroesseLabel(kg: string | undefined): string {
  switch (kg) {
    case 'gebaeudehoehe':
      return 'Gebäudehöhe'
    case 'abstand':
      return 'Abstand'
    case 'flaeche':
      return 'Fläche'
    case 'neigung':
      return 'Neigung'
    case 'feuerwiderstandsdauer':
      return 'Feuerwiderstand'
    case 'schalldaemmung':
      return 'Schalldämmung'
    case 'u_wert':
      return 'U-Wert'
    case 'lichte_hoehe':
      return 'Lichte Höhe'
    default:
      return kg ?? 'Wert'
  }
}

// ──────────────────────────── Rechtssatz → Regel ────────────────────────────

export interface QuelleInfo {
  quelleId: string
  quelleKurz: string
}

export function mapZuRegel(
  rs: Rechtssatz,
  variante: Variante | null,
  quelle: QuelleInfo,
): Regel {
  const anforderung = variante?.anforderung ?? rs.anforderung
  const viewB =
    mappeRaeumlicheKategorieZuViewB(rs.raeumliche_kategorie) ??
    mappeUnterkategorieZuViewB(rs.unterkategorie)
  return {
    id: rs.id,
    headline: rs.headline,
    status: leiteStatusAb(rs),
    erklaerung: rs.erklaerung,
    originalReferenz: rs.fundstelle,
    originalText: rs.originaltext,
    viewAKategorie: rs.hauptkategorie,
    viewAUnterkategorie: rs.thema,
    thema: rs.thema,
    viewBKategorie: viewB,
    phase: rs.planungsphase,
    kennzahl: kennzahlAus(anforderung),
    hinweise: rs.hinweise && rs.hinweise.length > 0 ? rs.hinweise : undefined,
    querverweise:
      rs.querverweise && rs.querverweise.length > 0 ? rs.querverweise : undefined,
    varianteHeadline: variante?.headline,
    quelleId: quelle.quelleId,
    quelleKurz: quelle.quelleKurz,
  }
}

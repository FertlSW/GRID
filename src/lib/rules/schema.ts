// Zentrale Schema-Typen für alle Gesetzestext-JSONs (v0.3).
// Diese Typen sind unabhängig von einer konkreten Quelle — sowohl BO Wien
// (alle Teile) als auch OIB-Richtlinien nutzen dasselbe Schema.

import type { Phase } from '@/lib/types'

// ──────────────────────────── Bedingungen ────────────────────────────

export type BedingungOperator =
  | 'ist'
  | 'ist_nicht'
  | 'ist_eines_von'
  | 'ist_keines_von'
  | 'groesser_als'
  | 'kleiner_als'
  | 'groesser_gleich'
  | 'kleiner_gleich'

export interface BedingungEinzel {
  parameter: string
  operator: BedingungOperator
  wert?: string | number
  werte?: Array<string | number>
}

export interface BedingungImmer {
  typ: 'immer'
}

export type Bedingung = BedingungEinzel | BedingungImmer

// ──────────────────────────── Anforderung ────────────────────────────

export interface Anforderung {
  typ: 'prosa' | 'grenzwert' | 'formel' | 'klassifizierung'
  // prosa
  text?: string
  // grenzwert + formel
  kenngroesse?: string
  min?: number
  max?: number
  exakt?: number
  einheit?: string
  klasse?: string
  bezug?: string
  // formel
  formel?: string
  // klassifizierung
  system?: string
  // alle
  zusatz?: string
}

// ──────────────────────────── Variante ────────────────────────────

export interface Fussnote {
  nummer: number
  text: string
}

export interface Variante {
  wenn?: BedingungEinzel
  wenn_alle?: BedingungEinzel[]
  headline: string
  anforderung?: Anforderung
  fussnoten?: Fussnote[]
}

// ──────────────────────────── Querverweis ────────────────────────────

export interface Querverweis {
  ref_id: string
  ref_fundstelle: string
  beschreibung: string
}

// ──────────────────────────── Rechtssatz ────────────────────────────

export interface Rechtssatz {
  id: string
  fundstelle: string
  // Landesgesetz / Verordnung
  paragraph?: string
  absatz?: string | null
  ziffer?: string | null
  paragraph_ueberschrift?: string
  // OIB-Richtlinien / Leitfäden
  punkt?: string
  abschnitt?: string
  abschnitt_titel?: string
  // Inhalt
  headline: string
  erklaerung: string
  originaltext: string
  hauptkategorie: string
  unterkategorie: string
  unterkategorie_label: string
  // ViewB direkt am Rechtssatz (v0.3)
  raeumliche_kategorie?: string
  thema?: string
  planungsphase: Phase
  bedingungen: Bedingung[]
  varianten: Variante[]
  anforderung: Anforderung | null
  querverweise: Querverweis[]
  hinweise: string[]
  pruefhinweise: string[]
  is_entfallen: boolean
  status: string
}

// ──────────────────────────── Datei-Meta ────────────────────────────

export interface GesetzestextMeta {
  schema_version: string
  quelle_id: string
  quelle_titel: string
  quelle_kurz: string
  quelle_typ: 'landesgesetz' | 'oib_richtlinie' | 'oib_leitfaden' | 'verordnung'
  fassung: string
  stand_aufbereitung: string
  anmerkungen?: string
  // Legacy-Felder (v0.2, werden noch gelesen falls vorhanden)
  teil_nummer?: string | number
  teil_titel?: string
  paragraphen_range?: string
  anzahl_rechtssaetze?: number
  [key: string]: unknown
}

/** Ein komplettes Gesetzestext-JSON wie es aus der Datenaufbereitung kommt. */
export interface GesetzestextDatei {
  meta: GesetzestextMeta
  paragraphen_uebersicht?: unknown
  rechtssaetze: Rechtssatz[]
}

// ──────────────────────────── Typ-Guards ────────────────────────────

export function istImmer(b: Bedingung): b is BedingungImmer {
  return (b as BedingungImmer).typ === 'immer'
}

export function istEinzel(b: Bedingung): b is BedingungEinzel {
  return !istImmer(b)
}

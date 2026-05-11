// Öffentliche API der Regel-Pipeline.
// App-Code sollte NUR von hier aus auf Regeln zugreifen — nie direkt auf
// einzelne Quellen oder JSON-Dateien.

import type { ProjektParameter, Regel, ViewAKategorie } from '@/lib/types'
import { aktiveQuellen, type GesetzesQuelle } from '@/data/rules/sources'
import type { Rechtssatz } from '@/lib/rules/schema'
import {
  matchtAlleBedingungen,
  waehleVariante,
  mapZuRegel,
} from '@/lib/rules/engine'
import { viewAKategorien } from '@/data/categoriesViewA'
import { formatThemaLabel } from '@/lib/thema'

interface RechtssatzMitQuelle {
  rs: Rechtssatz
  quelle: GesetzesQuelle
}

/** Alle Rechtssätze aller aktiven Quellen (entfallene ausgenommen). */
export function alleRechtssaetze(): RechtssatzMitQuelle[] {
  const result: RechtssatzMitQuelle[] = []
  for (const q of aktiveQuellen()) {
    for (const rs of q.rechtssaetze) {
      if (rs.is_entfallen) continue
      result.push({ rs, quelle: q })
    }
  }
  return result
}

/** Filtert alle Regeln aller Quellen anhand der Projekt-Parameter. */
export function filterAlleRegeln(p: ProjektParameter): Regel[] {
  const regeln = alleRechtssaetze()
    .filter(({ rs }) => matchtAlleBedingungen(rs, p))
    .map(({ rs, quelle }) =>
      mapZuRegel(rs, waehleVariante(rs, p), {
        quelleId: quelle.id,
        quelleKurz: quelle.kurzLabel,
      }),
    )
  // TODO: temporärer Debug-Log — wieder entfernen, wenn nicht mehr gebraucht.
  console.log('DEBUG_REGELN', JSON.stringify(regeln))
  return regeln
}

/** Lookup eines einzelnen Rechtssatzes per ID — ohne Parameter-Filter. */
export function rechtssatzById(id: string): Regel | null {
  for (const q of aktiveQuellen()) {
    const rs = q.rechtssaetze.find((r) => r.id === id)
    if (!rs || rs.is_entfallen) continue
    const variante = rs.varianten && rs.varianten.length > 0 ? rs.varianten[0] : null
    return mapZuRegel(rs, variante, {
      quelleId: q.id,
      quelleKurz: q.kurzLabel,
    })
  }
  return null
}

// ──────────────────────────── ViewA-Struktur dynamisch ────────────────────────────

/**
 * Baut die View-A-Kategorien auf Basis des Stamms (A–I) + der tatsächlich
 * geladenen Rechtssätze. Die Unter-Ebene wird aus dem feineren `thema`-Feld
 * jedes Rechtssatzes aggregiert, damit Hauptkategorien mit vielen Regeln
 * in mehrere aufklappbare Sub-Gruppen zerfallen (z. B. Brandschutz →
 * „Brandverhalten · Fassade WDVS", „Brandverhalten · Treppenhaus" …).
 * Sortierung: regelreichste Themen zuerst, bei Gleichstand alphabetisch.
 */
export function buildViewAStruktur(): ViewAKategorie[] {
  // Map: hauptkategorie → Map(themaSlug → Anzahl Regeln)
  const gesammelt = new Map<string, Map<string, number>>()

  for (const { rs } of alleRechtssaetze()) {
    if (!rs.thema) continue
    const hauptEntry = gesammelt.get(rs.hauptkategorie) ?? new Map<string, number>()
    hauptEntry.set(rs.thema, (hauptEntry.get(rs.thema) ?? 0) + 1)
    gesammelt.set(rs.hauptkategorie, hauptEntry)
  }

  return viewAKategorien.map((k) => {
    const ukMap = gesammelt.get(k.id)
    if (!ukMap || ukMap.size === 0) {
      return { ...k, unterkategorien: [] }
    }
    const unterkategorien = Array.from(ukMap.entries())
      .map(([slug, count]) => ({ slug, name: formatThemaLabel(slug), count }))
      .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name))
      .map(({ slug, name }) => ({ id: slug, name }))
    return { ...k, unterkategorien }
  })
}

// ──────────────────────────── Datenstand ────────────────────────────

export interface DatenstandEintrag {
  id: string
  label: string
  kurzLabel: string
  anzahl: number
  fassung: string
  paragraphenRange?: string
}

export function datenstandInfo(): DatenstandEintrag[] {
  return aktiveQuellen().map((q) => ({
    id: q.id,
    label: q.label,
    kurzLabel: q.kurzLabel,
    anzahl: q.rechtssaetze.filter((r) => !r.is_entfallen).length,
    fassung: String(q.meta?.fassung ?? ''),
    paragraphenRange: q.meta?.paragraphen_range
      ? String(q.meta.paragraphen_range)
      : undefined,
  }))
}

// Die 4 Planungsphasen für View B.
// Quelle: Output Struktur 2.md — spätere Phasen zeigen kumulativ mehr Details.

import type { Phase } from '@/lib/types'

export interface PhasenInfo {
  id: Phase
  nummer: string
  label: string
  frage: string // Was fragt sich der Architekt in dieser Phase?
  kurzbeschreibung: string
}

export const phasen: PhasenInfo[] = [
  {
    id: 'vorentwurf',
    nummer: '01',
    label: 'Vorentwurf',
    frage: 'Geht das so? Funktioniert mein Konzept?',
    kurzbeschreibung: 'Kennzahlen & Grundsatzentscheidungen',
  },
  {
    id: 'entwurf',
    nummer: '02',
    label: 'Entwurf',
    frage: 'Welche Werte gelten? Was muss mein Bauteil können?',
    kurzbeschreibung: 'Konkrete Anforderungswerte & Baustoffklassen',
  },
  {
    id: 'genehmigung',
    nummer: '03',
    label: 'Genehmigung',
    frage: 'Ist alles vollständig? Stimmt die Baubeschreibung?',
    kurzbeschreibung: 'Sonderfälle, Fußnoten, Verfahren',
  },
  {
    id: 'ausfuehrung',
    nummer: '04',
    label: 'Ausführung',
    frage: 'Wie genau? Welches Produkt? Welches Detail?',
    kurzbeschreibung: 'Konstruktive Details & Ausführungshinweise',
  },
]

/** Welche Phasen sind sichtbar, wenn man die gewählte Phase anwählt?
 * Kumulativ — in späteren Phasen sieht man auch frühere Inhalte. */
export function sichtbarePhasen(aktiv: Phase): Phase[] {
  const reihenfolge: Phase[] = ['vorentwurf', 'entwurf', 'genehmigung', 'ausfuehrung']
  const idx = reihenfolge.indexOf(aktiv)
  return reihenfolge.slice(0, idx + 1)
}

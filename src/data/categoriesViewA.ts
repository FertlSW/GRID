// Stamm der 9 Hauptkategorien A–I für View A.
// Unterkategorien werden NICHT mehr hier gepflegt — sie entstehen dynamisch
// aus den geladenen Rechtssätzen (siehe buildViewAStruktur in src/lib/rules).
// Hier stehen nur Name + Kurzbeschreibung pro Buchstabe, damit leere Kategorien
// im UI trotzdem mit Kopf dargestellt werden.

import type { ViewAKategorie } from '@/lib/types'

export const viewAKategorien: ViewAKategorie[] = [
  {
    id: 'A',
    letter: 'A',
    name: 'Tragwerk & Standsicherheit',
    kurzbeschreibung: 'Mechanische Festigkeit & Lasten',
    unterkategorien: [],
  },
  {
    id: 'B',
    letter: 'B',
    name: 'Brandschutz',
    kurzbeschreibung: 'OIB-Richtlinie 2 + BO Wien',
    unterkategorien: [],
  },
  {
    id: 'C',
    letter: 'C',
    name: 'Gesundheit, Hygiene & Umwelt',
    kurzbeschreibung: 'OIB-Richtlinie 3',
    unterkategorien: [],
  },
  {
    id: 'D',
    letter: 'D',
    name: 'Nutzungssicherheit & Barrierefreiheit',
    kurzbeschreibung: 'OIB-Richtlinie 4',
    unterkategorien: [],
  },
  {
    id: 'E',
    letter: 'E',
    name: 'Schallschutz',
    kurzbeschreibung: 'OIB-Richtlinie 5',
    unterkategorien: [],
  },
  {
    id: 'F',
    letter: 'F',
    name: 'Energie & Wärmeschutz',
    kurzbeschreibung: 'OIB-Richtlinie 6',
    unterkategorien: [],
  },
  {
    id: 'G',
    letter: 'G',
    name: 'Gebäudetypologie & Nutzungseinheiten',
    kurzbeschreibung: 'BO Wien §§ 117 ff.',
    unterkategorien: [],
  },
  {
    id: 'H',
    letter: 'H',
    name: 'Bauplatz & Bebauung',
    kurzbeschreibung: 'BO Wien · Widmung, Bebauungsplan, Höhe',
    unterkategorien: [],
  },
  {
    id: 'I',
    letter: 'I',
    name: 'Verfahren & Ausführung',
    kurzbeschreibung: 'BO Wien §§ 60 ff.',
    unterkategorien: [],
  },
]

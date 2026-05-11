// Die 9 räumlichen Kategorien für View B (Architekten-Dashboard).
// Geordnet nach Maßstab von groß (Städtebau) nach klein (Hülle & Energie).

import type { ViewBKategorie } from '@/lib/types'

export const viewBKategorien: ViewBKategorie[] = [
  {
    id: 'staedtebau',
    nummer: '01',
    name: 'Städtebau & Grundstück',
    untertitel: 'Lage, Grenzen, Zufahrt',
  },
  {
    id: 'baukoerper',
    nummer: '02',
    name: 'Baukörper & Volumen',
    untertitel: 'Brandabschnitte, Gebäudegliederung',
  },
  {
    id: 'erschliessung',
    nummer: '03',
    name: 'Erschließung & vertikale Struktur',
    untertitel: 'Treppenhäuser, Aufzüge, Fluchtwege',
  },
  {
    id: 'geschoss',
    nummer: '04',
    name: 'Geschoss & Grundriss',
    untertitel: 'Wohnungslayout',
  },
  {
    id: 'bauteile',
    nummer: '05',
    name: 'Bauteile & Konstruktion',
    untertitel: 'Wände, Decken, Trennbauteile, Durchdringungen, Abschottungen',
  },
  {
    id: 'technik',
    nummer: '06',
    name: 'Technische Anlagen, Sicherheitsinfrastruktur & Sonderräume',
    untertitel: 'Heizung, Lüftung, Lager, Abfall, Batterie, BMA, Löschwasser',
  },
  {
    id: 'aussenraum',
    nummer: '07',
    name: 'Außenraum & Verkehrsflächen',
    untertitel: 'Spielplatz, Fahrrad, Begrünung',
  },
  {
    id: 'stellplaetze',
    nummer: '08',
    name: 'Stellplätze & Garagen',
    untertitel: 'Tiefgaragen, Parkdecks, Ladestationen',
  },
  {
    id: 'huelle',
    nummer: '09',
    name: 'Gebäudehülle & Energie',
    untertitel: 'Fassade, Dach, Wärmeschutz, Energieausweis',
  },
]

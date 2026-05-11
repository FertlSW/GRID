// Registry aller aktiven Gesetzestext-Quellen.
// Neue Quelle hinzufügen: 1. JSON in src/data/gesetzestexte/ ablegen,
// 2. Adapter-Datei daneben (3-Zeiler), 3. hier in das Array einfügen.

import type { GesetzestextDatei, Rechtssatz } from '@/lib/rules/schema'
import { boWienTeil1 } from '@/data/rules/boWienTeil1'
import { oibRl2Tab1a } from '@/data/rules/oibRl2Tab1a'

export type QuelleTyp =
  | 'bo-wien'
  | 'oib'
  | 'landesgesetz'
  | 'oib_richtlinie'
  | 'oib_leitfaden'
  | 'verordnung'
  | 'sonstige'

export interface GesetzesQuelle {
  /** Stabile ID — wird an Regeln gehängt (z.B. 'bo-wien-teil-01'). */
  id: string
  /** Vollständiges Label („BO Wien Teil I — Stadtplanung"). */
  label: string
  /** Kurzlabel für Badges („BO Wien"). */
  kurzLabel: string
  /** Typ bestimmt u.a. Sortierung / Gruppierung in der Header-Note. */
  quelleTyp: QuelleTyp
  /** Quelle einblenden oder nicht. */
  aktiv: boolean
  /** Rohe Rechtssätze aus dem JSON. */
  rechtssaetze: Rechtssatz[]
  /** Meta-Block aus dem JSON. */
  meta: GesetzestextDatei['meta']
}

export const quellen: GesetzesQuelle[] = [
  {
    id: 'bo-wien-teil-01',
    label: boWienTeil1.meta.quelle_titel ?? `BO Wien ${boWienTeil1.meta.teil_titel ?? 'Teil I'}`,
    kurzLabel: boWienTeil1.meta.quelle_kurz ?? 'BO Wien',
    quelleTyp: 'bo-wien',
    aktiv: true,
    rechtssaetze: boWienTeil1.rechtssaetze,
    meta: boWienTeil1.meta,
  },
  {
    id: 'oib-rl-2-tab1a',
    label: 'OIB-Richtlinie 2 — Tabelle 1a: Brandverhalten',
    kurzLabel: 'OIB-RL 2',
    quelleTyp: 'oib',
    aktiv: true,
    rechtssaetze: oibRl2Tab1a.rechtssaetze,
    meta: oibRl2Tab1a.meta,
  },
]

export function aktiveQuellen(): GesetzesQuelle[] {
  return quellen.filter((q) => q.aktiv)
}

// Dünne Delegation an die zentrale Regel-Pipeline (src/lib/rules/).

import type { ProjektParameter, Regel, Phase } from '@/lib/types'
import { filterAlleRegeln } from '@/lib/rules'
import { sichtbarePhasen } from '@/data/phases'

export function filterRegeln(params: ProjektParameter): Regel[] {
  return filterAlleRegeln(params)
}

export function regelnFuerPhase(regeln: Regel[], phase: Phase): Regel[] {
  const sichtbar = sichtbarePhasen(phase)
  return regeln.filter((r) => sichtbar.includes(r.phase))
}

export function regelnFuerViewBKategorie(regeln: Regel[], kategorieId: string): Regel[] {
  return regeln.filter((r) => r.viewBKategorie === kategorieId)
}

export function regelnFuerViewAKategorie(regeln: Regel[], kategorieId: string): Regel[] {
  return regeln.filter((r) => r.viewAKategorie === kategorieId)
}

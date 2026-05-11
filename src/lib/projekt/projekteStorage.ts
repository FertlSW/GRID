// Reine Helper-Funktionen für Projekt-Persistenz im localStorage.
// Pendant zu lib/chat/threadStorage.ts. Bewusst ohne React-Imports.

import type { ProjektParameter } from '@/lib/types'

export const STORAGE_KEY = 'gridlegal.projekte.v1'

export interface Projekt {
  id: string
  name: string
  erstelltAm: number
  zuletztGeoeffnetAm: number
  params: ProjektParameter
  istKomplett: boolean
}

export interface ProjekteState {
  projekte: Projekt[]
  aktivesProjektId: string | null
}

// ──────────────────────────── IO ────────────────────────────

export function lade(): ProjekteState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return leererState()
    const parsed = JSON.parse(raw) as unknown
    if (!parsed || typeof parsed !== 'object') return leererState()
    const obj = parsed as Record<string, unknown>
    const projekte = Array.isArray(obj.projekte)
      ? obj.projekte.filter(istValidesProjekt)
      : []
    const aktivesProjektId =
      typeof obj.aktivesProjektId === 'string' ? obj.aktivesProjektId : null
    return { projekte, aktivesProjektId }
  } catch {
    return leererState()
  }
}

export function speichere(state: ProjekteState): ProjekteState {
  let aktuell = state
  for (let versuch = 0; versuch < 3; versuch++) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(aktuell))
      return aktuell
    } catch (err) {
      if (!istQuotaFehler(err)) return aktuell
      // Im unwahrscheinlichen Quota-Fall: ältestes nicht-aktives Projekt droppen.
      const aeltester = findeAeltestenNichtAktiven(aktuell)
      if (!aeltester) return aktuell
      aktuell = {
        ...aktuell,
        projekte: aktuell.projekte.filter((p) => p.id !== aeltester.id),
      }
    }
  }
  return aktuell
}

// ──────────────────────────── Helper ────────────────────────────

export function neueProjektId(jetzt: number = Date.now()): string {
  return `pr-${jetzt.toString(36)}`
}

/** Untertitel für die Liste: "BK IV · Wohnen" oder Fallback. */
export function projektUntertitel(p: Projekt): string {
  if (!p.istKomplett) return 'Wizard noch unvollständig'
  const teile: string[] = []
  if (p.params.bauklasse) teile.push(p.params.bauklasse.replace('BK_', 'BK '))
  if (p.params.hauptnutzung) {
    teile.push(
      p.params.hauptnutzung.charAt(0).toUpperCase() +
        p.params.hauptnutzung.slice(1),
    )
  }
  return teile.length > 0 ? teile.join(' · ') : '—'
}

// ──────────────────────────── intern ────────────────────────────

function leererState(): ProjekteState {
  return { projekte: [], aktivesProjektId: null }
}

function istValidesProjekt(x: unknown): x is Projekt {
  if (!x || typeof x !== 'object') return false
  const o = x as Record<string, unknown>
  return (
    typeof o.id === 'string' &&
    typeof o.name === 'string' &&
    typeof o.erstelltAm === 'number' &&
    typeof o.zuletztGeoeffnetAm === 'number' &&
    typeof o.params === 'object' &&
    typeof o.istKomplett === 'boolean'
  )
}

function istQuotaFehler(err: unknown): boolean {
  if (!err || typeof err !== 'object') return false
  const name = (err as { name?: string }).name
  return (
    name === 'QuotaExceededError' ||
    name === 'NS_ERROR_DOM_QUOTA_REACHED' ||
    name === 'QUOTA_EXCEEDED_ERR'
  )
}

function findeAeltestenNichtAktiven(s: ProjekteState): Projekt | null {
  let best: Projekt | null = null
  for (const p of s.projekte) {
    if (p.id === s.aktivesProjektId) continue
    if (!best || p.zuletztGeoeffnetAm < best.zuletztGeoeffnetAm) best = p
  }
  return best
}

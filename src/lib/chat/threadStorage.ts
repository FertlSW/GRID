// Reine Helper-Funktionen für Chat-Thread-Persistenz im localStorage.
// Bewusst ohne React/Browser-API-Abhängigkeit außer `localStorage` —
// damit der Provider klein bleibt und das Verhalten leicht testbar ist.

import type { ChatNachricht } from '@/lib/llm/chatTypes'

export const STORAGE_KEY = 'gridlegal.chat.threads.v1'
export const TTL_MS = 7 * 24 * 60 * 60 * 1000 // 7 Tage

export interface ChatThread {
  id: string
  /** ID des Projekts, zu dem dieser Chat gehört. Bei Threads aus älteren
   *  Versionen kann das fehlen — die Migration weist dann das aktive
   *  Projekt zu (siehe `migriereProjektIds()`). */
  projektId: string
  erstelltAm: number
  zuletztAktivAm: number
  nachrichten: ChatNachricht[]
}

export interface PersistedState {
  threads: ChatThread[]
  activeThreadId: string | null
}

// ──────────────────────────── IO ────────────────────────────

/** Lädt den persistierten Zustand. Gibt leeren State zurück, wenn nichts da
 *  oder etwas schief ist (kein Crash bei privatem Browsing-Modus). */
export function lade(): PersistedState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return leererState()
    const parsed = JSON.parse(raw) as unknown
    if (!parsed || typeof parsed !== 'object') return leererState()
    const obj = parsed as Record<string, unknown>
    const threads = Array.isArray(obj.threads)
      ? obj.threads.filter(istValiderThread)
      : []
    const activeThreadId =
      typeof obj.activeThreadId === 'string' ? obj.activeThreadId : null
    return { threads, activeThreadId }
  } catch {
    return leererState()
  }
}

/** Speichert. Bei Quota-Fehler einmal versuchen, ältesten nicht-aktiven
 *  Thread zu droppen, dann nochmal — bis zu 3× insgesamt. */
export function speichere(state: PersistedState): PersistedState {
  let aktuell = state
  for (let versuch = 0; versuch < 3; versuch++) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(aktuell))
      return aktuell
    } catch (err) {
      // Quota oder Privacy-Modus. Wenn Quota: ältesten nicht-aktiven droppen.
      if (!istQuotaFehler(err)) return aktuell
      const aeltester = findeAeltestenNichtAktiven(aktuell)
      if (!aeltester) return aktuell
      aktuell = {
        ...aktuell,
        threads: aktuell.threads.filter((t) => t.id !== aeltester.id),
      }
    }
  }
  return aktuell
}

/** Entfernt Threads, deren `zuletztAktivAm` älter als TTL ist. */
export function cleanup(state: PersistedState, ttlMs = TTL_MS): PersistedState {
  const grenze = Date.now() - ttlMs
  const frisch = state.threads.filter((t) => t.zuletztAktivAm >= grenze)
  if (frisch.length === state.threads.length) return state
  const aktivWeg =
    state.activeThreadId !== null &&
    !frisch.some((t) => t.id === state.activeThreadId)
  return {
    threads: frisch,
    activeThreadId: aktivWeg ? null : state.activeThreadId,
  }
}

// ──────────────────────────── Vorschau-Titel ────────────────────────────

/** Erste user-Frage als kurzen Titel — fällt auf „Neues Gespräch" zurück. */
export function threadTitel(thread: ChatThread): string {
  const erste = thread.nachrichten.find((n) => n.rolle === 'user' && n.text)
  if (!erste?.text) return 'Neues Gespräch'
  const t = erste.text.trim().replace(/\s+/g, ' ')
  if (t.length <= 60) return t
  return t.slice(0, 57).trimEnd() + '…'
}

/** Datums-Label für die Verlauf-Liste: Heute / Gestern / TT.MM. */
export function datumsLabel(ts: number, jetzt = Date.now()): string {
  const d = new Date(ts)
  const heute = new Date(jetzt)
  const gestern = new Date(jetzt - 24 * 60 * 60 * 1000)
  const istGleich = (a: Date, b: Date) =>
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  const hhmm = `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
  if (istGleich(d, heute)) return `Heute ${hhmm}`
  if (istGleich(d, gestern)) return `Gestern ${hhmm}`
  const tt = String(d.getDate()).padStart(2, '0')
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  return `${tt}.${mm}.`
}

// ──────────────────────────── intern ────────────────────────────

function leererState(): PersistedState {
  return { threads: [], activeThreadId: null }
}

function istValiderThread(x: unknown): x is ChatThread {
  if (!x || typeof x !== 'object') return false
  const o = x as Record<string, unknown>
  return (
    typeof o.id === 'string' &&
    typeof o.erstelltAm === 'number' &&
    typeof o.zuletztAktivAm === 'number' &&
    Array.isArray(o.nachrichten)
  )
  // Bewusst KEIN Check auf `projektId` — alte Threads landen sonst raus.
  // Die Migration setzt das Feld nachträglich.
}

/** Weist Threads ohne `projektId` (aus älteren Versionen) das übergebene
 *  Default-Projekt zu. Threads, deren `projektId` bereits gesetzt ist,
 *  bleiben unverändert. */
export function migriereProjektIds(
  state: PersistedState,
  defaultProjektId: string,
): PersistedState {
  let veraendert = false
  const threads = state.threads.map((t) => {
    if (typeof (t as ChatThread).projektId === 'string') return t
    veraendert = true
    return { ...t, projektId: defaultProjektId }
  })
  return veraendert ? { ...state, threads } : state
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

function findeAeltestenNichtAktiven(s: PersistedState): ChatThread | null {
  let best: ChatThread | null = null
  for (const t of s.threads) {
    if (t.id === s.activeThreadId) continue
    if (!best || t.zuletztAktivAm < best.zuletztAktivAm) best = t
  }
  return best
}

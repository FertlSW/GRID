// Projekt-gebundener, persistenter Cache für LLM-Zusammenfassungen.
//
// Aufbau:
//   localStorage[STORAGE_KEY] = {
//     [projektId]: {
//       paramsHash: string  // Hash der Projekt-Parameter beim letzten Prefetch
//       eintraege: { [cacheKey]: LLMSummary }
//     }
//   }
//
// Der Cache-Key wird aus Kategorie + sortierten Regel-IDs + serialisierten
// Params gebildet (siehe `buildCacheKey`). Sobald sich Regeln oder Params
// ändern, entsteht ein neuer Key — der alte Eintrag ist dann zwar verwaist,
// wird aber beim nächsten `loescheProjektCache()` mit aufgeräumt.
//
// In-Memory-Map als Schreib-Through-Layer: Lese- und Schreiboperationen
// gehen zuerst durch sie, sodass innerhalb einer Session kein wiederholtes
// JSON.parse/stringify nötig ist.

import type { ProjektParameter } from '@/lib/types'
import type { LLMSummary } from '@/lib/llm/types'

const STORAGE_KEY = 'gridlegal.llmCache.v1'

interface ProjektCache {
  paramsHash: string
  eintraege: Record<string, LLMSummary>
}

type CacheState = Record<string, ProjektCache>

// In-Memory-Spiegel des localStorage. Wird beim ersten Zugriff initialisiert.
let memory: CacheState | null = null

function load(): CacheState {
  if (memory) return memory
  if (typeof window === 'undefined' || !window.localStorage) {
    memory = {}
    return memory
  }
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) {
      memory = {}
      return memory
    }
    const parsed = JSON.parse(raw)
    memory = (parsed && typeof parsed === 'object' ? parsed : {}) as CacheState
    return memory
  } catch {
    memory = {}
    return memory
  }
}

function persist(): void {
  if (typeof window === 'undefined' || !window.localStorage) return
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(memory ?? {}))
  } catch {
    // Storage voll oder gesperrt — bewusst stillschweigend; In-Memory-Cache
    // funktioniert weiter, nur Reload-Persistenz fehlt dann.
  }
}

function projektSlot(projektId: string): ProjektCache {
  const state = load()
  if (!state[projektId]) {
    state[projektId] = { paramsHash: '', eintraege: {} }
  }
  return state[projektId]
}

// ────────────────── Cache-Key + Params-Hash ──────────────────

export function buildCacheKey(
  kategorieId: string,
  regelIds: string[],
  params: ProjektParameter,
): string {
  const sortedIds = [...regelIds].sort().join(',')
  const paramKeys = Object.keys(params).sort() as Array<keyof ProjektParameter>
  const paramStr = paramKeys.map((k) => `${k}=${params[k] ?? ''}`).join('|')
  return `${kategorieId}::${sortedIds}::${paramStr}`
}

// Stabiler Hash aller Projekt-Parameter — wird von `prefetcheAlleKategorien`
// verglichen, um zu erkennen ob sich seit dem letzten Prefetch etwas geändert
// hat. String-Form reicht (nicht kryptografisch); deterministisch durch sortierte Keys.
export function hashParams(params: ProjektParameter): string {
  const keys = Object.keys(params).sort() as Array<keyof ProjektParameter>
  return keys.map((k) => `${k}=${params[k] ?? ''}`).join('|')
}

// ────────────────── API ──────────────────

export function getCached(
  projektId: string,
  cacheKey: string,
): LLMSummary | undefined {
  return projektSlot(projektId).eintraege[cacheKey]
}

export function setCached(
  projektId: string,
  cacheKey: string,
  summary: LLMSummary,
): void {
  projektSlot(projektId).eintraege[cacheKey] = summary
  persist()
}

export function getParamsHash(projektId: string): string {
  return projektSlot(projektId).paramsHash
}

export function setParamsHash(projektId: string, hash: string): void {
  projektSlot(projektId).paramsHash = hash
  persist()
}

export function loescheProjektCache(projektId: string): void {
  const state = load()
  delete state[projektId]
  persist()
}

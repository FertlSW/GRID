// Provider für die Chat-Threads.
// Hält Threads + aktiven Thread, persistiert sie im localStorage (TTL 7 Tage),
// und führt den Streaming-Loop selber durch — damit Streams View-Wechsel
// und sogar kurze Tab-Wechsel überleben.
//
// Threads sind an ein Projekt gekoppelt (Feld `projektId`). Sichtbar ist immer
// nur die Liste des aktuell aktiven Projekts. Beim Projekt-Wechsel wird ein
// laufender Stream abgebrochen und der zuletzt aktive Thread des neuen
// Projekts automatisch ausgewählt (oder null, wenn keiner existiert).
//
// Außerhalb wird der Provider in App.tsx eingehängt, oberhalb von
// BrowserRouter — und unterhalb des ProjekteProviders.

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { useProjekte } from '@/state/ProjekteContext'
import { filterAlleRegeln } from '@/lib/rules'
import { streameChatAntwort } from '@/lib/llm/chatService'
import type { ChatBlock, ChatNachricht } from '@/lib/llm/chatTypes'
import {
  cleanup,
  lade,
  migriereProjektIds,
  speichere,
  type ChatThread,
  type PersistedState,
} from '@/lib/chat/threadStorage'

interface ChatThreadsContextValue {
  /** Threads des aktiven Projekts, sortiert nach zuletzt aktiv. */
  threads: ChatThread[]
  activeThreadId: string | null
  aktiveNachrichten: ChatNachricht[]
  loading: boolean
  sende: (text: string) => Promise<void>
  abbrechen: () => void
  neuerThread: () => void
  wechselZuThread: (id: string) => void
  loescheThread: (id: string) => void
}

const ChatThreadsContext = createContext<ChatThreadsContextValue | null>(null)

export function ChatThreadsProvider({ children }: { children: ReactNode }) {
  const { aktivesProjekt, params } = useProjekte()
  const aktivesProjektId = aktivesProjekt?.id ?? null

  // Initial-State: aus localStorage laden + TTL-Cleanup. Migration der
  // Projekt-IDs erfolgt im useEffect unten, sobald wir das aktive Projekt
  // kennen.
  const [state, setState] = useState<PersistedState>(() => cleanup(lade()))
  const [loading, setLoading] = useState(false)
  const abortRef = useRef<AbortController | null>(null)
  const migriertRef = useRef(false)
  const lastProjektIdRef = useRef<string | null>(aktivesProjektId)

  // Persistenz bei jeder Mutation.
  useEffect(() => {
    const naechster = speichere(state)
    if (naechster !== state) setState(naechster)
  }, [state])

  // Einmalige Migration: Threads ohne `projektId` aus älteren Versionen
  // bekommen das aktuell aktive Projekt zugewiesen, sobald es feststeht.
  useEffect(() => {
    if (migriertRef.current) return
    if (!aktivesProjektId) return
    setState((prev) => migriereProjektIds(prev, aktivesProjektId))
    migriertRef.current = true
  }, [aktivesProjektId])

  // Beim Wechsel des aktiven Projekts: Stream stoppen + den jüngsten Thread
  // des neuen Projekts auswählen (oder null, wenn keiner da ist).
  useEffect(() => {
    if (lastProjektIdRef.current === aktivesProjektId) return
    lastProjektIdRef.current = aktivesProjektId

    abortRef.current?.abort()
    abortRef.current = null
    setLoading(false)

    setState((prev) => {
      // Streaming-Markierung in allen Threads aufheben (defensive Reinigung).
      const threads = prev.threads.map((t) =>
        t.nachrichten.some((n) => n.streaming)
          ? {
              ...t,
              nachrichten: t.nachrichten.map((n) =>
                n.streaming ? { ...n, streaming: false } : n,
              ),
            }
          : t,
      )
      const fuerProjekt = aktivesProjektId
        ? threads
            .filter((t) => t.projektId === aktivesProjektId)
            .sort((a, b) => b.zuletztAktivAm - a.zuletztAktivAm)
        : []
      const naechsterAktiv = fuerProjekt[0]?.id ?? null
      return { threads, activeThreadId: naechsterAktiv }
    })
  }, [aktivesProjektId])

  // Regeln einmal pro Param-Set ableiten — nicht pro Frage neu.
  const regeln = useMemo(() => filterAlleRegeln(params), [params])

  // ──────────────────────────── Thread-Management ────────────────────────────

  const stoppLaufendenStream = useCallback(() => {
    abortRef.current?.abort()
    abortRef.current = null
    setLoading(false)
    setState((prev) => ({
      ...prev,
      threads: prev.threads.map((t) => ({
        ...t,
        nachrichten: t.nachrichten.map((n) =>
          n.streaming ? { ...n, streaming: false } : n,
        ),
      })),
    }))
  }, [])

  const neuerThread = useCallback(() => {
    stoppLaufendenStream()
    setState((prev) => ({ ...prev, activeThreadId: null }))
  }, [stoppLaufendenStream])

  const wechselZuThread = useCallback(
    (id: string) => {
      stoppLaufendenStream()
      setState((prev) => {
        if (!prev.threads.some((t) => t.id === id)) return prev
        return { ...prev, activeThreadId: id }
      })
    },
    [stoppLaufendenStream],
  )

  const loescheThread = useCallback(
    (id: string) => {
      setState((prev) => {
        const threads = prev.threads.filter((t) => t.id !== id)
        const activeThreadId =
          prev.activeThreadId === id ? null : prev.activeThreadId
        return { threads, activeThreadId }
      })
      if (state.activeThreadId === id) stoppLaufendenStream()
    },
    [state.activeThreadId, stoppLaufendenStream],
  )

  const abbrechen = useCallback(() => {
    stoppLaufendenStream()
  }, [stoppLaufendenStream])

  // ──────────────────────────── sende ────────────────────────────

  const sende = useCallback(
    async (text: string) => {
      const sauber = text.trim()
      if (!sauber || loading) return
      if (!aktivesProjektId) return // ohne aktives Projekt kein Chat

      const jetzt = Date.now()
      let activeId = state.activeThreadId
      let snapshotThreads = state.threads

      // Wenn nichts aktiv ist oder der aktive Thread zu einem anderen Projekt
      // gehört: neuen Thread anlegen.
      const aktuellerExistiert =
        !!activeId &&
        snapshotThreads.some(
          (t) => t.id === activeId && t.projektId === aktivesProjektId,
        )
      if (!aktuellerExistiert) {
        const neuer: ChatThread = {
          id: `th-${jetzt.toString(36)}`,
          projektId: aktivesProjektId,
          erstelltAm: jetzt,
          zuletztAktivAm: jetzt,
          nachrichten: [],
        }
        activeId = neuer.id
        snapshotThreads = [neuer, ...snapshotThreads]
      }

      const userMsg: ChatNachricht = {
        id: `u-${jetzt}`,
        rolle: 'user',
        text: sauber,
      }
      const assistantId = `a-${jetzt}`
      const assistantMsg: ChatNachricht = {
        id: assistantId,
        rolle: 'assistant',
        antwort: { bloecke: [] },
        streaming: true,
      }

      const aktuellerThread = snapshotThreads.find((t) => t.id === activeId)
      const verlaufFuerAPI = aktuellerThread?.nachrichten ?? []

      const aktualisiert = snapshotThreads.map((t) =>
        t.id === activeId
          ? {
              ...t,
              zuletztAktivAm: jetzt,
              nachrichten: [...t.nachrichten, userMsg, assistantMsg],
            }
          : t,
      )
      setState({ threads: aktualisiert, activeThreadId: activeId })
      setLoading(true)

      const controller = new AbortController()
      abortRef.current = controller
      const lokaleActiveId = activeId

      const updateAssistant = (mut: (n: ChatNachricht) => ChatNachricht) => {
        setState((prev) => ({
          ...prev,
          threads: prev.threads.map((t) =>
            t.id === lokaleActiveId
              ? {
                  ...t,
                  zuletztAktivAm: Date.now(),
                  nachrichten: t.nachrichten.map((n) =>
                    n.id === assistantId ? mut(n) : n,
                  ),
                }
              : t,
          ),
        }))
      }

      try {
        const stream = streameChatAntwort(
          sauber,
          verlaufFuerAPI,
          regeln,
          params,
          { signal: controller.signal },
        )
        for await (const event of stream) {
          if (event.typ === 'block' && event.block) {
            updateAssistant((n) => appendBlock(n, event.block as ChatBlock))
          } else if (event.typ === 'rueckfrage' && event.rueckfrage) {
            updateAssistant((n) =>
              setRueckfrage(n, event.rueckfrage as string),
            )
          }
        }
      } catch (err) {
        const aborted =
          err instanceof DOMException && err.name === 'AbortError'
        if (!aborted) {
          const msg =
            err instanceof Error ? err.message : 'Unbekannter Fehler'
          updateAssistant((n) => ({ ...n, fehler: msg }))
        }
      } finally {
        updateAssistant((n) => ({ ...n, streaming: false }))
        setLoading(false)
        abortRef.current = null
      }
    },
    [
      loading,
      params,
      regeln,
      state.activeThreadId,
      state.threads,
      aktivesProjektId,
    ],
  )

  // ──────────────────────────── abgeleitete Sicht ────────────────────────────

  const threadsFuerAktivesProjekt = useMemo(
    () =>
      state.threads
        .filter((t) => t.projektId === aktivesProjektId)
        .sort((a, b) => b.zuletztAktivAm - a.zuletztAktivAm),
    [state.threads, aktivesProjektId],
  )

  const aktiveNachrichten = useMemo(() => {
    if (!state.activeThreadId) return []
    const thread = state.threads.find((t) => t.id === state.activeThreadId)
    if (!thread) return []
    if (thread.projektId !== aktivesProjektId) return []
    return thread.nachrichten
  }, [state.activeThreadId, state.threads, aktivesProjektId])

  const value: ChatThreadsContextValue = {
    threads: threadsFuerAktivesProjekt,
    activeThreadId: state.activeThreadId,
    aktiveNachrichten,
    loading,
    sende,
    abbrechen,
    neuerThread,
    wechselZuThread,
    loescheThread,
  }

  return (
    <ChatThreadsContext.Provider value={value}>
      {children}
    </ChatThreadsContext.Provider>
  )
}

export function useChatThreads(): ChatThreadsContextValue {
  const ctx = useContext(ChatThreadsContext)
  if (!ctx) {
    throw new Error(
      'useChatThreads muss innerhalb eines ChatThreadsProviders verwendet werden',
    )
  }
  return ctx
}

// ──────────────────────────── State-Helfer ────────────────────────────

function appendBlock(n: ChatNachricht, block: ChatBlock): ChatNachricht {
  const aktuell = n.antwort ?? { bloecke: [] }
  return {
    ...n,
    antwort: { ...aktuell, bloecke: [...aktuell.bloecke, block] },
  }
}

function setRueckfrage(n: ChatNachricht, rueckfrage: string): ChatNachricht {
  const aktuell = n.antwort ?? { bloecke: [] }
  return {
    ...n,
    antwort: { ...aktuell, rueckfrage },
  }
}

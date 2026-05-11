// Fassade über `ChatThreadsContext`.
// Hält keinen eigenen State mehr — der lebt im Provider, damit er View-Wechsel
// und Tab-Reloads überlebt. Die Hook-Form bleibt shape-kompatibel zum vorigen
// Stand, sodass `ViewC` und `ChatInput` nicht angefasst werden müssen.

import { useChatThreads } from '@/state/ChatThreadsContext'
import type { ChatNachricht } from '@/lib/llm/chatTypes'
import type { ChatThread } from '@/lib/chat/threadStorage'

export interface UseChatResult {
  nachrichten: ChatNachricht[]
  sende: (text: string) => Promise<void>
  abbrechen: () => void
  loading: boolean
  neuesGespraech: () => void
}

export function useChat(): UseChatResult {
  const { aktiveNachrichten, sende, abbrechen, loading, neuerThread } =
    useChatThreads()
  return {
    nachrichten: aktiveNachrichten,
    sende,
    abbrechen,
    loading,
    neuesGespraech: neuerThread,
  }
}

// ──────────────────────────── Verlauf-Hook ────────────────────────────

export interface UseChatHistoryResult {
  threads: ChatThread[]
  activeThreadId: string | null
  wechselZuThread: (id: string) => void
  loescheThread: (id: string) => void
}

export function useChatHistory(): UseChatHistoryResult {
  const { threads, activeThreadId, wechselZuThread, loescheThread } =
    useChatThreads()
  return { threads, activeThreadId, wechselZuThread, loescheThread }
}

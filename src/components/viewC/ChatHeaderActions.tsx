// Header-Aktionen für View C: „+ Neuer Chat" und „Verlauf ▾".
// Ersetzt die frühere ChatHistorySidebar — beide Funktionen sitzen jetzt
// rechts im Haupt-Header, neben „Parameter ändern".

import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ChevronDown, Plus, Trash2 } from 'lucide-react'
import { cn } from '@/lib/cn'
import { useChat, useChatHistory } from '@/hooks/useChat'
import {
  datumsLabel,
  threadTitel,
  type ChatThread,
} from '@/lib/chat/threadStorage'

export function ChatHeaderActions() {
  const { nachrichten, neuesGespraech } = useChat()
  const { threads } = useChatHistory()
  const istInChat = nachrichten.length > 0

  return (
    <div className="flex items-center gap-2">
      {istInChat && (
        <button
          onClick={neuesGespraech}
          className="inline-flex h-7 items-center gap-1.5 rounded-chip border-[0.5px] border-line bg-paper px-3 text-xs font-medium text-ink transition-all duration-150 ease-gentle hover:border-line-strong hover:bg-paper-muted"
        >
          <Plus size={12} />
          Neuer Chat
        </button>
      )}
      {threads.length > 0 && <VerlaufDropdown />}
    </div>
  )
}

function VerlaufDropdown() {
  const { threads, activeThreadId, wechselZuThread, loescheThread } =
    useChatHistory()
  const [offen, setOffen] = useState(false)
  const wrapRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (!offen) return
    const onDown = (e: MouseEvent) => {
      if (!wrapRef.current) return
      if (!wrapRef.current.contains(e.target as Node)) setOffen(false)
    }
    document.addEventListener('mousedown', onDown)
    return () => document.removeEventListener('mousedown', onDown)
  }, [offen])

  return (
    <div ref={wrapRef} className="relative">
      <button
        onClick={() => setOffen((o) => !o)}
        className="inline-flex h-7 items-center gap-1 rounded-chip border-[0.5px] border-transparent px-3 text-xs font-medium text-ink transition-colors hover:bg-paper-soft"
        aria-expanded={offen}
        aria-haspopup="menu"
      >
        Verlauf
        <ChevronDown
          size={11}
          className={cn('text-muted transition-transform', offen && 'rotate-180')}
        />
      </button>

      <AnimatePresence initial={false}>
        {offen && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
            className="absolute top-full mt-2 right-0 w-80 max-h-96 overflow-y-auto bg-paper border-[0.5px] border-line rounded-card shadow-lift z-50"
            role="menu"
          >
            <div className="px-3 py-2 text-xxs font-mono uppercase tracking-widest text-muted-soft border-b-[0.5px] border-line-soft">
              Letzte 7 Tage
            </div>
            <ul className="flex flex-col">
              {threads.map((t) => (
                <Eintrag
                  key={t.id}
                  thread={t}
                  aktiv={t.id === activeThreadId}
                  onWechsel={() => {
                    wechselZuThread(t.id)
                    setOffen(false)
                  }}
                  onLoeschen={() => loescheThread(t.id)}
                />
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

interface EintragProps {
  thread: ChatThread
  aktiv: boolean
  onWechsel: () => void
  onLoeschen: () => void
}

function Eintrag({ thread, aktiv, onWechsel, onLoeschen }: EintragProps) {
  return (
    <li
      onClick={onWechsel}
      className={cn(
        'group flex items-start gap-2 px-3 py-2 border-b-[0.5px] border-line-soft last:border-b-0 cursor-pointer transition-colors',
        aktiv ? 'bg-paper-muted' : 'hover:bg-paper-soft',
      )}
    >
      <div className="flex-1 min-w-0">
        <div className="text-xs text-ink truncate">{threadTitel(thread)}</div>
        <div className="text-xxs text-muted-soft font-mono mt-0.5">
          {datumsLabel(thread.zuletztAktivAm)}
        </div>
      </div>
      <button
        onClick={(e) => {
          e.stopPropagation()
          onLoeschen()
        }}
        aria-label="Gespräch löschen"
        className="shrink-0 p-1 rounded text-muted-soft opacity-0 group-hover:opacity-100 hover:text-state-req hover:bg-state-reqBg transition-opacity"
      >
        <Trash2 size={12} />
      </button>
    </li>
  )
}

import { useMemo, useState } from 'react'
import { Trash2, Plus, Search } from 'lucide-react'
import { cn } from '@/lib/cn'
import { useChat, useChatHistory } from '@/hooks/useChat'
import { datumsLabel, threadTitel, type ChatThread } from '@/lib/chat/threadStorage'

interface ChatSidebarProps {
  className?: string
}

function threadTextIndex(thread: ChatThread): string {
  // Nur User-Text indexieren: genug für „wiederfinden", ohne viel Lärm.
  return thread.nachrichten
    .filter((n) => n.rolle === 'user' && n.text)
    .map((n) => n.text?.trim() ?? '')
    .join('\n')
}

export function ChatSidebar({ className }: ChatSidebarProps) {
  const { neuesGespraech } = useChat()
  const { threads, activeThreadId, wechselZuThread, loescheThread } =
    useChatHistory()
  const [query, setQuery] = useState('')

  const items = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return threads
    return threads.filter((t) => {
      const title = threadTitel(t).toLowerCase()
      if (title.includes(q)) return true
      const body = threadTextIndex(t).toLowerCase()
      return body.includes(q)
    })
  }, [threads, query])

  return (
    <aside
      className={cn(
        'h-full min-h-0 w-[320px] shrink-0 border-r border-line-soft bg-paper-soft',
        className,
      )}
    >
      <div className="h-full min-h-0 flex flex-col">
        <div className="shrink-0 p-4 border-b border-line-soft">
          <button
            onClick={neuesGespraech}
            className="w-full inline-flex h-9 items-center justify-center gap-2 rounded-card border-[0.5px] border-line bg-paper px-3 text-xs font-medium text-ink transition-all duration-150 ease-gentle hover:border-line-strong hover:bg-paper-muted"
          >
            <Plus size={14} />
            Neuer Chat
          </button>

          <div className="mt-3 flex items-center gap-2 rounded-card border-[0.5px] border-line bg-paper px-3 py-2">
            <Search size={14} className="text-muted-soft" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Chats durchsuchen …"
              className="w-full bg-transparent text-xs text-ink outline-none placeholder:text-muted-soft"
            />
          </div>
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto">
          {items.length === 0 ? (
            <div className="p-4 text-xs text-muted">Keine Treffer.</div>
          ) : (
            <ul className="flex flex-col">
              {items.map((t) => (
                <li
                  key={t.id}
                  onClick={() => wechselZuThread(t.id)}
                  className={cn(
                    'group flex items-start gap-2 px-4 py-3 border-b-[0.5px] border-line-soft last:border-b-0 cursor-pointer transition-colors',
                    t.id === activeThreadId
                      ? 'bg-paper-muted'
                      : 'hover:bg-paper',
                  )}
                >
                  <div className="flex-1 min-w-0">
                    <div className="text-xs text-ink truncate">
                      {threadTitel(t)}
                    </div>
                    <div className="text-xxs text-muted-soft font-mono mt-0.5">
                      {datumsLabel(t.zuletztAktivAm)}
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      loescheThread(t.id)
                    }}
                    aria-label="Gespräch löschen"
                    className="shrink-0 p-1.5 rounded text-muted-soft opacity-0 group-hover:opacity-100 hover:text-state-req hover:bg-state-reqBg transition-opacity"
                  >
                    <Trash2 size={14} />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </aside>
  )
}


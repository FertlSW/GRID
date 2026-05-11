// Darstellung einer einzelnen Nachricht.
// User-Nachrichten: rechts in Paper-Muted-Bubble.
// Assistant-Nachrichten: links, gerendert aus ChatBlock[]; ggf. Rückfrage zuerst.

import { Loader2 } from 'lucide-react'
import { MotionReveal } from '@/components/shared/MotionReveal'
import { ChatBlockRenderer } from '@/components/viewC/ChatBlockRenderer'
import { ChatRueckfrage } from '@/components/viewC/ChatRueckfrage'
import type { ChatNachricht } from '@/lib/llm/chatTypes'

interface ChatMessageProps {
  nachricht: ChatNachricht
}

export function ChatMessage({ nachricht: n }: ChatMessageProps) {
  if (n.rolle === 'user') {
    return (
      <MotionReveal>
        <div className="flex justify-end">
          <div className="max-w-[80%] bg-paper-muted text-ink text-sm rounded-card px-4 py-2.5 leading-relaxed whitespace-pre-wrap">
            {n.text}
          </div>
        </div>
      </MotionReveal>
    )
  }

  const bloecke = n.antwort?.bloecke ?? []
  const rueckfrage = n.antwort?.rueckfrage

  return (
    <MotionReveal>
      <div className="flex flex-col gap-4 max-w-2xl">
        {rueckfrage && <ChatRueckfrage text={rueckfrage} />}

        {bloecke.map((b, i) => (
          <ChatBlockRenderer key={i} block={b} />
        ))}

        {n.streaming && bloecke.length === 0 && !rueckfrage && (
          <div className="flex items-center gap-2 text-xs text-muted">
            <Loader2 size={14} className="animate-spin" />
            <span>Denke nach …</span>
          </div>
        )}

        {n.fehler && (
          <div className="bg-state-reqBg text-state-req border-[0.5px] border-state-req/20 rounded-card p-3 text-xs leading-relaxed">
            <p className="font-medium mb-1">Antwort fehlgeschlagen</p>
            <p>{n.fehler}</p>
          </div>
        )}
      </div>
    </MotionReveal>
  )
}

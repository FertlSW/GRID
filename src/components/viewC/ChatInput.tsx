// Texteingabe unten: Textarea + Senden-Button.
// Während Streaming wird der Senden-Button durch einen Stop-Button ersetzt.
// Enter sendet, Shift+Enter erzeugt Zeilenumbruch.

import { useState, type KeyboardEvent } from 'react'
import { ArrowUp, Square } from 'lucide-react'

interface ChatInputProps {
  onSend: (text: string) => void
  onStop?: () => void
  loading?: boolean
}

export function ChatInput({ onSend, onStop, loading }: ChatInputProps) {
  const [text, setText] = useState('')

  const send = () => {
    const t = text.trim()
    if (!t || loading) return
    onSend(t)
    setText('')
  }

  const onKey = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      send()
    }
  }

  return (
    <div className="flex items-end gap-2 border-[0.5px] border-line rounded-card bg-paper px-3 py-2 focus-within:border-ink/40 transition-colors">
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={onKey}
        rows={1}
        placeholder="An was arbeitest du gerade?"
        disabled={loading}
        className="flex-1 bg-transparent outline-none focus:outline-none focus-visible:outline-none text-sm placeholder:text-muted-soft resize-none max-h-40 leading-relaxed py-1 disabled:opacity-60"
      />
      {loading ? (
        <button
          onClick={onStop}
          aria-label="Antwort stoppen"
          className="shrink-0 w-8 h-8 rounded-full bg-ink text-paper flex items-center justify-center hover:bg-accent transition-colors"
        >
          <Square size={12} fill="currentColor" />
        </button>
      ) : (
        <button
          onClick={send}
          disabled={!text.trim()}
          aria-label="Senden"
          className="shrink-0 w-8 h-8 rounded-full bg-ink text-paper flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed hover:bg-accent transition-colors"
        >
          <ArrowUp size={16} />
        </button>
      )}
    </div>
  )
}

// Hybrid-Eingabefeld: ein Composer für Suche UND Chat.
// Erkennt anhand des Eingabetexts, ob es sich um eine Frage oder ein Stichwort
// handelt, und zeigt das als kleine Pille rechts neben dem Eingabefeld an.
// Beim Submit entscheidet der Parent (NachschlagenView), was passiert.

import { useLayoutEffect, useRef } from 'react'
import { ArrowUp, Search } from 'lucide-react'
import { isQuestion } from '@/lib/lookup/isQuestion'
import { cn } from '@/lib/cn'

interface HybridComposerProps {
  value: string
  onChange: (next: string) => void
  onSubmit: () => void
  /** Kompakte Variante: kleinere Maße für Hero-collapsed oder Chat-Composer am Boden. */
  compact?: boolean
  placeholder?: string
  /** ARIA-Label für Submit-Button — nützlich, wenn mehrere Composer auf der Seite sind. */
  submitLabel?: string
}

export function HybridComposer({
  value,
  onChange,
  onSubmit,
  compact = false,
  placeholder = 'Frage stellen oder Stichwort suchen …',
  submitLabel = 'Senden',
}: HybridComposerProps) {
  const taRef = useRef<HTMLTextAreaElement | null>(null)
  const trimmed = value.trim()
  const liveKind = trimmed ? isQuestion(value) : null

  // Auto-Grow: passt die Textarea an den Inhalt an.
  useLayoutEffect(() => {
    const el = taRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = el.scrollHeight + 'px'
  }, [value])

  return (
    <div
      className={cn(
        'flex items-center bg-paper transition-all duration-300 ease-gentle',
        trimmed ? 'border-line-strong' : 'border-line',
        'border-[0.5px]',
        compact
          ? 'gap-2.5 rounded-[10px] py-1.5 pl-3.5 pr-1.5 shadow-none'
          : trimmed
            ? 'gap-3.5 rounded-[14px] px-[18px] py-3.5 shadow-lift'
            : 'gap-3.5 rounded-[14px] px-[18px] py-3.5 shadow-soft',
      )}
    >
      <span
        className={cn(
          'flex shrink-0 transition-colors duration-200 ease-gentle',
          trimmed ? 'text-ink' : 'text-muted-soft',
        )}
        aria-hidden
      >
        <Search size={compact ? 15 : 18} strokeWidth={1.8} />
      </span>

      <textarea
        ref={taRef}
        rows={1}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            if (trimmed) onSubmit()
          }
        }}
        placeholder={placeholder}
        className={cn(
          'flex-1 resize-none border-0 bg-transparent text-ink outline-none focus-visible:outline-none placeholder:text-muted-soft',
          'leading-[1.5]',
          compact ? 'max-h-[28px] py-0.5 text-[13px]' : 'max-h-[200px] py-1 text-[14px]',
        )}
      />

      {liveKind && (
        <span className="shrink-0 self-center rounded-chip bg-paper-muted px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.12em] text-muted">
          {liveKind === 'frage' ? '↩ Frage' : '↩ Suche'}
        </span>
      )}

      <button
        type="button"
        onClick={onSubmit}
        disabled={!trimmed}
        aria-label={submitLabel}
        className={cn(
          'flex shrink-0 items-center justify-center rounded-chip border-0 transition-all duration-200 ease-gentle',
          compact ? 'h-7 w-7' : 'h-9 w-9',
          trimmed
            ? 'cursor-pointer bg-ink text-paper'
            : 'cursor-not-allowed bg-paper-muted text-muted-soft',
        )}
      >
        <ArrowUp size={compact ? 13 : 16} strokeWidth={2.2} />
      </button>
    </div>
  )
}

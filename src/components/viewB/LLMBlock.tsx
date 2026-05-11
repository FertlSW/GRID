// Thematischer Block in View B — ersetzt die bisherige DecisionCard.
// Zeigt einen LLM-aggregierten Titel + Fließtext plus die Quell-Regel-IDs.

import type { LLMBlock as LLMBlockType } from '@/lib/llm/types'

interface LLMBlockProps {
  block: LLMBlockType
}

export function LLMBlock({ block }: LLMBlockProps) {
  return (
    <div className="bg-paper border-[0.5px] border-line rounded-card px-4 py-3">
      <div className="text-sm text-ink font-medium leading-snug">{block.titel}</div>
      <p className="mt-1.5 text-xs text-muted leading-relaxed">{block.zusammenfassung}</p>
      {block.regelIds.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1">
          {block.regelIds.map((id) => (
            <span
              key={id}
              className="text-xxs font-mono text-muted-soft bg-paper-muted rounded-md px-1.5 py-0.5"
            >
              {id}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}

// Hero-Bereich oberhalb der Kategorie-Pills.
// Sichtbar im Browse-Modus (kein aktiver Chat). Beim Scrollen kollabiert er
// sanft: Projekt-Pille, Headline und Suggestions schrumpfen weg, der Composer
// bleibt sichtbar und wird kompakter.

import { HybridComposer } from '@/components/lookup/HybridComposer'
import { lookupSuggestions } from '@/data/lookupSuggestions'
import { cn } from '@/lib/cn'

interface HeroSectionProps {
  input: string
  onInputChange: (next: string) => void
  onSubmit: () => void
  projektName: string
  /** Wenn true: Hero-Inhalte oberhalb des Composers sind kollabiert. */
  compact: boolean
}

export function HeroSection({
  input,
  onInputChange,
  onSubmit,
  projektName,
  compact,
}: HeroSectionProps) {
  return (
    <div
      className={cn(
        'relative z-[2] shrink-0 border-b border-line-soft bg-gradient-to-b from-paper-soft to-paper text-center',
        'transition-[padding,box-shadow] duration-300 ease-gentle',
        compact
          ? 'px-8 py-3.5 shadow-[0_8px_20px_-10px_rgba(0,0,0,0.14),0_2px_6px_-2px_rgba(0,0,0,0.05)]'
          : 'px-8 pb-10 pt-16 shadow-[0_4px_14px_-8px_rgba(0,0,0,0.08),0_1px_3px_-1px_rgba(0,0,0,0.04)]',
      )}
    >
      <div className="mx-auto max-w-[720px]">
        {/* Kollabierender oberer Bereich: Pille + Headline */}
        <div
          className={cn(
            'overflow-hidden transition-[max-height,opacity,transform] duration-[350ms] ease-gentle',
            compact
              ? 'pointer-events-none max-h-0 -translate-y-2 opacity-0'
              : 'max-h-[200px] translate-y-0 opacity-100',
          )}
        >
          <ProjektPille name={projektName} />
          <h1 className="m-0 text-[28px] font-medium leading-[1.2] tracking-[-0.02em] text-ink">
            Was möchtest du nachschlagen?
          </h1>
        </div>

        {/* Composer */}
        <div className={cn('text-left', compact ? 'mt-0' : 'mt-8')}>
          <HybridComposer
            value={input}
            onChange={onInputChange}
            onSubmit={onSubmit}
            compact={compact}
            submitLabel="Senden"
          />
        </div>

        {/* Suggestion-Pills */}
        <div
          className={cn(
            'overflow-hidden transition-[max-height,opacity,transform] duration-[350ms] ease-gentle',
            compact
              ? 'pointer-events-none max-h-0 -translate-y-1.5 opacity-0'
              : 'max-h-[120px] translate-y-0 opacity-100',
          )}
        >
          <div className="mt-[18px] flex flex-wrap justify-center gap-2">
            {lookupSuggestions.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => onInputChange(s)}
                className="rounded-chip border-[0.5px] border-line bg-paper px-3.5 py-1.5 text-xs font-medium text-ink transition-all duration-150 ease-gentle hover:border-line-strong hover:bg-paper-muted"
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function ProjektPille({ name }: { name: string }) {
  return (
    <div className="mb-4 inline-flex items-center gap-2 rounded-chip border-[0.5px] border-line bg-paper py-1.5 pl-2.5 pr-3 text-xs text-muted">
      <span
        className="h-1.5 w-1.5 rounded-full bg-accent shadow-[0_0_0_3px_#EEF2FF]"
        aria-hidden
      />
      <span>Durchsucht nur</span>
      <span className="font-medium text-ink">{name}</span>
    </div>
  )
}

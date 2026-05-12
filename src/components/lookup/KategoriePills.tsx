// Horizontale Kategorie-Pills (statt linker Letter-Spalte aus dem alten View A).
// Erste Pille „Alle" hebt jeden Filter auf. Pillen ohne Treffer (count === 0)
// sind nicht klickbar und ausgegraut.

import type { ViewAKategorie } from '@/lib/types'
import { cn } from '@/lib/cn'

interface KategoriePillsProps {
  kategorien: ViewAKategorie[]
  /** Counter pro Kategorie-ID (Letter). Wird vom Parent berechnet. */
  counts: Record<string, number>
  value: string | null
  onChange: (next: string | null) => void
}

export function KategoriePills({
  kategorien,
  counts,
  value,
  onChange,
}: KategoriePillsProps) {
  return (
    <div className="mb-6 flex flex-wrap items-center gap-2">
      <span className="mr-1 text-[10px] font-medium uppercase tracking-[0.14em] text-muted-soft">
        Kategorien
      </span>

      <PillButton active={value === null} onClick={() => onChange(null)}>
        Alle
      </PillButton>

      {kategorien.map((k) => {
        const count = counts[k.letter] ?? 0
        const has = count > 0
        const active = value === k.letter
        return (
          <PillButton
            key={k.letter}
            active={active}
            disabled={!has}
            onClick={() => has && onChange(active ? null : k.letter)}
          >
            {k.name}
          </PillButton>
        )
      })}
    </div>
  )
}

interface PillButtonProps {
  active: boolean
  disabled?: boolean
  onClick: () => void
  children: React.ReactNode
}

function PillButton({ active, disabled, onClick, children }: PillButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'rounded-chip border-[0.5px] px-3.5 py-1.5 text-xs font-medium transition-all duration-150 ease-gentle',
        active
          ? 'border-ink bg-ink text-paper'
          : disabled
            ? 'cursor-not-allowed border-line bg-paper text-muted-soft opacity-50'
            : 'border-line bg-paper text-ink hover:border-line-strong hover:bg-paper-muted',
      )}
    >
      {children}
    </button>
  )
}

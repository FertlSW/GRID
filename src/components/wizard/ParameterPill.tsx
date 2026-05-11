// Kleine Pill, die eine bereits gegebene Antwort anzeigt.
// Klickbar — springt zurück zur entsprechenden Frage.

import { cn } from '@/lib/cn'

interface ParameterPillProps {
  label: string
  value: string
  active?: boolean
  onClick?: () => void
}

export function ParameterPill({ label, value, active, onClick }: ParameterPillProps) {
  const Wrapper = onClick ? 'button' : 'span'
  return (
    <Wrapper
      onClick={onClick}
      className={cn(
        'inline-flex items-center gap-2 px-3 py-1 rounded-chip text-xxs transition-colors',
        'border-[0.5px]',
        active
          ? 'border-ink bg-ink text-paper'
          : 'border-line bg-paper text-muted hover:border-line-strong hover:text-ink'
      )}
    >
      <span className="font-mono uppercase tracking-wider opacity-60">{label}</span>
      <span className="font-medium">{value}</span>
    </Wrapper>
  )
}

// Farbige Status-Badges (erforderlich, abhängig, …) — exakt eine Farbe pro Status.

import type { RegelStatus } from '@/lib/types'
import { cn } from '@/lib/cn'

interface BadgeProps {
  status: RegelStatus
  /** Optional anderer Text als das Default-Label */
  children?: React.ReactNode
  className?: string
}

const labels: Record<RegelStatus, string> = {
  erforderlich: 'erforderlich',
  eingeschraenkt: 'eingeschränkt',
  abhaengig: 'abhängig',
  pruefen: 'prüfen',
  ok: 'erfüllt',
  nicht_erforderlich: 'nicht erforderlich',
}

const classes: Record<RegelStatus, string> = {
  erforderlich: 'bg-state-reqBg text-state-req',
  eingeschraenkt: 'bg-state-reqBg text-state-req',
  abhaengig: 'bg-state-depBg text-state-dep',
  pruefen: 'bg-state-checkBg text-state-check',
  ok: 'bg-state-okBg text-state-ok',
  nicht_erforderlich: 'bg-paper-muted text-muted',
}

export function Badge({ status, children, className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-2 py-[2px] rounded-chip text-xxs font-medium whitespace-nowrap',
        classes[status],
        className
      )}
    >
      {children ?? labels[status]}
    </span>
  )
}

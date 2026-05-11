// Zentraler Umschalter zwischen den drei Ansichten.
// Animierter "Gleitstein" per Framer-Motion-Layout-Animation.

import { motion } from 'framer-motion'
import { cn } from '@/lib/cn'

export type ViewMode = 'A' | 'B' | 'C'

interface ViewToggleProps {
  value: ViewMode
  onChange: (v: ViewMode) => void
}

const options: Array<{ value: ViewMode; label: string }> = [
  { value: 'A', label: 'Nachschlagen' },
  { value: 'B', label: 'Dashboard' },
  { value: 'C', label: 'Chat' },
]

export function ViewToggle({ value, onChange }: ViewToggleProps) {
  return (
    <div className="inline-flex items-center p-1 bg-paper-muted rounded-chip relative">
      {options.map((opt) => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          className={cn(
            'relative z-10 px-4 py-1.5 rounded-chip text-xs font-medium transition-colors',
            value === opt.value ? 'text-ink' : 'text-muted hover:text-ink'
          )}
        >
          {value === opt.value && (
            <motion.span
              layoutId="view-toggle-pill"
              className="absolute inset-0 bg-paper rounded-chip shadow-soft border-[0.5px] border-line"
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            />
          )}
          <span className="relative">{opt.label}</span>
        </button>
      ))}
    </div>
  )
}

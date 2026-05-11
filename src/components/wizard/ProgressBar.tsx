// Schlanke Fortschrittsleiste oben im Wizard.

import { motion } from 'framer-motion'

interface ProgressBarProps {
  current: number
  total: number
}

export function ProgressBar({ current, total }: ProgressBarProps) {
  const pct = Math.min(100, Math.round(((current + 1) / total) * 100))
  return (
    <div className="w-full">
      <div className="flex items-baseline justify-between text-xxs text-muted mb-2 font-mono">
        <span>
          Frage {current + 1} <span className="text-muted-soft">von {total}</span>
        </span>
        <span>{pct}%</span>
      </div>
      <div className="h-[2px] bg-line-soft rounded-chip overflow-hidden">
        <motion.div
          className="h-full bg-ink"
          initial={false}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        />
      </div>
    </div>
  )
}

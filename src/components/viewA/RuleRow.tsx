// Eine einzelne Regel als Zeile in View A.
// Klick → aufklappen → Erklärung + Originalzitat.

import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ChevronRight } from 'lucide-react'
import { RuleDetail } from '@/components/viewA/RuleDetail'
import type { Regel } from '@/lib/types'
import { cn } from '@/lib/cn'

interface RuleRowProps {
  regel: Regel
}

export function RuleRow({ regel }: RuleRowProps) {
  const [open, setOpen] = useState(false)
  return (
    <div
      className={cn(
        'border-b-[0.5px] border-line-soft transition-colors',
        open ? 'bg-paper-soft' : 'hover:bg-paper-soft'
      )}
    >
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full text-left px-4 py-3 flex items-center gap-3"
      >
        <motion.div
          animate={{ rotate: open ? 90 : 0 }}
          transition={{ duration: 0.2 }}
          className="text-muted-soft flex-shrink-0"
        >
          <ChevronRight size={14} />
        </motion.div>
        <span className="text-sm text-ink font-medium flex-1 leading-tight">
          {regel.headline}
        </span>
        {regel.quelleKurz && (
          <span className="hidden sm:inline text-xxs font-mono text-muted-soft">
            {regel.quelleKurz}
          </span>
        )}
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <RuleDetail regel={regel} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

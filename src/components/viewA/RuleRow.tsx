// Eine einzelne Regel als aufklappbare Card.
//   • Eigene weiße Card mit Border, rounded-card.
//   • Header: Headline groß, Kategorie-Subline klein, Chevron rechts.
//   • Beim Aufklappen: paperSoft-Hintergrund, Detail-Inhalt aus RuleDetail
//     (dort steht auch die Quelle).

import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ChevronDown } from 'lucide-react'
import { RuleDetail } from '@/components/viewA/RuleDetail'
import type { Regel } from '@/lib/types'
import { cn } from '@/lib/cn'

interface RuleRowProps {
  regel: Regel
  /** Name der Hauptkategorie (für die Subline unter der Headline). */
  kategorieName?: string
}

export function RuleRow({ regel, kategorieName }: RuleRowProps) {
  const [open, setOpen] = useState(false)

  return (
    <article
      className={cn(
        'rounded-card border-[0.5px] bg-paper overflow-hidden transition-colors duration-200 ease-gentle',
        open ? 'border-line-strong' : 'border-line',
      )}
    >
      <button
        onClick={() => setOpen((o) => !o)}
        className={cn(
          'w-full flex items-center gap-3.5 px-4 py-3.5 text-left transition-colors',
          open ? 'bg-paper-soft' : 'hover:bg-paper-soft',
        )}
        aria-expanded={open}
      >
        <div className="flex-1 min-w-0">
          <div
            className={cn(
              'text-sm text-ink tracking-[-0.005em] leading-snug',
              open ? 'font-semibold' : 'font-medium',
            )}
          >
            {regel.headline}
          </div>
          {kategorieName && (
            <div className="text-[11px] text-muted mt-0.5">{kategorieName}</div>
          )}
        </div>

        <motion.div
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          className="text-muted-soft flex shrink-0"
        >
          <ChevronDown size={16} />
        </motion.div>
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
            <div className="border-t-[0.5px] border-line-soft bg-paper-soft">
              <RuleDetail regel={regel} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </article>
  )
}

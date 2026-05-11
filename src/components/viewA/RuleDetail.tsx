// Aufgeklappter Detail-Block einer Regel in View A.
// Zeigt: Erklärung → "Originalzitat anzeigen"-Toggle → Originaltext mit Referenz.

import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { BookOpen } from 'lucide-react'
import type { Regel } from '@/lib/types'

interface RuleDetailProps {
  regel: Regel
}

export function RuleDetail({ regel }: RuleDetailProps) {
  const [showOriginal, setShowOriginal] = useState(false)

  return (
    <div className="pl-4 md:pl-8 pr-4 pb-6 pt-2">
      {regel.varianteHeadline && (
        <div className="mb-3 inline-block px-2.5 py-1 rounded-chip text-xxs bg-paper-muted text-ink font-mono">
          {regel.varianteHeadline}
        </div>
      )}

      <p className="text-sm text-ink-soft leading-relaxed max-w-3xl">{regel.erklaerung}</p>

      {regel.hinweise && regel.hinweise.length > 0 && (
        <ul className="mt-3 max-w-3xl text-xs text-muted italic leading-relaxed list-disc pl-4 space-y-1">
          {regel.hinweise.map((h, i) => (
            <li key={i}>{h}</li>
          ))}
        </ul>
      )}

      {regel.querverweise && regel.querverweise.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-1.5 max-w-3xl">
          {regel.querverweise.map((q) => (
            <span
              key={q.ref_id}
              title={q.beschreibung}
              className="px-2 py-0.5 rounded-chip text-xxs bg-paper-muted text-muted font-mono"
            >
              → {q.ref_fundstelle}
            </span>
          ))}
        </div>
      )}

      <button
        onClick={() => setShowOriginal((s) => !s)}
        className="mt-4 inline-flex items-center gap-2 text-xxs text-muted hover:text-ink transition-colors"
      >
        <BookOpen size={12} />
        <span>{showOriginal ? 'Originalzitat ausblenden' : 'Originalzitat anzeigen'}</span>
      </button>

      <AnimatePresence initial={false}>
        {showOriginal && (
          <motion.div
            initial={{ opacity: 0, height: 0, marginTop: 0 }}
            animate={{ opacity: 1, height: 'auto', marginTop: 12 }}
            exit={{ opacity: 0, height: 0, marginTop: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <div className="bg-paper-soft border-[0.5px] border-line rounded-card p-4 max-w-3xl">
              <div className="text-xxs font-mono text-muted mb-2 tracking-wider uppercase">
                {regel.originalReferenz}
              </div>
              <p className="text-sm text-ink leading-relaxed italic">
                „{regel.originalText}"
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

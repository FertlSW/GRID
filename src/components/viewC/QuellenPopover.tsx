// Klappt auf, wenn der Nutzer auf einen `datenbasis`- oder `modell`-Marker
// eines Block klickt.
//
// Datenbasis: zeigt jede zitierte Regel mit Fundstelle + Toggle für Originalzitat.
// Modell: zeigt die Begründung, warum hier Hintergrundwissen ergänzt wurde.
// Web: (Phase 2) zeigt die URLs.

import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { BookOpen } from 'lucide-react'
import { rechtssatzById } from '@/lib/rules'
import type { Provenance } from '@/lib/llm/chatTypes'

interface QuellenPopoverProps {
  provenance: Provenance
  visible: boolean
}

export function QuellenPopover({ provenance, visible }: QuellenPopoverProps) {
  return (
    <AnimatePresence initial={false}>
      {visible && (
        <motion.div
          initial={{ opacity: 0, height: 0, marginTop: 0 }}
          animate={{ opacity: 1, height: 'auto', marginTop: 8 }}
          exit={{ opacity: 0, height: 0, marginTop: 0 }}
          transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
          className="overflow-hidden"
        >
          <div className="bg-paper-soft border-[0.5px] border-line rounded-card p-3">
            <Inhalt provenance={provenance} />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

function Inhalt({ provenance }: { provenance: Provenance }) {
  if (provenance.quelle === 'datenbasis') {
    if (provenance.regelIds.length === 0) {
      return (
        <p className="text-xs text-muted">
          Keine konkreten Quellen-IDs angegeben.
        </p>
      )
    }
    return (
      <ul className="flex flex-col gap-3">
        {provenance.regelIds.map((id) => (
          <RegelEintrag key={id} regelId={id} />
        ))}
      </ul>
    )
  }

  if (provenance.quelle === 'modell') {
    return (
      <div>
        <p className="text-xxs font-mono uppercase tracking-widest text-muted mb-1.5">
          Modellwissen
        </p>
        <p className="text-xs text-ink-soft leading-relaxed">
          {provenance.begruendung}
        </p>
        <p className="mt-2 text-xxs text-muted-soft italic">
          Diese Aussage stammt nicht aus den geladenen Rechtssätzen, sondern
          aus dem allgemeinen Wissen des Sprachmodells. Bitte verifizieren.
        </p>
      </div>
    )
  }

  // web (Phase 2)
  return (
    <div>
      <p className="text-xxs font-mono uppercase tracking-widest text-muted mb-1.5">
        Web-Quellen
      </p>
      <ul className="flex flex-col gap-1">
        {provenance.urls.map((u) => (
          <li key={u}>
            <a
              href={u}
              target="_blank"
              rel="noreferrer"
              className="text-xs text-accent hover:underline break-all"
            >
              {u}
            </a>
          </li>
        ))}
      </ul>
    </div>
  )
}

function RegelEintrag({ regelId }: { regelId: string }) {
  const [showOriginal, setShowOriginal] = useState(false)
  const regel = rechtssatzById(regelId)

  if (!regel) {
    return (
      <li className="text-xs text-state-req">
        Quelle nicht gefunden: <span className="font-mono">{regelId}</span>
      </li>
    )
  }

  return (
    <li className="flex flex-col gap-1.5">
      <div className="flex items-baseline gap-2 flex-wrap">
        <span className="text-xxs font-mono text-muted">
          {regel.originalReferenz}
        </span>
        {regel.quelleKurz && (
          <span className="px-1.5 py-0.5 rounded-chip text-xxs bg-paper-muted text-muted">
            {regel.quelleKurz}
          </span>
        )}
      </div>
      <p className="text-xs text-ink leading-relaxed">{regel.headline}</p>
      <button
        onClick={() => setShowOriginal((s) => !s)}
        className="self-start inline-flex items-center gap-1.5 text-xxs text-muted hover:text-ink transition-colors"
      >
        <BookOpen size={11} />
        {showOriginal ? 'Originalzitat ausblenden' : 'Originalzitat anzeigen'}
      </button>
      <AnimatePresence initial={false}>
        {showOriginal && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <p className="bg-paper border-[0.5px] border-line-soft rounded-card p-3 text-xs text-ink leading-relaxed italic">
              „{regel.originalText}"
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </li>
  )
}

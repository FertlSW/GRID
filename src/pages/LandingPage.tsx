// Landing-Seite: großflächig weiß, zentriertes Logo + CTA.
// Motion: gestaffeltes Einblenden (Logo → Untertitel → Button).

import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { Shell } from '@/components/Shell'
import { useProjekte } from '@/state/ProjekteContext'

export function LandingPage() {
  const navigate = useNavigate()
  const { legeNeuesProjektAn } = useProjekte()

  const startenNeu = () => {
    legeNeuesProjektAn()
    navigate('/wizard')
  }

  return (
    <Shell minimal>
      <div className="mx-auto max-w-3xl px-6 md:px-10 py-24 md:py-36 flex flex-col items-center text-center">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="text-xxs text-muted font-mono tracking-widest uppercase mb-8"
        >
          Wien · OIB · Bauordnung
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          className="text-5xl md:text-7xl font-medium tracking-tight text-ink leading-[1.05]"
        >
          Grid<span className="text-muted">.legal</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
          className="mt-6 text-lg md:text-xl text-muted max-w-xl leading-relaxed"
        >
          Bauvorschriften für Wien. Strukturiert.
          <br />
          Auf einen Blick.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="mt-12"
        >
          <button
            onClick={startenNeu}
            className="group inline-flex items-center gap-2 bg-ink text-paper px-6 py-3 rounded-chip text-sm font-medium hover:bg-ink-soft transition-colors"
          >
            Neues Projekt starten
            <ArrowRight
              size={16}
              className="transition-transform group-hover:translate-x-0.5"
            />
          </button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.7 }}
          className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 w-full text-left"
        >
          {[
            {
              titel: '7 Fragen',
              text: 'Parameter zu deinem Bauvorhaben — Hauptnutzung, GK, Geschosse, Fluchtniveau.',
            },
            {
              titel: 'Zwei Ansichten',
              text: 'Juristisches Nachschlagewerk und Architekten-Dashboard mit Phasen.',
            },
            {
              titel: 'Originalquellen',
              text: 'Jede Regel mit direkter Referenz auf Paragraf oder OIB-Punkt.',
            },
          ].map((f, i) => (
            <div
              key={f.titel}
              className="border-t-[0.5px] border-line pt-4 text-xs text-muted"
            >
              <div className="font-mono text-xxs text-muted-soft tracking-widest mb-1">
                {String(i + 1).padStart(2, '0')}
              </div>
              <div className="text-ink text-sm font-medium mb-2">{f.titel}</div>
              <p className="leading-relaxed">{f.text}</p>
            </div>
          ))}
        </motion.div>
      </div>
    </Shell>
  )
}

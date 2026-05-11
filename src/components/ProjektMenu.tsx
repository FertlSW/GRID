// Header-Dropdown zur Verwaltung mehrerer Projekte.
// - Zeigt links neben dem Logo den aktiven Projektnamen + Chevron.
// - Klick öffnet eine Liste aller Projekte mit Inline-Umbenennen + Löschen.
// - „+ Neues Projekt" legt ein leeres Projekt an und navigiert in den Wizard.

import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { Check, ChevronDown, Pencil, Plus, Trash2 } from 'lucide-react'
import { cn } from '@/lib/cn'
import { useProjekte } from '@/state/ProjekteContext'
import { projektUntertitel, type Projekt } from '@/lib/projekt/projekteStorage'

export function ProjektMenu() {
  const navigate = useNavigate()
  const {
    projekte,
    aktivesProjekt,
    legeNeuesProjektAn,
    wechselZuProjekt,
    benenneProjektUm,
    loescheProjekt,
  } = useProjekte()

  const [offen, setOffen] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const wrapRef = useRef<HTMLDivElement | null>(null)

  // Klick außerhalb schließt das Menü.
  useEffect(() => {
    if (!offen) return
    const onDown = (e: MouseEvent) => {
      if (!wrapRef.current) return
      if (!wrapRef.current.contains(e.target as Node)) {
        setOffen(false)
        setEditId(null)
      }
    }
    document.addEventListener('mousedown', onDown)
    return () => document.removeEventListener('mousedown', onDown)
  }, [offen])

  const handleWechsel = (p: Projekt) => {
    wechselZuProjekt(p.id)
    setOffen(false)
    if (!p.istKomplett) navigate('/wizard')
    else navigate('/ergebnisse')
  }

  const handleNeu = () => {
    legeNeuesProjektAn()
    setOffen(false)
    navigate('/wizard')
  }

  return (
    <div ref={wrapRef} className="relative flex items-center gap-2">
      <span className="text-muted-soft">·</span>
      <button
        onClick={() => setOffen((o) => !o)}
        className="inline-flex items-center gap-1.5 text-[15px] tracking-tight text-ink hover:opacity-70 transition-opacity"
        aria-expanded={offen}
        aria-haspopup="menu"
      >
        <span className="font-medium">
          {aktivesProjekt?.name ?? 'Kein Projekt'}
        </span>
        <ChevronDown
          size={13}
          className={cn(
            'text-muted-soft transition-transform',
            offen && 'rotate-180',
          )}
        />
      </button>

      <AnimatePresence initial={false}>
        {offen && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
            className="absolute top-full mt-2 left-0 w-80 max-h-[28rem] overflow-y-auto bg-paper border-[0.5px] border-line rounded-card shadow-lift z-50"
            role="menu"
          >
            <div className="px-3 py-2 text-xxs font-mono uppercase tracking-widest text-muted-soft border-b-[0.5px] border-line-soft">
              Projekte
            </div>

            <ul className="flex flex-col">
              {projekte.map((p) => (
                <Eintrag
                  key={p.id}
                  projekt={p}
                  aktiv={p.id === aktivesProjekt?.id}
                  imBearbeitenModus={editId === p.id}
                  onWechsel={() => handleWechsel(p)}
                  onUmbenennenStart={() => setEditId(p.id)}
                  onUmbenennenSpeichern={(name) => {
                    benenneProjektUm(p.id, name)
                    setEditId(null)
                  }}
                  onUmbenennenAbbrechen={() => setEditId(null)}
                  onLoeschen={() => {
                    if (
                      confirm(
                        `„${p.name}" wirklich löschen? Auch die Chats dieses Projekts gehen verloren.`,
                      )
                    ) {
                      loescheProjekt(p.id)
                    }
                  }}
                />
              ))}
            </ul>

            <button
              onClick={handleNeu}
              className="w-full flex items-center gap-2 px-3 py-2.5 border-t-[0.5px] border-line-soft text-sm text-ink hover:bg-paper-soft transition-colors"
            >
              <Plus size={14} className="text-muted" />
              <span>Neues Projekt</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

interface EintragProps {
  projekt: Projekt
  aktiv: boolean
  imBearbeitenModus: boolean
  onWechsel: () => void
  onUmbenennenStart: () => void
  onUmbenennenSpeichern: (name: string) => void
  onUmbenennenAbbrechen: () => void
  onLoeschen: () => void
}

function Eintrag({
  projekt,
  aktiv,
  imBearbeitenModus,
  onWechsel,
  onUmbenennenStart,
  onUmbenennenSpeichern,
  onUmbenennenAbbrechen,
  onLoeschen,
}: EintragProps) {
  const [entwurf, setEntwurf] = useState(projekt.name)
  useEffect(() => {
    if (imBearbeitenModus) setEntwurf(projekt.name)
  }, [imBearbeitenModus, projekt.name])

  return (
    <li
      onClick={!imBearbeitenModus ? onWechsel : undefined}
      className={cn(
        'group flex items-start gap-2 px-3 py-2.5 border-b-[0.5px] border-line-soft last:border-b-0 transition-colors',
        aktiv ? 'bg-paper-muted' : 'hover:bg-paper-soft cursor-pointer',
        imBearbeitenModus && 'cursor-default',
      )}
    >
      <span className="shrink-0 w-4 mt-0.5 text-state-ok">
        {aktiv && <Check size={13} />}
      </span>
      <div className="flex-1 min-w-0">
        {imBearbeitenModus ? (
          <input
            autoFocus
            value={entwurf}
            onChange={(e) => setEntwurf(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') onUmbenennenSpeichern(entwurf)
              if (e.key === 'Escape') onUmbenennenAbbrechen()
            }}
            onBlur={() => onUmbenennenSpeichern(entwurf)}
            onClick={(e) => e.stopPropagation()}
            className="w-full bg-paper border-[0.5px] border-line-strong rounded px-2 py-1 text-sm text-ink outline-none"
          />
        ) : (
          <>
            <div className={cn('text-sm', aktiv ? 'text-ink font-medium' : 'text-ink')}>
              {projekt.name}
            </div>
            <div className="text-xxs text-muted-soft mt-0.5">
              {projektUntertitel(projekt)}
            </div>
          </>
        )}
      </div>
      {!imBearbeitenModus && (
        <div className="shrink-0 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={(e) => {
              e.stopPropagation()
              onUmbenennenStart()
            }}
            aria-label="Projekt umbenennen"
            className="p-1 rounded text-muted-soft hover:text-ink hover:bg-paper transition-colors"
          >
            <Pencil size={12} />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation()
              onLoeschen()
            }}
            aria-label="Projekt löschen"
            className="p-1 rounded text-muted-soft hover:text-state-req hover:bg-state-reqBg transition-colors"
          >
            <Trash2 size={12} />
          </button>
        </div>
      )}
    </li>
  )
}

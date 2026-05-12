// Darstellung einer einzelnen Nachricht im Chat.
//
// User-Nachrichten: rechts in Paper-Muted-Bubble.
// Assistant-Nachrichten: Mockup-Layout in fünf Sektionen
//   1) Optionale Rückfrage zuerst.
//   2) „Antwort"-Card (paperSoft, Sparkles-Label) — wrappt den ersten Prosa-Block.
//   3) Zwei-Spalten-Grid: „Bezug zum Projekt"-Card + Schema-Piktogramm.
//      Wird nur gerendert, wenn projektBezug und/oder topic gesetzt sind.
//   4) Kennwerte-Tabelle: alle `kennzahl`-Blöcke gruppiert als 3-Spalten-Liste.
//   5) Detail-Blöcke: alle restlichen Blöcke (weitere Prosa, Tabelle, Liste, Hinweis).
//   6) „Referenzierte Regeln"-Sektion mit den im Stream genannten regelIds als RuleCards.

import { useMemo } from 'react'
import { Loader2, Sparkles } from 'lucide-react'
import { MotionReveal } from '@/components/shared/MotionReveal'
import { ChatBlockRenderer } from '@/components/viewC/ChatBlockRenderer'
import { ChatRueckfrage } from '@/components/viewC/ChatRueckfrage'
import { ProjektBezugCard } from '@/components/viewC/ProjektBezugCard'
import { Piktogramm } from '@/components/viewC/Piktogramm'
import { KennwerteTabelle } from '@/components/viewC/KennwerteTabelle'
import { RuleRow } from '@/components/viewA/RuleRow'
import { useProjekte } from '@/state/ProjekteContext'
import { filterRegeln } from '@/lib/filter'
import { rechtssatzById } from '@/lib/rules'
import type {
  ChatBlock,
  ChatBlockKennzahl,
  ChatNachricht,
} from '@/lib/llm/chatTypes'
import type { Regel } from '@/lib/types'
import { cn } from '@/lib/cn'

interface ChatMessageProps {
  nachricht: ChatNachricht
}

export function ChatMessage({ nachricht: n }: ChatMessageProps) {
  if (n.rolle === 'user') {
    return (
      <MotionReveal>
        <div className="flex justify-end">
          <div className="max-w-[80%] bg-paper-muted text-ink text-sm rounded-card px-4 py-2.5 leading-relaxed whitespace-pre-wrap">
            {n.text}
          </div>
        </div>
      </MotionReveal>
    )
  }

  const bloecke = n.antwort?.bloecke ?? []
  const rueckfrage = n.antwort?.rueckfrage
  const topic = n.antwort?.topic
  const projektBezug = n.antwort?.projektBezug

  // Den ersten Prosa-Block isolieren — er wird als prominente „Antwort"-Card
  // gerendert.
  const ersterProsaIdx = bloecke.findIndex((b) => b.typ === 'prosa')
  const antwortBlock = ersterProsaIdx >= 0 ? bloecke[ersterProsaIdx] : null

  // Restblöcke: alles außer der ersten Prosa.
  const restBloecke = bloecke.filter((_, i) => i !== ersterProsaIdx)

  // Kennzahlen: aus den Restblöcken extrahieren — werden als Tabelle gerendert.
  const kennzahlen = restBloecke.filter(
    (b): b is ChatBlockKennzahl => b.typ === 'kennzahl',
  )
  const detailBloecke = restBloecke.filter((b) => b.typ !== 'kennzahl')

  const hatBezugSektion = !!projektBezug || !!topic

  return (
    <MotionReveal>
      <div className="flex flex-col gap-5 max-w-2xl">
        {rueckfrage && <ChatRueckfrage text={rueckfrage} />}

        {antwortBlock && <AntwortCard block={antwortBlock} />}

        {hatBezugSektion && (
          <div
            className={cn(
              'grid gap-3',
              projektBezug && topic
                ? 'grid-cols-1 md:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]'
                : 'grid-cols-1',
            )}
          >
            {projektBezug && <ProjektBezugCard text={projektBezug} />}
            {topic && <Piktogramm topic={topic} />}
          </div>
        )}

        {kennzahlen.length > 0 && <KennwerteTabelle items={kennzahlen} />}

        {detailBloecke.length > 0 && (
          <div className="flex flex-col gap-4">
            {detailBloecke.map((b, i) => (
              <ChatBlockRenderer key={i} block={b} />
            ))}
          </div>
        )}

        {n.streaming && bloecke.length === 0 && !rueckfrage && (
          <div className="flex items-center gap-2 text-xs text-muted">
            <Loader2 size={14} className="animate-spin" />
            <span>Denke nach …</span>
          </div>
        )}

        {n.fehler && (
          <div className="bg-state-reqBg text-state-req border-[0.5px] border-state-req/20 rounded-card p-3 text-xs leading-relaxed">
            <p className="font-medium mb-1">Antwort fehlgeschlagen</p>
            <p>{n.fehler}</p>
          </div>
        )}

        <ReferenzierteRegeln bloecke={bloecke} streaming={n.streaming} />
      </div>
    </MotionReveal>
  )
}

// ──────────────────────────── „Antwort"-Card ────────────────────────────

function AntwortCard({ block }: { block: ChatBlock }) {
  // Nur Prosa wird hier gewrappt — andere Block-Typen werden via Renderer geroutet
  // (defensiv für Stream-Edge-Cases).
  if (block.typ !== 'prosa') {
    return <ChatBlockRenderer block={block} />
  }
  return (
    <div className="rounded-card border-[0.5px] border-line-soft bg-paper-soft px-5 pb-5 pt-4">
      <div className="mb-2.5 flex items-center gap-2">
        <Sparkles size={11} strokeWidth={2} className="text-muted-soft" />
        <span className="text-[10px] font-medium uppercase tracking-[0.14em] text-muted-soft">
          Antwort
        </span>
      </div>
      <ChatBlockRenderer block={block} />
    </div>
  )
}

// ──────────────────────────── Referenzierte Regeln ────────────────────────────

function ReferenzierteRegeln({
  bloecke,
  streaming,
}: {
  bloecke: ChatBlock[]
  streaming?: boolean
}) {
  const { params } = useProjekte()

  // Map<id, Regel> aller projekt-relevanten Regeln, einmal pro Param-Set.
  const regelnById = useMemo(() => {
    const map = new Map<string, Regel>()
    for (const r of filterRegeln(params)) map.set(r.id, r)
    return map
  }, [params])

  // Einzigartige regelIds aus allen datenbasis-Provenance-Markern.
  const regeln = useMemo(() => {
    const seen = new Set<string>()
    for (const b of bloecke) {
      if (b.typ === 'ueberschrift' || b.typ === 'hinweis') continue
      if (b.provenance.quelle !== 'datenbasis') continue
      for (const id of b.provenance.regelIds) seen.add(id)
    }
    const out: Regel[] = []
    for (const id of seen) {
      const r = regelnById.get(id) ?? rechtssatzById(id)
      if (r) out.push(r)
    }
    return out
  }, [bloecke, regelnById])

  if (regeln.length === 0) return null
  if (streaming) return null

  return (
    <section className="flex flex-col gap-3">
      <div className="text-[10px] font-medium uppercase tracking-[0.14em] text-muted-soft">
        {regeln.length} {regeln.length === 1 ? 'referenzierte Regel' : 'referenzierte Regeln'}
      </div>
      <div className="flex flex-col gap-2">
        {regeln.map((r) => (
          <RuleRow key={r.id} regel={r} />
        ))}
      </div>
    </section>
  )
}

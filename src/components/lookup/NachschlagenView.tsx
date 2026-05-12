// Nachschlagen-Ansicht (Regel-Browse + Suche) mit Hybrid-Composer.
//
// Verhalten:
//   - Stichwort-Submit filtert die Liste (Browse bleibt sichtbar).
//   - Frage-Submit startet einen Chat und kann optional den Parent dazu bringen,
//     in den separaten „Chat“-Tab zu wechseln.
//
// Wichtig: Das Nachschlagewerk bleibt unabhängig vom Chat-Verlauf sichtbar,
// damit man jederzeit wieder in die Regelansicht zurück kann.

import { useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import Fuse from 'fuse.js'
import { useChat } from '@/hooks/useChat'
import { useProjekte } from '@/state/ProjekteContext'
import { filterRegeln, regelnFuerViewAKategorie } from '@/lib/filter'
import { buildViewAStruktur } from '@/lib/rules'
import { isQuestion } from '@/lib/lookup/isQuestion'
import { HeroSection } from '@/components/lookup/HeroSection'
import { KategoriePills } from '@/components/lookup/KategoriePills'
import { HybridComposer } from '@/components/lookup/HybridComposer'
import {
  CategoryAccordion,
  EmptyCategoryAccordion,
} from '@/components/viewA/CategoryAccordion'
import { MotionReveal } from '@/components/shared/MotionReveal'

const SCROLL_COLLAPSE_AT = 24
const SCROLL_EXPAND_AT = 4

interface NachschlagenViewProps {
  /** Optional: Wird nach dem Abschicken einer Frage aufgerufen (z.B. um auf den Chat-Tab zu wechseln). */
  onOpenChat?: () => void
}

export function NachschlagenView({ onOpenChat }: NachschlagenViewProps) {
  const { params, aktivesProjekt } = useProjekte()
  const { sende } = useChat()

  const [input, setInput] = useState('')
  const [search, setSearch] = useState('')
  const [activePill, setActivePill] = useState<string | null>(null)
  const [openIds, setOpenIds] = useState<Set<string>>(() => new Set())
  const [scrolled, setScrolled] = useState(false)

  const scrollRef = useRef<HTMLDivElement | null>(null)

  // ───────────────── Daten: Regelmenge je nach Filter ─────────────────

  const alle = useMemo(() => filterRegeln(params), [params])
  const viewAKategorien = useMemo(() => buildViewAStruktur(), [])

  // Fuzzy-Index über alle Regeln. Felder werden nach Relevanz gewichtet
  // (Headline + Referenz zählen am meisten). `threshold: 0.4` toleriert
  // Wortstämme („Brand" → „Brandschutz") ohne Zufallstreffer aufzunehmen.
  const fuse = useMemo(
    () =>
      new Fuse(alle, {
        keys: [
          { name: 'headline', weight: 3 },
          { name: 'erklaerung', weight: 2 },
          { name: 'originalText', weight: 1 },
          { name: 'originalReferenz', weight: 2 },
          { name: 'hinweise', weight: 1 },
          { name: 'thema', weight: 2 },
        ],
        threshold: 0.4,
        ignoreLocation: true,
        minMatchCharLength: 2,
        includeScore: true,
      }),
    [alle],
  )

  // Treffer-IDs bei aktiver Suche; null wenn Suche leer (= alle Regeln zeigen).
  const trefferIds = useMemo<Set<string> | null>(() => {
    const q = search.trim()
    if (!q) return null
    return new Set(fuse.search(q).map((r) => r.item.id))
  }, [fuse, search])

  const counts = useMemo(() => {
    const out: Record<string, number> = {}
    for (const k of viewAKategorien) {
      out[k.letter] = regelnFuerViewAKategorie(alle, k.id).length
    }
    return out
  }, [alle, viewAKategorien])

  const sichtbareKategorien = useMemo(
    () =>
      activePill
        ? viewAKategorien.filter((k) => k.letter === activePill)
        : viewAKategorien,
    [viewAKategorien, activePill],
  )

  const daten = useMemo(
    () =>
      sichtbareKategorien
        .map((k) => {
          let regeln = regelnFuerViewAKategorie(alle, k.id)
          if (trefferIds) regeln = regeln.filter((r) => trefferIds.has(r.id))
          return { kategorie: k, regeln }
        })
        .filter((g) => (trefferIds ? g.regeln.length > 0 : true)),
    [sichtbareKategorien, alle, trefferIds],
  )

  // ───────────────── Submit-Handler ─────────────────

  const handleSubmit = () => {
    const sauber = input.trim()
    if (!sauber) return
    const art = isQuestion(sauber)
    if (art === 'frage') {
      void sende(sauber)
      onOpenChat?.()
    } else {
      setSearch(sauber)
      // Beim Stichwort-Submit alle Kategorien aufklappen, damit Treffer sichtbar sind.
      setOpenIds(new Set(viewAKategorien.map((k) => k.id)))
    }
    setInput('')
  }

  const setOpen = (id: string, on: boolean) => {
    setOpenIds((prev) => {
      const next = new Set(prev)
      if (on) next.add(id)
      else next.delete(id)
      return next
    })
  }

  // ───────────────── Layout ─────────────────

  return (
    <section className="flex h-full min-h-0 flex-col">
      <HeroSection
        input={input}
        onInputChange={setInput}
        onSubmit={handleSubmit}
        projektName={aktivesProjekt?.name ?? 'aktuelles Projekt'}
        compact={scrolled}
      />

      <div
        ref={scrollRef}
        className="flex-1 min-h-0 overflow-y-auto"
        style={{ scrollbarGutter: 'stable' }}
        onScroll={(e) => {
          const top = e.currentTarget.scrollTop
          if (top > SCROLL_COLLAPSE_AT && !scrolled) setScrolled(true)
          else if (top <= SCROLL_EXPAND_AT && scrolled) setScrolled(false)
        }}
      >
        <div className="mx-auto max-w-[980px] px-6 py-8 md:px-8 md:pb-16">
          <AnimatePresence mode="wait">
            <motion.div
              key="browse"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            >
              <KategoriePills
                kategorien={viewAKategorien}
                counts={counts}
                value={activePill}
                onChange={setActivePill}
              />

              {search.trim() && (
                <div className="mb-4 flex items-center gap-3 text-xxs text-muted">
                  <span>Suche:</span>
                  <span className="rounded-chip bg-paper-muted px-3 py-1 font-medium text-ink">
                    {search}
                  </span>
                  <span className="text-muted-soft">
                    {trefferIds?.size ?? 0} Treffer
                  </span>
                  <button
                    onClick={() => setSearch('')}
                    className="text-muted-soft hover:text-ink"
                  >
                    zurücksetzen
                  </button>
                </div>
              )}

              {trefferIds && trefferIds.size === 0 && (
                <div className="rounded-card border-[0.5px] border-line-soft bg-paper-soft px-6 py-10 text-center text-sm text-muted">
                  Keine Treffer für „{search}".
                  <br />
                  Versuche es mit einem anderen Stichwort — oder formuliere es
                  als Frage, dann springst du automatisch in den Chat.
                </div>
              )}

              <MotionReveal>
                <div className="flex flex-col gap-3">
                  {daten.map(({ kategorie, regeln }) =>
                    regeln.length > 0 ? (
                      <CategoryAccordion
                        key={kategorie.id}
                        kategorie={kategorie}
                        regeln={regeln}
                        open={openIds.has(kategorie.id)}
                        onToggle={(next) => setOpen(kategorie.id, next)}
                        searchActive={trefferIds !== null}
                      />
                    ) : trefferIds ? null : (
                      <EmptyCategoryAccordion
                        key={kategorie.id}
                        kategorie={kategorie}
                      />
                    ),
                  )}
                </div>
              </MotionReveal>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  )
}

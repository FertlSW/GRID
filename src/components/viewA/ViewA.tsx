// Die Nachschlage-Ansicht (View A).
// Links: Navigations-Spalte mit Buchstaben A–I.
// Rechts: Alle Kategorien als Accordion.

import { useCallback, useMemo, useState } from 'react'
import { Search } from 'lucide-react'
import {
  CategoryAccordion,
  EmptyCategoryAccordion,
} from '@/components/viewA/CategoryAccordion'
import { filterRegeln, regelnFuerViewAKategorie } from '@/lib/filter'
import { buildViewAStruktur } from '@/lib/rules'
import { useProjekt } from '@/state/ProjektContext'
import { MotionReveal } from '@/components/shared/MotionReveal'
import { cn } from '@/lib/cn'

export function ViewA() {
  const { params } = useProjekt()
  const [active, setActive] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [openIds, setOpenIds] = useState<Set<string>>(() => new Set())

  const alle = useMemo(() => filterRegeln(params), [params])
  const viewAKategorien = useMemo(() => buildViewAStruktur(), [])

  // Pro Kategorie filtern + optionale Suche
  const daten = viewAKategorien.map((k) => {
    let regeln = regelnFuerViewAKategorie(alle, k.id)
    if (search.trim()) {
      const s = search.toLowerCase()
      regeln = regeln.filter(
        (r) =>
          r.headline.toLowerCase().includes(s) ||
          r.erklaerung.toLowerCase().includes(s) ||
          r.originalReferenz.toLowerCase().includes(s)
      )
    }
    return { kategorie: k, regeln }
  })

  const setOpen = useCallback((id: string, on: boolean) => {
    setOpenIds((prev) => {
      const next = new Set(prev)
      if (on) next.add(id)
      else next.delete(id)
      return next
    })
  }, [])

  const scrollTo = useCallback(
    (id: string) => {
      setActive(id)
      setOpen(id, true)
      // Nach dem State-Update (Layout fertig) scrollen — eine Frame
      // reicht, weil das Accordion erst dann seine Endhöhe hat.
      requestAnimationFrame(() => {
        const el = document.getElementById(`cat-${id}`)
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
      })
    },
    [setOpen],
  )

  return (
    <div className="grid grid-cols-12 gap-8">
      {/* Linke Navigation */}
      <aside className="hidden lg:block col-span-2">
        <div className="sticky top-0 space-y-1">
          <div className="text-xxs font-mono uppercase tracking-widest text-muted-soft mb-3 px-2">
            Kategorien
          </div>
          {viewAKategorien.map((k) => {
            const count = daten.find((d) => d.kategorie.id === k.id)?.regeln.length ?? 0
            return (
              <button
                key={k.id}
                onClick={() => scrollTo(k.id)}
                className={cn(
                  'w-full text-left px-2 py-1.5 rounded-md flex items-center gap-3 text-xs transition-colors',
                  active === k.id ? 'bg-paper-soft text-ink' : 'text-muted hover:text-ink hover:bg-paper-soft'
                )}
              >
                <span className="font-mono text-xxs w-4">{k.letter}</span>
                <span className="flex-1 truncate">{k.name}</span>
                {count > 0 && (
                  <span className="text-xxs text-muted-soft font-mono tabular-nums">
                    {count}
                  </span>
                )}
              </button>
            )
          })}
        </div>
      </aside>

      {/* Hauptinhalt */}
      <div className="col-span-12 lg:col-span-10">
        <MotionReveal>
          <div className="flex items-center gap-3 border-[0.5px] border-line rounded-card px-3 py-2 mb-6 max-w-md">
            <Search size={14} className="text-muted-soft" />
            <input
              type="text"
              placeholder="Regeln durchsuchen …"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 bg-transparent outline-none text-sm placeholder:text-muted-soft"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="text-xxs text-muted hover:text-ink"
              >
                zurücksetzen
              </button>
            )}
          </div>
        </MotionReveal>

        <MotionReveal delay={0.1}>
          <div className="bg-paper border-[0.5px] border-line rounded-card">
            {daten.map(({ kategorie, regeln }) =>
              regeln.length > 0 ? (
                <CategoryAccordion
                  key={kategorie.id}
                  kategorie={kategorie}
                  regeln={regeln}
                  open={openIds.has(kategorie.id)}
                  onToggle={(next) => setOpen(kategorie.id, next)}
                />
              ) : (
                <EmptyCategoryAccordion key={kategorie.id} kategorie={kategorie} />
              )
            )}
          </div>
        </MotionReveal>
      </div>
    </div>
  )
}

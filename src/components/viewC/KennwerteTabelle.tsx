// Flache 3-Spalten-Tabelle für die Kennwerte einer Antwort.
// Spalten: Label · Wert (mono, fett, tabular-nums) · Hinweis (klein, grau).
// Bekommt eine Liste aus den `kennzahl`-Blöcken der Antwort und rendert sie
// gruppiert. Der Provenance-Marker pro Zeile entfällt visuell — die
// referenzierten Regeln werden weiter unten in einer eigenen Sektion
// gesammelt aufgeführt.

import type { ChatBlockKennzahl } from '@/lib/llm/chatTypes'

interface KennwerteTabelleProps {
  items: ChatBlockKennzahl[]
}

export function KennwerteTabelle({ items }: KennwerteTabelleProps) {
  if (items.length === 0) return null

  return (
    <section className="flex flex-col gap-3">
      <div className="text-[10px] font-medium uppercase tracking-[0.14em] text-muted-soft">
        Kennwerte
      </div>
      <div className="overflow-hidden rounded-card border-[0.5px] border-line bg-paper">
        {items.map((it, i) => {
          const wert = it.einheit ? `${it.wert} ${it.einheit}` : it.wert
          return (
            <div
              key={`${it.label}-${i}`}
              className={`grid items-center gap-4 px-4 py-[11px] text-[12.5px] ${
                i > 0 ? 'border-t-[0.5px] border-line-soft' : ''
              }`}
              style={{
                gridTemplateColumns: 'minmax(0, 1.4fr) minmax(0, 1fr) minmax(0, 1.2fr)',
              }}
            >
              <div className="text-ink-soft">{it.label}</div>
              <div className="font-mono font-medium tabular-nums text-ink">
                {wert}
              </div>
              <div className="text-[11.5px] text-muted">{it.hinweis ?? ''}</div>
            </div>
          )
        })}
      </div>
    </section>
  )
}

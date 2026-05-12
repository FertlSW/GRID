// Aufgeklappter Detail-Block einer Regel.
// Stil 1:1 nach Mockup „Mutiger" (RuleCard, geöffneter Bereich):
//   • Erklärung als prominente weiße Card mit ink-Akzentbalken links und
//     einer „KI-gestützt"-Pille (Sparkles-Icon).
//   • Originalzitat als kleinere Box mit italic-Schrift.
//   • Quelle als Inline-Hinweis mit border-left.

import { Sparkles } from 'lucide-react'
import type { Regel } from '@/lib/types'

interface RuleDetailProps {
  regel: Regel
}

export function RuleDetail({ regel }: RuleDetailProps) {
  return (
    <div className="px-5 pb-5 pt-1.5">
      {regel.varianteHeadline && (
        <div className="mb-3 inline-block px-2.5 py-1 rounded-chip text-xxs bg-paper-muted text-ink font-mono">
          {regel.varianteHeadline}
        </div>
      )}

      {/* Erklärung-Card mit Akzentbalken */}
      <div className="relative mt-4 overflow-hidden rounded-card border-[0.5px] border-line bg-paper px-5 pb-[18px] pt-4">
        <div
          className="absolute inset-y-0 left-0 w-[3px] bg-ink"
          aria-hidden
        />
        <div className="mb-2.5 flex items-center gap-2">
          <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-ink">
            Erklärung
          </span>
          <span className="inline-flex items-center gap-1 rounded-chip border-[0.5px] border-line-soft bg-paper-muted px-2 py-[2px] text-[10px] font-medium tracking-[0.04em] text-muted">
            <Sparkles size={9} strokeWidth={2} />
            KI-gestützt
          </span>
        </div>
        <p className="m-0 text-[14.5px] leading-[1.7] tracking-[-0.003em] text-ink">
          <ErklaerungMitHervorhebungen text={regel.erklaerung} />
        </p>
      </div>

      {regel.hinweise && regel.hinweise.length > 0 && (
        <ul className="mt-5 list-disc pl-5 space-y-1 text-xs italic leading-relaxed text-muted">
          {regel.hinweise.map((h, i) => (
            <li key={i}>{h}</li>
          ))}
        </ul>
      )}

      {regel.querverweise && regel.querverweise.length > 0 && (
        <div className="mt-5 flex flex-wrap gap-1.5">
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

      {/* Originalzitat */}
      {regel.originalText && (
        <>
          <div className="mt-5 mb-2 text-[10px] font-medium uppercase tracking-[0.14em] text-muted">
            Originalzitat
          </div>
          <blockquote className="m-0 rounded-md border-[0.5px] border-line bg-paper px-3.5 py-3 text-[13px] italic leading-[1.6] text-ink">
            „{regel.originalText}"
          </blockquote>
        </>
      )}

      {/* Quelle (Fundstelle) */}
      {regel.originalReferenz && (
        <div className="mt-2.5 border-l-2 border-line-soft pl-3.5 text-[11px] leading-[1.5] text-muted">
          <span className="mr-1.5 text-[9px] font-medium uppercase tracking-[0.14em] text-muted-soft">
            Quelle
          </span>
          {regel.quelleKurz && (
            <span className="text-ink-soft">{regel.quelleKurz} · </span>
          )}
          {regel.originalReferenz}
        </div>
      )}
    </div>
  )
}

// Hebt Zahlen mit Einheiten und Schlüsselbegriffe (OIB-RL X, § XYZ, BK X) im
// Erklärungstext fetter hervor. Match-Regeln 1:1 aus dem Mockup.
function ErklaerungMitHervorhebungen({ text }: { text: string }) {
  const patterns = [
    /\d+(?:[.,]\d+)?\s*(?:m²K|kWh\/m²a|m²|m\b|cm|mm|kN|°C|kg|%|°|W\/m²K|Personen)/gi,
    /\b(?:OIB-RL\s*\d+|OIB-Richtlinie\s*\d+|§\s*\d+(?:\s*BO)?|BK\s*[IVX]+|Bauklasse\s*[IVX]+)/gi,
  ]
  const ranges: Array<[number, number]> = []
  for (const re of patterns) {
    let m: RegExpExecArray | null
    while ((m = re.exec(text)) !== null) {
      ranges.push([m.index, m.index + m[0].length])
    }
  }
  ranges.sort((a, b) => a[0] - b[0])

  const merged: Array<[number, number]> = []
  for (const [s, e] of ranges) {
    const last = merged[merged.length - 1]
    if (last && s <= last[1]) {
      last[1] = Math.max(last[1], e)
    } else {
      merged.push([s, e])
    }
  }
  if (merged.length === 0) return <span className="text-ink-soft">{text}</span>

  const out: JSX.Element[] = []
  let cursor = 0
  merged.forEach(([s, e], i) => {
    if (s > cursor) {
      out.push(
        <span key={`t${i}`} className="text-ink-soft">
          {text.slice(cursor, s)}
        </span>,
      )
    }
    out.push(
      <strong key={`b${i}`} className="font-semibold text-ink">
        {text.slice(s, e)}
      </strong>,
    )
    cursor = e
  })
  if (cursor < text.length) {
    out.push(
      <span key="tail" className="text-ink-soft">
        {text.slice(cursor)}
      </span>,
    )
  }
  return <>{out}</>
}

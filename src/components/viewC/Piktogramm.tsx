// Piktogramm-Card im Chat-Antwort-Layout.
// Drei vorgefertigte SVG-Schemata für die häufigsten Themen
// (Fluchtwege, Höhe, U-Wert). Bei unbekanntem oder fehlendem Topic → null.
// SVGs 1:1 aus dem Mockup übernommen (Mutiger.html → Piktogramm-Funktion).

import type { ChatTopic } from '@/lib/llm/chatTypes'

const INK = '#0A0A0A'
const MUTED = '#737373'
const ACCENT = '#1E40AF'
const PAPER_MUTED = '#F4F4F5'
const PAPER_SOFT = '#FAFAFA'
const FONT = 'Inter, -apple-system, sans-serif'

interface PiktogrammProps {
  topic: ChatTopic | undefined
}

export function Piktogramm({ topic }: PiktogrammProps) {
  const svg = renderSvg(topic)
  if (!svg) return null

  return (
    <div className="flex flex-col rounded-card border-[0.5px] border-line-soft bg-paper-soft px-4 py-3.5">
      <div className="mb-1 text-[10px] font-medium uppercase tracking-[0.14em] text-muted-soft">
        Schema
      </div>
      <div className="flex flex-1 items-center">{svg}</div>
    </div>
  )
}

function renderSvg(topic: ChatTopic | undefined): React.ReactNode {
  if (topic === 'fluchtwege') return <SvgFluchtwege />
  if (topic === 'hoehe') return <SvgHoehe />
  if (topic === 'uwert') return <SvgUWert />
  return null
}

// ──────────────────────────── Fluchtwege ────────────────────────────

function SvgFluchtwege() {
  const sw = 1.5
  return (
    <svg viewBox="0 0 240 140" width="100%" height={140} className="block">
      {/* Grundriss */}
      <rect x="20" y="20" width="200" height="100" fill="none" stroke={INK} strokeWidth={sw} />
      {/* Innenwände */}
      <line x1="100" y1="20" x2="100" y2="80" stroke={INK} strokeWidth={sw} />
      <line x1="100" y1="80" x2="220" y2="80" stroke={INK} strokeWidth={sw} />
      {/* Treppenhaus */}
      <rect x="40" y="35" width="40" height="30" fill="none" stroke={INK} strokeWidth={sw} />
      <line x1="40" y1="42" x2="80" y2="42" stroke={MUTED} strokeWidth={1} />
      <line x1="40" y1="49" x2="80" y2="49" stroke={MUTED} strokeWidth={1} />
      <line x1="40" y1="56" x2="80" y2="56" stroke={MUTED} strokeWidth={1} />
      <text x="60" y="76" fontSize="8" fill={MUTED} fontFamily={FONT} textAnchor="middle">
        TR-1
      </text>
      {/* Fluchtweg 1 — Pfeil zu Treppe */}
      <path d="M 160 50 L 90 50" fill="none" stroke={ACCENT} strokeWidth={sw + 0.5} strokeDasharray="4 3" />
      <path d="M 95 46 L 88 50 L 95 54" fill="none" stroke={ACCENT} strokeWidth={sw + 0.5} />
      <text x="160" y="44" fontSize="9" fill={ACCENT} fontFamily={FONT} fontWeight={600}>
        Fluchtweg 1
      </text>
      {/* Fluchtweg 2 — Pfeil zu Balkon */}
      <path d="M 160 100 L 215 100" fill="none" stroke={ACCENT} strokeWidth={sw + 0.5} strokeDasharray="4 3" />
      <path d="M 210 96 L 217 100 L 210 104" fill="none" stroke={ACCENT} strokeWidth={sw + 0.5} />
      <text x="160" y="115" fontSize="9" fill={ACCENT} fontFamily={FONT} fontWeight={600}>
        Fluchtweg 2
      </text>
      {/* Notbalkon */}
      <rect x="220" y="85" width="6" height="30" fill={ACCENT} opacity={0.15} stroke={ACCENT} strokeWidth={sw} />
      <text x="223" y="80" fontSize="7" fill={MUTED} fontFamily={FONT} textAnchor="middle">
        Balkon
      </text>
      {/* Personen-Marker */}
      <circle cx="170" cy="50" r="3" fill={INK} />
      <circle cx="170" cy="100" r="3" fill={INK} />
    </svg>
  )
}

// ──────────────────────────── Höhe ────────────────────────────

function SvgHoehe() {
  const sw = 1.5
  return (
    <svg viewBox="0 0 240 140" width="100%" height={140} className="block">
      {/* Boden */}
      <line x1="10" y1="125" x2="230" y2="125" stroke={INK} strokeWidth={sw} />
      {/* Nachbargebäude links */}
      <rect x="20" y="75" width="40" height="50" fill={PAPER_MUTED} stroke={INK} strokeWidth={sw} />
      <text x="40" y="68" fontSize="8" fill={MUTED} fontFamily={FONT} textAnchor="middle">
        Nachbar
      </text>
      {/* Projektgebäude */}
      <rect
        x="90"
        y="35"
        width="80"
        height="90"
        fill={ACCENT}
        fillOpacity={0.08}
        stroke={ACCENT}
        strokeWidth={sw + 0.3}
      />
      <text x="130" y="55" fontSize="9" fill={ACCENT} fontFamily={FONT} textAnchor="middle" fontWeight={600}>
        14,8 m
      </text>
      {/* Maxhöhe-Linie */}
      <line x1="80" y1="28" x2="180" y2="28" stroke={INK} strokeWidth={1} strokeDasharray="3 2" />
      <text x="178" y="25" fontSize="8" fill={INK} fontFamily={FONT} textAnchor="end">
        Max BK III · 16,0 m
      </text>
      {/* Höhenpfeil */}
      <line x1="78" y1="35" x2="78" y2="125" stroke={INK} strokeWidth={1} />
      <path d="M 75 38 L 78 33 L 81 38" fill="none" stroke={INK} strokeWidth={1} />
      <path d="M 75 122 L 78 127 L 81 122" fill="none" stroke={INK} strokeWidth={1} />
      {/* Abstand Bemaßung */}
      <line x1="60" y1="135" x2="90" y2="135" stroke={MUTED} strokeWidth={1} />
      <text x="75" y="139" fontSize="7" fill={MUTED} fontFamily={FONT} textAnchor="middle">
        8,88 m
      </text>
      {/* Nachbar rechts */}
      <rect x="200" y="90" width="25" height="35" fill={PAPER_MUTED} stroke={INK} strokeWidth={sw} />
    </svg>
  )
}

// ──────────────────────────── U-Wert ────────────────────────────

function SvgUWert() {
  const sw = 1.5
  return (
    <svg viewBox="0 0 240 140" width="100%" height={140} className="block">
      <g transform="translate(40, 20)">
        {/* Innen-Beschriftung */}
        <text x="-5" y="50" fontSize="8" fill={MUTED} fontFamily={FONT} textAnchor="end">
          +20°C
        </text>
        <text x="-5" y="62" fontSize="7" fill={MUTED} fontFamily={FONT} textAnchor="end">
          innen
        </text>
        {/* Stahlbeton 25cm */}
        <rect x="0" y="20" width="40" height="80" fill={PAPER_MUTED} stroke={INK} strokeWidth={sw} />
        <text x="20" y="115" fontSize="8" fill={INK} fontFamily={FONT} textAnchor="middle">
          25 cm
        </text>
        <text x="20" y="125" fontSize="7" fill={MUTED} fontFamily={FONT} textAnchor="middle">
          STB
        </text>
        {/* EPS 18cm */}
        <rect
          x="40"
          y="20"
          width="32"
          height="80"
          fill={ACCENT}
          fillOpacity={0.12}
          stroke={ACCENT}
          strokeWidth={sw}
        />
        <text x="56" y="115" fontSize="8" fill={ACCENT} fontFamily={FONT} textAnchor="middle" fontWeight={600}>
          18 cm
        </text>
        <text x="56" y="125" fontSize="7" fill={MUTED} fontFamily={FONT} textAnchor="middle">
          EPS-F
        </text>
        {/* Putz 1,5cm */}
        <rect x="72" y="20" width="6" height="80" fill={PAPER_SOFT} stroke={INK} strokeWidth={sw} />
        <text x="75" y="115" fontSize="7" fill={MUTED} fontFamily={FONT} textAnchor="middle">
          1,5
        </text>
        {/* Außen-Beschriftung */}
        <text x="85" y="50" fontSize="8" fill={MUTED} fontFamily={FONT}>
          −10°C
        </text>
        <text x="85" y="62" fontSize="7" fill={MUTED} fontFamily={FONT}>
          außen
        </text>
        {/* U-Wert Box */}
        <rect x="100" y="35" width="80" height="40" fill="none" stroke={INK} strokeWidth={sw} rx="4" />
        <text x="140" y="50" fontSize="8" fill={MUTED} fontFamily={FONT} textAnchor="middle">
          U-Wert
        </text>
        <text x="140" y="65" fontSize="13" fill={ACCENT} fontFamily={FONT} textAnchor="middle" fontWeight={600}>
          0,19 W/m²K
        </text>
        {/* Pfeil zur Box */}
        <path d="M 80 60 L 98 55" fill="none" stroke={MUTED} strokeWidth={1} />
        <path d="M 96 53 L 100 55 L 96 57" fill="none" stroke={MUTED} strokeWidth={1} />
      </g>
    </svg>
  )
}

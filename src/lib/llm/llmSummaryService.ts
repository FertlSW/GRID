// Service-Funktion, die eine Kategorie (Regel-Liste + Projekt-Params) an OpenAI
// schickt und eine strukturierte Zusammenfassung zurückbekommt.
//
// Bewusst per nativem fetch — kein OpenAI-SDK, um das Browser-Bundle klein zu
// halten und Node-Polyfills zu vermeiden.

import type { ProjektParameter, Regel } from '@/lib/types'
import { SYSTEM_PROMPT } from '@/lib/llm/systemPrompt'
import type { LLMSummary } from '@/lib/llm/types'

const OPENAI_URL = 'https://api.openai.com/v1/chat/completions'
const MODEL = 'gpt-4o-mini'

interface ServiceOptions {
  signal?: AbortSignal
}

export async function erstelleLLMZusammenfassung(
  kategorieId: string,
  regeln: Regel[],
  params: ProjektParameter,
  opts: ServiceOptions = {},
): Promise<LLMSummary> {
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY
  if (!apiKey) {
    throw new Error(
      'Kein OpenAI-API-Key gefunden. Bitte VITE_OPENAI_API_KEY in der .env eintragen.',
    )
  }

  const userMessage = buildUserMessage(kategorieId, regeln, params)

  // Dev-Log: zeigt in der Browser-Konsole, was an OpenAI geschickt wird.
  // Läuft nur im Dev-Modus, nicht im Produktions-Build.
  if (import.meta.env.DEV) {
    console.groupCollapsed(`[LLM →] ${kategorieId} (${regeln.length} Regeln)`)
    console.log('User message:', userMessage)
    console.groupEnd()
  }

  const response = await fetch(OPENAI_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    signal: opts.signal,
    body: JSON.stringify({
      model: MODEL,
      temperature: 0.2,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: userMessage },
      ],
    }),
  })

  if (!response.ok) {
    const text = await response.text().catch(() => '')
    throw new Error(`OpenAI-Fehler (${response.status}): ${text.slice(0, 300)}`)
  }

  const data = (await response.json()) as {
    choices?: Array<{ message?: { content?: string } }>
  }
  const content = data.choices?.[0]?.message?.content
  if (!content) {
    throw new Error('OpenAI-Antwort enthielt keinen Inhalt.')
  }

  let parsed: unknown
  try {
    parsed = JSON.parse(content)
  } catch {
    throw new Error('OpenAI-Antwort war kein gültiges JSON.')
  }

  const validated = validateSummary(parsed)

  if (import.meta.env.DEV) {
    console.groupCollapsed(
      `[LLM ←] ${kategorieId} — ${validated.bloecke.length} Blöcke, ${validated.kennzahlen.length} Kennzahlen`,
    )
    console.log('Validated:', validated)
    console.groupEnd()
  }

  return validated
}

// Baut die User-Message auf. Ziel: schlank, lesbar, und in den Feldnamen
// konsistent mit dem Systemprompt.
function buildUserMessage(
  kategorieId: string,
  regeln: Regel[],
  params: ProjektParameter,
): string {
  const regelnKompakt = regeln.map((r) => ({
    id: r.id,
    fundstelle: r.originalReferenz,
    headline: r.headline,
    varianteHeadline: r.varianteHeadline,
    erklaerung: r.erklaerung,
    hinweise: r.hinweise,
  }))

  return [
    `Kategorie: ${kategorieLabel(kategorieId)}`,
    '',
    'Projekt-Parameter:',
    formatParams(params),
    '',
    `Rechtssätze (${regeln.length}):`,
    JSON.stringify(regelnKompakt, null, 2),
  ].join('\n')
}

// Übersetzt Engine-Parameter-Keys in menschenlesbare Labels.
// So sieht das Modell "Bauklasse IV" statt "BK_IV" und kann entsprechend
// formulieren. Erweitern, wenn neue Parameter dazukommen.
function formatParams(p: ProjektParameter): string {
  const lines: string[] = []

  if (p.hauptnutzung) lines.push(`  - Hauptnutzung: ${p.hauptnutzung}`)
  if (p.widmung) lines.push(`  - Widmung: ${p.widmung.replace(/_/g, ' ')}`)
  if (p.bauklasse) lines.push(`  - Bauklasse: ${p.bauklasse.replace('BK_', '')}`)
  if (p.gebaeudeklasse) {
    const gk = String(p.gebaeudeklasse).replace(/^GK_?/, '')
    lines.push(`  - Gebäudeklasse: ${gk}`)
  }
  if (p.bauweise) lines.push(`  - Bauweise: ${p.bauweise.replace(/_/g, ' ')}`)
  if (p.oberirdischeGeschosse != null) {
    lines.push(`  - Oberirdische Geschosse: ${p.oberirdischeGeschosse}`)
  }
  if (p.unterirdischeGeschosse != null) {
    lines.push(`  - Unterirdische Geschosse: ${p.unterirdischeGeschosse}`)
  }
  if (p.fluchtniveau) lines.push(`  - Fluchtniveau: ${decodeRange(p.fluchtniveau, 'm')}`)
  if (p.grenzabstand) lines.push(`  - Grenzabstand: ${decodeRange(p.grenzabstand, 'm')}`)
  if (p.bauplatz_an_fluchtlinie) {
    lines.push(`  - Bauplatz an Fluchtlinie: ${jaNein(p.bauplatz_an_fluchtlinie)}`)
  }
  if (p.in_schutzzone) lines.push(`  - In Schutzzone: ${jaNein(p.in_schutzzone)}`)
  if (p.bebauungsplan_abweichend) {
    lines.push(`  - Bebauungsplan abweichend: ${jaNein(p.bebauungsplan_abweichend)}`)
  }
  if (p.bauart) lines.push(`  - Bauart: ${p.bauart}`)

  return lines.join('\n')
}

// Wandelt Engine-Kodes wie "u22" / "ab4" in lesbare Form um.
// Fällt auf den Rohwert zurück, wenn das Muster nicht passt.
function decodeRange(value: string, unit: string): string {
  const m = /^([uoa]b?)(\d+(?:[.,]\d+)?)$/.exec(value)
  if (!m) return value
  const [, prefix, num] = m
  switch (prefix) {
    case 'u':
      return `unter ${num} ${unit}`
    case 'o':
    case 'ab':
      return `ab ${num} ${unit}`
    default:
      return value
  }
}

function jaNein(value: string): string {
  return value === 'ja' ? 'Ja' : value === 'nein' ? 'Nein' : value
}

// Lesbares Label für die Kategorie-ID. Wenn nicht gemappt, fällt auf die ID
// zurück — das Modell versteht's trotzdem.
function kategorieLabel(id: string): string {
  const map: Record<string, string> = {
    staedtebau: 'Städtebau / Grundstück',
    staedtebau_grundstueck: 'Städtebau / Grundstück',
    baukoerper: 'Baukörper',
    gebaeudehuelle_energie: 'Gebäudehülle & Energie',
    geschoss: 'Geschoss / Grundriss',
    erschliessung: 'Erschließung & vertikale Struktur',
    bauteile_konstruktion: 'Bauteile & Konstruktion',
    innenraeume: 'Innenräume',
    haustechnik: 'Haustechnik',
    verfahren: 'Verfahren & Ausführung',
  }
  return map[id] ?? id
}

function validateSummary(raw: unknown): LLMSummary {
  if (!raw || typeof raw !== 'object') {
    throw new Error('OpenAI-Antwort hat ungültige Struktur.')
  }
  const obj = raw as Record<string, unknown>
  const bloecke = Array.isArray(obj.bloecke) ? obj.bloecke : []
  const kennzahlen = Array.isArray(obj.kennzahlen) ? obj.kennzahlen : []

  return {
    bloecke: bloecke
      .filter((b): b is Record<string, unknown> => !!b && typeof b === 'object')
      .map((b) => ({
        titel: String(b.titel ?? ''),
        zusammenfassung: String(b.zusammenfassung ?? ''),
        regelIds: Array.isArray(b.regelIds) ? b.regelIds.map(String) : [],
      }))
      .filter((b) => b.titel && b.zusammenfassung),
    kennzahlen: kennzahlen
      .filter((k): k is Record<string, unknown> => !!k && typeof k === 'object')
      .map((k) => ({
        label: String(k.label ?? ''),
        wert: String(k.wert ?? ''),
        kontext: k.kontext ? String(k.kontext) : undefined,
        regelId: k.regelId ? String(k.regelId) : undefined,
      }))
      .filter((k) => k.label && k.wert),
  }
}

// Streaming-Service für den Chat-View.
// Schickt Projekt-Parameter, gefilterte Regeln, Konversations-Verlauf und die
// aktuelle Frage an OpenAI und liefert per AsyncIterable inkrementelle
// Updates: jeder fertige `ChatBlock` wird sofort emittiert, und sobald eine
// `rueckfrage` vorliegt, ebenfalls.

import type { ProjektParameter, Regel } from '@/lib/types'
import { CHAT_SYSTEM_PROMPT } from '@/lib/llm/chatPrompt'
import { ChatStreamParser } from '@/lib/llm/streamParser'
import type {
  ChatBlock,
  ChatNachricht,
  ChatTopic,
} from '@/lib/llm/chatTypes'

const OPENAI_URL = 'https://api.openai.com/v1/chat/completions'
// gpt-4.1-mini: schneller als gpt-4o-mini bei Time-to-First-Token und folgt
// Strukturierungs-Anweisungen disziplinierter — beides relevant für den Chat.
const MODEL = 'gpt-4.1-mini'

export interface ChatStreamEvent {
  typ: 'block' | 'rueckfrage' | 'topic' | 'projektBezug' | 'fertig'
  block?: ChatBlock
  rueckfrage?: string
  topic?: ChatTopic
  projektBezug?: string
}

export interface ChatStreamOptions {
  signal?: AbortSignal
}

/**
 * Schickt eine Chat-Anfrage und gibt einen AsyncIterable zurück, der
 * Block für Block beim Empfang emittiert.
 */
export async function* streameChatAntwort(
  frage: string,
  verlauf: ChatNachricht[],
  regeln: Regel[],
  params: ProjektParameter,
  opts: ChatStreamOptions = {},
): AsyncGenerator<ChatStreamEvent> {
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY
  if (!apiKey) {
    throw new Error(
      'Kein OpenAI-API-Key gefunden. Bitte VITE_OPENAI_API_KEY in der .env eintragen.',
    )
  }

  const messages = baueMessages(frage, verlauf, regeln, params)

  if (import.meta.env.DEV) {
    console.groupCollapsed(`[Chat →] "${frage.slice(0, 60)}…"`)
    console.log('Messages:', messages)
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
      temperature: 0.3,
      stream: true,
      response_format: { type: 'json_object' },
      messages,
    }),
  })

  if (!response.ok) {
    const text = await response.text().catch(() => '')
    throw new Error(`OpenAI-Fehler (${response.status}): ${text.slice(0, 300)}`)
  }
  if (!response.body) {
    throw new Error('OpenAI-Antwort hat keinen Stream-Body.')
  }

  const reader = response.body.getReader()
  const decoder = new TextDecoder('utf-8')
  const parser = new ChatStreamParser()
  let sseRest = ''

  try {
    // eslint-disable-next-line no-constant-condition
    while (true) {
      const { value, done } = await reader.read()
      if (done) break
      sseRest += decoder.decode(value, { stream: true })

      const lines = sseRest.split('\n')
      sseRest = lines.pop() ?? '' // letzte (ggf. unvollständige) Zeile zurückhalten

      for (const raw of lines) {
        const line = raw.trim()
        if (!line.startsWith('data:')) continue
        const payload = line.slice(5).trim()
        if (payload === '[DONE]') continue
        let json: { choices?: Array<{ delta?: { content?: string } }> }
        try {
          json = JSON.parse(payload)
        } catch {
          continue
        }
        const delta = json.choices?.[0]?.delta?.content
        if (!delta) continue

        const out = parser.feed(delta)
        for (const block of out.neueBloecke) {
          yield { typ: 'block', block }
        }
        if (out.rueckfrage) {
          yield { typ: 'rueckfrage', rueckfrage: out.rueckfrage }
        }
        if (out.topic) {
          yield { typ: 'topic', topic: out.topic }
        }
        if (out.projektBezug) {
          yield { typ: 'projektBezug', projektBezug: out.projektBezug }
        }
      }
    }
  } finally {
    reader.releaseLock()
  }

  // Stream zu Ende — letzten Buffer-Rest leeren (z.B. wenn das letzte Block
  // erst mit dem allerletzten Chunk vollständig wurde).
  const finalOut = parser.done()
  for (const block of finalOut.neueBloecke) {
    yield { typ: 'block', block }
  }
  if (finalOut.rueckfrage) {
    yield { typ: 'rueckfrage', rueckfrage: finalOut.rueckfrage }
  }
  if (finalOut.topic) {
    yield { typ: 'topic', topic: finalOut.topic }
  }
  if (finalOut.projektBezug) {
    yield { typ: 'projektBezug', projektBezug: finalOut.projektBezug }
  }
  yield { typ: 'fertig' }
}

// ──────────────────────────── Message-Bau ────────────────────────────

function baueMessages(
  frage: string,
  verlauf: ChatNachricht[],
  regeln: Regel[],
  params: ProjektParameter,
): Array<{ role: 'system' | 'user' | 'assistant'; content: string }> {
  // Verlauf auf max. 10 letzte Turns kürzen (Token-Schutz).
  const kurz = verlauf.slice(-10)

  const messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [
    { role: 'system', content: CHAT_SYSTEM_PROMPT },
  ]

  // Bisherigen Verlauf einspielen (falls vorhanden).
  for (const m of kurz) {
    if (m.rolle === 'user' && m.text) {
      messages.push({ role: 'user', content: m.text })
    } else if (m.rolle === 'assistant') {
      // Assistant-Verlauf als JSON zurückspielen, damit das Modell das
      // eigene Format wiedererkennt.
      const payload = m.antwort ?? { bloecke: [] }
      messages.push({ role: 'assistant', content: JSON.stringify(payload) })
    }
  }

  // Aktuelle Frage + Projekt-Kontext.
  const userMsg = baueUserMessage(frage, regeln, params)
  messages.push({ role: 'user', content: userMsg })

  return messages
}

function baueUserMessage(
  frage: string,
  regeln: Regel[],
  params: ProjektParameter,
): string {
  const regelnKompakt = regeln.map((r) => ({
    id: r.id,
    fundstelle: r.originalReferenz,
    headline: r.headline,
    varianteHeadline: r.varianteHeadline,
    erklaerung: r.erklaerung,
    originaltext: r.originalText,
    hinweise: r.hinweise,
  }))

  return [
    'Aktuelle Frage:',
    frage,
    '',
    'Projekt-Parameter:',
    formatParams(params),
    '',
    `Vorgefilterte Rechtssätze für genau dieses Projekt (${regeln.length}):`,
    JSON.stringify(regelnKompakt, null, 2),
  ].join('\n')
}

function formatParams(p: ProjektParameter): string {
  const lines: string[] = []
  if (p.hauptnutzung) lines.push(`  - Hauptnutzung: ${p.hauptnutzung}`)
  if (p.widmung) lines.push(`  - Widmung: ${p.widmung.replace(/_/g, ' ')}`)
  if (p.bauklasse) lines.push(`  - Bauklasse: ${p.bauklasse.replace('BK_', '')}`)
  if (p.gebaeudeklasse) {
    lines.push(`  - Gebäudeklasse: ${String(p.gebaeudeklasse).replace(/^GK_?/, '')}`)
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

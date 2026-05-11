// Typen für den LLM-Chat in View C.
// Bewusst getrennt von `llm/types.ts` (das ist die Summary-API für View B).

// ──────────────────────────── Provenance ────────────────────────────
// Jeder Block trägt einen Marker, woher seine Aussage stammt.
// - 'datenbasis': aus den im Prompt mitgeschickten Rechtssätzen abgeleitet.
//                  `regelIds` referenzieren mind. 1 Rechtssatz aus dem Kontext.
// - 'modell':     allgemeines Hintergrundwissen vom Sprachmodell.
//                  `begruendung` erklärt, warum diese Information ergänzt wurde.
// - 'web':        Phase 2 — externe Recherche via Tool-Calling.

export type Provenance =
  | { quelle: 'datenbasis'; regelIds: string[] }
  | { quelle: 'modell'; begruendung: string }
  | { quelle: 'web'; urls: string[] }

// ──────────────────────────── Block-Typen ────────────────────────────
// Ein Antwort-Block ist die kleinste atomare Aussage. Mehrere Blöcke
// ergeben zusammen die Antwort des Assistants.

export interface ChatBlockUeberschrift {
  typ: 'ueberschrift'
  text: string
  // 'haupt' = vor einer Sektion (etwas größer), 'unter' = innerhalb (mono-uppercase).
  ebene: 'haupt' | 'unter'
  // Keine Provenance — Headlines sind reine Gliederung.
}

export interface ChatBlockProsa {
  typ: 'prosa'
  // Markdown erlaubt für Inline-Formatierung (fett, kursiv, Inline-Code).
  // Tabellen NICHT hier — dafür gibt es den 'tabelle'-Typ.
  markdown: string
  provenance: Provenance
}

export interface ChatBlockTabelle {
  typ: 'tabelle'
  spalten: string[]
  zeilen: string[][]
  provenance: Provenance
}

export interface ChatBlockListe {
  typ: 'liste'
  geordnet: boolean
  punkte: string[]
  provenance: Provenance
}

export interface ChatBlockKennzahl {
  typ: 'kennzahl'
  label: string
  wert: string
  einheit?: string
  provenance: Provenance
}

export interface ChatBlockHinweis {
  typ: 'hinweis'
  text: string
  ton: 'info' | 'warnung'
  // Hinweise sind redaktionelle Anmerkungen, deshalb ohne Provenance.
}

export type ChatBlock =
  | ChatBlockUeberschrift
  | ChatBlockProsa
  | ChatBlockTabelle
  | ChatBlockListe
  | ChatBlockKennzahl
  | ChatBlockHinweis

// ──────────────────────────── Antwort + Nachricht ────────────────────────────

export interface ChatAntwort {
  bloecke: ChatBlock[]
  // Wenn gesetzt: Modell will erst eine Klärung, bevor es antwortet.
  // In dem Fall sind `bloecke` typischerweise leer oder sehr kurz.
  rueckfrage?: string
}

export interface ChatNachricht {
  id: string
  rolle: 'user' | 'assistant'
  // Bei user-Nachrichten: nur `text`. Bei assistant-Nachrichten: `antwort`.
  text?: string
  antwort?: ChatAntwort
  // Während des Streamings true; sobald fertig false.
  streaming?: boolean
  // Bei Fehlern: Fehlermeldung, die in der Bubble angezeigt wird.
  fehler?: string
}

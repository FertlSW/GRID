// Typen für die LLM-basierte Kategorie-Zusammenfassung in View B.
// Werden vom Service, Hook und den UI-Komponenten gemeinsam verwendet.

export interface LLMBlock {
  titel: string
  zusammenfassung: string
  regelIds: string[]
}

export interface LLMKennzahl {
  label: string
  wert: string
  kontext?: string
  regelId?: string
}

export interface LLMSummary {
  bloecke: LLMBlock[]
  kennzahlen: LLMKennzahl[]
}

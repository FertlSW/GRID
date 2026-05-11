// Simulierte Chat-Szenarien für View C.
// Jedes Szenario: Keywords, Beispielfrage, Prosa-Antwort und IDs der relevanten
// Rechtssätze.
//
// TODO: Neue Szenarien für BO Wien Teil I (Stadtplanung, §§ 1–8) erstellen.
// Die alten Szenarien (§§ 75–86 aus Teil 8) wurden entfernt, weil sich die
// zugrundeliegende Datenquelle geändert hat. Solange dieses Array leer ist,
// zeigt View C nur die Eingabe ohne kuratierte Beispielfragen.

export interface ChatScenario {
  id: string
  keywords: string[]
  frageBeispiel: string
  antwort: string
  regelIds: string[]
  verweisThema?: string
}

export const chatScenarios: ChatScenario[] = []

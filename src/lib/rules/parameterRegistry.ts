// Einzige Wahrheit über alle Parameter, die in JSON-Bedingungen auftauchen dürfen.
// Jede Änderung hier zwingt dazu, auch Wizard-Frage / ProjektParameter-Typ
// mitzuziehen — und umgekehrt.

import type { ProjektParameter } from '@/lib/types'

export interface ParameterEintrag {
  /** Name wie er im JSON in `bedingungen[].parameter` steht. */
  jsonName: string
  /** Entsprechender Schlüssel in ProjektParameter (ggf. Alias). */
  projektKey: keyof ProjektParameter
  /** Wizard-Frage-ID, die diesen Parameter erfasst. */
  wizardId: keyof ProjektParameter
  /** Erlaubte Werte (optional, für Validierung). */
  werte?: Array<string | number>
  /** Hinweis für Doku. */
  beschreibung: string
}

export const parameterRegistry: ParameterEintrag[] = [
  {
    jsonName: 'widmung',
    projektKey: 'widmung',
    wizardId: 'widmung',
    werte: [
      'wohngebiet',
      'gemischtes_baugebiet',
      'geschaeftsviertel',
      'betriebsbaugebiet',
      'industriegebiet',
      'gartensiedlungsgebiet',
      'erholungsgebiet',
      'laendliches_gebiet',
      'sondergebiet',
    ],
    beschreibung: 'Flächenwidmung nach Bebauungsplan',
  },
  {
    jsonName: 'bauklasse',
    projektKey: 'bauklasse',
    wizardId: 'bauklasse',
    werte: ['BK_I', 'BK_II', 'BK_III', 'BK_IV', 'BK_V', 'BK_VI', 'keine'],
    beschreibung: 'Bauklasse nach BO Wien',
  },
  {
    jsonName: 'bauweise',
    projektKey: 'bauweise',
    wizardId: 'bauweise',
    werte: [
      'offen',
      'gekuppelt',
      'offen_oder_gekuppelt',
      'gruppe',
      'geschlossen',
      'nicht_festgesetzt',
    ],
    beschreibung: 'Bauweise laut Bebauungsplan',
  },
  {
    jsonName: 'bauplatz_an_fluchtlinie',
    projektKey: 'bauplatz_an_fluchtlinie',
    wizardId: 'bauplatz_an_fluchtlinie',
    werte: ['ja', 'nein', 'teilweise'],
    beschreibung: 'Liegt der Bauplatz an einer Fluchtlinie?',
  },
  {
    jsonName: 'in_schutzzone',
    projektKey: 'in_schutzzone',
    wizardId: 'in_schutzzone',
    werte: ['ja', 'nein'],
    beschreibung: 'Liegt der Bauplatz in einer Schutzzone?',
  },
  {
    jsonName: 'bebauungsplan_abweichend',
    projektKey: 'bebauungsplan_abweichend',
    wizardId: 'bebauungsplan_abweichend',
    werte: ['ja', 'nein', 'unbekannt'],
    beschreibung: 'Sieht der Bebauungsplan Abweichungen vor?',
  },
  {
    jsonName: 'neubau_oder_bestand',
    projektKey: 'bauart',
    wizardId: 'bauart',
    werte: ['neubau', 'bestand'],
    beschreibung: 'Neubau oder Bestand (Wizard-Feld: bauart)',
  },
  {
    jsonName: 'hauptnutzung',
    projektKey: 'hauptnutzung',
    wizardId: 'hauptnutzung',
    beschreibung: 'Hauptnutzung des Gebäudes',
  },
  {
    jsonName: 'gebaeudeklasse',
    projektKey: 'gebaeudeklasse',
    wizardId: 'gebaeudeklasse',
    // App-interne Schreibweise. JSON-Werte `GK_1`…`GK_5` werden in mapping.ts
    // (wertAlias) auf `GK1`…`GK5` normalisiert.
    werte: ['GK1', 'GK2', 'GK3', 'GK4', 'GK5'],
    beschreibung: 'Gebäudeklasse nach OIB',
  },
  {
    jsonName: 'fluchtniveau',
    projektKey: 'fluchtniveau',
    wizardId: 'fluchtniveau',
    werte: ['u22', 'u32', 'u90', 'o90'],
    beschreibung: 'Höhe des höchsten Fluchtniveaus',
  },
  {
    jsonName: 'grenzabstand',
    projektKey: 'grenzabstand',
    wizardId: 'grenzabstand',
    werte: ['u2', 'u4', 'o4'],
    beschreibung: 'Kleinster Abstand zur Nachbargrenze',
  },
  {
    jsonName: 'oberirdische_geschosse',
    projektKey: 'oberirdischeGeschosse',
    wizardId: 'oberirdischeGeschosse',
    beschreibung: 'Anzahl oberirdischer Geschosse (JSON: snake_case)',
  },
]

export function istBekannterParameter(jsonName: string): boolean {
  return parameterRegistry.some((p) => p.jsonName === jsonName)
}

export function findeParameter(jsonName: string): ParameterEintrag | undefined {
  return parameterRegistry.find((p) => p.jsonName === jsonName)
}

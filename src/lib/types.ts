// TypeScript-Typen für Grid.legal
// Diese Datei definiert die Datenstrukturen für das gesamte Projekt.

/** Mögliche Hauptnutzungen eines Gebäudes */
export type Hauptnutzung =
  | 'wohnen'
  | 'buero'
  | 'beherbergung'
  | 'altersheim'
  | 'verkauf'
  | 'versammlung'
  | 'bildung'
  | 'betriebsbau'
  | 'garage'
  | 'gewerbe'
  | 'kultur'
  | 'sport'
  | 'gesundheit'
  | 'sonstige'

/** Gebäudeklassen nach OIB */
export type Gebaeudeklasse = 'GK1' | 'GK2' | 'GK3' | 'GK4' | 'GK5'

/** Fluchtniveau-Kategorien */
export type Fluchtniveau = 'u22' | 'u32' | 'u90' | 'o90'

/** Grenzabstand */
export type Grenzabstand = 'u2' | 'u4' | 'o4'

/** Bauart */
export type Bauart = 'neubau' | 'bestand'

/** Unterirdische Geschosse */
export type UGAnzahl = 'nein' | '1' | '2' | 'o2'

/** Bauklasse nach BO Wien */
export type Bauklasse =
  | 'BK_I'
  | 'BK_II'
  | 'BK_III'
  | 'BK_IV'
  | 'BK_V'
  | 'BK_VI'
  | 'keine'

/** Widmungsart nach BO Wien */
export type Widmung =
  | 'wohngebiet'
  | 'gemischtes_baugebiet'
  | 'geschaeftsviertel'
  | 'betriebsbaugebiet'
  | 'industriegebiet'
  | 'gartensiedlungsgebiet'
  | 'erholungsgebiet'
  | 'laendliches_gebiet'
  | 'sondergebiet'

/** Bauweise nach Bebauungsplan */
export type Bauweise =
  | 'offen'
  | 'gekuppelt'
  | 'offen_oder_gekuppelt'
  | 'gruppe'
  | 'geschlossen'
  | 'nicht_festgesetzt'

export type JaNein = 'ja' | 'nein'
export type JaNeinUnbekannt = 'ja' | 'nein' | 'unbekannt'
export type JaNeinTeilweise = 'ja' | 'nein' | 'teilweise'

/** Projekt-Parameter aus dem Wizard */
export interface ProjektParameter {
  hauptnutzung?: Hauptnutzung
  widmung?: Widmung
  bauklasse?: Bauklasse
  gebaeudeklasse?: Gebaeudeklasse
  bauweise?: Bauweise
  oberirdischeGeschosse?: number
  unterirdischeGeschosse?: UGAnzahl
  fluchtniveau?: Fluchtniveau
  grenzabstand?: Grenzabstand
  bauplatz_an_fluchtlinie?: JaNeinTeilweise
  in_schutzzone?: JaNein
  bebauungsplan_abweichend?: JaNeinUnbekannt
  bauart?: Bauart
  // Bedingte Folgefragen
  anzahlBetten?: 'u30' | '31-100' | 'o100'
  anzahlBewohner?: 'u30' | '31-60' | 'o60'
  verkaufsflaeche?: 'u600' | '601-3000' | 'o3000'
  versammlungsflaeche?: 'u600' | '601-1600' | 'o1600'
  sicherheitskategorie?: 'K1' | 'K2' | 'K3' | 'K4.1' | 'K4.2'
}

/** Zustand einer Regel — steuert Badge-Farbe */
export type RegelStatus =
  | 'erforderlich'
  | 'eingeschraenkt'
  | 'abhaengig'
  | 'pruefen'
  | 'ok'
  | 'nicht_erforderlich'

/** Planungsphase nach Architekten-Workflow */
export type Phase = 'vorentwurf' | 'entwurf' | 'genehmigung' | 'ausfuehrung'

/** Kategorie in View A (juristisch, A–I) */
export interface ViewAKategorie {
  id: string // z.B. 'B'
  letter: string // z.B. 'B'
  name: string // z.B. 'Brandschutz'
  kurzbeschreibung: string
  unterkategorien: ViewAUnterkategorie[]
}

export interface ViewAUnterkategorie {
  id: string // z.B. 'B.05'
  name: string // z.B. 'Fluchtwege & Rettungswege'
}

/** Kategorie in View B (räumlich, 01–07) */
export interface ViewBKategorie {
  id: string // z.B. 'staedtebau'
  nummer: string // z.B. '01'
  name: string // z.B. 'Städtebau & Grundstück'
  untertitel: string
}

/** Eine konkrete Vorschrift (Platzhalter oder echt) */
export interface Regel {
  id: string
  headline: string // z.B. 'Der Fluchtweg darf maximal 40 m betragen'
  status: RegelStatus
  erklaerung: string // architekten-freundliche Erklärung (2–4 Sätze)
  originalReferenz: string // z.B. 'OIB-RL 2, Pkt. 5.1.1 b)'
  originalText: string // Originalzitat
  viewAKategorie: string // z.B. 'B'
  viewAUnterkategorie?: string // Slug aus `thema` (z.B. 'brandverhalten-fassade-wdvs'), gruppiert View A
  thema?: string // Roh-Slug aus der Quelle, identisch mit viewAUnterkategorie
  viewBKategorie: string // z.B. 'erschliessung'
  phase: Phase // ab welcher Phase sichtbar
  bauteile?: string[] // z.B. ['treppenhaus', 'aussenwand']
  // Optional: kompakter Kennzahl-Wert für View B Metric-Cards
  kennzahl?: {
    label: string
    wert: string
    anmerkung?: string
  }
  /**
   * Ist true, wenn die Regel in der "Nicht erforderlich"-Leiste
   * aufgeführt werden soll (View B). Z.B. "Feuerwehraufzug — erst ab 22m".
   */
  nichtErforderlichHinweis?: string
  // User-facing Hinweise aus der Gesetzesaufbereitung
  hinweise?: string[]
  // Querverweise auf andere Paragraphen oder Gesetze
  querverweise?: Array<{
    ref_id: string
    ref_fundstelle: string
    beschreibung: string
  }>
  // Wenn eine Variante (z.B. nach Bauklasse) aufgelöst wurde
  varianteHeadline?: string
  // Quelle (Gesetzestext), aus dem diese Regel stammt
  quelleId?: string
  quelleKurz?: string
}

/** Eine Wizard-Frage */
export interface WizardFrage {
  id: keyof ProjektParameter
  text: string
  hint?: string
  type: 'card-grid' | 'stepper' | 'binary'
  // Nur für card-grid / binary:
  optionen?: Array<{
    value: string
    label: string
    description?: string
  }>
  // Folgefrage erscheint nur, wenn Bedingung erfüllt
  condition?: (p: ProjektParameter) => boolean
}

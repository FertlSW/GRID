# Schema v0.2 — Mit Bedingungen, Varianten und Anforderungen

**Änderung gegenüber v0.1**: Die Felder `bedingungen`, `varianten`, `anforderung` sind jetzt vollständig dokumentiert und werden befüllt.

## Die Gesamtstruktur einer Karteikarte

Eine Karteikarte hat zwei große Bereiche:

**Bereich 1: Metadaten & Text** — unverändert zu v0.1 (id, quelle, paragraph, originaltext, headline, erklaerung, hauptkategorie, etc.)

**Bereich 2: Filter-Logik** — das Neue:
- `bedingungen` — Wann ist diese Vorschrift **überhaupt relevant**?
- `varianten` — Welche **unterschiedlichen Werte** gibt es je nach Bedingung?
- `anforderung` — Was ist der **konkrete Zahlenwert / Schwellenwert**?

---

## Feld: `bedingungen`

**Zweck**: Filtert die gesamte Karteikarte. Wenn Bedingungen nicht erfüllt sind, wird die Karteikarte dem Architekten **gar nicht erst gezeigt**.

**Format**: Eine Liste von Bedingungs-Objekten. Alle Bedingungen in der Liste sind mit UND verknüpft.

### Einfache Form (immer gültig)

```json
"bedingungen": [
  { "typ": "immer" }
]
```

### Einzelne Bedingung

```json
"bedingungen": [
  {
    "parameter": "widmung",
    "operator": "ist",
    "wert": "gartensiedlungsgebiet"
  }
]
```

### Mehrere Bedingungen (UND)

```json
"bedingungen": [
  {
    "parameter": "widmung",
    "operator": "ist",
    "wert": "gartensiedlungsgebiet"
  },
  {
    "parameter": "bebauungsplan_abweichend",
    "operator": "ist_nicht",
    "wert": "ja"
  }
]
```

### ODER-Logik (mit `ist_eines_von`)

```json
"bedingungen": [
  {
    "parameter": "widmung",
    "operator": "ist_eines_von",
    "werte": ["wohngebiet", "gemischtes_baugebiet"]
  }
]
```

---

## Feld: `varianten`

**Zweck**: Wenn eine Vorschrift **mehrere Ausprägungen** hat (z.B. unterschiedliche Höhen je Bauklasse), wird das in Varianten aufgeteilt. Die Engine zeigt im UI nur die Variante(n) an, die zu den Wizard-Eingaben passen.

**Format**: Eine Liste von Varianten-Objekten.

### Struktur einer Variante

```json
{
  "wenn": { ... Bedingung wie oben ... },
  "headline": "Kurzbeschreibung dieser Variante",
  "anforderung": { ... Schwellenwert ... }
}
```

### Beispiel: § 75 Abs. 2 — Gebäudehöhe je Bauklasse

```json
{
  "id": "bo-wien-para-75-abs2",
  "headline": "Maximale Gebäudehöhe je Bauklasse (Grundregel)",
  "bedingungen": [
    { "typ": "immer" }
  ],
  "varianten": [
    {
      "wenn": { "parameter": "bauklasse", "operator": "ist", "wert": "BK_I" },
      "headline": "Bauklasse I: 2,5 – 9 m",
      "anforderung": { "min": 2.5, "max": 9, "einheit": "m", "typ": "gebaeudehoehe" }
    },
    {
      "wenn": { "parameter": "bauklasse", "operator": "ist", "wert": "BK_II" },
      "headline": "Bauklasse II: 2,5 – 12 m",
      "anforderung": { "min": 2.5, "max": 12, "einheit": "m", "typ": "gebaeudehoehe" }
    },
    {
      "wenn": { "parameter": "bauklasse", "operator": "ist", "wert": "BK_III" },
      "headline": "Bauklasse III: 9 – 16 m",
      "anforderung": { "min": 9, "max": 16, "einheit": "m", "typ": "gebaeudehoehe" }
    },
    {
      "wenn": { "parameter": "bauklasse", "operator": "ist", "wert": "BK_IV" },
      "headline": "Bauklasse IV: 12 – 21 m",
      "anforderung": { "min": 12, "max": 21, "einheit": "m", "typ": "gebaeudehoehe" }
    },
    {
      "wenn": { "parameter": "bauklasse", "operator": "ist", "wert": "BK_V" },
      "headline": "Bauklasse V: 16 – 26 m",
      "anforderung": { "min": 16, "max": 26, "einheit": "m", "typ": "gebaeudehoehe" }
    }
  ]
}
```

**Engine-Verhalten**: Wenn der Architekt im Wizard "Bauklasse III" angibt, zeigt das UI:
- Oben: *"§ 75 Abs. 2 — Maximale Gebäudehöhe je Bauklasse"*
- Darunter (gefiltert): *"Bauklasse III: 9 – 16 m"* (nur diese Variante)
- Darunter aufklappbar: den vollen Originaltext

---

## Feld: `anforderung`

**Zweck**: Der konkrete Schwellenwert als **maschinenlesbares Objekt**. Das UI kann daraus automatisch Tabellen, Merkblätter und Warnungen generieren.

**Format**: Ein Objekt mit typisierten Feldern.

### Mögliche Typen

| Typ | Beispiel | Bedeutung |
|---|---|---|
| `gebaeudehoehe` | `{ "min": 9, "max": 16, "einheit": "m" }` | Höhenregel |
| `abstand` | `{ "min": 6, "einheit": "m", "bezug": "nachbargrenze" }` | Mindestabstand |
| `flaeche` | `{ "max": 33.3, "einheit": "%", "bezug": "bauplatz" }` | Flächenanteil |
| `anzahl` | `{ "max": 1, "bezug": "geschoss" }` | Anzahl |
| `eigenschaft` | `{ "eigenschaft": "freistehend" }` | Qualitative Anforderung |
| `verweis` | `{ "ref": "bo-wien-para-79-abs3" }` | Verweis auf andere Vorschrift |
| `prosa` | `{ "text": "Das Äußere muss sich einfügen" }` | Nicht quantifizierbar |

### Beispiel — Abstand

```json
"anforderung": {
  "typ": "abstand",
  "min": 6,
  "einheit": "m",
  "bezug": "nachbargrenze"
}
```

### Beispiel — Fläche

```json
"anforderung": {
  "typ": "flaeche",
  "max": 33.3,
  "einheit": "%",
  "bezug": "bauplatzflaeche"
}
```

---

## Feld: `querverweise`

**Zweck**: Wenn eine Vorschrift auf eine andere verweist, wird das hier als maschinenlesbarer Link hinterlegt. Die UI kann dann einen klickbaren Querverweis anzeigen.

**Format**: Liste von Verweis-Objekten.

```json
"querverweise": [
  {
    "ref_id": "bo-wien-para-81",
    "ref_text": "§ 81",
    "beschreibung": "Bemessung der Gebäudehöhe"
  }
]
```

---

## Feld: `status` (erweitert)

Bewertet den Pflegezustand der Karteikarte:

| Wert | Bedeutung |
|---|---|
| `platzhalter_generiert` | Automatisch erzeugt, Inhalte sind Platzhalter |
| `bedingungen_gesetzt` | Bedingungen wurden manuell/LLM-basiert ergänzt |
| `inhalte_pruefen` | **Achtung**: Teile sind mit `PRÜFEN`-Flag markiert, müssen manuell validiert werden |
| `llm_bearbeitet` | Headlines/Erklärungen wurden durch LLM optimiert |
| `manuell_geprueft` | Von einem Fachmann/einer Fachfrau geprüft |
| `final` | Produktionsreif |

---

## Feld: `pruefhinweise` *(NEU)*

**Zweck**: Wenn ich bei der Befüllung unsicher bin, schreibe ich einen Hinweis hierher. Das ist für dich eine Art "To-Do-Liste" zum späteren Prüfen.

**Format**: Liste von Strings.

```json
"pruefhinweise": [
  "PRÜFEN: Gilt die Anforderung auch für Gartensiedlungsgebiete, oder nur für Wohn-/Mischgebiete?",
  "PRÜFEN: Maßzahl '33,3 %' ist eine Interpretation von 'ein Drittel'"
]
```

---

## Was das UI später damit macht

Ein Beispiel-Ablauf, wenn der Architekt im Wizard einstellt:
- **Widmung**: wohngebiet
- **Bauklasse**: BK_III
- **Bauweise**: offen

**Die Engine macht folgendes**:

1. **Laden**: Alle Karteikarten aus `bo-wien-teil-08.json` einlesen.
2. **Filtern nach Bedingungen**: Alle Karteikarten ausblenden, deren `bedingungen` nicht erfüllt sind. Übrig bleiben die relevanten.
3. **Varianten auflösen**: Für jede übrig gebliebene Karteikarte werden die `varianten` gefiltert — nur noch die Variante mit `wenn.bauklasse = BK_III` bleibt übrig.
4. **Gruppieren**: Die Karteikarten werden nach `hauptkategorie` und `unterkategorie` gruppiert (z.B. alles unter H.02 zusammen).
5. **Anzeigen**: Das UI zeigt die Liste — jede Karteikarte als aufklappbare Zeile mit Headline, Erklärung und Originaltext-Referenz.

---

## Zusammenfassung der Schema-Änderungen

| Feld | v0.1 | v0.2 |
|---|---|---|
| `bedingungen` | leer `[]` | **befüllt** |
| `varianten` | existierte nicht | **NEU** — für mehrwertige Regeln |
| `anforderung` | `null` | **befüllt** — typisierte Schwellenwerte |
| `querverweise` | leer `[]` | **befüllt** mit maschinenlesbaren Refs |
| `pruefhinweise` | existierte nicht | **NEU** — für Unsicherheiten |
| `status` | nur "platzhalter_generiert" | **erweitert** um weitere Zustände |

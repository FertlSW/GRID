# Grid.legal — Briefing für Claude Code

## Rolle

Du hilfst beim Aufbau eines **UI-Prototyps** für Grid.legal — ein Vorschriften-Assistent für Architekten in Wien.

Der User ist **Programmier-Laie**. Erkläre alle technischen Entscheidungen in verständlicher Sprache. Lege Dateien so ab, dass sie auch für Laien klar organisiert sind. Zeige vor dem Schreiben von Code, was du vorhast, und hole Bestätigung.

---

## Was dieses Projekt ist

**Produktname**: Grid.legal
**Zielgruppe**: Architekten in Wien
**Aktueller Fokus**: UI/UX-Prototyp (noch kein Production-Code)

**Funktion**: Der Architekt beantwortet im Wizard ein paar Fragen zu seinem Bauvorhaben. Das Tool zeigt dann die geltenden Vorschriften — in zwei Ansichten:

1. **Output 1 — Kategorie-Nachschlagewerk**: Alle zutreffenden Vorschriften, sortiert nach Kategorien (A–I), aufklappbar mit Headline → Erklärung → Originaltext
2. **Output 2 — Planungsphasen-Dashboard**: Dieselben Vorschriften, aber strukturiert nach Planungsphasen (Vorentwurf / Entwurf / Genehmigung / Ausführung), mit steigendem Detailgrad je Phase

---

## Technologie-Stack

- **Frontend**: React (TypeScript)
- **Engine**: TypeScript — filtert JSON-Daten anhand Wizard-Eingaben
- **Wissensbasis**: JSON-Dateien in `gesetzestexte/`
- **Architekturentscheidung**: **Regelbasiert, NICHT RAG** — alle Vorschriften als deterministische JSON-Objekte

---

## Datenstand (Stand 16.04.2026)

### Was fertig ist

- **Bauordnung Wien Teil 8** (§§ 75–86) komplett als JSON strukturiert:
  - 80 Rechtssätze, alle mit manueller Headline
  - Bedingungen, Varianten, Anforderungen befüllt (mittlere Komplexität)
  - Querverweise erfasst
  - Pfad: `gesetzestexte/bauordnung-wien/bo-wien-teil-08.json`

### Was noch aussteht

- BO Wien Teile 1–7, 9–12
- OIB-Richtlinien 1, 2, 2.1, 2.2, 2.3, 3, 4, 5, 6
- Echte architektengerechte Erklärungen (Erklärungs-Feld ist aktuell Platzhalter)
- 19 markierte Prüfhinweise (siehe `pruefhinweise`-Feld in der JSON)

---

## Entwicklungsreihenfolge (Vorschlag)

### Phase A — Grundgerüst UI
1. React-Projekt aufsetzen mit TypeScript
2. Wizard-Komponente: Schrittweise Parameter-Eingabe (siehe `WIZARD_PARAMETER.md`)
3. Ergebnis-View: Liste der Rechtssätze nach Kategorien (Output 1)
4. Detail-View: Aufklappbare Rechtssatz-Kachel (Headline → Erklärung → Originaltext)

### Phase B — Filter-Engine
5. JSON-Import und Parser
6. Bedingungs-Auswertung (welche Rechtssätze gelten?)
7. Varianten-Auflösung (welche Variante pro Rechtssatz?)
8. Kategorie-Gruppierung

### Phase C — Feinschliff
9. Querverweise als klickbare Links
10. Hinweise-Boxen anzeigen
11. Planungsphasen-Dashboard (Output 2)
12. Suche / Filter in der Ergebnisansicht

---

## Zentrale Konzepte im JSON

### Bedingungen
Jeder Rechtssatz hat ein `bedingungen`-Array. Die Engine prüft: **Sind alle Bedingungen (UND-verknüpft) erfüllt?** Wenn ja, wird der Rechtssatz angezeigt.

```json
"bedingungen": [
  { "parameter": "widmung", "operator": "ist", "wert": "wohngebiet" },
  { "parameter": "bauweise", "operator": "ist_eines_von", "werte": ["offen", "gekuppelt"] }
]
```

**Operatoren**: `ist`, `ist_nicht`, `ist_eines_von`, `groesser_als`, `kleiner_als`, und `{"typ": "immer"}` für "keine Einschränkung".

### Varianten
Wenn ein Rechtssatz **verschiedene Werte** je nach Parameter hat (z.B. Gebäudehöhe je Bauklasse), sind die im `varianten`-Array:

```json
"varianten": [
  {
    "wenn": { "parameter": "bauklasse", "operator": "ist", "wert": "BK_III" },
    "headline": "Bauklasse III: 9 – 16 m",
    "anforderung": { "typ": "gebaeudehoehe", "min": 9, "max": 16, "einheit": "m" }
  }
]
```

Die Engine zeigt nur die Variante an, deren `wenn`-Bedingung zu den Wizard-Eingaben passt.

### Hinweise vs. Prüfhinweise

- `hinweise`: **Für den Nutzer im UI sichtbar** — z.B. "Abweichungen durch Bebauungsplan möglich"
- `pruefhinweise`: **Nur intern** — Redaktionsnotizen für spätere Fachprüfung

Im Prototyp: `hinweise` anzeigen, `pruefhinweise` nur in Entwickler-Modus oder gar nicht.

---

## UI-Mockup-Leitlinien

- **Dezent und seriös** — das Tool ist für Berufsanwender
- **Lesbarkeit > Effekte** — Gesetzestexte brauchen ruhige Typografie
- **Originaltext immer zugänglich** — aufklappbar, nie versteckt
- **Transparenz über Grenzen** — "Beta"-Status klar kommunizieren
- **Mobile tauglich** (Architekten sind auf Baustellen unterwegs), aber **Desktop-first** (Hauptarbeit am großen Bildschirm)

---

## Was Claude Code NICHT tun soll

- **Keine OIB-Richtlinien einbauen** — die JSON-Dateien kommen später vom User
- **Keine realen Gesetzesänderungen raten** — was im JSON steht, ist die Quelle der Wahrheit
- **Keine eigene Rechtsauslegung** — bei Unsicherheiten den Architekten-User auf den Originaltext verweisen
- **Keine Platzhalter-Erklärungen überschreiben** — die werden in einem separaten Schritt durch LLM-Calls ersetzt

---

## Kommunikation mit dem User

- Auf **Deutsch** kommunizieren
- **Laienverständlich** erklären
- **Kleine Schritte** — lieber häufig Feedback holen als lange allein arbeiten
- **Technische Begriffe erst nach Erklärung** verwenden
- Bei Entscheidungen: **Optionen anbieten**, Empfehlung begründen

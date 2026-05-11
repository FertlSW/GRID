# Grid.legal — Prototyp-Projekt

**Ein Vorschriften-Assistent für Architekten in Wien.**

Dieses Projekt ist die **Grundlage** für den UI-Prototyp. Es enthält eine strukturierte Wissensbasis der Bauordnung für Wien (Teil 8 als erstes Muster) und alle Konzepte, die der Prototyp braucht.

---

## Was in diesem Repo ist

```
grid-legal-projekt/
│
├── CLAUDE.md                           ← Briefing für Claude Code (LIES ZUERST)
├── README.md                           ← Diese Datei
│
├── gesetzestexte/                      ← Die strukturierte Wissensbasis
│   └── bauordnung-wien/
│       └── bo-wien-teil-08.json          (80 Rechtssätze aus §§ 75–86)
│
├── dokumentation/                      ← Alle Konzepte und Schemata
│   ├── README.md                          (laienverständliche Einführung)
│   ├── SCHEMA_v0.2.md                     (technisches JSON-Schema)
│   ├── WIZARD_PARAMETER.md                (alle Wizard-Fragen definiert)
│   └── OUTPUT_STRUKTUR1.md                (dein Original-Briefing, Kategorien)
│
└── werkzeuge/                          ← Python-Skripte (wie Daten entstanden sind)
    ├── parse_bo_teil8.py                  (v0.1 — reine Textextraktion)
    ├── parse_bo_teil8_v2.py               (v0.2 — mit Anreicherungen)
    └── anreicherungen_teil8.py            (manuelle Kuration aller Rechtssätze)
```

---

## Was du mit Claude Code als Erstes tun solltest

### Schritt 1 — Briefing lesen

Lies `CLAUDE.md` komplett. Dort steht die vollständige Projektbeschreibung.

### Schritt 2 — Datenmodell verstehen

Lies in dieser Reihenfolge:

1. `dokumentation/README.md` (was ist überhaupt drin?)
2. `dokumentation/WIZARD_PARAMETER.md` (welche Fragen stellt der Wizard?)
3. `dokumentation/SCHEMA_v0.2.md` (wie sind die Rechtssätze strukturiert?)
4. `dokumentation/OUTPUT_STRUKTUR1.md` (die Kategorien-Struktur für Output 1)

### Schritt 3 — Beispiel-Daten ansehen

Öffne `gesetzestexte/bauordnung-wien/bo-wien-teil-08.json` und schau dir diese Rechtssätze als Muster an:

- **`bo-wien-para-75-abs2`** — Klassisches Beispiel mit Varianten (Bauklasse-Tabelle)
- **`bo-wien-para-79-abs3`** — Abstandsregel je Bauklasse
- **`bo-wien-para-76-abs10`** — Einfache Bedingung (nur Wohngebiet)
- **`bo-wien-para-78`** — Aufgehobener Paragraph
- **`bo-wien-para-82a`** — Paragraph ohne Absatzgliederung

### Schritt 4 — Prototyp bauen

Der Prototyp soll laut Briefing zwei Ausgabe-Varianten haben:

1. **Output 1**: Kategorie-Nachschlagewerk (Hauptkategorien A–I, Unterkategorien)
2. **Output 2**: Dashboard nach Planungsphasen (Vorentwurf → Ausführung)

Starte mit dem **Wizard** (Parameter-Eingabe) und dann **Output 1** (Kategorien). Output 2 kann später kommen.

---

## Wichtig: Stand der Daten

- **Teil 8 (§§ 75–86)** ist vollständig strukturiert und angereichert
- **Teile 1–7, 9–12** sind noch NICHT in JSON überführt — das kommt erst, wenn der Prototyp steht
- **OIB-Richtlinien** sind NICHT in diesem Paket — kommen in einer späteren Phase
- **Headlines sind manuell kuratiert** — Erklärungen sind noch Platzhalter (LLM-Pass folgt)
- **19 Rechtssätze haben `pruefhinweise`** — das sind Stellen, die vor Produktivsetzung von Architekten/Juristen validiert werden müssen. Die Hinweise stehen direkt in der JSON im Feld `pruefhinweise` pro Rechtssatz.

---

## Technologie-Stack (aus Briefing)

- **Frontend**: React
- **Engine**: TypeScript — Routing, Filter, Override-Resolution, Kategorisierung
- **Wissensbasis**: JSON (nicht RAG!)
- **Optional**: Claude API für architektengerechte Erklärungen einzelner Vorschriften

---

## Grenzen dieses Prototypen-Datensatzes

Gewissenhaft dokumentiert, damit der Prototyp realistische Erwartungen setzt:

1. **Nur 80 Rechtssätze aus einem Teil** der BO Wien — nicht die ganze Rechtslage für Wien
2. **Keine OIB-Richtlinien** — obwohl sie für Architekten essentiell sind
3. **Bedingungen sind LLM-interpretiert** — nicht juristisch geprüft
4. **Erklärungen sind Platzhalter** — Originaltext ist wortgetreu

Der Prototyp sollte das transparent kommunizieren, z.B. durch einen "Beta"-Badge und eine Hinweis-Seite.

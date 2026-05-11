# OIB Brandschutz & Bautechnik Tool — Projekt-Briefing v2

## Projektziel
Ein deterministisches Expertensystem für Architekten in Wien, das basierend auf wenigen Eingabeparametern alle zutreffenden bautechnischen Vorschriften filtert und strukturiert darstellt. Das Tool deckt perspektivisch alle OIB-Richtlinien (1–6) und die Bauordnung Wien ab.

## Architekturentscheidung: Regelbasiert, NICHT RAG
Alle Regelwerke sind geschlossene, deterministische Systeme. Anforderungen ergeben sich aus endlichen Parameter-Kombinationen. RAG würde Unschärfe einführen, wo Präzision gefordert ist.

### Technologie-Stack
- **Wissensbasis**: Strukturiertes JSON — jede Vorschrift als Datenobjekt mit Bedingungen, Anforderung, Originaltext-Referenz
- **Engine**: TypeScript — filtert Regeln gegen Nutzerparameter, löst Fußnoten-Overrides auf
- **Frontend**: React — Wizard für Parametereingabe → kategorisierte Ergebnisansicht → aufklappbare Originalzitate
- **Claude API** (optional, ergänzend): Für natürlichsprachliche Erklärungen einzelner Vorschriften, NICHT für die Regelauswahl

---

## Dokumentenlandschaft

### Gesetzliche Ebene
| Dokument | Umfang | Charakter |
|---|---|---|
| **Bauordnung Wien (BO)** | 105 Seiten, §§ 1–135 | Landesgesetz — Schutzziele + eigene materielle Vorschriften |

### OIB-Richtlinien (technische Ebene)
| Dokument | Thema | Charakter |
|---|---|---|
| **OIB-RL 1** | Mechanische Festigkeit und Standsicherheit | Normativ |
| **OIB-RL 1 Leitfaden** | Bestehende Tragwerke | Methodisch |
| **OIB-RL 2** | Brandschutz (Hauptrichtlinie) | Normativ |
| **OIB-RL 2.1** | Brandschutz bei Betriebsbauten | Normativ |
| **OIB-RL 2.2** | Brandschutz bei Garagen, Stellplätze, Parkdecks | Normativ |
| **OIB-RL 2.3** | Brandschutz bei Gebäuden mit Fluchtniveau > 22 m | Normativ |
| **OIB-RL 2 Leitfaden** | Abweichungen und Brandschutzkonzepte | Methodisch |
| **OIB-RL 3** | Hygiene, Gesundheit und Umweltschutz | Normativ |
| **OIB-RL 4** | Nutzungssicherheit und Barrierefreiheit | Normativ |
| **OIB-RL 5** | Schallschutz | Normativ |
| **OIB-RL 6** | Energieeinsparung und Wärmeschutz | Normativ |
| **OIB-RL 6 Leitfaden** | Energietechnisches Verhalten von Gebäuden | Methodisch |

### Hierarchie
Die BO Wien steht als Landesgesetz über den OIB-Richtlinien. Sie definiert Schutzziele und verweist für konkrete technische Anforderungen auf die OIB-Richtlinien. In einigen Bereichen (Aufzugspflicht, Barrierefreiheit, Wohnungsgrößen, Stellplätze, Spielplätze) hat die BO Wien **eigene materielle Vorschriften**, die über die OIB-Richtlinien hinausgehen.

---

## Dokumenten-Routing

### OIB-RL 2 Brandschutz (intern)
```
Immer aktiv:           OIB-RL 2 (Hauptrichtlinie)
Bei Betriebsbau:       + OIB-RL 2.1 (primär für betreffende Bereiche)
Bei Garage/Parkdeck:   + OIB-RL 2.2
Bei Fluchtniveau >22m: + OIB-RL 2.3
Bei Sondergebäuden:    + Leitfaden (Brandschutzkonzept verpflichtend)
```

Wichtig: 2.1, 2.2 und 2.3 sagen jeweils explizit in ihren Vorbemerkungen, dass "parallel einzelne Bestimmungen der OIB-RL 2 zu berücksichtigen sind".

### Gesamtrouting (alle Richtlinien)
```
Für jedes Projekt gelten:
  - BO Wien (immer, als gesetzliche Grundlage)
  - OIB-RL 1 (immer, Tragwerk)
  - OIB-RL 2 + ggf. 2.1/2.2/2.3 (immer, Brandschutz)
  - OIB-RL 3 (immer, Hygiene/Gesundheit)
  - OIB-RL 4 (immer, Nutzungssicherheit)
  - OIB-RL 5 (immer, Schallschutz)
  - OIB-RL 6 (immer, Energie)
```

Die Filterung passiert auf Kategorie-Ebene: Nicht alle Unterkategorien sind für jedes Projekt relevant. Leere Kategorien werden ausgeblendet.

---

## Wizard-Parameter (Eingabe)

### Pflichtfragen (Gesamtgebäude-Ebene)

1. **Hauptnutzung**: Wohnen, Büro, Betriebsbau, Garage, Beherbergung, Schule/Kindergarten, Verkaufsstätte, Altersheim, Pflegeheim, Krankenhaus, Versammlungsstätte, Landwirtschaft, Schutzhütte, Gemischte Nutzung
2. **Gebäudeklasse**: GK 1–5
3. **Oberirdische Geschoße**: Zahl (wichtig: bei GK 5 Unterscheidung ≤6 / >6)
4. **Unterirdische Geschoße**: Nein / 1 / 2 / >2
5. **Fluchtniveau**: ≤22m / ≤32m / >32m bis ≤90m / >90m
6. **Grenzabstand**: <2m / 2–4m / ≥4m
7. **Neubau oder Bestand**: Neubau / Bauführung im Bestand

### Bedingte Folgefragen (nur bei bestimmter Nutzung)
- Beherbergung: Anzahl Gästebetten (≤30 / 31–100 / >100)
- Altersheim: Anzahl Bewohner (≤30 / 31–60 / >60)
- Verkaufsstätte: Verkaufsfläche (≤600 / 601–3.000 / >3.000 m²)
- Versammlungsstätte: Netto-Grundfläche Versammlungsraum (≤600 / 601–1.600 / >1.600 m²)
- Betriebsbau: Sicherheitskategorie (K1 / K2 / K3.1 / K3.2 / K4.1 / K4.2)
- Garage: Nutzfläche + Typ (Garage/Stellplatz/Parkdeck) + Fahrzeugtypen

### Gemischte Nutzung
Bei "Gemischt" kann der Nutzer mehrere Gebäudeteile anlegen. Jeder Teil hat eigene Nutzung + Folgefragen. Übergreifende Parameter (GK, Geschoße, Fluchtniveau, Grenzabstand) gelten für das Gesamtgebäude.

Automatische Hochstufung beachten: Schulen/Beherbergung/Altersheime der GK 1+2 → GK 3 (OIB-RL 2 Punkte 7.2.1, 7.3.1, 7.5.1)

---

## Ausgabe-Kategorien

### Grundprinzip
Kategorien orientieren sich an **Planungsthemen** (wie ein Architekt denkt), nicht an Dokumenten (wie ein Jurist liest). Jede Kategorie sammelt alle Vorschriften aus allen Quellen zu diesem Thema. Leere Kategorien werden ausgeblendet.

Jede Kategorie zeigt:
- Oben: **BO-Wien-Schutzziel** (die gesetzliche Grundlage)
- Darunter: **OIB-Detailanforderungen** (die konkreten Werte, gefiltert nach Parametern)
- Pro Regel: Aufklappbarer **Originaltext** mit Quellenangabe

### Ebene 1: Hauptkategorien (9 Stück)

#### A — Tragwerk & Standsicherheit
*Quellen: BO Wien §§ 89–90 · OIB-RL 1 · OIB-RL 2 Tab 1b (Feuerwiderstand)*

#### B — Brandschutz
*Quellen: BO Wien §§ 91–96 · OIB-RL 2 komplett · OIB-RL 2.1 · OIB-RL 2.2 · OIB-RL 2.3 · Leitfaden*

#### C — Gesundheit, Hygiene & Umwelt
*Quellen: BO Wien §§ 97–108 · OIB-RL 3*

#### D — Nutzungssicherheit & Barrierefreiheit
*Quellen: BO Wien §§ 109–115 · OIB-RL 4*

#### E — Schallschutz
*Quellen: BO Wien §§ 116–117 · OIB-RL 5*

#### F — Energie & Wärmeschutz
*Quellen: BO Wien § 118 · OIB-RL 6*

#### G — Gebäudetypologie & Nutzungseinheiten
*Quellen: BO Wien §§ 119–121 (Wohnungen, Bürogebäude, Heime, Beherbergung)*

#### H — Bauplatz & Bebauung
*Quellen: BO Wien Teile 1, 5, 8 (Stadtplanung, Anliegerleistungen, bauliche Ausnützbarkeit)*

#### I — Verfahren & Ausführung
*Quellen: BO Wien Teile 7, 10 (Baubewilligung, Bauausführung, Fertigstellung, Erhaltung)*

---

### Ebene 2: Unterkategorien

#### B — Brandschutz (18 + 4 bedingte Unterkategorien)

| ID | Unterkategorie | OIB-RL 2 | OIB-RL 2.1 | OIB-RL 2.2 | OIB-RL 2.3 | BO Wien |
|---|---|---|---|---|---|---|
| B.01 | Tragwerk & Feuerwiderstand | Tab 1b | Tab 1 | Pkt 5.1 | Pkt 2.2 | § 92 |
| B.02 | Brandverhalten von Baustoffen | Tab 1a | Pkt 3.9/3.10 | Pkt 5.2 | Tab 1 | § 93 Abs 5 |
| B.03 | Brandabschnitte & Trennbauteile | Pkt 3.1 + 3.2 | Pkt 2 + 3.8 | Pkt 5.6 | Pkt 2.4 | § 93 |
| B.04 | Flucht- & Rettungswege | Pkt 5 | Pkt 3.6 | Pkt 5.5 | Pkt 3.1/4.1 | § 95 |
| B.05 | Treppenhäuser | Tab 2a/2b/3 | Tab 2 | – | Pkt 2.5/3.2/4.2 | § 95 |
| B.06 | Fassade & Außenwand | Pkt 3.5 | Pkt 3.9 | – | Pkt 2.3 | § 94 |
| B.07 | Dach & Photovoltaik | Pkt 3.13 + Tab 1a Pkt 4 | Pkt 3.10/3.11 | – | Pkt 2.18 | § 94 |
| B.08 | Schächte, Leitungen & Installationen | Pkt 3.4 | – | – | Pkt 2.9 | – |
| B.09 | Aufzüge | Pkt 3.6 | – | Pkt 5.4 | Pkt 2.7 | § 111 |
| B.10 | Feuerstätten & Abgasanlagen | Pkt 3.7/3.8 | – | Pkt 5.7 | – | § 101 |
| B.11 | Räume mit erhöhter Brandgefahr | Pkt 3.9 | – | – | Pkt 2.8 | § 93 Abs 4 |
| B.12 | Brandmeldung & Alarmierung | Pkt 3.11 + Pkt 7.x | Pkt 3.12.3 | Tab 2 | Pkt 3.3/4.3 | § 93 Abs 8 |
| B.13 | Löscheinrichtungen | Pkt 3.10 | Pkt 3.12 | Pkt 5.8 | Pkt 2.10 | § 93 Abs 8 |
| B.14 | Rauch- & Wärmeabzug | Pkt 3.12 | Pkt 3.7 | Tab 2 | – | § 93 Abs 8 |
| B.15 | Sicherheitsbeleuchtung | Tab 6 | Pkt 3.6.5 | Pkt 5.5.3 | Pkt 2.14 | – |
| B.16 | Nachbarschutz & Abstände | Pkt 4 | Pkt 3.2 | diverse | – | § 94 |
| B.17 | Brandbekämpfung & Feuerwehrzugänglichkeit | Pkt 6 | Pkt 3.3 | – | Pkt 2.16/2.17 | § 96 |
| B.18 | Organisatorische Maßnahmen | – | Pkt 3.12.2 | – | Pkt 2.17 | – |

**Bedingte Brandschutz-Kategorien:**

| ID | Unterkategorie | Bedingung |
|---|---|---|
| B.S1 | Nutzungsspezifische Sonderbestimmungen | OIB-RL 2 Pkt 7.1–7.9 je nach Nutzung |
| B.S2 | Lagerung | Nur Betriebsbau · OIB-RL 2.1 Pkt 4 + Tab 3 + Anhang A |
| B.S3 | Fahrzeug-Sonderanforderungen | Nur Garage · OIB-RL 2.2 Pkt 7–10 |
| B.S4 | Hochhaus-Sonderanforderungen | Nur Fluchtniveau >22m · OIB-RL 2.3 Pkt 2.12–2.16, 3.4, 4.4 |
| B.X | Trennungen zwischen Nutzungsbereichen | Nur gemischte Nutzung |

#### C — Gesundheit, Hygiene & Umwelt (11 Unterkategorien)

| ID | Unterkategorie | OIB-RL 3 | BO Wien |
|---|---|---|---|
| C.01 | Sanitäreinrichtungen | Pkt 2 | § 98 |
| C.02 | Abwasser & Entwässerung | Pkt 3 | § 99 |
| C.03 | Abfallentsorgung | Pkt 4 | § 100 |
| C.04 | Abgase von Feuerstätten | Pkt 5 | § 101 |
| C.05 | Feuchteschutz | Pkt 6 | § 102 |
| C.06 | Trinkwasser & Nutzwasser | Pkt 7 | § 104 |
| C.07 | Immissionsschutz | Pkt 8 | § 105 |
| C.08 | Belichtung & Beleuchtung | Pkt 9 | § 106 |
| C.09 | Lüftung & Beheizung | Pkt 10 | § 106 |
| C.10 | Raumhöhe & Niveau | Pkt 11 | § 107 |
| C.11 | Lagerung gefährlicher Stoffe | Pkt 12 | § 108 |

#### D — Nutzungssicherheit & Barrierefreiheit (7 Unterkategorien)

| ID | Unterkategorie | OIB-RL 4 | BO Wien |
|---|---|---|---|
| D.01 | Erschließung & Verbindungswege | Pkt 2 | § 109 |
| D.02 | Aufzüge & Hebeeinrichtungen | Pkt 2 | § 111 |
| D.03 | Rutsch- & Stolperschutz | Pkt 3 | § 112 |
| D.04 | Absturzschutz | Pkt 4 | § 112 |
| D.05 | Aufprallschutz & Verglasung | Pkt 5 | § 113 |
| D.06 | Blitzschutz | Pkt 6 | § 114 |
| D.07 | Barrierefreiheit | Pkt 7 | § 115 |

#### E — Schallschutz (4 Unterkategorien)

| ID | Unterkategorie | OIB-RL 5 | BO Wien |
|---|---|---|---|
| E.01 | Baulicher Schallschutz | Pkt 2 | § 116 |
| E.02 | Raumakustik | Pkt 3 | – |
| E.03 | Erschütterungsschutz | Pkt 4 | – |
| E.04 | Haustechnische Anlagen (Schall) | Pkt 5 | § 117 |

#### F — Energie & Wärmeschutz (4 Unterkategorien)

| ID | Unterkategorie | OIB-RL 6 | BO Wien |
|---|---|---|---|
| F.01 | Gebäudehülle & U-Werte | Pkt 4 | § 118 |
| F.02 | Energieträger & Heizsysteme | Pkt 5 | § 118 Abs 3 |
| F.03 | Energieausweis | Pkt 6 | § 118 Abs 5–6 |
| F.04 | Solaranlagen & erneuerbare Energie | – | § 118b |

#### G — Gebäudetypologie & Nutzungseinheiten (4 Unterkategorien)

| ID | Unterkategorie | Quellen |
|---|---|---|
| G.01 | Wohnungen (Größe, Ausstattung, Anforderungen) | BO § 119 |
| G.02 | Wohngebäude (Gemeinschaftseinrichtungen, Fahrrad, Spielplätze) | BO § 119a |
| G.03 | Büro- & Geschäftsgebäude | BO § 120 |
| G.04 | Beherbergungsstätten & Heime | BO § 121 |

#### H — Bauplatz & Bebauung (4 Unterkategorien)

| ID | Unterkategorie | Quellen |
|---|---|---|
| H.01 | Bebauungsbestimmungen & Widmung | BO Wien Teil 1 |
| H.02 | Gebäudehöhe & Geschoßanzahl | BO §§ 75–81 |
| H.03 | Abstände & Abstandsflächen | BO §§ 79–84 |
| H.04 | Stellplatzverpflichtung | BO diverse |

#### I — Verfahren & Ausführung (4 Unterkategorien)

| ID | Unterkategorie | Quellen |
|---|---|---|
| I.01 | Bewilligungsfreie Bauvorhaben | BO § 62 |
| I.02 | Baubewilligungsverfahren | BO §§ 60–70 |
| I.03 | Bauausführung & Fertigstellung | BO §§ 124–128 |
| I.04 | Erhaltung & Bestandsschutz | BO §§ 129–135, OIB Bauführungen im Bestand |

---

## Kreuzreferenzen zwischen Kategorien

Einige Themen betreffen mehrere Hauptkategorien. Das Tool zeigt in diesen Fällen **Querverweise**:

| Thema | Primäre Kategorie | Querverweise |
|---|---|---|
| Aufzüge | D.02 (Nutzungssicherheit) | → B.09 (Brandfallsteuerung, Feuerwehraufzug) |
| Fluchtwege | B.04 (Brandschutz) | → D.01 (Erschließung, Barrierefreiheit von Fluchtwegen) |
| Feuerstätten / Abgase | B.10 (Brandschutz) | → C.04 (Abgasführung, Hygiene) |
| Lüftung | C.09 (Hygiene) | → B.14 (RWA, Rauchfreihaltung) → F.01 (Energieeffizienz) |
| Feuchteschutz | C.05 (Hygiene) | → F.01 (Wärmebrücken, Kondensation) |
| Treppen | B.05 (Brandschutz-Treppenhaus) | → D.01 (Abmessungen, Rutschschutz) |

---

## Datenmodell: Fußnoten als bedingte Overrides

### Drei Fußnoten-Typen
- **Typ A — Bedingte Überschreibung**: Ändert den Wert unter einer Bedingung
- **Typ B — Zulässige Alternative**: Erweitert akzeptierte Materialien/Klassen
- **Typ C — Technischer Hinweis**: Erklärt/konkretisiert, ändert nicht den Wert

### Struktur einer Tabellenzelle (gemäß types.ts)
```json
{
  "base": "B-d1",
  "overrides": [
    {
      "footnote_id": 1,
      "condition": { "op": "always" },
      "alternative": "D (bei Gesamtsystem D-d0)",
      "note": "Holz und Holzwerkstoffe in D zulässig, wenn Gesamtsystem D-d0",
      "original_text": "Es sind auch Holz und Holzwerkstoffe in D zulässig, wenn das Gesamtsystem die Klasse D-d0 erfüllt"
    }
  ]
}
```

### Schema-Pflichtfelder (aus types.ts)
- **Table**: id, title, source (keine Seitenzahlen), columns, footnotes, sections
- **Column**: key, label, activeWhen (Condition)
- **Footnote**: id, type (A/B/C), text, source
- **Cell**: base, overrides (NICHT "fn")
- **Override**: footnote_id, condition, note, original_text + new_value (Typ A) oder alternative (Typ B)
- **Section**: id, title, note (NICHT "section_note"), rows

---

## Projektstruktur
```
/project
├── CLAUDE.md                          # Dieses Briefing
├── docs/                              # Original-PDFs
│   ├── oib-rl-2.pdf
│   ├── oib-rl-2-1.pdf
│   ├── oib-rl-2-2.pdf
│   ├── oib-rl-2-3.pdf
│   ├── oib-rl-2-leitfaden.pdf
│   ├── bo-wien.pdf
│   └── (perspektivisch: oib-rl-1/3/4/5/6)
├── knowledge-base/
│   ├── rules/                         # Punkt-Regeln (nicht-tabellarisch)
│   │   ├── oib2-main.json
│   │   ├── oib2-1-betriebsbauten.json
│   │   ├── oib2-2-garagen.json
│   │   ├── oib2-3-hochhaus.json
│   │   └── bo-wien-brandschutz.json
│   ├── tables/                        # Tabellen als JSON
│   │   ├── tab1a-brandverhalten.json
│   │   ├── tab1b-feuerwiderstand.json
│   │   ├── tab2a-treppenhaeuser-gk234.json
│   │   ├── tab2b-treppenhaeuser-gk5.json
│   │   ├── tab3-treppenhaeuser-fluchtweg-c.json
│   │   ├── tab4-verkaufsflaechen.json
│   │   ├── tab5-pflegeheime-krankenhaeuser.json
│   │   ├── tab6-sicherheitsbeleuchtung.json
│   │   ├── tab-2_1-hauptbrandabschnitte.json
│   │   ├── tab-2_1-treppenhaeuser.json
│   │   ├── tab-2_1-lagerabschnitte.json
│   │   ├── tab-2_2-stellplaetze-garagen.json
│   │   ├── tab-2_2-rwa-garagen.json
│   │   ├── tab-2_2-parkdecks.json
│   │   └── tab-2_3-brandverhalten.json
│   ├── definitions/
│   │   └── begriffsbestimmungen.json
│   └── triggers/
│       └── brandschutzkonzept.json
├── engine/
│   ├── types.ts                       # Basis-Typen
│   ├── router.ts                      # Welche Richtlinien aktiv
│   ├── filter.ts                      # Parameter → Regeln
│   ├── resolver.ts                    # Fußnoten-Overrides auflösen
│   ├── categorizer.ts                 # Regeln → Ausgabe-Kategorien
│   └── __tests__/
│       ├── filter.test.ts
│       └── resolver.test.ts
├── frontend/
│   ├── Wizard.tsx
│   ├── BuildingParts.tsx
│   ├── ResultView.tsx
│   ├── CategorySection.tsx
│   ├── RuleCard.tsx
│   ├── TableView.tsx
│   └── CitationPopover.tsx
└── prototype/
    └── tabelle1b-prototyp.jsx
```

---

## Umsetzungs-Reihenfolge

### Phase 1 — Wissensbasis OIB-RL 2 (aktuell)
Alle Tabellen und Punkt-Regeln der OIB-RL 2, 2.1, 2.2, 2.3 als strukturiertes JSON. Tabellen werden im Chat (Claude.ai) erstellt und gegen PDFs verifiziert, dann in Claude Code validiert gegen types.ts.

### Phase 2 — Engine
TypeScript-Filterlogik: Routing → Filter → Override-Resolution → Kategorisierung. Automatisierte Tests mit konkreten Szenarien.

### Phase 3 — Frontend
React-Wizard, Ergebnisansicht, Gebäudeteile-Verwaltung.

### Phase 4 — BO Wien Integration
BO-Wien-Schutzziele den Kategorien zuordnen. Eigene BO-Wien-Regeln (§ 111 Aufzug, § 115 Barrierefreiheit, § 119 Wohnungen) als JSON erfassen.

### Phase 5 — Weitere OIB-Richtlinien
OIB-RL 3, 4, 5, 6 schrittweise integrieren. Die Kategoriestruktur ist dafür vorbereitet — die Unterkategorien C.01–C.11, D.01–D.07, E.01–E.04, F.01–F.04 sind bereits definiert.

### Phase 6 — Erweiterung auf andere Bundesländer (perspektivisch)
Andere Landesbauordnungen (NÖ, Steiermark etc.) können als zusätzliche Schicht über denselben Kategorien eingefügt werden, mit einer Landeskennung als Filter.

---

## Validierter Prototyp
Ein funktionierender Prototyp für Tabelle 1b mit Fußnoten-Override-Logik wurde gebaut und getestet (prototype/tabelle1b-prototyp.jsx).

### Getestete Szenarien
- GK 1 + Wohnnutzung → Fußnote 1 greift, "keine Anforderung" für Punkt 1.2 und 4.4
- GK 1 + andere Nutzung → Fußnote 1 greift nicht, R 30 bleibt
- GK 2 + Reihenhaus → Fußnote 2 reduziert Punkt 3.1 auf REI 60
- GK 2 + Büro + 2 Betriebseinheiten → Fußnote 3 reduziert Punkt 4.5 auf R 60
- GK 2 + Büro + 3 Betriebseinheiten → Fußnote 3 greift nicht, REI 60 bleibt
- GK 5 + >6 Geschoße → korrekte Werte aus rechter Spalte

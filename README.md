# Grid.legal

Ein UI/UX-Prototyp, der Wiener Architekt:innen auf einen Blick zeigt, welche
Bauvorschriften (Bauordnung Wien, künftig OIB-Richtlinien) für ein konkretes
Bauvorhaben gelten. Drei Fragen beantworten → Regeln sehen.

> **Stand: April 2026.** Funktionale Regel-Engine mit 129 Rechtssätzen aus
> BO Wien Teil I (§§ 1–8, Stadtplanung). Weitere Gesetzestexte folgen.

---

## Was das Tool heute kann

- **Landing** → kurze Erklärung + „Neues Projekt starten".
- **Wizard** → 13 Pflichtfragen und bis zu 5 bedingte Folgefragen
  (Betten, Bewohner, Verkaufsfläche, Versammlungsfläche, Sicherheitskategorie).
- **Ergebnisseite** mit drei austauschbaren Ansichten:
  - **View A — Nachschlagen**: Regeln sortiert nach juristischer Struktur
    (Hauptkategorien A–I fest, Unterkategorien werden zur Laufzeit aus dem
    `thema`-Feld jedes Rechtssatzes aggregiert — z.B.
    `brandverhalten-fassade-wdvs` → „Brandverhalten · Fassade WDVS").
  - **View B — Architekten-Dashboard**: sortiert nach räumlichem Maßstab
    (Städtebau → Baukörper → Geschoss …) und gefiltert nach Planungsphase
    (Vorentwurf → Entwurf → Genehmigung → Ausführung). Die Regeln pro
    Kategorie werden per OpenAI-Call (gpt-4o-mini) zu thematischen Blöcken
    (z. B. „Brandschutz im Treppenhaus") + Kennzahlen-Übersicht verdichtet —
    ausschließlich projekt-spezifisch, keine Grundsatz-Aussagen.
  - **View C — Chat**: LLM-gestützter Dialog (gpt-4o-mini, Streaming).
    Antwortet projekt-spezifisch aus den per `filterAlleRegeln(params)`
    gefilterten Rechtssätzen, markiert pro Aussage, ob sie aus der
    Datenbasis oder aus Modellwissen stammt, und stellt bei Bedarf
    Rückfragen. Output kann Tabelle, Liste, Kennzahl oder Fließtext sein.

**Datenbestand heute:** BO Wien Teil I, Fassung 11.03.2026 — 129 Rechtssätze
aus §§ 1–8 („Stadtplanung": Planungsinstrumente, Widmungen, Sonderzonen,
Bausperren). Die Rechtssätze sind in drei Hauptkategorien einsortiert:
**H — Bauplatz & Bebauung** (73), **I — Verfahren & Ausführung** (38) und
**F — Energie & Wärmeschutz** (18). Die übrigen Kategorien (A–E, G) sind im
UI angelegt, aber noch leer.

---

## Tech-Stack

- **Vite 5** als Build-Tool und Dev-Server (kein Webpack, kein Next.js).
- **React 18** mit **TypeScript** im `strict`-Modus.
- **Tailwind CSS 3** mit eigenen Design-Tokens in `tailwind.config.ts`.
- **Framer Motion** für alle Animationen (Seitenübergänge, Pills, Karten).
- **Lucide React** für Icons, **React Router 6** für Routing.
- **Keine Backend-Abhängigkeiten.** Alle Regel-Daten sind statische JSON-Dateien,
  die zur Build-Zeit importiert werden.
- **OpenAI API** (gpt-4o-mini) für die Aufbereitung von View B. Direkter
  `fetch`-Call vom Browser — kein SDK, kein Proxy. Key kommt aus `.env`.

---

## Schnellstart (für Einsteiger)

### Voraussetzungen

Node.js 18 oder neuer. Prüfen:

```bash
node --version
```

Falls nicht installiert: `brew install node` oder von
[nodejs.org](https://nodejs.org) herunterladen.

### 1. Abhängigkeiten installieren (einmalig)

```bash
npm install
```

Lädt alle Bibliotheken nach `node_modules/`. Dauert 1–2 Minuten.

### 2. OpenAI-API-Key eintragen (einmalig)

View B ruft die OpenAI-API auf, um die Regeln pro Kategorie zu verdichten.
Dafür ist ein Key nötig:

1. `.env.example` nach `.env` kopieren (falls `.env` noch nicht existiert).
2. In `.env` den eigenen Key eintragen:
   ```
   VITE_OPENAI_API_KEY=sk-...
   ```

> **Sicherheitshinweis.** Alle `VITE_*`-Variablen landen im Browser-Bundle
> und sind damit öffentlich einsehbar. Für Dev/Demo ok, **nicht für
> Produktion**. In Produktion gehört der Key hinter einen Backend-Proxy.
> `.env` ist via `.gitignore` vom Commit ausgeschlossen.

Wenn kein Key gesetzt ist, bleibt View A / View C voll funktional; nur in
View B erscheint pro Kategorie eine Fehlermeldung mit Retry-Button.

### 3. Entwicklungs-Server starten

```bash
npm run dev
```

Der Browser öffnet automatisch `http://localhost:5173` (Vite nimmt Port 5174,
falls 5173 belegt ist). Änderungen an Dateien erscheinen sofort — kein
Neuladen nötig. Stoppen mit `Ctrl + C`.

> **Achtung:** Vite liest die `.env` nur beim Start ein. Nach Änderungen am
> Key Server stoppen (`Ctrl+C`) und erneut `npm run dev` starten.

### 4. Produktions-Build (optional)

```bash
npm run build
```

Erzeugt den Ordner `dist/` mit optimierten Dateien für Deployment.
TypeScript wird dabei streng geprüft (`tsc -b`).

---

## Wie klicke ich durch den Prototyp?

1. **Landing** (`/`) → auf **„Neues Projekt starten"** klicken.
2. **Wizard** (`/wizard`) → Schritt für Schritt 13 Fragen beantworten
   (Hauptnutzung, Widmung, Bauklasse, Gebäudeklasse, Bauweise, Geschosse,
   Fluchtniveau, Grenzabstand, Fluchtlinie, Schutzzone, Bebauungsplan,
   Neubau/Bestand). Je nach Hauptnutzung erscheint eine bedingte Zusatzfrage
   (z.B. Verkaufsfläche bei „Verkaufsstätte"). Unten „Weiter" / am Ende
   „Vorschriften anzeigen".
3. **Ergebnisseite** (`/ergebnisse`) → oben sticky die Parameter-Pills
   deiner Wizard-Antworten plus ein Toggle **A / B / C**. Rechts oben
   **„Parameter ändern"** führt dich zurück in den Wizard — deine Antworten
   bleiben erhalten.
   - In **View A** Kategorie anklicken → Regel anklicken → Original-Zitat,
     Hinweise und Querverweise einblenden.
   - In **View B** zuerst eine **Planungsphase** wählen. Pro Kategorie wird
     **einmal** ein OpenAI-Call gestartet (Ladezustand: graue Skeleton-Blöcke).
     Ergebnis wird in-memory gecacht; solange sich die Wizard-Antworten nicht
     ändern, gibt es keine weiteren Calls.
   - In **View C** eine Frage tippen oder eines der Vorschlag-Chips
     auswählen — das Tool ruft die OpenAI-API mit den projekt-relevanten
     Regeln als Kontext auf, streamt die Antwort live (Tabelle, Liste,
     Kennzahl oder Fließtext) und markiert pro Aussage, ob sie aus der
     Datenbasis (klickbar → Original-Zitat) oder aus Modellwissen stammt.

---

## Projektstruktur

```
GridUI/
├── README.md                       Diese Datei
├── package.json                    Abhängigkeiten + npm-Skripte
├── vite.config.ts                  Vite-Konfiguration, Alias "@/" → src/
├── tsconfig.json                   TypeScript-Einstellungen (strict)
├── tailwind.config.ts              Design-Tokens (Farben, Radien, Fonts)
├── postcss.config.js               Tailwind-Pipeline
├── index.html                      HTML-Einstiegspunkt
├── .env                            OpenAI-Key (lokal, via .gitignore ignoriert)
├── .env.example                    Vorlage mit Sicherheitshinweis
├── .gitignore                      Ignoriert node_modules, dist, .env
├── Datenbasis/                     Roh-JSONs + Skripte zur Aufbereitung
├── Pläne Kategoriestrukturen/      Konzept-Dokumente (nicht Teil des Builds)
└── src/
    ├── main.tsx                    App-Startpunkt, ruft runDevChecks() auf
    ├── App.tsx                     Router: / → Landing, /wizard, /ergebnisse
    ├── vite-env.d.ts               Vite-Typen + Typing für VITE_OPENAI_API_KEY
    │
    ├── pages/
    │   ├── LandingPage.tsx         Startseite
    │   ├── WizardPage.tsx          Frage-Flow
    │   └── ResultsPage.tsx         Ergebnisseite mit View-Toggle
    │
    ├── components/
    │   ├── Shell.tsx               Gemeinsamer Rahmen (Header/Footer)
    │   ├── wizard/                 ParameterPill · ProgressBar · WizardStep
    │   ├── viewA/                  CategoryAccordion · RuleRow · RuleDetail
    │   ├── viewB/                  PhaseSelector · ScaleCategory · MetricCard
    │   │                           LLMCategoryContent · LLMBlock · LLMKennzahlenGrid
    │   │                           (DecisionCard noch im Repo, aber nicht mehr verwendet)
    │   ├── viewC/                  ChatInput · ChatMessage · ChatSuggestions
    │   │                           ChatBlockRenderer · ChatTabelle · ChatRueckfrage
    │   │                           ProvenanceBadge · QuellenPopover
    │   └── shared/                 Badge · ViewToggle · MotionReveal
    │
    ├── hooks/
    │   ├── useLLMSummary.ts        React-Hook: lädt LLM-Zusammenfassung pro Kategorie
    │   └── useChat.ts              React-Hook: hält Konversation + ruft Streaming-Service auf
    │
    ├── state/
    │   └── ProjektContext.tsx      React-Context für die Wizard-Antworten
    │
    ├── data/
    │   ├── wizardQuestions.ts      Alle Wizard-Fragen in einem Array
    │   ├── categoriesViewA.ts      Stamm der 9 Hauptkategorien A–I
    │   ├── categoriesViewB.ts      9 räumliche Kategorien (Städtebau …)
    │   ├── phases.ts               4 Planungsphasen
    │   ├── chatScenarios.ts        (Legacy — Keyword-Szenarien, aktuell leer; wird vom LLM-Chat ersetzt)
    │   │
    │   ├── gesetzestexte/          Rohe JSON-Dateien (eine pro Teil/Richtlinie)
    │   │   ├── bo-wien-teil-01.json
    │   │   └── oib-rl-2-tab1a.json
    │   │
    │   └── rules/                  Adapter je Quelle + zentrale Registry
    │       ├── boWienTeil1.ts      5-Zeilen-Adapter (typisiert das JSON)
    │       ├── oibRl2Tab1a.ts      5-Zeilen-Adapter (typisiert das JSON)
    │       └── sources.ts          Registry aller aktiven Quellen
    │
    ├── lib/
    │   ├── types.ts                ProjektParameter, Regel, Phase, Kategorien
    │   ├── cn.ts                   className-Helfer für Tailwind
    │   ├── filter.ts               Dünner Wrapper um rules/index.ts (UI-API)
    │   │
    │   ├── rules/                  Quellenunabhängige Regel-Engine (Pipeline v2)
    │   │   ├── schema.ts           JSON-Schema-Typen (Rechtssatz, Bedingung …)
    │   │   ├── engine.ts           pruefeBedingung · waehleVariante · mapZuRegel
    │   │   ├── mapping.ts          Parameter-Aliase + ViewB-Mapping-Tabelle
    │   │   ├── parameterRegistry.ts  Gültige Parameter + Dev-Warnungen
    │   │   ├── validate.ts         Schema-Check beim App-Start (nur Dev)
    │   │   ├── devChecks.ts        Orchestriert validate + Chat-Szenario-Guard
    │   │   └── index.ts            Öffentliche API (filterAlleRegeln …)
    │   │
    │   └── llm/                    OpenAI-Integration für View B + View C
    │       ├── systemPrompt.ts     System-Prompt für View B (Kategorie-Summaries)
    │       ├── types.ts            LLMBlock · LLMKennzahl · LLMSummary (View B)
    │       ├── llmSummaryService.ts View B: fetch-Call (komplette Antwort)
    │       ├── cache.ts            View B: In-Memory-Cache pro Kategorie
    │       ├── chatPrompt.ts       System-Prompt für View C (Chat, Provenance)
    │       ├── chatTypes.ts        ChatBlock · Provenance · ChatNachricht (View C)
    │       ├── chatService.ts      View C: streameChatAntwort() (SSE, AsyncGenerator)
    │       └── streamParser.ts     View C: inkrementeller JSON-Parser für Streaming
    │
    └── styles/
        └── globals.css             Tailwind-Imports, Fonts, Basis-Styles
```

---

## Datenpipeline: Wie wird aus JSON eine Regel in der UI?

Der ganze Regel-Teil ist absichtlich in **zwei Schichten** geteilt:

```
┌─ src/data/ ──────────────────────────────┐   ┌─ src/lib/rules/ ─────────────────────┐
│                                          │   │                                      │
│  gesetzestexte/bo-wien-teil-01.json      │   │  schema.ts   (Datentypen)            │
│           │                              │   │  engine.ts   (Filter / Varianten)    │
│           ▼                              │   │  mapping.ts  (ViewB + Alias)         │
│  rules/boWienTeil1.ts  ─ typisiert ────► │   │  parameterRegistry.ts                │
│           │                              │   │  validate.ts (Dev-Warnungen)         │
│           ▼                              │   │  index.ts    (öffentliche API)       │
│  rules/sources.ts      ← Registry ──────►│   │                                      │
│                                          │   └──────────┬───────────────────────────┘
└──────────────────────────────────────────┘              │
                                                          ▼
                                             filterAlleRegeln(params)
                                             rechtssatzById(id)
                                             buildViewAStruktur()
                                             datenstandInfo()
                                                          │
                                                          ▼
                                             ViewA · ViewB · ViewC · Header-Note
```

**Schritt für Schritt:**

1. Jede Rechtsquelle ist **eine einzige JSON-Datei** unter
   `src/data/gesetzestexte/` im Schema v0.3 (v0.2 wird aus Kompatibilität
   noch akzeptiert).
2. Ein **Adapter** in `src/data/rules/` importiert die JSON und castet sie
   auf den Schema-Typ — 5 Zeilen, keine Logik.
3. Die **Registry** `src/data/rules/sources.ts` listet alle Adapter mit
   Metadaten (ID, Kurzlabel für Badges, `aktiv`-Flag).
4. Die **Engine** in `src/lib/rules/engine.ts` ist quellenunabhängig. Sie
   prüft Bedingungen gegen die Wizard-Antworten (`ProjektParameter`), wählt
   bei Rechtssätzen mit Varianten automatisch die passende aus (z.B. eine
   bauklassen- oder widmungsabhängige Anforderung) und mappt jeden Rechtssatz
   auf den App-internen `Regel`-Typ.
5. Die UI (ViewA/B/C, Header-Note) greift ausschließlich auf die
   **öffentliche API** in `src/lib/rules/index.ts` zu:
   - `filterAlleRegeln(params)` — alle passenden Regeln über alle Quellen.
   - `rechtssatzById(id)` — Einzelabfrage für View C.
   - `buildViewAStruktur()` — Hauptkategorien A–I plus dynamisch
     aggregierte Unterkategorien aus dem `thema`-Feld der tatsächlich
     geladenen Rechtssätze (Details siehe Abschnitt unten).
   - `datenstandInfo()` — Liste aller aktiven Quellen für die Header-Note.

---

## View A: Wie entstehen die Unterkategorien?

Die 9 Hauptkategorien A–I sind in `src/data/categoriesViewA.ts` fest
verdrahtet. Die Unter-Ebene innerhalb jeder Hauptkategorie wird aber
**zur Laufzeit aus den Daten gebaut** — keine Pflege in einer
Mapping-Tabelle nötig.

**Eingabe:** Jeder Rechtssatz im JSON hat ein optionales Feld `thema`
als kebab-case-Slug, z.B. `"brandverhalten-fassade-wdvs"` oder
`"fluchtwege-treppenhaus"`.

**Ablauf** (`src/lib/rules/index.ts:72` — `buildViewAStruktur()`):

1. Alle aktiven, nicht-entfallenen Rechtssätze durchlaufen.
2. Pro `hauptkategorie` eine Map `themaSlug → Anzahl` aufbauen.
3. Jeden Slug via `formatThemaLabel()` aus `src/lib/thema.ts` in ein
   Label umwandeln:
   - am `-` splitten, jedes Segment kapitalisieren.
   - Akronyme (`WDVS`, `BROOF`, `OIB`, `HWB`, `PEB`) bleiben
     großgeschrieben.
   - das erste Segment wird zum Oberthema, der Rest folgt nach `·`.
   - Beispiel: `brandverhalten-fassade-wdvs` →
     `Brandverhalten · Fassade WDVS`.
4. Sortierung der Unterkategorien: regelreichstes Thema zuerst, bei
   Gleichstand alphabetisch.

**Konsequenzen für die Datenpflege:**

- Rechtssätze **ohne** `thema`-Feld erzeugen keine Unterkategorie und
  tauchen damit in View A nicht auf — beim JSON-Import also auf das
  Feld achten.
- Soll ein neues Akronym groß bleiben (z.B. `BIM`, `PV`), in der Liste
  `ACRONYMS` in `src/lib/thema.ts` ergänzen.
- Eine Unterkategorie umzubenennen heißt: den Slug im JSON ändern
  (z.B. via Datenaufbereitungs-Skript) — nicht den Code.

---

## View B: LLM-Aufbereitung

View B verdichtet die gefilterten Regeln pro räumlicher Kategorie per
OpenAI-Call zu **thematischen Blöcken + Kennzahlen**. Ablauf:

```
ProjektParameter ─┐
                  ▼
filterAlleRegeln(params) ──► Regel[] ──► useLLMSummary(kat, regeln)
                                                │
                                                ▼ (Cache-Miss)
                                 erstelleLLMZusammenfassung(...)
                                                │ fetch
                                                ▼
                                 api.openai.com/v1/chat/completions
                                 (gpt-4o-mini, response_format: json_object)
                                                │
                                                ▼
                                 LLMSummary { bloecke[], kennzahlen[] }
                                                │
                                                ▼
                                 <LLMCategoryContent /> rendert
                                 LLMKennzahlenGrid + LLMBlock[]
```

**Wichtige Bausteine:**

- **`src/lib/llm/systemPrompt.ts`** — der System-Prompt lebt isoliert, damit
  er ohne Touch am Service-Code iterativ geschärft werden kann. Er zwingt
  das Modell zu projekt-spezifischen Aussagen (keine „Grundsätzlich gilt …")
  und auf das vorgegebene JSON-Schema.
- **`src/lib/llm/llmSummaryService.ts`** — schlanker `fetch`-Wrapper gegen
  die OpenAI-API. Nutzt `response_format: { type: 'json_object' }` und
  validiert die Antwort vor der Rückgabe (keine leeren Blöcke/Kennzahlen).
  Kein SDK, damit das Browser-Bundle klein bleibt.
- **`src/lib/llm/cache.ts`** — Module-Scope-`Map` mit Key aus Kategorie-ID,
  sortierten Regel-IDs und serialisierten Parametern. Jede Wizard-Änderung
  erzeugt automatisch einen neuen Key → Cache-Miss → neuer Call.
- **`src/hooks/useLLMSummary.ts`** — React-Hook, der genau einmal pro
  (Kategorie + Params + Regel-Set) feuert. Erst den Cache prüfen, dann bei
  Miss asynchron laden. Rückgabe: `{ summary, loading, error, reload }`.
- **`src/components/viewB/LLMCategoryContent.tsx`** — kapselt Loading-,
  Error- und Success-State pro Kategorie und rendert `LLMKennzahlenGrid`
  + `LLMBlock[]`. Wird in `ScaleCategory.tsx` anstelle der früheren
  `DecisionCard[]`-Liste verwendet.

**Trigger:** Der Hook feuert beim ersten Mount, wenn nichts im Cache liegt,
und erneut, sobald sich `ProjektParameter` oder das Regel-Set ändern.
Anschließend liegt das Ergebnis im Speicher und Tab-/Re-Rendern löst
keinen neuen Call aus.

**Fehlerbehandlung:** Fehlt der Key oder scheitert der Call, rendert die
Kategorie einen kleinen Fehler-Block mit `Erneut versuchen`-Button
(`reload()`). Die anderen Views (A, C) sind davon nicht betroffen.

**Kosten-/Rate-Hinweis:** Pro Wizard-Durchlauf werden bis zu 9 parallele
OpenAI-Calls gestartet (ein Call pro Kategorie mit Regeln). Bei großen
Kategorien (z. B. „Städtebau" mit ~70 Rechtssätzen) kann eine Antwort
10–30 Sekunden brauchen.

---

## View C: LLM-Chat

View C ist ein dialogfähiger Chat, der Fragen direkt aus den **für dein
Projekt geltenden Vorschriften** beantwortet. Anders als View B verdichtet
er nicht eine ganze Kategorie auf einmal, sondern reagiert auf konkrete
Fragen — und kennzeichnet pro Aussage, ob sie aus der Datenbasis stammt
oder aus dem Allgemeinwissen des Sprachmodells.

```
ProjektParameter ──► filterAlleRegeln(params) ──┐
                                                 ▼
       Konversations-Verlauf ──► useChat() ──► streameChatAntwort()
                                                 │ fetch(stream:true)
                                                 ▼
                                  api.openai.com/v1/chat/completions
                                  (gpt-4o-mini, response_format: json_object)
                                                 │ SSE-Chunks
                                                 ▼
                                       ChatStreamParser
                                  (extrahiert fertige Bloecke + rueckfrage)
                                                 │ live
                                                 ▼
                                  <ChatBlockRenderer />
                                  (Prosa · Tabelle · Liste · Kennzahl · Hinweis)
```

**Was der Chat liefert** (Antwort-Schema in `src/lib/llm/chatTypes.ts`):

- **Block-Typen**: `prosa` (Markdown-Inline), `tabelle` (Spalten + Zeilen),
  `liste` (geordnet/Bullet), `kennzahl` (Label + Wert + Einheit),
  `hinweis` (redaktionell, in info/warnung).
- **Provenance-Marker pro Block**:
  - `datenbasis` (grün) — die Aussage stützt sich auf gelistete
    `regelIds` aus den im Prompt mitgegebenen Rechtssätzen. Klick auf
    den Marker öffnet die Quellenliste; jede Quelle hat einen Toggle
    für das Originalzitat (gleicher Mechanismus wie View A).
  - `modell` (blau-soft) — Hintergrundwissen aus dem Sprachmodell. Hat
    eine sichtbare Begründung, warum es ergänzt wurde. Gilt explizit
    nicht als juristische Quelle.
  - `web` (orange, **Phase 2**) — externe Recherche; aktuell nicht
    aktiv.
- **Rückfragen**: Statt zu raten kann das Modell eine `rueckfrage`
  zurückgeben (eigene Bubble im Akzent-Stil), wenn die Frage zu vage
  ist oder ein Aspekt fehlt.

**Wichtige Bausteine:**

- **`src/lib/llm/chatPrompt.ts`** — der System-Prompt für den Chat,
  isoliert vom View-B-Prompt. Erzwingt Provenance pro Block und das
  oben beschriebene JSON-Schema.
- **`src/lib/llm/chatService.ts`** — `streameChatAntwort()` als
  AsyncGenerator. Schickt System-Prompt, Verlauf (max. 10 letzte
  Turns), Projekt-Parameter und die per `filterAlleRegeln(params)`
  vorgefilterten Rechtssätze an OpenAI mit `stream: true`.
- **`src/lib/llm/streamParser.ts`** — `ChatStreamParser` puffert die
  SSE-Chunks und erkennt stringbewusst (Klammer-Tiefe, Escape), wann
  ein Block-Objekt komplett geschrieben ist. So kann die UI fertige
  Blöcke rendern, während der Stream weiterläuft.
- **`src/hooks/useChat.ts`** — verbindet `useProjekt()` mit dem Service.
  Hält `nachrichten[]`, `loading`, einen `AbortController` und stellt
  `sende() / abbrechen() / neuesGespraech()` bereit.
- **`src/components/viewC/ChatBlockRenderer.tsx`** — Render-Switch über
  die Block-Typen. Nutzt `react-markdown` + `remark-gfm` für
  Prosa-Inline-Markdown.
- **`src/components/viewC/QuellenPopover.tsx`** — klappt nach Klick auf
  einen Datenbasis-Marker auf und zeigt Fundstelle, Headline und
  Original-Zitat-Toggle pro zitierter Regel.

**Kontext-Strategie:** Der Chat sieht **nur die projekt-relevanten
Regeln** (typisch 30–60 statt 129) — kostengünstiger und fokussierter.
Fragen außerhalb des Projekt-Scopes weist das Modell zurück oder
beantwortet sie als `modell`-Block mit klarer Markierung.

**Streaming:** Antworten erscheinen Wort für Wort (wie ChatGPT/Claude).
Während des Streams ist der Senden-Button durch einen Stop-Button
ersetzt; ein Klick bricht den Stream ab und die bis dahin empfangenen
Blöcke bleiben sichtbar.

**Fehlerbehandlung:** Fehlt der Key oder scheitert der Call, zeigt die
Bubble einen kleinen Fehler-Block. View A und View B sind davon nicht
betroffen.

**Kosten:** Pro Frage gehen System-Prompt + Verlauf (max. 10 Turns) +
Parameter + ~30–60 Rechtssätze raus. Die Antwort streamt in JSON; ein
typischer Turn liegt unter 5.000 Output-Tokens.

---

## Neuen Gesetzestext hinzufügen

Im Normalfall reichen drei Handgriffe — **kein neuer Engine-Code, kein
UI-Edit**:

### 1. JSON ablegen

```
src/data/gesetzestexte/oib-rl-2.json
```

Die Datei muss Schema v0.3 entsprechen (siehe `src/lib/rules/schema.ts` für
die genaue Struktur, und `bo-wien-teil-01.json` als Referenz).

### 2. Adapter daneben (5 Zeilen)

```ts
// src/data/rules/oibRl2.ts
import oibRl2Json from '@/data/gesetzestexte/oib-rl-2.json'
import type { GesetzestextDatei } from '@/lib/rules/schema'

export const oibRl2 = oibRl2Json as unknown as GesetzestextDatei
```

### 3. In die Registry eintragen

```ts
// src/data/rules/sources.ts
import { oibRl2 } from '@/data/rules/oibRl2'

export const quellen: GesetzesQuelle[] = [
  // … bestehende Einträge
  {
    id: 'oib-rl-2',
    label: 'OIB-Richtlinie 2 — Brandschutz',
    kurzLabel: 'OIB-RL 2',
    quelleTyp: 'oib',
    aktiv: true,
    rechtssaetze: oibRl2.rechtssaetze,
    meta: oibRl2.meta,
  },
]
```

Sofort sichtbar:
- Die Regeln erscheinen in View A unter ihrer Hauptkategorie (z.B. „B —
  Brandschutz"). Neue Unterkategorien (Slugs im Feld `thema`, z.B.
  `fluchtwege-treppenhaus`) werden automatisch zu
  „Fluchtwege · Treppenhaus" aggregiert — siehe Abschnitt
  „View A: Wie entstehen die Unterkategorien?".
- Die Header-Note listet die neue Quelle neben „BO Wien Teil I".
- Jede Regel bekommt das Quelle-Badge („OIB-RL 2") in ViewA und ViewB.

### Wenn neue Parameter im JSON auftauchen

Falls die neuen Bedingungen einen Parameter referenzieren, den es noch
nicht gibt (z.B. `brandabschnitt_flaeche`), zwei Stellen anfassen:

1. **`src/lib/rules/parameterRegistry.ts`** — Eintrag ergänzen (Name,
   erlaubte Werte, Wizard-Feld-Zuordnung).
2. **`src/data/wizardQuestions.ts`** — passende Wizard-Frage anlegen
   (und ggf. `ProjektParameter` in `src/lib/types.ts` erweitern).

### Wenn neue Unterkategorien neu im ViewB-Mapping sind

Betrifft **nur View B** (räumliche Kategorie). Wenn ein
`unterkategorie`-Präfix (z.B. `B.05`) in `src/lib/rules/mapping.ts`
noch keinen räumlichen Ziel-Eintrag hat, ergänze eine Zeile — sonst fällt
das Mapping auf `'staedtebau'` zurück.

Für **View A** ist hier nichts zu tun: die Unterkategorien dort kommen
ausschließlich aus dem Feld `thema` und werden ohne Mapping aggregiert.

---

## Dev-Checks: Wenn die Konsole warnt

Beim App-Start läuft `runDevChecks()` (nur im Dev-Modus, siehe
`src/lib/rules/devChecks.ts`). Typische Warnungen:

| Meldung | Bedeutung | Wo fixen? |
|---|---|---|
| `meta.schema_version fehlt` oder `unbekannte schema_version` | JSON-Kopf stimmt nicht mit v0.2/v0.3 überein | JSON-Datei im `meta`-Block anpassen |
| `unbekannte hauptkategorie "X"` | JSON verwendet eine Kategorie außerhalb A–I | JSON korrigieren |
| `Unterkategorie "X.XX" fehlt im ViewB-Mapping → Fallback 'staedtebau'` | ViewB zeigt die Regel unter „Städtebau" statt der intendierten Kategorie | Zeile in `src/lib/rules/mapping.ts` ergänzen |
| `Parameter "X" in Bedingung ist nicht im parameterRegistry registriert` | Tippfehler im JSON **oder** echter neuer Parameter | JSON korrigieren, oder `parameterRegistry.ts` + passende Wizard-Frage ergänzen |
| `[rules:chat] N Chat-Szenario-IDs zeigen auf unbekannte Rechtssätze` | Eine `regelIds`-ID in `chatScenarios.ts` findet keinen Rechtssatz | ID im Szenario korrigieren oder den Rechtssatz ergänzen |

Ohne Warnungen meldet die Konsole `[rules:validate] <id> ok`.

---

## Design-Prinzipien

- **Wenig Farbe.** Hauptsächlich Schwarz/Weiß + 4 Grautöne. Ein dezentes
  Blau als Akzent. Status-Badges in gedämpften Pastelltönen.
- **Schrift.** Inter (Text) + JetBrains Mono (Zahlen, Paragrafen-Referenzen).
  Beide via Google Fonts geladen.
- **Viel Weißraum.** Großzügige Abstände, viel Luft.
- **0,5-px-Rahmen** statt 1 px — subtiler, näher an Apple-Ästhetik.
- **Motion.** Sanfte Ease-Out-Übergänge (200–350 ms). Inhalte gleiten und
  faden ein, keine Ruckler.

---

## Troubleshooting

- **`command not found: npm`** → Node.js nicht installiert. Siehe
  Voraussetzungen.
- **Browser öffnet sich nicht** → manuell `http://localhost:5173` aufrufen.
- **Port belegt (`EADDRINUSE`)** → anderer Prozess auf 5173. Entweder mit
  `lsof -i :5173` finden und stoppen, oder Vite wählt automatisch 5174.
- **Weißer Bildschirm** → Browser-Konsole (F12 / Cmd+Option+I) öffnen und
  nach Fehlern suchen.
- **Keine Regeln sichtbar, obwohl Wizard beantwortet** → Browser-Konsole
  prüfen, ob `[rules:validate]`-Warnungen zeigen, dass eine Quelle gar
  nicht sauber geladen wurde.
- **Chat-Karte fehlt / zeigt leere Regel** → wahrscheinlich eine
  `regelId` in `src/data/chatScenarios.ts`, die keinen Rechtssatz mehr
  trifft (Dev-Console zeigt diese Mismatches beim Start an).
- **View B bleibt im Loading-Zustand** → Dev-Server nach `.env`-Änderung
  neu starten. Network-Tab (F12 → Network) auf `completions` filtern:
  `(pending)` = Call läuft noch (bis zu 30 s warten), `401/403` = Key
  ungültig, `429` = Rate-Limit. `(canceled)` ist im Dev-Modus wegen React
  StrictMode normal und harmlos.
- **View B zeigt „LLM-Zusammenfassung fehlgeschlagen"** → Fehlertext lesen.
  Häufig: Key fehlt in `.env`, Key abgelaufen, oder OpenAI-Quota leer.

---

## Datenstand & Roadmap

**Heute** (April 2026):
- BO Wien Teil I „Stadtplanung" (§§ 1–8, Fassung 11.03.2026) — 129
  Rechtssätze, verteilt auf Hauptkategorien H (73), I (38) und F (18).
- Chat-Szenarien: **aktuell keine** — die alten Szenarien bezogen sich auf
  Teil 8 (§§ 75–86) und wurden beim Quellen-Wechsel entfernt. Neue
  Szenarien für Teil I sind noch zu erstellen (siehe `chatScenarios.ts`).

**Geplant**:
- Weitere Teile der BO Wien (Teile 2–12, inkl. Teil 8 „Bauliche
  Ausnützbarkeit" der früher geladen war).
- OIB-Richtlinien 1–6 (Tragwerk, Brandschutz, Hygiene, Nutzungssicherheit,
  Schallschutz, Energie). OIB-RL 2 Tabelle 1a ist bereits aktiv.
- Neue Chat-Szenarien für Teil I und pro weitere hinzukommende Quelle.
- Systemprompt für die View-B-LLM-Aufbereitung iterativ schärfen (siehe
  `src/lib/llm/systemPrompt.ts`).

**Explizit nicht geplant** (Prototyp-Scope):
- Backend / API — alle Regel-Daten bleiben statisch. Der OpenAI-Call in
  View B läuft direkt vom Browser, für Produktion wäre ein Proxy nötig.
- Projekt-Persistenz, Export als PDF/Excel, Multi-Projekt-Management.

---

## Glossar (für Einsteiger)

- **Wizard** — Die Fragestrecke am Anfang. Antworten landen im
  `ProjektContext` und steuern die Filter.
- **Rechtssatz** — Ein einzelner Absatz / Ziffer aus einem Gesetzestext mit
  ID, Headline, Erklärung, Originaltext und Bedingungen. Die Rohform im JSON.
- **Regel** — Die App-interne, aufbereitete Fassung eines Rechtssatzes:
  mit aufgelöster Variante, abgeleitetem Status und Quellenangabe. Wird in
  der UI angezeigt.
- **Bedingung** — Kleine Prüfung im JSON, z.B. `bauklasse ist BK_III`. Alle
  Bedingungen müssen zutreffen, damit eine Regel angezeigt wird.
- **Variante** — Mehrere alternative Formulierungen/Werte innerhalb
  desselben Rechtssatzes (z.B. Gebäudehöhe je Bauklasse). Die Engine wählt
  die passende automatisch anhand der Wizard-Antworten.
- **Hauptkategorie A–I** — Juristisches Gerüst (Tragwerk, Brandschutz …),
  fest verdrahtet in `categoriesViewA.ts`.
- **Unterkategorie (View A)** — Wird zur Laufzeit aus dem `thema`-Slug
  am Rechtssatz aggregiert (z.B. `brandverhalten-fassade-wdvs` →
  „Brandverhalten · Fassade WDVS"). Das ältere Feld `unterkategorie`
  (z.B. `H.02`) wird im Schema noch mitgeführt, steuert aber nur das
  ViewB-Mapping in `src/lib/rules/mapping.ts`.
- **Quelle** — Ein Gesetzestext als Einheit (z.B. „BO Wien Teil I").
  Erscheint in Badges und in der Header-Note.
- **Registry** — `src/data/rules/sources.ts`: die einzige Stelle, an der
  steht, welche Quellen aktiv sind.
- **Adapter** — Mini-Datei pro Quelle in `src/data/rules/`, die das JSON
  typisiert importiert. Enthält keine Logik.
- **Engine** — Der quellenunabhängige Logik-Teil in `src/lib/rules/engine.ts`.
  Weiß nichts über konkrete Gesetze, arbeitet nur auf Schema-Typen.
- **LLM-Block** — Ein vom Sprachmodell erzeugter thematischer Abschnitt in
  View B (z. B. „Höhenbeschränkung durch Bauklasse"). Fasst mehrere Regeln
  in 2–4 Sätzen zusammen und verweist auf die Quell-Regel-IDs.
- **LLM-Kennzahl** — Konkreter Zahlwert, den das Modell aus den Regeln
  rauszieht (z. B. „Max. Gebäudehöhe: 21 m"). Wird als Kachel in View B
  gerendert.
- **Systemprompt** — Die Anweisung an das LLM, wie es Regeln verdichten soll.
  Liegt isoliert in `src/lib/llm/systemPrompt.ts`, damit man ihn ohne
  Service-Code-Änderungen feinjustieren kann.

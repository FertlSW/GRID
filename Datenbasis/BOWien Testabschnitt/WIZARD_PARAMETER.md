# Wizard-Parameter — Grid.legal

Dies ist die Liste aller Parameter, die im Wizard abgefragt werden. Jeder Parameter kann von Rechtssätzen als Bedingung referenziert werden.

---

## Teil A — Parameter aus dem ursprünglichen Briefing

Diese Parameter stammen aus `Output_Struktur1.md` und bleiben unverändert:

### `hauptnutzung`
**Wizard-Frage**: "Welche Hauptnutzung hat das Gebäude?"
**Mögliche Werte**:
- `wohnen`
- `buero`
- `betriebsbau`
- `garage`
- `beherbergung`
- `schule_kindergarten`
- `verkaufsstaette`
- `altersheim`
- `pflegeheim`
- `krankenhaus`
- `versammlungsstaette`
- `landwirtschaft`
- `schutzhuette`
- `gemischt`

### `gebaeudeklasse`
**Wizard-Frage**: "Welche Gebäudeklasse (gemäß OIB) hat das Gebäude?"
**Mögliche Werte**: `gk1`, `gk2`, `gk3`, `gk4`, `gk5`
**Hinweis**: Das ist die **OIB-Gebäudeklasse** (1–5), nicht die **BO-Wien-Bauklasse** (I–VI) — zwei verschiedene Konzepte.

### `oberirdische_geschosse`
**Wizard-Frage**: "Wie viele oberirdische Geschoße hat das Gebäude?"
**Werte**: Ganze Zahl (1, 2, 3, …)

### `unterirdische_geschosse`
**Wizard-Frage**: "Wie viele unterirdische Geschoße hat das Gebäude?"
**Werte**: `keine`, `1`, `2`, `mehr_als_2`

### `fluchtniveau`
**Wizard-Frage**: "Wie hoch liegt das höchste Fluchtniveau?"
**Werte**: `bis_22m`, `bis_32m`, `32_bis_90m`, `ueber_90m`

### `grenzabstand`
**Wizard-Frage**: "Wie groß ist der Abstand zur Nachbargrenze?"
**Werte**: `unter_2m`, `2_bis_4m`, `ab_4m`

### `neubau_oder_bestand`
**Wizard-Frage**: "Handelt es sich um einen Neubau oder eine Bauführung im Bestand?"
**Werte**: `neubau`, `bestand`

---

## Teil B — **Neue Parameter für BO Wien Teil 8**

Diese Parameter ergeben sich aus der Auswertung der BO-Wien-Paragraphen. Ohne sie kann Teil 8 nicht sinnvoll gefiltert werden.

### `bauklasse` *(NEU)*
**Wizard-Frage**: "Welche Bauklasse (gemäß BO Wien) ist im Bebauungsplan festgesetzt?"
**Mögliche Werte**:
- `BK_I` — Bauklasse I (Gebäudehöhe 2,5 – 9 m)
- `BK_II` — Bauklasse II (Gebäudehöhe 2,5 – 12 m)
- `BK_III` — Bauklasse III (Gebäudehöhe 9 – 16 m)
- `BK_IV` — Bauklasse IV (Gebäudehöhe 12 – 21 m)
- `BK_V` — Bauklasse V (Gebäudehöhe 16 – 26 m)
- `BK_VI` — Bauklasse VI (Gebäudehöhe ab 21 m, nach Bebauungsplan)
- `keine` — Keine Bauklasse festgesetzt

**Verwendet in**: § 75 (Gebäudehöhe), § 79 (Abstandsflächen), viele weitere

### `widmung` *(NEU)*
**Wizard-Frage**: "Welche Widmung hat der Bauplatz gemäß Flächenwidmungsplan?"
**Mögliche Werte**:
- `wohngebiet`
- `gemischtes_baugebiet`
- `geschaeftsviertel`
- `betriebsbaugebiet`
- `industriegebiet`
- `gartensiedlungsgebiet`
- `erholungsgebiet`
- `laendliches_gebiet`
- `sondergebiet`

**Verwendet in**: § 75 Abs. 7–8, § 76 Abs. 10–12, § 79, weitere

### `bauweise` *(NEU)*
**Wizard-Frage**: "Welche Bauweise sieht der Bebauungsplan vor?"
**Mögliche Werte**:
- `offen`
- `gekuppelt`
- `offen_oder_gekuppelt`
- `gruppe`
- `geschlossen`
- `nicht_festgesetzt`

**Verwendet in**: § 76 (Bauweisen), § 79 (Abstände bei offener Bauweise)

### `in_schutzzone` *(NEU)*
**Wizard-Frage**: "Liegt der Bauplatz in einer Schutzzone (z.B. Weltkulturerbe, Ensemble-Schutz)?"
**Mögliche Werte**: `ja`, `nein`

**Verwendet in**: § 75 Abs. 6, § 85 (Äußere Gestaltung)

### `bebauungsplan_abweichend` *(NEU)*
**Wizard-Frage**: "Enthält der Bebauungsplan abweichende Festlegungen (z.B. besondere Höhenbeschränkungen, Bauweisen)?"
**Mögliche Werte**: `ja`, `nein`, `unbekannt`

**Hinweis**: Viele BO-Wien-Vorschriften beginnen mit "sofern der Bebauungsplan nicht anderes bestimmt". Wenn der Architekt "ja" angibt, sollte er die Details manuell nachpflegen — das Tool kann dann einen Hinweis anzeigen.

**Verwendet in**: § 75 Abs. 7, § 76 Abs. 10–11, § 85 Abs. 3, viele weitere

### `bauplatz_an_fluchtlinie` *(NEU)*
**Wizard-Frage**: "Wird das Gebäude an der Baulinie, Straßenfluchtlinie oder Verkehrsfluchtlinie errichtet?"
**Mögliche Werte**: `ja`, `nein`, `teilweise`

**Verwendet in**: § 75 Abs. 4, § 81 Abs. 1, § 83 (Bauteile vor der Baulinie)

---

## Teil C — Bedingte Folgefragen (aus Briefing, unverändert)

Diese werden nur gestellt, wenn `hauptnutzung` einen bestimmten Wert hat:

- **Bei `beherbergung`**: `anzahl_gaestebetten` (`bis_30`, `31_bis_100`, `ueber_100`)
- **Bei `altersheim`**: `anzahl_bewohner` (`bis_30`, `31_bis_60`, `ueber_60`)
- **Bei `verkaufsstaette`**: `verkaufsflaeche` (`bis_600`, `601_bis_3000`, `ueber_3000`) [m²]
- **Bei `versammlungsstaette`**: `netto_grundflaeche_vers_raum` (`bis_600`, `601_bis_1600`, `ueber_1600`) [m²]
- **Bei `betriebsbau`**: `sicherheitskategorie` (K1, K2, K3.1, K3.2, K4.1, K4.2)
- **Bei `garage`**: Mehrere Folgefragen zu Nutzfläche, Typ, Fahrzeugtypen

---

## Parameter, die im Teil 8 noch nicht gebraucht werden

Diese sind im Briefing definiert, werden aber erst in späteren Teilen der BO Wien oder in den OIB-Richtlinien relevant:

- Sicherheitskategorie (Betriebsbau)
- Anzahl Gästebetten / Bewohner / Verkaufsfläche
- Garage-Typ und Fahrzeugtypen
- Fluchtniveau (wird für Brandschutz-Routing der OIB-RL 2.3 gebraucht)

Sie stehen im Wizard trotzdem von Anfang an zur Verfügung, damit wir sie bei späteren Teilen nutzen können.

---

## Wie die Bedingungen auf diese Parameter zugreifen

In den JSON-Dateien der Rechtssätze referenzieren Bedingungen die Parameter über ihren Namen:

```json
{
  "parameter": "bauklasse",
  "operator": "ist",
  "wert": "BK_III"
}
```

**Verfügbare Operatoren**:

| Operator | Bedeutung | Beispiel |
|---|---|---|
| `ist` | Genau dieser Wert | `bauklasse ist BK_III` |
| `ist_nicht` | Irgendein anderer Wert | `widmung ist_nicht gartensiedlungsgebiet` |
| `ist_eines_von` | Einer von mehreren Werten | `widmung ist_eines_von [wohngebiet, gemischtes_baugebiet]` |
| `groesser_als` | Zahlenwert > X | `oberirdische_geschosse groesser_als 4` |
| `kleiner_als` | Zahlenwert < X | `grenzabstand kleiner_als 4` |
| `immer` | Immer wahr (keine Einschränkung) | — |

**Verknüpfung mehrerer Bedingungen**: Alle Bedingungen innerhalb einer `bedingungen`-Liste sind mit UND verknüpft. Für ODER-Logik wird der `ist_eines_von`-Operator verwendet.

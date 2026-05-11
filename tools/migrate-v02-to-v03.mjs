#!/usr/bin/env node
// Einmal-Migration v0.2 -> v0.3 für Gesetzestext-JSONs.
// Idempotent durch Schema-Version-Guard. Bleibt im Repo als Doku der Transformation.
//
// Aufruf:
//   node tools/migrate-v02-to-v03.mjs <pfad-zur-datei.json>
//
// Transformationen:
//   META:
//     - schema_version "0.2" -> "0.3"
//     - quelle_typ          (neu, "landesgesetz")
//     - quelle_id           (neu, abgeleitet aus Dateiname)
//     - quelle_titel        (neu, aus quelle + teil_titel)
//     - stand_aufbereitung  (neu, heute)
//   PRO RECHTSSATZ:
//     - Felder löschen: quelle, quelle_kurz, quelle_fassung
//     - raeumliche_kategorie (neu, aus unterkategorie abgeleitet)
//     - anforderung-Typen migrieren (gebaeudehoehe/abstand/flaeche -> grenzwert)
//     - status normalisieren (inhalte_pruefen -> llm_bearbeitet)
//     - querverweise: ref_text -> ref_fundstelle

import fs from 'node:fs'
import path from 'node:path'

const HEUTE_ISO = new Date().toISOString().slice(0, 10)

const KATEGORIE_MAPPING = {
  'H.01': 'staedtebau_grundstueck',
  'H.02': 'baukoerper_volumen',
  'H.03': 'staedtebau_grundstueck',
}
const KATEGORIE_FALLBACK = 'staedtebau_grundstueck'

const ANFORDERUNGS_MAPPING = {
  gebaeudehoehe: { typ: 'grenzwert', kenngroesse: 'gebaeudehoehe' },
  abstand: { typ: 'grenzwert', kenngroesse: 'abstand' },
  flaeche: { typ: 'grenzwert', kenngroesse: 'flaeche' },
}

const STATUS_MAPPING = {
  inhalte_pruefen: 'llm_bearbeitet',
}

function migriereAnforderung(anf) {
  if (!anf || typeof anf !== 'object') return anf
  const mapping = ANFORDERUNGS_MAPPING[anf.typ]
  if (!mapping) return anf
  const { typ: _alt, ...rest } = anf
  return { typ: mapping.typ, kenngroesse: mapping.kenngroesse, ...rest }
}

function migriereRechtssatz(rs) {
  const { quelle, quelle_kurz, quelle_fassung, ...ohneQuellen } = rs

  const raeumliche_kategorie =
    KATEGORIE_MAPPING[ohneQuellen.unterkategorie] ?? KATEGORIE_FALLBACK

  if (ohneQuellen.anforderung) {
    ohneQuellen.anforderung = migriereAnforderung(ohneQuellen.anforderung)
  }

  if (Array.isArray(ohneQuellen.varianten)) {
    ohneQuellen.varianten = ohneQuellen.varianten.map((v) => {
      if (v && v.anforderung) {
        return { ...v, anforderung: migriereAnforderung(v.anforderung) }
      }
      return v
    })
  }

  if (ohneQuellen.status && STATUS_MAPPING[ohneQuellen.status]) {
    ohneQuellen.status = STATUS_MAPPING[ohneQuellen.status]
  }

  if (Array.isArray(ohneQuellen.querverweise)) {
    ohneQuellen.querverweise = ohneQuellen.querverweise.map((q) => {
      if (q && typeof q === 'object' && 'ref_text' in q) {
        const { ref_text, ...restQ } = q
        return { ...restQ, ref_fundstelle: ref_text }
      }
      return q
    })
  }

  return { ...ohneQuellen, raeumliche_kategorie }
}

function migriereMeta(meta, quelleId) {
  const teilTitel = meta.teil_titel ?? ''
  const quelle = meta.quelle ?? ''
  const quelleTitel =
    quelle && teilTitel
      ? `${quelle} — Teil ${meta.teil_nummer}: ${teilTitel}`
      : quelle || teilTitel || quelleId

  return {
    ...meta,
    schema_version: '0.3',
    quelle_typ: 'landesgesetz',
    quelle_id: quelleId,
    quelle_titel: quelleTitel,
    stand_aufbereitung: HEUTE_ISO,
  }
}

function main() {
  const arg = process.argv[2]
  if (!arg) {
    console.error('Aufruf: node tools/migrate-v02-to-v03.mjs <datei.json>')
    process.exit(2)
  }

  const dateiPfad = path.resolve(arg)
  if (!fs.existsSync(dateiPfad)) {
    console.error(`Datei nicht gefunden: ${dateiPfad}`)
    process.exit(2)
  }

  const rohText = fs.readFileSync(dateiPfad, 'utf8')
  let daten
  try {
    daten = JSON.parse(rohText)
  } catch (e) {
    console.error(`JSON-Parsing fehlgeschlagen: ${e.message}`)
    process.exit(2)
  }

  if (!daten?.meta) {
    console.error('Kein meta-Block gefunden — abgebrochen.')
    process.exit(2)
  }

  if (daten.meta.schema_version === '0.3') {
    console.log('Datei ist bereits v0.3 — nichts zu tun.')
    process.exit(0)
  }

  if (daten.meta.schema_version !== '0.2') {
    console.error(
      `Unerwartete schema_version "${daten.meta.schema_version}" — Migration nur ab 0.2.`
    )
    process.exit(2)
  }

  const quelleId = path.basename(dateiPfad, '.json')
  daten.meta = migriereMeta(daten.meta, quelleId)

  if (Array.isArray(daten.rechtssaetze)) {
    daten.rechtssaetze = daten.rechtssaetze.map(migriereRechtssatz)
  }

  fs.writeFileSync(dateiPfad, JSON.stringify(daten, null, 2) + '\n', 'utf8')

  const anzahl = Array.isArray(daten.rechtssaetze) ? daten.rechtssaetze.length : 0
  console.log(`Migration v0.2 -> v0.3 abgeschlossen.`)
  console.log(`  Datei:        ${dateiPfad}`)
  console.log(`  quelle_id:    ${quelleId}`)
  console.log(`  Rechtssätze:  ${anzahl}`)
}

main()

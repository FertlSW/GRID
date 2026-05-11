#!/usr/bin/env node
// Validiert Gesetzestext-JSONs gegen Schema v0.3 + Parameter-Registry.
// Keine externen Abhängigkeiten. Aufruf:
//   node tools/validate.mjs <datei.json>
//   node tools/validate.mjs <verzeichnis>
//   node tools/validate.mjs                (Default: src/data/gesetzestexte/)

import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs'
import { resolve, join, dirname, basename, isAbsolute } from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const REPO_ROOT = resolve(__dirname, '..')
const DEFAULT_TARGET = join(REPO_ROOT, 'src', 'data', 'gesetzestexte')
const REGISTRY_PATH = join(__dirname, 'parameter-registry.json')

const ERLAUBTE_SCHEMA_VERSIONEN = ['0.3']
const ERLAUBTE_QUELLE_TYPEN = ['landesgesetz', 'oib_richtlinie', 'oib_leitfaden', 'verordnung']
const META_PFLICHT = ['quelle_id', 'quelle_titel', 'quelle_kurz', 'quelle_typ', 'fassung', 'stand_aufbereitung']
const ERLAUBTE_HAUPTKATEGORIEN = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I']
const ERLAUBTE_PHASEN = ['vorentwurf', 'entwurf', 'genehmigung', 'ausfuehrung']
const ERLAUBTE_RAEUM_KATEGORIEN = [
  'staedtebau_grundstueck',
  'baukoerper_volumen',
  'erschliessung_vertikal',
  'geschoss_grundriss',
  'bauteile_konstruktion',
  'technik_sonderraeume',
  'aussenraum_verkehr',
  'stellplaetze_garagen',
  'gebaeudehuelle_energie',
]
const ERLAUBTE_STATUS = ['entwurf', 'llm_bearbeitet', 'fachlich_geprueft', 'final']
const OP_EINZEL = ['ist', 'ist_nicht']
const OP_MEHRFACH = ['ist_eines_von', 'ist_keines_von']
const OP_ZAHL = ['groesser_als', 'kleiner_als', 'groesser_gleich', 'kleiner_gleich']
const ALLE_OPERATOREN = [...OP_EINZEL, ...OP_MEHRFACH, ...OP_ZAHL]
const ERLAUBTE_ANFORDERUNGS_TYPEN = ['prosa', 'grenzwert', 'formel', 'klassifizierung']

const useColor = process.stdout.isTTY
const paint = (color, s) => (useColor ? `\x1b[${color}m${s}\x1b[0m` : s)
const green = (s) => paint('32', s)
const yellow = (s) => paint('33', s)
const red = (s) => paint('31', s)
const dim = (s) => paint('2', s)

function main() {
  const argv = process.argv.slice(2)
  const targets = resolveTargets(argv)
  if (targets.length === 0) {
    console.error(red('Keine JSON-Dateien zum Prüfen gefunden.'))
    process.exit(1)
  }

  let registry
  try {
    registry = JSON.parse(readFileSync(REGISTRY_PATH, 'utf8'))
  } catch (err) {
    console.error(red(`Konnte Registry nicht lesen (${REGISTRY_PATH}): ${err.message}`))
    process.exit(1)
  }

  const geladen = targets.map((pfad) => {
    try {
      const daten = JSON.parse(readFileSync(pfad, 'utf8'))
      return { pfad, daten, ladefehler: null }
    } catch (err) {
      return { pfad, daten: null, ladefehler: err.message }
    }
  })

  const alleIds = sammleIds(geladen)
  let gesamtFehler = 0
  let gesamtWarnungen = 0
  let gesamtRechtssaetze = 0

  for (const eintrag of geladen) {
    const { fehler, warnungen, anzahl } = pruefeDatei(eintrag, registry, alleIds)
    gesamtFehler += fehler
    gesamtWarnungen += warnungen
    gesamtRechtssaetze += anzahl
  }

  console.log()
  console.log(`${dim('═══')} Gesamt ${dim('═══')}`)
  console.log(`  ${geladen.length} Datei(en) geprüft, ${gesamtRechtssaetze} Rechtssätze`)
  const fehlerText = gesamtFehler === 0 ? green('0 Fehler') : red(`${gesamtFehler} Fehler`)
  const warnText = gesamtWarnungen === 0 ? green('0 Warnungen') : yellow(`${gesamtWarnungen} Warnungen`)
  console.log(`  ${fehlerText}, ${warnText}`)

  process.exit(gesamtFehler > 0 ? 1 : 0)
}

function resolveTargets(argv) {
  const roots = argv.length === 0 ? [DEFAULT_TARGET] : argv
  const result = []
  for (const arg of roots) {
    const abs = isAbsolute(arg) ? arg : resolve(process.cwd(), arg)
    if (!existsSync(abs)) {
      console.error(red(`Pfad existiert nicht: ${arg}`))
      continue
    }
    const s = statSync(abs)
    if (s.isDirectory()) {
      for (const name of readdirSync(abs)) {
        if (name.endsWith('.json')) result.push(join(abs, name))
      }
    } else if (s.isFile() && abs.endsWith('.json')) {
      result.push(abs)
    }
  }
  return result
}

function sammleIds(geladen) {
  const map = new Map() // id → [{ datei, rechtssatz }]
  for (const { pfad, daten } of geladen) {
    if (!daten || !Array.isArray(daten.rechtssaetze)) continue
    for (const rs of daten.rechtssaetze) {
      if (!rs || typeof rs.id !== 'string') continue
      if (!map.has(rs.id)) map.set(rs.id, [])
      map.get(rs.id).push({ pfad })
    }
  }
  return map
}

function pruefeDatei(eintrag, registry, alleIds) {
  const { pfad, daten, ladefehler } = eintrag
  const label = basename(pfad)
  const fehler = []
  const warnungen = []

  console.log(`${dim('═══')} ${label} ${dim('═══')}`)

  if (ladefehler) {
    fehler.push(`Datei konnte nicht als JSON gelesen werden: ${ladefehler}`)
    druckeErgebnis(fehler, warnungen, 0)
    return { fehler: fehler.length, warnungen: warnungen.length, anzahl: 0 }
  }

  const metaOk = pruefeMeta(daten, fehler)
  if (metaOk) console.log(`  ${green('✓')} Meta-Block: OK`)

  const rechtssaetze = Array.isArray(daten?.rechtssaetze) ? daten.rechtssaetze : []
  console.log(`  ${green('✓')} ${rechtssaetze.length} Rechtssätze geladen`)

  const dupFehler = pruefeDoppelteIds(pfad, rechtssaetze, alleIds)
  if (dupFehler.length === 0) {
    console.log(`  ${green('✓')} Keine doppelten IDs`)
  } else {
    fehler.push(...dupFehler)
  }

  const quelleTyp = daten?.meta?.quelle_typ
  let gliederungOk = true
  let kategorienOk = true
  let bedingungenOk = true
  let parameterOk = true
  let anforderungenOk = true

  for (const rs of rechtssaetze) {
    const prefixId = rs?.id ?? '?'
    if (!pruefePflichtfelder(prefixId, rs, fehler)) {
      // weiter prüfen trotzdem
    }
    if (!pruefeGliederung(prefixId, rs, quelleTyp, fehler)) gliederungOk = false
    if (!pruefeKategorien(prefixId, rs, fehler)) kategorienOk = false
    if (!pruefeBedingungenBlock(prefixId, rs, registry, fehler, warnungen)) bedingungenOk = false
    if (!pruefeVariantenBlock(prefixId, rs, registry, fehler, warnungen)) bedingungenOk = false
    if (!pruefeAnforderungsBlock(prefixId, rs, fehler)) anforderungenOk = false
    pruefeQuerverweise(prefixId, rs, alleIds, warnungen)
    pruefeRohextraktion(prefixId, rs, warnungen)
  }

  if (rechtssaetze.length > 0) {
    const p = (ok, label) => console.log(`  ${ok ? green('✓') : red('✗')} ${label}`)
    p(gliederungOk, `Gliederung (${quelleTyp ?? 'unbekannt'}): ${gliederungOk ? 'OK' : 'Fehler'}`)
    p(kategorienOk, `Kategorien: ${kategorienOk ? 'OK' : 'Fehler'}`)
    p(bedingungenOk, `Bedingungen: ${bedingungenOk ? 'OK' : 'Fehler'}`)
    p(parameterOk, `Parameter: ${parameterOk ? 'OK' : 'Fehler'}`)
    p(anforderungenOk, `Anforderungen: ${anforderungenOk ? 'OK' : 'Fehler'}`)
  }

  druckeErgebnis(fehler, warnungen, rechtssaetze.length)
  return { fehler: fehler.length, warnungen: warnungen.length, anzahl: rechtssaetze.length }
}

function druckeErgebnis(fehler, warnungen, anzahl) {
  if (fehler.length > 0) {
    console.log(`  ${red('✗ FEHLER:')}`)
    fehler.forEach((m, i) => console.log(`    [E${i + 1}] ${m}`))
  }
  if (warnungen.length > 0) {
    console.log(`  ${yellow(`⚠ ${warnungen.length} Warnung(en):`)}`)
    warnungen.forEach((m, i) => console.log(`    [W${i + 1}] ${m}`))
  }
  console.log()
  if (fehler.length === 0) {
    const suffix = warnungen.length > 0 ? ` (${warnungen.length} Warnung${warnungen.length === 1 ? '' : 'en'})` : ''
    console.log(`  Ergebnis: ${green('✓ GÜLTIG')}${suffix}`)
  } else {
    console.log(`  Ergebnis: ${red('✗ UNGÜLTIG')} (${fehler.length} Fehler)`)
  }
  console.log()
}

// ─────────────────────────────── Meta ───────────────────────────────

function pruefeMeta(daten, fehler) {
  const meta = daten?.meta
  if (!meta || typeof meta !== 'object') {
    fehler.push('meta-Block fehlt oder ist kein Objekt')
    return false
  }
  let ok = true
  if (!ERLAUBTE_SCHEMA_VERSIONEN.includes(meta.schema_version)) {
    fehler.push(
      `meta.schema_version "${meta.schema_version}" ist nicht erlaubt — erwartet: ${ERLAUBTE_SCHEMA_VERSIONEN.join(', ')}`,
    )
    ok = false
  }
  if (!ERLAUBTE_QUELLE_TYPEN.includes(meta.quelle_typ)) {
    fehler.push(
      `meta.quelle_typ "${meta.quelle_typ}" ist nicht erlaubt — erwartet: ${ERLAUBTE_QUELLE_TYPEN.join(', ')}`,
    )
    ok = false
  }
  for (const f of META_PFLICHT) {
    if (meta[f] === undefined || meta[f] === null || meta[f] === '') {
      fehler.push(`meta.${f} fehlt`)
      ok = false
    }
  }
  return ok
}

// ──────────────────────────── Rechtssätze ────────────────────────────

function pruefeDoppelteIds(pfad, rechtssaetze, alleIds) {
  const fehler = []
  const seen = new Set()
  for (const rs of rechtssaetze) {
    if (!rs || typeof rs.id !== 'string' || rs.id === '') continue
    if (seen.has(rs.id)) {
      fehler.push(`Doppelte id "${rs.id}" innerhalb der Datei ${basename(pfad)}`)
    }
    seen.add(rs.id)
    const treffer = alleIds.get(rs.id) || []
    if (treffer.length > 1) {
      const andere = treffer.filter((t) => t.pfad !== pfad).map((t) => basename(t.pfad))
      if (andere.length > 0 && !fehler.some((f) => f.includes(rs.id))) {
        fehler.push(`ID "${rs.id}" kommt auch in ${andere.join(', ')} vor`)
      }
    }
  }
  return fehler
}

function pruefePflichtfelder(prefix, rs, fehler) {
  let ok = true
  if (typeof rs?.id !== 'string' || rs.id === '') {
    fehler.push(`${prefix}: id fehlt`)
    ok = false
  }
  if (typeof rs?.fundstelle !== 'string' || rs.fundstelle === '') {
    fehler.push(`${prefix}: fundstelle fehlt`)
    ok = false
  }
  if (typeof rs?.originaltext !== 'string' || rs.originaltext === '') {
    fehler.push(`${prefix}: originaltext fehlt`)
    ok = false
  }
  if (!ERLAUBTE_STATUS.includes(rs?.status)) {
    fehler.push(`${prefix}: status "${rs?.status}" ist nicht erlaubt — erwartet: ${ERLAUBTE_STATUS.join(', ')}`)
    ok = false
  }
  return ok
}

function pruefeGliederung(prefix, rs, quelleTyp, fehler) {
  let ok = true
  if (quelleTyp === 'landesgesetz' || quelleTyp === 'verordnung') {
    if (!hatWert(rs?.paragraph)) { fehler.push(`${prefix}: paragraph fehlt (Landesgesetz/Verordnung)`); ok = false }
    if (rs?.absatz === undefined) { fehler.push(`${prefix}: absatz fehlt (Landesgesetz/Verordnung)`); ok = false }
    if (!hatWert(rs?.paragraph_ueberschrift)) { fehler.push(`${prefix}: paragraph_ueberschrift fehlt`); ok = false }
  } else if (quelleTyp === 'oib_richtlinie' || quelleTyp === 'oib_leitfaden') {
    if (!hatWert(rs?.punkt)) { fehler.push(`${prefix}: punkt fehlt (OIB)`); ok = false }
    if (!hatWert(rs?.abschnitt)) { fehler.push(`${prefix}: abschnitt fehlt (OIB)`); ok = false }
    if (!hatWert(rs?.abschnitt_titel)) { fehler.push(`${prefix}: abschnitt_titel fehlt (OIB)`); ok = false }
  }
  return ok
}

function pruefeKategorien(prefix, rs, fehler) {
  // Entfallene Paragraphen (LGBl-Aufhebung) haben keine fachliche Kategorisierung.
  if (rs?.is_entfallen === true) return true
  let ok = true
  if (!ERLAUBTE_HAUPTKATEGORIEN.includes(rs?.hauptkategorie)) {
    fehler.push(`${prefix}: hauptkategorie "${rs?.hauptkategorie}" ist nicht erlaubt`)
    ok = false
  }
  const uk = rs?.unterkategorie
  if (uk !== null && uk !== undefined && uk !== '') {
    const m = typeof uk === 'string' ? uk.match(/^([A-Z])\.(\d+)$/) : null
    if (!m) {
      fehler.push(`${prefix}: unterkategorie "${uk}" hat nicht das Format "{Buchstabe}.{Nummer}"`)
      ok = false
    } else if (m[1] !== rs.hauptkategorie) {
      fehler.push(`${prefix}: unterkategorie "${uk}" passt nicht zu hauptkategorie "${rs.hauptkategorie}"`)
      ok = false
    }
  }
  const phase = rs?.planungsphase
  if (phase !== null && phase !== undefined && !ERLAUBTE_PHASEN.includes(phase)) {
    fehler.push(`${prefix}: planungsphase "${phase}" ist nicht erlaubt — erwartet: ${ERLAUBTE_PHASEN.join(', ')} oder null`)
    ok = false
  }
  if (!ERLAUBTE_RAEUM_KATEGORIEN.includes(rs?.raeumliche_kategorie)) {
    fehler.push(`${prefix}: raeumliche_kategorie "${rs?.raeumliche_kategorie}" ist nicht erlaubt`)
    ok = false
  }
  return ok
}

function pruefeBedingungenBlock(prefix, rs, registry, fehler, warnungen) {
  let ok = true
  if (rs?.bedingungen === undefined) return ok
  if (!Array.isArray(rs.bedingungen)) {
    fehler.push(`${prefix}: bedingungen ist kein Array`)
    return false
  }
  if (rs.bedingungen.length === 0) {
    warnungen.push(`${prefix}: Keine Bedingungen — ist 'immer' gemeint?`)
    return ok
  }
  for (const b of rs.bedingungen) {
    if (!pruefeBedingungEinzeln(prefix, b, registry, fehler, warnungen)) ok = false
  }
  return ok
}

function pruefeBedingungEinzeln(prefix, b, registry, fehler, warnungen) {
  if (!b || typeof b !== 'object') {
    fehler.push(`${prefix}: Bedingung ist kein Objekt`)
    return false
  }
  if (b.typ === 'immer') return true
  let ok = true
  if (typeof b.parameter !== 'string' || b.parameter === '') {
    fehler.push(`${prefix}: Bedingung ohne parameter`)
    ok = false
  }
  if (typeof b.operator !== 'string' || !ALLE_OPERATOREN.includes(b.operator)) {
    fehler.push(`${prefix}: Bedingung mit unbekanntem Operator "${b.operator}"`)
    ok = false
  }
  if (ok) {
    if (!pruefeOperatorKonsistenz(prefix, b, fehler)) ok = false
    if (!pruefeParameterGegenRegistry(prefix, b.parameter, b, registry, fehler, warnungen)) ok = false
  }
  return ok
}

function pruefeOperatorKonsistenz(prefix, b, fehler) {
  let ok = true
  if (OP_EINZEL.includes(b.operator)) {
    if (b.wert === undefined) { fehler.push(`${prefix}: Operator "${b.operator}" erwartet wert`); ok = false }
    if (b.werte !== undefined) { fehler.push(`${prefix}: Operator "${b.operator}" darf kein werte haben`); ok = false }
  } else if (OP_MEHRFACH.includes(b.operator)) {
    if (!Array.isArray(b.werte)) { fehler.push(`${prefix}: Operator "${b.operator}" erwartet werte-Array`); ok = false }
    if (b.wert !== undefined) { fehler.push(`${prefix}: Operator "${b.operator}" darf kein wert haben`); ok = false }
  } else if (OP_ZAHL.includes(b.operator)) {
    if (typeof b.wert !== 'number') { fehler.push(`${prefix}: Operator "${b.operator}" erwartet numerischen wert`); ok = false }
  }
  return ok
}

function pruefeParameterGegenRegistry(prefix, name, b, registry, fehler, warnungen) {
  const eintrag = registry[name]
  if (!eintrag) {
    fehler.push(`${prefix}: Parameter "${name}" nicht in Registry`)
    return false
  }
  if (eintrag.status !== 'aktiv' && eintrag.status !== 'geplant') {
    fehler.push(`${prefix}: Parameter "${name}" hat unerwarteten Status "${eintrag.status}"`)
    return false
  }
  if (eintrag.status === 'geplant') {
    warnungen.push(`${prefix}: Parameter "${name}" ist noch im Status 'geplant'`)
  }
  if ((eintrag.typ === 'auswahl' || eintrag.typ === 'ja_nein') && Array.isArray(eintrag.werte) && eintrag.werte.length > 0) {
    if (OP_EINZEL.includes(b.operator) && !eintrag.werte.includes(b.wert)) {
      fehler.push(`${prefix}: Wert "${b.wert}" für Parameter "${name}" nicht in erlaubten Werten [${eintrag.werte.join(', ')}]`)
      return false
    }
    if (OP_MEHRFACH.includes(b.operator) && Array.isArray(b.werte)) {
      for (const w of b.werte) {
        if (!eintrag.werte.includes(w)) {
          fehler.push(`${prefix}: Wert "${w}" für Parameter "${name}" nicht in erlaubten Werten [${eintrag.werte.join(', ')}]`)
          return false
        }
      }
    }
  }
  return true
}

function pruefeVariantenBlock(prefix, rs, registry, fehler, warnungen) {
  if (rs?.varianten === undefined) return true
  if (!Array.isArray(rs.varianten)) {
    fehler.push(`${prefix}: varianten ist kein Array`)
    return false
  }
  let ok = true
  for (const v of rs.varianten) {
    const hatWenn = v?.wenn !== undefined
    const hatWennAlle = v?.wenn_alle !== undefined
    if (hatWenn === hatWennAlle) {
      fehler.push(`${prefix}: Variante muss genau eines von "wenn" oder "wenn_alle" haben`)
      ok = false
      continue
    }
    if (hatWenn) {
      if (!pruefeBedingungEinzeln(prefix, v.wenn, registry, fehler, warnungen)) ok = false
    }
    if (hatWennAlle) {
      if (!Array.isArray(v.wenn_alle)) {
        fehler.push(`${prefix}: Variante wenn_alle muss ein Array sein`)
        ok = false
      } else {
        for (const b of v.wenn_alle) {
          if (!pruefeBedingungEinzeln(prefix, b, registry, fehler, warnungen)) ok = false
        }
      }
    }
    if (v?.anforderung !== undefined && v.anforderung !== null) {
      if (!pruefeAnforderung(prefix, v.anforderung, fehler)) ok = false
    }
  }
  return ok
}

function pruefeAnforderungsBlock(prefix, rs, fehler) {
  if (rs?.anforderung === undefined || rs.anforderung === null) return true
  return pruefeAnforderung(prefix, rs.anforderung, fehler)
}

function pruefeAnforderung(prefix, a, fehler) {
  if (!a || typeof a !== 'object') {
    fehler.push(`${prefix}: Anforderung ist kein Objekt`)
    return false
  }
  if (!ERLAUBTE_ANFORDERUNGS_TYPEN.includes(a.typ)) {
    fehler.push(`${prefix}: anforderung.typ "${a.typ}" ist nicht erlaubt — erwartet: ${ERLAUBTE_ANFORDERUNGS_TYPEN.join(', ')}`)
    return false
  }
  let ok = true
  if (a.typ === 'prosa') {
    if (typeof a.text !== 'string' || a.text === '') {
      fehler.push(`${prefix}: anforderung typ=prosa braucht text`)
      ok = false
    }
  } else if (a.typ === 'grenzwert') {
    if (typeof a.kenngroesse !== 'string' || a.kenngroesse === '') {
      fehler.push(`${prefix}: anforderung typ=grenzwert braucht kenngroesse`)
      ok = false
    }
    if (typeof a.einheit !== 'string' || a.einheit === '') {
      fehler.push(`${prefix}: anforderung typ=grenzwert braucht einheit`)
      ok = false
    }
    const hatZahl = [a.min, a.max, a.exakt].some((v) => typeof v === 'number')
    if (!hatZahl) {
      fehler.push(`${prefix}: anforderung typ=grenzwert braucht min, max oder exakt`)
      ok = false
    }
  } else if (a.typ === 'formel') {
    if (typeof a.kenngroesse !== 'string' || a.kenngroesse === '') { fehler.push(`${prefix}: anforderung typ=formel braucht kenngroesse`); ok = false }
    if (typeof a.formel !== 'string' || a.formel === '') { fehler.push(`${prefix}: anforderung typ=formel braucht formel`); ok = false }
    if (typeof a.einheit !== 'string' || a.einheit === '') { fehler.push(`${prefix}: anforderung typ=formel braucht einheit`); ok = false }
  } else if (a.typ === 'klassifizierung') {
    if (typeof a.system !== 'string' || a.system === '') { fehler.push(`${prefix}: anforderung typ=klassifizierung braucht system`); ok = false }
    if (typeof a.klasse !== 'string' || a.klasse === '') { fehler.push(`${prefix}: anforderung typ=klassifizierung braucht klasse`); ok = false }
  }
  return ok
}

function pruefeQuerverweise(prefix, rs, alleIds, warnungen) {
  const liste = rs?.querverweise
  if (!Array.isArray(liste)) return
  for (const q of liste) {
    const refId = q?.ref_id
    if (typeof refId !== 'string' || refId === '') continue
    if (refId.startsWith('_pending:')) {
      warnungen.push(`${prefix}: Ausstehender Querverweis: ${refId}`)
      continue
    }
    if (!alleIds.has(refId)) {
      warnungen.push(`${prefix}: Querverweis ref_id "${refId}" nicht gefunden`)
    }
  }
}

function pruefeRohextraktion(prefix, rs, warnungen) {
  if (rs?._rohextraktion === true) {
    warnungen.push(`${prefix}: Rechtssatz ist noch nicht aufbereitet (_rohextraktion: true)`)
  }
}

// ─────────────────────────────── Util ───────────────────────────────

function hatWert(v) {
  return v !== undefined && v !== null && v !== ''
}

main()

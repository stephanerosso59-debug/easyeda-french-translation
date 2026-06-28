/**
 * EasyEDA Pro - French language pack applier.
 *
 * Inserts the French translations from translations-fr.json into a target ui.js
 * (EasyEDA Pro's UI bundle), right before the FIRST `,"@@topMenu"` marker (the FR
 * `sni` object). Accents are emitted as \uXXXX and apostrophes as ’ so the
 * file stays pure-ASCII (the non-ASCII byte count is left unchanged).
 *
 * Usage:  node apply-french.mjs "C:\\path\\to\\ui.js"
 * A backup "<file>.en.bak" is written before patching. Re-run safe (skips keys
 * already present). Restore English by copying the .en.bak back over ui.js.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dir = path.dirname(fileURLToPath(import.meta.url));
const target = process.argv[2];
if (!target) {
  console.error('Usage: node apply-french.mjs <path-to-ui.js>');
  process.exit(1);
}

const glossary = JSON.parse(fs.readFileSync(path.join(__dir, 'ui-fr.json'), 'utf8'));

// Encode a decoded string back into a ui.js JSON string body (pure ASCII).
function enc(str) {
  let r = '';
  for (const ch of str) {
    if (ch === '\\') { r += '\\\\'; continue; }
    if (ch === '"') { r += '\\"'; continue; }
    const cp = ch.codePointAt(0);
    r += cp < 0x80 ? ch : '\\u' + cp.toString(16).toUpperCase().padStart(4, '0');
  }
  return r;
}

let s = fs.readFileSync(target, 'utf8');

const marker = ',"@@topMenu"';
const idx = s.indexOf(marker);
if (idx < 0) { console.error('ERROR: marker `,"@@topMenu"` not found - is this an EasyEDA Pro ui.js?'); process.exit(2); }

const nonAsciiBefore = (s.match(/[^\x00-\x7F]/g) || []).length;
const topBefore = (s.match(/,"@@topMenu"/g) || []).length;

let added = 0, skipped = 0;
let insertion = '';
for (const [key, val] of Object.entries(glossary)) {
  const encKey = enc(key);
  const encVal = enc(val);
  // Skip only if this EXACT pair already exists (idempotent re-run). Checking the
  // key alone would wrongly skip strings that also appear in the English table.
  if (s.includes('"' + encKey + '":"' + encVal + '"')) { skipped++; continue; }
  insertion += ',"' + encKey + '":"' + encVal + '"';
  added++;
}

let out = s.slice(0, idx) + insertion + s.slice(idx);

// --- Code modifications that make French selectable in the UI -----------------
// These target EasyEDA Pro's minified ui.js. They are idempotent (skip if already
// present) and version-tolerant where possible. If an anchor is not found the step
// is reported as a warning (your ui.js version may differ) - see CODE-MODS.md.
const mods = [];

// 1) Register the French language option in the language switcher.
if (out.includes('icon:"language_fr",lang:"fr"')) {
  mods.push('lang-option: already present');
} else {
  const anchor = ',icon:"language_en",lang:"en"}]';
  if (out.includes(anchor)) {
    out = out.replace(anchor, ',icon:"language_en",lang:"en"},{title:"Fran\\u00e7ais",icon:"language_fr",lang:"fr"}]');
    mods.push('lang-option: ADDED');
  } else mods.push('lang-option: WARN anchor not found (see CODE-MODS.md)');
}

// 2) Flag sprite CSS for the French entry (reuse the same hash as the English rule).
if (/\.language_fr_\w+\{background-position/.test(out)) {
  mods.push('flag-css: already present');
} else {
  const m = out.match(/#language \.language_en_(\w+)\{background-position:-36px -26px\}/);
  if (m) {
    out = out.replace(m[0], m[0] + `#language .language_fr_${m[1]}{background-position:-36px -52px}`);
    mods.push('flag-css: ADDED');
  } else mods.push('flag-css: WARN anchor not found (see CODE-MODS.md)');
}

// verify
const nonAsciiAfter = (out.match(/[^\x00-\x7F]/g) || []).length;
const topAfter = (out.match(/,"@@topMenu"/g) || []).length;

if (!process.argv.includes('--dry-run')) {
  fs.copyFileSync(target, target + '.en.bak');
  fs.writeFileSync(target, out, 'utf8');
}

console.log('translations added:', added, '| skipped (already present):', skipped);
mods.forEach((m) => console.log('  code-mod', m));
console.log('@@topMenu:', topBefore, '->', topAfter, topAfter === topBefore ? 'OK' : 'CHANGED!');
console.log('non-ASCII:', nonAsciiBefore, '->', nonAsciiAfter, nonAsciiAfter === nonAsciiBefore ? 'OK (pure ASCII added)' : 'CHANGED!');
console.log(process.argv.includes('--dry-run') ? '(dry-run, nothing written)' : 'written. backup: ' + path.basename(target) + '.en.bak');

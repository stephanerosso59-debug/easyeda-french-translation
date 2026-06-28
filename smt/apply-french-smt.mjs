/**
 * EasyEDA Pro - French pack for the SMT / DFM module (smt-ui.js).
 * Injects a French i18next table (Rnt.fr) and registers it in the resources (lIo),
 * so the SMT / DFM panels appear in French when EasyEDA's language is "fr".
 * Usage: node apply-french-smt.mjs "C:\\...\\assets\\smt-ui\\<VERSION>\\smt-ui.js"
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dir = path.dirname(fileURLToPath(import.meta.url));
const target = process.argv[2];
if (!target) { console.error('Usage: node apply-french-smt.mjs <path-to-smt-ui.js>'); process.exit(1); }
const glossary = JSON.parse(fs.readFileSync(path.join(__dir, 'smt-fr.json'), 'utf8'));

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
if (s.includes('fr:{common:Rnt.fr}')) { console.log('SMT French pack already applied (idempotent skip).'); process.exit(0); }

// 1) brace-match Rnt={...}
const rs = s.indexOf('Rnt={');
if (rs < 0) { console.error('ERROR: Rnt table not found - incompatible smt-ui.js version.'); process.exit(2); }
let i = rs + 'Rnt='.length, d = 0, end = -1, inStr = false;
for (; i < s.length; i++) {
  const c = s[i];
  if (inStr) { if (c === '\\') { i++; continue; } if (c === '"') inStr = false; continue; }
  if (c === '"') { inStr = true; continue; }
  if (c === '{') d++;
  else if (c === '}') { d--; if (d === 0) { end = i; break; } }
}
if (end < 0) { console.error('ERROR: could not parse Rnt object.'); process.exit(2); }

// 2) build fr table and inject before Rnt closing brace
const frObj = 'fr:{' + Object.entries(glossary).map(([k, v]) => k + ':"' + enc(v) + '"').join(',') + '}';
s = s.slice(0, end) + ',' + frObj + s.slice(end);

// 3) register fr in the i18next resources object lIo
const lioAnchor = 'en:{common:Rnt.en}}';
if (!s.includes(lioAnchor)) { console.error('ERROR: lIo resources anchor not found.'); process.exit(2); }
s = s.replace(lioAnchor, 'en:{common:Rnt.en},fr:{common:Rnt.fr}}');

fs.writeFileSync(target, s, 'utf8'); // UTF-8, no BOM
console.log('Injected Rnt.fr (' + Object.keys(glossary).length + ' keys) + lIo fr entry. OK.');

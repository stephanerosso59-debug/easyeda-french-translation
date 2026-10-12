/**
 * EasyEDA Pro - French pack for the SMT / DFM module (smt-ui.js).
 * Finds EVERY i18next table registered as `{cn:{common:T.cn},en:{common:T.en}}`
 * (1 table up to smt-ui 1.0.2xx, 3 tables since 1.0.340), injects `T.fr` and registers
 * `fr:{common:Object.assign({},T.en,T.fr)}` so a key missing from the glossary falls back
 * to English instead of showing its raw name.
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

// index of the brace closing the one opened at s[open] (skips "..." strings)
function matchBrace(s, open) {
  let d = 0, inStr = false;
  for (let i = open; i < s.length; i++) {
    const c = s[i];
    if (inStr) { if (c === '\\') { i++; continue; } if (c === '"') inStr = false; continue; }
    if (c === '"') { inStr = true; continue; }
    if (c === '{') d++;
    else if (c === '}') { d--; if (d === 0) return i; }
  }
  return -1;
}

// top-level keys of the object literal s[open..close]
function topKeys(s, open, close) {
  const keys = new Set();
  let d = 0, inStr = false, expectKey = true;
  for (let i = open + 1; i < close; i++) {
    const c = s[i];
    if (inStr) { if (c === '\\') { i++; continue; } if (c === '"') inStr = false; continue; }
    if (d === 0 && expectKey) {
      const m = /^"?([\w$]+)"?:/.exec(s.slice(i, i + 200));
      if (m) { keys.add(m[1]); i += m[0].length - 1; expectKey = false; continue; }
    }
    if (c === '"') { inStr = true; continue; }
    if (c === '{' || c === '[' || c === '(') d++;
    else if (c === '}' || c === ']' || c === ')') d--;
    else if (c === ',' && d === 0) expectKey = true;
  }
  return keys;
}

let s = fs.readFileSync(target, 'utf8');
const anchors = [...s.matchAll(/en:\{common:([\w$]+)\.en\}\}/g)].map((m) => m[1]);
if (!anchors.length) {
  if (s.includes('.fr)}}')) { console.log('SMT French pack already applied (idempotent skip).'); process.exit(0); }
  console.error('ERROR: no i18next table found - incompatible smt-ui.js version.'); process.exit(2);
}

let total = 0;
for (const T of [...new Set(anchors)]) {
  const ts = s.indexOf(T + '={');
  if (ts < 0) { console.error('ERROR: table ' + T + ' not found.'); process.exit(2); }
  const open = ts + T.length + 1, close = matchBrace(s, open);
  const enPos = s.indexOf('en:{', open);
  if (close < 0 || enPos < 0 || enPos > close) { console.error('ERROR: could not parse ' + T + '.'); process.exit(2); }
  const enKeys = topKeys(s, enPos + 3, matchBrace(s, enPos + 3));
  const fr = Object.entries(glossary).filter(([k]) => enKeys.has(k));
  const frObj = 'fr:{' + fr.map(([k, v]) => k + ':"' + enc(v) + '"').join(',') + '}';
  s = s.slice(0, close) + ',' + frObj + s.slice(close);
  s = s.replace('en:{common:' + T + '.en}}', 'en:{common:' + T + '.en},fr:{common:Object.assign({},' + T + '.en,' + T + '.fr)}}');
  console.log('  ' + T + ' : ' + fr.length + '/' + enKeys.size + ' keys in French');
  total += fr.length;
}

fs.writeFileSync(target, s, 'utf8'); // UTF-8, no BOM
console.log('Injected French into ' + new Set(anchors).size + ' table(s), ' + total + ' strings. OK.');

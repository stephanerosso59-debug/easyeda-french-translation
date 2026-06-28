/**
 * EasyEDA Pro - French pack for the app shell (app.js).
 * Translates the startup / workspace / cache & settings dialogs.
 * Usage: node apply-french-app.mjs "C:\Program Files\easyeda-pro\resources\app\app.js"
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dir = path.dirname(fileURLToPath(import.meta.url));
const target = process.argv[2];
if (!target) { console.error('Usage: node apply-french-app.mjs <path-to-app.js>'); process.exit(1); }
const glossary = JSON.parse(fs.readFileSync(path.join(__dir, 'app-fr.json'), 'utf8'));

function enc(str) {
  let r = '';
  for (const ch of str) {
    if (ch === '\\') { r += '\\\\'; continue; }
    if (ch === '"') { r += '\\"'; continue; }
    if (ch === '\n') { r += '\\n'; continue; }
    if (ch === '\r') { r += '\\r'; continue; }
    if (ch === '\t') { r += '\\t'; continue; }
    const cp = ch.codePointAt(0);
    if (cp < 0x20 || cp >= 0x80) { r += '\\u' + cp.toString(16).toUpperCase().padStart(4, '0'); continue; }
    r += ch;
  }
  return r;
}

let s = fs.readFileSync(target, 'utf8').replace(/^﻿/, '');
if (s.includes('var f5=') || s.includes('LANGUAGE_FR="fr"')) {
  console.log('app.js French pack already applied (idempotent skip).');
  process.exit(0);
}

const lyOld = 'function Ly(t="",e={}){let a=(X.globalWindowsMap[X.globalActiveWindowId].language=="en"?K5:q5)[t]||t';
if (!s.includes(lyOld)) {
  console.error('ERROR: app.js structure not recognized (different EasyEDA version?) - not translated.');
  process.exit(2);
}

// build the f5 French table
const f5 = 'var f5={' + Object.entries(glossary).map(([k, v]) => '"' + enc(k) + '":"' + enc(v) + '"').join(',') + '};';

// 1) register the FR language constant
s = s.replace('r.LANGUAGE_EN="en",r))', 'r.LANGUAGE_EN="en",r.LANGUAGE_FR="fr",r))');
// 2) add fr to the language->module map
s = s.replace('"zh-cn":X3,en:W3}', '"zh-cn":X3,en:W3,fr:W3}');
// 3) insert the f5 table + route the Ly lookup through it for fr
const lyNew = f5 + 'function Ly(t="",e={}){let a=(()=>{let _l=X.globalWindowsMap[X.globalActiveWindowId].language;return _l=="en"||_l=="en-us"?K5:_l=="fr"||_l=="fr-fr"?f5:q5})()[t]||t';
s = s.replace(lyOld, lyNew);

fs.writeFileSync(target, s, 'utf8'); // UTF-8, no BOM
console.log('app.js translated: f5 (' + Object.keys(glossary).length + ' strings) + LANGUAGE_FR + fr map + Ly routing. OK.');

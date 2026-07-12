/**
 * EasyEDA Pro - French pack for the Interactive BOM inline labels (smt-ui.js).
 *
 * The iBOM viewer's UI labels (器件型号, 位号聚合, 顶层位号, 返回编辑器, 视图, 详情 ...)
 * are HARD-CODED as \uXXXX escapes inside smt-ui.js JSX children - they are NOT
 * i18next keys, so apply-french-smt.mjs (Rnt.fr table) does not reach them.
 * This applier replaces those inline strings directly with French.
 *
 * Idempotent : once translated, the Chinese escapes are gone, so re-running does
 * nothing. No backup here - install.mjs makes smt-ui.js.en.bak before patching.
 *
 * Usage: node apply-french-smt-ibom.mjs "C:\\...\\assets\\smt-ui\\<VERSION>\\smt-ui.js"
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dir = path.dirname(fileURLToPath(import.meta.url));
const target = process.argv[2];
if (!target) { console.error('Usage: node apply-french-smt-ibom.mjs <path-to-smt-ui.js>'); process.exit(1); }

const dict = JSON.parse(fs.readFileSync(path.join(__dir, 'smt-ibom-fr.json'), 'utf8'));

// French output: escape backslash, double-quote, and any non-ASCII as \uXXXX
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

// The two forms a Chinese string can take in the bundle: \uXXXX with lower- or
// upper-case hex letters (tools emit one or the other).
function escForms(zh) {
  let lo = '', up = '';
  for (const ch of zh) {
    const h = ch.codePointAt(0).toString(16).padStart(4, '0');
    lo += '\\u' + h.toLowerCase();
    up += '\\u' + h.toUpperCase();
  }
  return lo === up ? [lo] : [lo, up];
}

let s = fs.readFileSync(target, 'utf8');
const keys = Object.keys(dict).sort((a, b) => b.length - a.length); // longest first
let total = 0, translated = 0;
for (const zh of keys) {
  const fr = enc(dict[zh]);
  let n = 0;
  for (const seq of escForms(zh)) {
    const parts = s.split(seq);
    if (parts.length > 1) { n += parts.length - 1; s = parts.join(fr); }
  }
  if (n) { total += n; translated++; }
}

fs.writeFileSync(target, s, 'utf8'); // UTF-8, no BOM
console.log('Inline iBOM labels: ' + total + ' replacements (' + translated + '/' + keys.length + ' terms). OK.');

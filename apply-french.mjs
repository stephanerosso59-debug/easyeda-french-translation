/**
 * EasyEDA Pro - French language pack applier.
 *
 * Direct approach: translate the ENGLISH strings to French in place. EasyEDA's English
 * locale object is COMPLETE, so REPLACING its values with French translates the whole UI
 * with no missing keys (no need to build a separate French object). We also translate the
 * French locale object (adding any keys it lacks) and the top menu bar (@@topMenu), and
 * apply the code mods that make French selectable + load locally.
 *
 * Accents are emitted as \uXXXX so the file stays pure-ASCII. Works across versions
 * (3.2.148, 3.2.149, ...) because it captures the minified names instead of hardcoding.
 *
 * Usage:  node apply-french.mjs "C:\\path\\to\\ui.js"  [--dry-run]
 * A backup "<file>.en.bak" is written before patching. Re-run safe.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dir = path.dirname(fileURLToPath(import.meta.url));
const target = process.argv[2];
if (!target) { console.error('Usage: node apply-french.mjs <path-to-ui.js>'); process.exit(1); }

const glossary = JSON.parse(fs.readFileSync(path.join(__dir, 'ui-fr.json'), 'utf8'));
let menuGlossary = {};
try { menuGlossary = JSON.parse(fs.readFileSync(path.join(__dir, 'topmenu-fr.json'), 'utf8')); } catch (e) {}

// Encode a decoded string into a ui.js JSON string body (pure ASCII).
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
function esc(x) { return x.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }
// brace-match an object literal starting at `s[from]` === '{'; return index of its '}'
function matchBrace(s, from) {
  let d = 0, inStr = false;
  for (let j = from; j < s.length; j++) {
    const c = s[j];
    if (inStr) { if (c === '\\') { j++; continue; } if (c === '"') inStr = false; continue; }
    if (c === '"') inStr = true;
    else if (c === '{') d++;
    else if (c === '}') { d--; if (d === 0) return j; }
  }
  return -1;
}

let s = fs.readFileSync(target, 'utf8');
const nonAsciiBefore = (s.match(/[^\x00-\x7F]/g) || []).length;

// Find a locale object's minified var name from the map ({...en:rni,...,fr:sni,...}).
function localeVar(code) { const m = s.match(new RegExp('[,{]' + code + ':(\\w+)[,}]')); return m ? m[1] : null; }
// Find `var <name>={ ... }` (or `<name>={...}`) boundaries in `text`.
function findObj(text, name) {
  let decl = 'var ' + name + '={';
  let i = text.indexOf(decl);
  if (i < 0) { decl = name + '={'; i = text.indexOf(decl); }
  if (i < 0) return null;
  const start = i + decl.length - 1;
  const end = matchBrace(text, start);
  return end < 0 ? null : { start, end };
}
// REPLACE every "englishKey":"value" in a locale object with the French value.
// addMissing: also append keys the object lacks (used for the partial fr object).
function translateLocale(text, name, addMissing, dict) {
  const loc = findObj(text, name);
  if (!loc) return { text, replaced: 0, added: 0, found: false };
  let region = text.slice(loc.start, loc.end + 1);
  let replaced = 0; const missing = [];
  for (const [key, val] of Object.entries(dict)) {
    const ek = enc(key), ev = enc(val);
    const re = new RegExp('"' + esc(ek) + '":"(?:[^"\\\\]|\\\\.)*"');
    if (re.test(region)) { region = region.replace(re, '"' + ek + '":"' + ev + '"'); replaced++; }
    else if (addMissing) missing.push(',"' + ek + '":"' + ev + '"');
  }
  if (addMissing && missing.length) region = region.slice(0, -1) + missing.join('') + '}';
  return { text: text.slice(0, loc.start) + region + text.slice(loc.end + 1), replaced, added: missing.length, found: true };
}

const enVar = localeVar('en');
const frVar = localeVar('fr') || 'sni';

// Translatable keys = the UI strings + the menu words (Settings/Advanced/Tools/...). The
// menu BAR items are looked up by their plain key (t("Settings")), so they must live in
// the locale object too - not only inside @@topMenu.
const allDict = { ...glossary, ...menuGlossary };

let out = s;
// 1) Translate the ENGLISH object in place (harmless if it is partial).
const enRes = enVar ? translateLocale(out, enVar, false, allDict) : { replaced: 0, added: 0, found: false };
if (enRes.found) out = enRes.text;
// 2) Translate the FRENCH object: replace existing values + add every key it lacks, so
//    t(anyEnglishKey) returns French (no fallback-to-English gaps).
const frRes = translateLocale(out, frVar, true, allDict);
if (frRes.found) out = frRes.text;

// 3) Translate the top menu bar (@@topMenu) - a single shared menu config.
//    Keys may be quoted "File{num}" or bare identifiers like Order:.
let menuReplaced = 0;
{
  const mk = '"@@topMenu":';
  const mIdx = out.indexOf(mk);
  if (mIdx >= 0) {
    const ts = mIdx + mk.length;            // at '{'
    const meIdx = matchBrace(out, ts);
    let mreg = out.slice(ts, meIdx + 1);
    for (const [k, v] of Object.entries(menuGlossary)) {
      const ek = esc(enc(k)), ev = enc(v);
      const rq = new RegExp('"' + ek + '":"(?:[^"\\\\]|\\\\.)*"');
      const ident = /^[A-Za-z_$][\w$]*$/.test(k);
      const ru = ident ? new RegExp('([{,])' + esc(k) + ':"(?:[^"\\\\]|\\\\.)*"') : null;
      if (rq.test(mreg)) { mreg = mreg.replace(rq, '"' + enc(k) + '":"' + ev + '"'); menuReplaced++; }
      else if (ru && ru.test(mreg)) { mreg = mreg.replace(ru, '$1' + enc(k) + ':"' + ev + '"'); menuReplaced++; }
    }
    out = out.slice(0, ts) + mreg + out.slice(meIdx + 1);
  }
}

// --- Code modifications that make French work in the UI -------------------------------
const mods = [];

// a) Register the French language option in the language switcher.
if (out.includes('icon:"language_fr",lang:"fr"')) mods.push('lang-option: already present');
else {
  const anchor = ',icon:"language_en",lang:"en"}]';
  if (out.includes(anchor)) { out = out.replace(anchor, ',icon:"language_en",lang:"en"},{title:"Fran\\u00e7ais",icon:"language_fr",lang:"fr"}]'); mods.push('lang-option: ADDED'); }
  else mods.push('lang-option: WARN anchor not found');
}

// b) Flag sprite CSS for the French entry.
if (/\.language_fr_\w+\{background-position/.test(out)) mods.push('flag-css: already present');
else {
  const m = out.match(/#language \.language_en_(\w+)\{background-position:-36px -26px\}/);
  if (m) { out = out.replace(m[0], m[0] + `#language .language_fr_${m[1]}{background-position:-36px -52px}`); mods.push('flag-css: ADDED'); }
  else mods.push('flag-css: WARN anchor not found');
}

// c) Force LOCAL locale loading (else EasyEDA fetches the partial French from its server).
const cacheRe = /(\w+)\._cache\[(\w+)\]&&\1\.update\(\2\)/;
if (cacheRe.test(out)) {
  out = out.replace(cacheRe, (mm, X, Y) =>
    X + '._cache[' + Y + ']?' + X + '._cache[' + Y + ']._status="loaded":' + X + '._cache[' + Y + ']={_status:"loaded"},' + X + '.update(' + Y + ')');
  mods.push('local-loading: ADDED');
} else mods.push('local-loading: already present / anchor not found');

// d) Show "FR" in the top-right language badge (cosmetic).
if (out.includes('children:"FR"}')) mods.push('fr-badge: already present');
else {
  const bq = String.fromCharCode(96);
  const m3 = out.match(new RegExp('(\\w+)\\.lang==="en"\\?\\(0,(\\w+)\\.jsx\\)\\("div",\\{className:' + bq + '\\$\\{(\\w+)\\["language-en-text"\\]\\} ' + bq + ',children:"EN"\\}\\):'));
  if (m3) {
    const frBranch = m3[1] + '.lang==="fr"?(0,' + m3[2] + '.jsx)("div",{className:' + bq + '${' + m3[3] + '["language-en-text"]} ' + bq + ',children:"FR"}):';
    out = out.replace(m3[0], m3[0] + frBranch); mods.push('fr-badge: ADDED');
  } else mods.push('fr-badge: anchor not found');
}

// --- verify & write -------------------------------------------------------------------
const nonAsciiAfter = (out.match(/[^\x00-\x7F]/g) || []).length;
if (!process.argv.includes('--dry-run')) { fs.copyFileSync(target, target + '.en.bak'); fs.writeFileSync(target, out, 'utf8'); }

console.log('en object:', enVar, '-> replaced:', enRes.replaced, (enRes.found ? '' : '(NOT FOUND)'));
console.log('fr object:', frVar, '-> replaced:', frRes.replaced, '| added:', frRes.added, (frRes.found ? '' : '(NOT FOUND)'));
console.log('top-menu replaced:', menuReplaced);
mods.forEach((m) => console.log('  code-mod', m));
console.log('non-ASCII:', nonAsciiBefore, '->', nonAsciiAfter, nonAsciiAfter === nonAsciiBefore ? 'OK (pure ASCII added)' : 'CHANGED');
console.log(process.argv.includes('--dry-run') ? '(dry-run, nothing written)' : 'written. backup: ' + path.basename(target) + '.en.bak');

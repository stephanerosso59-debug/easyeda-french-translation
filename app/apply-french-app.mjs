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

let s = fs.readFileSync(target, 'utf8').replace(/^\uFEFF/, '');
if (s.includes('LANGUAGE_FR="fr"')) {
  console.log('app.js French pack already applied (idempotent skip).');
  process.exit(0);
}

// minified names change with every EasyEDA build -> capture them by regex
// e.g. 3.2.149: Ly / K5 / q5 / W3   -   3.2.206: Py / u6 / l6 / iT
const lyRe = /function ([\w$]+)\(t="",e=\{\}\)\{let a=\(([\w$]+)\.globalWindowsMap\[\2\.globalActiveWindowId\]\.language=="en"\?([\w$]+):([\w$]+)\)\[t\]\|\|t/;
const ly = lyRe.exec(s);
const mapRe = /"zh-cn":([\w$]+),en:([\w$]+)\}/;
const map = mapRe.exec(s);
const langRe = /r\.LANGUAGE_EN="en",r\)\)/;
if (!ly || !map || !langRe.test(s)) {
  console.error('ERROR: app.js structure not recognized (different EasyEDA version?) - not translated.');
  process.exit(2);
}
const [lyOld, fn, W, EN, ZH] = ly;

// French table under a name that cannot collide with EasyEDA's minified identifiers
const FR = '__easyedaFr';
const frTable = 'var ' + FR + '={' + Object.entries(glossary).map(([k, v]) => '"' + enc(k) + '":"' + enc(v) + '"').join(',') + '};';

// 1) register the FR language constant
s = s.replace(langRe, 'r.LANGUAGE_EN="en",r.LANGUAGE_FR="fr",r))');
// 2) add fr to the language->module map (same module as en)
s = s.replace(map[0], '"zh-cn":' + map[1] + ',en:' + map[2] + ',fr:' + map[2] + '}');
// 3) insert the French table + route the lookup through it for fr
const lyNew = frTable + 'function ' + fn + '(t="",e={}){let a=(()=>{let _l=' + W + '.globalWindowsMap[' + W + '.globalActiveWindowId].language;return _l=="en"||_l=="en-us"?' + EN + ':_l=="fr"||_l=="fr-fr"?' + FR + ':' + ZH + '})()[t]||t';
s = s.replace(lyOld, lyNew);

if (!fs.existsSync(target + '.en.bak')) fs.copyFileSync(target, target + '.en.bak'); // English original, used by --uninstall
fs.writeFileSync(target, s, 'utf8'); // UTF-8, no BOM
console.log('app.js translated: ' + FR + ' (' + Object.keys(glossary).length + ' strings) + LANGUAGE_FR + fr map + ' + fn + '() routing. OK.');

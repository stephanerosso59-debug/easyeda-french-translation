/**
 * EasyEDA Pro - Traduction FRANCAISE - installeur tout-en-un (Node.js)
 *
 *   Lancer dans un terminal EN ADMINISTRATEUR, depuis ce dossier :
 *       node install.mjs
 *   Chemin EasyEDA personnalise :
 *       node install.mjs "D:\\Chemin\\easyeda-pro"
 *   Revenir a l'anglais :
 *       node install.mjs --uninstall
 *
 * Traduit : ui.js (editeur) + app.js (demarrage/parametres) + smt-ui.js (module SMT)
 * et copie les locales fr.json / app-menu-fr.json. Une sauvegarde *.en.bak est creee.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';

const __dir = path.dirname(fileURLToPath(import.meta.url));
const args = process.argv.slice(2);
const uninstall = args.includes('--uninstall');
const EASYEDA = args.find((a) => !a.startsWith('--')) || 'C:\\Program Files\\easyeda-pro';
const appDir = path.join(EASYEDA, 'resources', 'app');

const C = { g: '\x1b[32m', y: '\x1b[33m', r: '\x1b[31m', c: '\x1b[36m', x: '\x1b[0m' };
const ok = (m) => console.log(C.g + '  [OK] ' + m + C.x);
const warn = (m) => console.log(C.y + '  [!] ' + m + C.x);
const err = (m) => console.log(C.r + '  [X] ' + m + C.x);

function latestVer(dir) {
  if (!fs.existsSync(dir)) return null;
  const subs = fs.readdirSync(dir).filter((d) => { try { return fs.statSync(path.join(dir, d)).isDirectory(); } catch { return false; } }).sort().reverse();
  return subs[0] ? path.join(dir, subs[0]) : null;
}
function runApplier(script, target) {
  try { execFileSync(process.execPath, [path.join(__dir, script), target], { stdio: 'inherit' }); return true; }
  catch (e) { err('echec ' + path.basename(script)); return false; }
}
function restore(file) {
  const bak = file + '.en.bak';
  if (fs.existsSync(bak)) { fs.copyFileSync(bak, file); ok('restaure : ' + path.basename(file)); }
  else warn('pas de sauvegarde pour ' + path.basename(file));
}

console.log(C.c + '======================================================' + C.x);
console.log(C.c + '  EasyEDA Pro - Traduction francaise' + (uninstall ? ' (DESINSTALLATION)' : '') + C.x);
console.log(C.c + '======================================================' + C.x);
console.log('  EasyEDA : ' + EASYEDA);

if (!fs.existsSync(appDir)) {
  err('EasyEDA introuvable : ' + appDir);
  err('Precise le chemin :  node install.mjs "C:\\Chemin\\easyeda-pro"');
  process.exit(1);
}

const proUi = latestVer(path.join(appDir, 'assets', 'pro-ui'));
const uiJs = proUi ? path.join(proUi, 'js', 'ui.js') : null;
const appJs = path.join(appDir, 'app.js');
const smtDir = latestVer(path.join(appDir, 'assets', 'smt-ui'));
const smtJs = smtDir ? path.join(smtDir, 'smt-ui.js') : null;
const localeDir = path.join(appDir, 'assets', 'locale');

if (uninstall) {
  if (uiJs) restore(uiJs);
  if (smtJs) restore(smtJs);
  restore(appJs);
  console.log(C.c + '  Termine. Redemarre EasyEDA Pro.' + C.x);
  process.exit(0);
}

// 1) ui.js (editeur principal : menus, proprietes, regles...)
if (uiJs && fs.existsSync(uiJs)) { console.log('\n  ui.js (editeur)...'); runApplier('apply-french.mjs', uiJs); }
else err('ui.js introuvable (pro-ui)');

// 2) app.js (ecran de demarrage, espace de travail, cache, parametres)
if (fs.existsSync(appJs)) { console.log('\n  app.js (demarrage / parametres)...'); runApplier(path.join('app', 'apply-french-app.mjs'), appJs); }

// 3) smt-ui.js (module SMT / DFM)
if (smtJs && fs.existsSync(smtJs)) { console.log('\n  smt-ui.js (module SMT)...'); runApplier(path.join('smt', 'apply-french-smt.mjs'), smtJs); }

// 4) locales systeme
console.log('\n  locales (fr.json, app-menu-fr.json)...');
fs.mkdirSync(localeDir, { recursive: true });
for (const f of ['fr.json', 'app-menu-fr.json']) {
  const src = path.join(__dir, 'locale', f);
  if (fs.existsSync(src)) {
    const dst = path.join(localeDir, f);
    if (fs.existsSync(dst) && !fs.existsSync(dst + '.bak')) fs.copyFileSync(dst, dst + '.bak');
    fs.copyFileSync(src, dst); ok(f);
  }
}

console.log(C.c + '\n======================================================' + C.x);
console.log(C.g + '  Termine ! Ferme et rouvre EasyEDA Pro,' + C.x);
console.log(C.g + '  puis choisis "Francais" (menu langue, en haut a droite).' + C.x);
console.log(C.c + '  Revenir a l\'anglais :  node install.mjs --uninstall' + C.x);
console.log(C.c + '======================================================' + C.x);

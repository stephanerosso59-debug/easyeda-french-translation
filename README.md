# EasyEDA Pro — French Translation Pack 🇫🇷

A community **French (français) language pack** for the **EasyEDA Pro** desktop
application. It ships the **translation data** (≈ 3 870 UI strings) plus a small
script that injects them into your own copy of EasyEDA's `ui.js`.

> ⚠️ **Not affiliated with EasyEDA / JLCEDA.** This repository contains **only**
> independently-authored translations and tooling. It does **not** contain, and does
> not redistribute, any of EasyEDA's proprietary application code. You apply the
> translations to **your own** installed copy of EasyEDA Pro.

- **Authors:** Stéphane Rosso & Claude
- **Tested against:** EasyEDA Pro **`3.2.148.f1ab0d63`** (Windows).
  The *translations* are largely version-independent; the *code modifications*
  (see `CODE-MODS.md`) are tied to this build's minified bundle and may need small
  tweaks on other versions.

## What's inside

| File | Description |
|---|---|
| `ui-fr.json` | Main UI glossary — **3 870** `English → Français` pairs (from `ui.js`) |
| `app-fr.json` | Startup / workspace-picker / cache & storage settings — **132** pairs (from the `app.js` shell) |
| `apply-french.mjs` | Node script: inserts the `ui.js` translations **+** registers the French language entry and flag |
| `locale/fr.json` | System locale (Client Setting panel & misc. strings), ~474 keys |
| `locale/app-menu-fr.json` | Application menu (French) |
| `translate_bom.ps1` | Bonus: translates an exported **Interactive BOM** HTML to French (~80 terms) |
| `CODE-MODS.md` | The code edits that make French selectable (`ui.js` #1–2 automated; `ui.js` #3–4 and the `app.js` integration documented) |
| `MEMO_EASYEDA_FR.md` | Full translation procedure / project notes |

## 🇫🇷 Installation (Français)

1. **Télécharge** ce projet (bouton vert **Code → Download ZIP**) puis **dézippe-le**.
2. Ouvre **PowerShell en Administrateur** (clic droit sur *Windows PowerShell* → **Exécuter en tant qu'administrateur**).
3. Place-toi dans le dossier dézippé, par exemple :
   ```powershell
   cd "C:\Users\TonNom\Downloads\easyeda-french-translation"
   ```
4. Lance ces **3 lignes** (copier-coller) :
   ```powershell
   Set-ExecutionPolicy Bypass -Scope Process -Force
   Get-ChildItem . -Recurse | Unblock-File
   .\install.ps1
   ```
5. **Ferme et rouvre EasyEDA Pro**, puis choisis **Français** dans le menu de langue (en haut à droite). 🎉

`install.ps1` fait tout : il **détecte** ton install EasyEDA, **sauvegarde** `ui.js`, insère les
**3 870** traductions, enregistre la **langue + le drapeau** FR, et copie les fichiers de locale.

- **Revenir à l'anglais :** `.\install.ps1 -Uninstall`
- **EasyEDA installé ailleurs :** `.\install.ps1 -EasyEdaDir "D:\...\easyeda-pro"`

### ⚠️ En cas d'erreur (texte en rouge)

| Message d'erreur | Cause | Solution |
|---|---|---|
| **« impossible de charger le fichier … l'exécution de scripts est désactivée »** | la sécurité PowerShell bloque les `.ps1` | exécute la ligne `Set-ExecutionPolicy Bypass -Scope Process -Force` (étape 4) **avant** `.\install.ps1` |
| **« … n'est pas signé numériquement »** ou fichier *bloqué* | fichiers issus d'un ZIP téléchargé | exécute `Get-ChildItem . -Recurse \| Unblock-File` (étape 4) |
| **« Accès refusé » / « Access is denied »** (sur `Program Files`) | PowerShell **pas** en admin | relance PowerShell en **Administrateur** |
| **« Lance ce script … EN ADMINISTRATEUR »** | idem | idem |
| **« EasyEDA Pro introuvable »** | installé hors `C:\Program Files\easyeda-pro` | `.\install.ps1 -EasyEdaDir "<ton chemin>\easyeda-pro"` |
| **« Marqueur de traduction introuvable »** | version de `ui.js` non compatible | signale-le (avec ta version d'EasyEDA) |

> Prérequis : **Windows + EasyEDA Pro**. PowerShell est **intégré à Windows**, rien d'autre à installer.

## 🇬🇧 Installation (English)

In an **Administrator** PowerShell, inside the unzipped folder, run:
```powershell
Set-ExecutionPolicy Bypass -Scope Process -Force
Get-ChildItem . -Recurse | Unblock-File
.\install.ps1
```
Then restart EasyEDA Pro and pick **Français** (language menu, top-right).
Revert: `.\install.ps1 -Uninstall`. Custom path: `-EasyEdaDir "D:\...\easyeda-pro"`.
*(Advanced: `node apply-french.mjs "<path-to-ui.js>"`.)*

> **Common error:** *"... cannot be loaded because running scripts is disabled on this
> system"* → that's the PowerShell execution policy. The `Set-ExecutionPolicy Bypass -Scope
> Process -Force` line (run it first, in the same window) fixes it.

## Also included

- **`app.js` strings** (`app-fr.json`, 132 pairs) — the Electron shell shown at launch
  (workspace picker, online/offline mode, cache & storage settings). Applying these is a
  more invasive edit to `app.js` (a `f5` French table + routing the lookup through it);
  it is **documented in `CODE-MODS.md`** rather than auto-applied, because it depends on
  minified identifiers that change between versions.
- **Interactive BOM → French** (`translate_bom.ps1`) — when EasyEDA exports an Interactive
  BOM as HTML, run:
  ```powershell
  .\translate_bom.ps1 -InputFile "InteractiveBOM_PCB1_2026-06-16.html"
  ```
  It writes `..._FR.html` next to it.

> **Not yet covered:** the SMT/assembly module (`smt-ui.js`, i18next-based) and the
> `pro-mgr` workers (mostly locale-routing code). Contributions welcome.

## How it works (clean-room / legal)

EasyEDA Pro keeps its UI strings in a translation table (`sni`) inside `ui.js`,
keyed by the English source string. This pack stores those **`English → Français`
pairs as data** (`ui-fr.json`) — the standard form of a localization file (like a
`.po`). The apply script merely re-inserts that data into *your* installed bundle.
No EasyEDA source file is included or redistributed here.

## Credits

Made with ❤️ by **Stéphane Rosso & Claude**. Contributions / corrections welcome —
open an issue or a PR.

## License

MIT for the tooling; the translation strings are released under
[CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). See `LICENSE`.
"Easyeda" and "EasyEDA Pro" are trademarks of their respective owners.

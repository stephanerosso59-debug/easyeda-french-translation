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

## Requirements

- **Node.js ≥ 18** (only to run the apply script)
- **EasyEDA Pro** installed (Windows). Admin rights to write into `Program Files`.

## Installation

1. **Find your `ui.js`** — the active copy is usually in the EasyEDA **cache** under
   your Documents; a bundled default also exists in `Program Files` (version folder differs):
   ```
   %USERPROFILE%\Documents\LCEDA-Pro\cache.<id>\pro-ui\<VERSION>\js\ui.js   (active)
   C:\Program Files\easyeda-pro\resources\app\assets\pro-ui\<VERSION>\js\ui.js   (bundled)
   ```
2. **Apply the translations** (run an elevated terminal so it can write there):
   ```bash
   node apply-french.mjs "C:\Program Files\easyeda-pro\resources\app\assets\pro-ui\<VERSION>\js\ui.js"
   ```
   The script:
   - inserts the **3 870** translations into the French table,
   - **registers the French language option** and its flag,
   - writes a backup next to the file: **`ui.js.en.bak`**,
   - is **idempotent** (safe to re-run) and keeps the file pure-ASCII.
3. *(Optional — system strings)* copy the locale files and apply the two remaining
   edits described in **`CODE-MODS.md`**:
   ```
   copy locale\fr.json           ...\assets\locale\fr.json
   copy locale\app-menu-fr.json  ...\assets\locale\app-menu-fr.json
   ```
4. **Restart EasyEDA Pro** and pick **Français** in the language menu (top-right).

### Revert to English

```bash
copy "ui.js.en.bak" "ui.js"     # restore the backup the script made
```

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

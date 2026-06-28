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
| `ui-fr.json` | The translation glossary — **3 870** `English → Français` pairs |
| `apply-french.mjs` | Node script: inserts the translations **+** registers the French language entry and flag in your `ui.js` |
| `locale/fr.json` | System locale (Client Setting panel & misc. strings), ~474 keys |
| `locale/app-menu-fr.json` | Application menu (French) |
| `CODE-MODS.md` | The 4 small code edits that make French selectable (2 are automated, 2 documented) |
| `MEMO_EASYEDA_FR.md` | Full translation procedure / project notes |

## Requirements

- **Node.js ≥ 18** (only to run the apply script)
- **EasyEDA Pro** installed (Windows). Admin rights to write into `Program Files`.

## Installation

1. **Find your `ui.js`** (the version folder name will differ):
   ```
   C:\Program Files\easyeda-pro\resources\app\assets\pro-ui\<VERSION>\js\ui.js
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

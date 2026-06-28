# How the French pack works (method + code-mods)

`apply-french.mjs` makes EasyEDA Pro's `ui.js` French **automatically** and is
**version-robust** (confirmed on `3.2.148` and a fresh `3.2.149`). It does NOT need a
pristine-English original — it edits the bundle in place. Identifiers like `cn`, `me`,
`t`, `sni`, `K5`, `UBDbW` are minified and differ per build, so everything below is found
by **structure / the locale map**, not hardcoded names.

## The translation method (the important part)

1. **Find the French locale object via the locale map**, not a fixed name:
   `match /[,{]fr:(\w+)[,}]/` → e.g. `fr:sni` (the map is `{cs:oni,de:nni,en:rni,es:ani,fr:sni,…}`),
   then brace-match `var <name>={ … }`.
2. **REPLACE existing key values in place — never append duplicates.** EasyEDA keeps the
   **FIRST** value of a duplicated key, so appending French is silently ignored. For each
   English key: replace its value if it exists, otherwise ADD it. The shipped `fr` (and
   `en`) objects are nearly empty, so untranslated UI falls back to the **English key
   itself** — that is exactly why setting `sni["English text"]="French"` translates it.
3. **Translate `@@topMenu` (the top menu bar) globally.** On newer versions it lives
   **outside** the `fr` object as a single shared menu config. Its keys may be quoted
   (`"File{num}"`) or bare identifiers (`Order:"…"`); REPLACE both. The menu words
   (Settings/Advanced/Tools…) from `topmenu-fr.json` are also merged into the `fr` object,
   because the bar looks items up by plain key (`t("Settings")`).

Accents are emitted as `\uXXXX` so the file stays pure-ASCII (non-ASCII count unchanged);
the script `node --check`s its output and writes a `.en.bak` backup.

## The 4 code-mods (all automated)

| # | What | Effect |
|---|------|--------|
| 1 | **Language option** — add `{title:"Français",icon:"language_fr",lang:"fr"}` after the English entry | French appears in the picker |
| 2 | **Flag CSS** — add `#language .language_fr_<hash>{background-position:-36px -52px}` (hash captured from the EN rule) | French flag shows |
| 3 | **FR badge** — add an `is.lang==="fr"?…children:"FR"…` branch next to the EN one | "FR" in the top-right badge |
| 4 | **Force LOCAL loading** *(the critical one)* — `<X>._cache[<t>]&&<X>.update(<t>)` → `<X>._cache[<t>]?<X>._cache[<t>]._status="loaded":<X>._cache[<t>]={_status:"loaded"},<X>.update(<t>)` | EasyEDA uses the **local** table instead of fetching the (partial) French from its server |

**Mod #4 was the missing piece**: without it EasyEDA downloads the server's incomplete
French and ignores everything we inserted → only a few strings showed. All four are
applied with regex-captured minified names, so one pack works across versions.

## `app.js` (the Electron shell) — `app-fr.json`, 132 pairs

The shell has its own table (`Save`→`Enregistrer`, `Export`→`Exporter`, `Close`→`Fermer`…).
`apply-french-app.mjs` adds `r.LANGUAGE_FR="fr"`, a `,fr:<module>` map entry, a
`var f5={…}` French table, and routes the `Ly()` lookup through `f5` when the language is
`"fr"`. `File`/`Edit`/`Open`/`New`/`View` are keys **nowhere** — they come from `@@topMenu`
(`File{num}`) or are hardcoded.

## Locale data files (copied, not patched)

`locale/fr.json` (≈511 keys) and `locale/app-menu-fr.json` (browser context menu,
`label_undo`→`Annuler`…) are copied into `…\resources\app\assets\locale\`. Mod #4 makes
EasyEDA load these locally.

## Out of scope

Server-loaded PCB-order panel strings ("Double Sided", "Single Sided Top/Bottom"), a few
composed/dynamic labels, and `smt-ui.js` (uses i18next + external JSON, almost no inline FR).

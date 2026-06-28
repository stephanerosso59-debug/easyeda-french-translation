# Code modifications (making French selectable)

Besides the ~3 870 translated strings, four tiny edits to `ui.js` make French a
real, selectable language. **`apply-french.mjs` performs #1 and #2 automatically**
(idempotently). #3 and #4 are cosmetic / for the system-locale file and are
documented here for manual application. All snippets are from EasyEDA Pro
`3.2.148.f1ab0d63`; identifiers like `cn`, `me`, `t`, `UBDbW` are minified and may
differ on other builds.

---

## 1. Register the French language option  ✅ automated

In the language list, after the English entry, add the French one:

```js
// ...,{title:"English",icon:"language_en",lang:"en"}]
// becomes:
   ...,{title:"English",icon:"language_en",lang:"en"},{title:"Français",icon:"language_fr",lang:"fr"}]
```

## 2. Flag sprite for French  ✅ automated

Right after the English flag rule, add the French one (reuse the same hash suffix):

```css
#language .language_en_UBDbW{background-position:-36px -26px}
/* add: */
#language .language_fr_UBDbW{background-position:-36px -52px}
```

## 3. Show "FR" in the top-right language badge  ✍️ manual (cosmetic)

Insert a French branch next to the English one:

```js
// ...children:"EN"}):  (0,cn.jsx)("div",{...})
// becomes:
   ...children:"EN"}):is.lang==="fr"?(0,cn.jsx)("div",{className:`${t["language-en-text"]} `,children:"FR"}):(0,cn.jsx)("div",{...})
```

## 4. Load the local French locale without a server  ✍️ manual (for `locale/fr.json`)

In the locale-loading routine, short-circuit so the bundled `fr.json` is treated as
already loaded:

```js
me._cache.en=me._cache.en||{_status:"loaded"},me._cache[t]?me._cache[t]._status="loaded":me._cache[t]={_status:"loaded"},me.update(t);return
```

This pairs with copying `locale/fr.json` and `locale/app-menu-fr.json` into
`...\assets\locale\`.

---

### Not translatable from `ui.js`

Some strings come from the server-loaded PCB-order panel ("Double Sided",
"Single Sided Top/Bottom"), a few composed/dynamic labels, and some CSS-bound
layout text. These are out of scope for this pack.

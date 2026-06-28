# 🌍 EASYEDA PRO EN FRANÇAIS + EXTENSION MCP — MÉMO COMPLET

> **Version : v20 — ~1421 traductions**
> Date : 27 juin 2026 (base v18 du 14 juin 2026)
> Base : `ui_v12-3.js` (stable) + ajouts v13 → v20
> **Master de travail : `ui_v20.js`** (à recopier vers Program Files ; sert de base pour la v21)
> Statut : Fonctionnel ✅
> Auteurs : Stéphane Rosso & Claude

---

# PARTIE 1 — TRADUCTION DE L'INTERFACE EASYEDA PRO (`ui.js`)

## 📁 Fichiers

```
Cible installée : C:\Program Files\easyeda-pro\resources\app\assets\pro-ui\3.2.148.f1ab0d63\js\ui.js
Master de travail : C:\Users\PC\Documents\EasyEDA-Pro\EasyEda_FR\Easyeda_fr_v3_French\ui_v20.js
Captures à traduire : ...\Easyeda_fr_v3_French\captures\   (Claude lit les PNG et en extrait l'anglais)
```

## 🔧 4 modifications de code (en plus des traductions)

1. **Langue FR** : `{title:"Français",icon:"language_fr",lang:"fr"}`
2. **CSS drapeau** : `#language .language_fr_UBDbW{background-position:-36px -52px}`
3. **Affichage « FR »** : `is.lang==="fr"?(0,cn.jsx)("div",{className:`${t["language-en-text"]} `,children:"FR"})`
4. **Chargement local** : `me._cache[t]?me._cache[t]._status="loaded":me._cache[t]={_status:"loaded"},me.update(t);return`

## 📋 RÈGLES CRITIQUES POUR MODIFIER `ui.js`

⚠️ Traductions FR **DANS** l'objet `sni`, insérées **AVANT le 1er** `,"@@topMenu"` (le 2ᵉ appartient à l'objet chinois `zh`).
⚠️ **Accents** → `\uXXXX` (é→`é`…). **Apostrophe `'` dans les valeurs** → `’`. **Guillemets internes** restent escapés (`\"`).
⚠️ **Pas de doublons** dans `sni`. ⚠️ **Diff non-ASCII vs original = 0** (tout ajout doit être pur ASCII).
⚠️ Vérifs systématiques : `node --check ui_vXX.js` ; non-ASCII inchangé ; `@@topMenu` reste à 2.

## 🔑 PROCÉDURE D'INSERTION (script Node)

Le script lit la **clé source EXACTE** depuis le fichier (gère les troncatures et les guillemets internes via une extraction respectant les `\` échappés), encode les valeurs FR, refuse les doublons, insère avant le 1er `,"@@topMenu"`, écrit `ui_vXX.js` et vérifie tout. Cœur :

```javascript
function enc(str){let r="";for(const ch of str){if(ch==="'"){r+="\\u2019";continue;}
  const cp=ch.codePointAt(0);r+=cp<0x80?ch:"\\u"+cp.toString(16).toUpperCase().padStart(4,"0");}return r;}
function extractKey(s,oq){let i=oq+1,k="";while(i<s.length){const c=s[i];
  if(c==="\\"){k+=c+s[i+1];i+=2;continue;}if(c==='"'){return(s[i+1]===":"&&s[i+2]==='"')?k:null;}k+=c;i++;}return null;}
const idx=s.indexOf(',"@@topMenu"');                 // 1er marqueur = objet sni FR
const result=s.slice(0,idx)+insertion+s.slice(idx);  // insertion = ,"cleEN":"valFR_encodee",...
```

**Captures d'écran** : enregistrer les PNG dans `captures\`, Claude lit, extrait l'anglais, **cherche la clé exacte dans `ui.js`** (l'OCR peut se tromper, pas la clé), traduit, insère.

## ✅ CE QUI EST TRADUIT (v20 ~1421 clés)

- Menus, sous-menus, Paramètres, Design Rules, Export (Gerber/BOM/Netlist/PADS — noms conservés), Couches, Quick Start, Propriétés, etc. *(base v18)*
- **v19** : dialogue « Safety Tips » → « Conseils de sécurité » + texte de permission.
- **🆕 v20 (~99 ajouts, depuis captures d'écran)** :
  - **Règles de Conception** : onglets Réseau (bus/net/Netflag/Netport/Off Page Connector/paire différentielle…), Composant (Device/Footprint/Number/Designator/Supplier Part…), Bloc de Réutilisation.
  - **Dialogues d'import** : EasyEDA Std, Altium, LTspice, EAGLE (compresser en zip, police, différences de format, responsabilité…).
  - **Création composants en lot** (modèle xlsx, bibliothèques Symbole/Empreinte/Modèle 3D, ≤ 2000 composants…).
  - **Export PDF / Vues** : Blanc sur noir, Noir sur blanc, Taille d'origine, Mode variantes d'assemblage, Mosaïque H/V/Tout, Tout fusionner.
  - **Calques 3D / formes de carte** : Coque 3D - Contour/Pilier de vis/Entité…, Générer forme/lignes, Conserver/Fusionner/Soustraire/Exclure/Diviser zones, sélections « … uniquement ».
  - **Infos PCB** : Titre carte/PCB, Taille carte, Trou métallisé/non métallisé, Vias traversants.
  - **Calques & piste** : Couche forme/marquage/soudure/contour, Largeur de piste initiale, Diamètre via int./ext., Sérigraphie couleur, couleurs faces sup./inf.
  - **Divers** : Définir le masque du composant, Définir le style, « Cette action effacera l'historique… », « Compris, supprimer. » (raccourci pour éviter le débordement).

## ❌ CE QUI RESTE EN ANGLAIS / À FAIRE

- **« Explanation »** (en-tête colonne) et **« UnLocked »** (état calque) : pas des clés directes dans `ui.js`.
- **« Double Sided » / « Single Sided Top/Bottom »** : **absents de `ui.js`** — viennent du **panneau de commande PCB** (chargé depuis le serveur).
- **Règle #3 « The first columns "Device"… "$" »** : guillemets internes → à insérer manuellement avec la clé exacte.
- **Texte rouge « You can select or box select the component… »** (masque composant) : chaîne composée.
- **Mise en page (non-trad)** : fenêtre du modèle **Spice** trop petite (CSS dans le code).
- Labels de dialogues avancés, messages du journal, noms de couches PCB, textes serveur LCSC.

## 🚀 INSTALLATION (PowerShell Admin)

```powershell
$dst = "C:\Program Files\easyeda-pro\resources\app\assets\pro-ui\3.2.148.f1ab0d63\js\ui.js"
Copy-Item $dst "$dst.bak" -Force
Copy-Item "C:\Users\PC\Documents\EasyEDA-Pro\EasyEda_FR\Easyeda_fr_v3_French\ui_v20.js" $dst -Force
# Restaurer l'anglais : Copy-Item "$dst.bak" $dst -Force
```
⚠️ Adapter le dossier de version (`3.2.148.f1ab0d63`) s'il change après une MAJ EasyEDA.

## 📦 FICHIERS ANNEXES MODIFIÉS

- `…\assets\js\translate.js` → bloc `fr:{ … }` (panneau Client Setting)
- `…\assets\locale\fr.json` → traductions système (~474 clés)

## 📝 HISTORIQUE DES VERSIONS

| Version | Base | Clés | Statut |
|---------|------|------|--------|
| v12-3 | ui.js original | ~1282 | ✅ Base stable |
| v18 | v12-3 | ~1320 | ✅ Fonctionne |
| v19 | v18 | ~1322 | ✅ + dialogue « Safety Tips » FR |
| **v20** | **v19** | **~1421** | **✅ + ~99 trad. (règles, imports, export, 3D, infos PCB…)** |

---

# PARTIE 2 — EXTENSION « PONT MCP EASYEDA » (MCP Bridge)

Extension EasyEDA Pro créant un **pont WebSocket local** (`ws://127.0.0.1:8765`) entre EasyEDA Pro et un **serveur MCP** (Claude) : lire le schéma, tracer des nets, exporter netlist/BOM/Gerber/PDF, etc.

## Emplacements & git

| Élément | Chemin |
|---|---|
| Projet | `C:\Users\PC\Documents\easyeda_mcp` |
| Source extension | `…\easyeda_mcp\extension\src\index.ts` |
| `.eext` anglais | `…\easyeda_mcp\easyeda-mcp-bridge_v0.3.3.eext` (branche git `feat/schematic-netlist-export`) |
| `.eext` français | `…\easyeda_mcp\easyeda-mcp-bridge_v0.4.0_FR.eext` (branche git `i18n/french-only`) |
| Build | `npm run build:extension && npm run package:extension` |
| Remote | `github.com/VLab-Software/easyeda_mcp` (`master`) |

## Ce qu'on a fait

1. **Correctif netlist** : la vraie connectivité net→broche est exportée via **`eda.sch_ManufactureData.getNetlistFile(fileName, "PADS")`** → parser le PADS (`*SIGNAL*` + `DES.PIN`) → inscrire le net sur chaque broche avant le snapshot. (Avant : `nodeCount: 0` partout, car `SCH_Net` ne donne que les noms.)
2. **Résilience port** : `EasyEdaBridge.start()` ne crashe plus sur `EADDRINUSE`.
3. **22 outils MCP** ; **version française v0.4.0** (menus « Pont MCP », Detail FR, messages FR).

## Crédits

- **Stéphane Rosso & Claude** — curation, correctif netlist, version française, maintenance.
- **oaslananka** — jeu d'outils MCP d'origine (`easyeda-mcp-pro`).
- **vlabsoft** — bundle de pont d'origine.

---

# PARTIE 3 — FICHIERS JSON F1ATB

| Fichier | Usage | Import via |
|---------|-------|-----------|
| `F1ATB_DesignRules_v2.json` | Règles pistes (Signal/3.3V/5V/12V/220V) | Conception → Règle Conception → Importer |
| `F1ATB_LayerManager.json` | Couches PCB 2 couches optimisées | Gestionnaire Couches → Importer |
| `F1ATB_SystemSetting.json` | Largeurs pistes + vias + langue FR | Paramètres → Importer Config |

### Classes de pistes F1ATB

| Classe | Largeur | Usage |
|--------|---------|-------|
| Signal_Default | 0.25 mm | GPIO, SPI, UART, I2C |
| Power_3V3 | 0.5 mm | +3.3V (I<500mA) |
| Power_5V | 0.8 mm | +5V (I<1A) |
| Power_12V | 1.0 mm | +12V, GND (I<2A) |
| HT_220V | 2.5 mm | Phase/Neutre 220V |

Isolation 220V : **3 mm minimum**

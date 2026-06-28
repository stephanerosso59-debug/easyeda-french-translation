# ============================================================
#  EasyEDA Pro - Pack de traduction FRANCAIS - Installation
#  Usage (terminal PowerShell EN ADMINISTRATEUR) :
#      Set-ExecutionPolicy Bypass -Scope Process -Force
#      .\install.ps1
#  Option : .\install.ps1 -EasyEdaDir "D:\Chemin\vers\easyeda-pro"
#  Pour revenir a l'anglais : .\install.ps1 -Uninstall
# ============================================================
param(
    [string]$EasyEdaDir = "C:\Program Files\easyeda-pro",
    [switch]$Uninstall
)
$ErrorActionPreference = 'Stop'
$Here = Split-Path -Parent $MyInvocation.MyCommand.Path

function Info($m){ Write-Host $m -ForegroundColor Green }
function Warn($m){ Write-Host $m -ForegroundColor Yellow }
function Err ($m){ Write-Host $m -ForegroundColor Red }

Write-Host "============================================" -ForegroundColor Cyan
Write-Host "  EasyEDA Pro - Traduction francaise" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan

# --- droits admin (requis pour ecrire dans Program Files) ---
$needAdmin = $EasyEdaDir -like "$env:ProgramFiles*" -or $EasyEdaDir -like "C:\Program Files*"
$isAdmin = ([Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]"Administrator")
if ($needAdmin -and -not $isAdmin) {
    Err "Lance ce script dans un terminal PowerShell EN ADMINISTRATEUR."
    Err "(Clic droit sur PowerShell -> Executer en tant qu'administrateur)"
    exit 1
}

# --- localiser ui.js (auto-detection du dossier de version) ---
$proUi = Join-Path $EasyEdaDir "resources\app\assets\pro-ui"
if (-not (Test-Path $proUi)) {
    Err "EasyEDA Pro introuvable ici : $proUi"
    Err "Precise le bon chemin :  .\install.ps1 -EasyEdaDir 'C:\Chemin\easyeda-pro'"
    exit 1
}
$verDir = Get-ChildItem $proUi -Directory | Sort-Object Name -Descending | Select-Object -First 1
$uiPath = Join-Path $verDir.FullName "js\ui.js"
if (-not (Test-Path $uiPath)) { Err "ui.js introuvable dans $($verDir.FullName)\js"; exit 1 }
$localeDir = Join-Path $EasyEdaDir "resources\app\assets\locale"
Info "ui.js detecte : $uiPath"

# --- desinstallation : restaurer la sauvegarde ---
if ($Uninstall) {
    if (Test-Path "$uiPath.en.bak") {
        Copy-Item "$uiPath.en.bak" $uiPath -Force
        Info "ui.js restaure (anglais)."
    } else { Warn "Pas de sauvegarde ui.js.en.bak trouvee." }
    $smtRoot = Join-Path $EasyEdaDir "resources\app\assets\smt-ui"
    if (Test-Path $smtRoot) {
        $smtVer = Get-ChildItem $smtRoot -Directory | Sort-Object Name -Descending | Select-Object -First 1
        if ($smtVer -and (Test-Path "$($smtVer.FullName)\smt-ui.js.en.bak")) {
            Copy-Item "$($smtVer.FullName)\smt-ui.js.en.bak" "$($smtVer.FullName)\smt-ui.js" -Force
            Info "smt-ui.js restaure (anglais)."
        }
    }
    Write-Host "Redemarre EasyEDA Pro." -ForegroundColor Cyan
    exit 0
}

# --- fonctions d'encodage ---
function Enc([string]$s){
    $sb = New-Object System.Text.StringBuilder
    foreach($c in $s.ToCharArray()){
        $n = [int][char]$c
        if   ($c -eq '\'){ [void]$sb.Append('\\') }
        elseif($c -eq '"'){ [void]$sb.Append('\"') }
        elseif($n -lt 128){ [void]$sb.Append($c) }
        else { [void]$sb.Append('\u' + $n.ToString('x4')) }
    }
    $sb.ToString()
}
function JsonUnescape([string]$s){
    $s = [regex]::Replace($s,'\\u([0-9a-fA-F]{4})',{ param($m) [string][char][Convert]::ToInt32($m.Groups[1].Value,16) })
    $s = $s -replace '\\"','"' -replace '\\\\','\' -replace '\\/','/' -replace '\\n',"`n" -replace '\\t',"`t"
    return $s
}

# --- lire ui.js + sauvegarde ---
$ui = [System.IO.File]::ReadAllText($uiPath, [System.Text.Encoding]::UTF8)
$marker = ',"@@topMenu"'
$idx = $ui.IndexOf($marker)
if ($idx -lt 0) { Err "Marqueur de traduction introuvable - cette version de ui.js n'est pas compatible."; exit 1 }
if (-not (Test-Path "$uiPath.en.bak")) { Copy-Item $uiPath "$uiPath.en.bak" -Force; Info "Sauvegarde creee : ui.js.en.bak" }

# --- charger le glossaire ui-fr.json (ligne par ligne : evite les soucis de cles dupliquees) ---
$rx = [regex]'^\s*"((?:[^"\\]|\\.)*)"\s*:\s*"((?:[^"\\]|\\.)*)"\s*,?\s*$'
$added = 0; $skipped = 0
$sb = New-Object System.Text.StringBuilder
foreach($line in [System.IO.File]::ReadAllLines((Join-Path $Here 'ui-fr.json'))){
    $m = $rx.Match($line)
    if (-not $m.Success) { continue }
    $k = Enc (JsonUnescape $m.Groups[1].Value)
    $v = Enc (JsonUnescape $m.Groups[2].Value)
    $pair = '"' + $k + '":"' + $v + '"'
    if ($ui.Contains($pair)) { $skipped++; continue }
    [void]$sb.Append(',' + $pair)
    $added++
}
$ui = $ui.Substring(0,$idx) + $sb.ToString() + $ui.Substring($idx)
Info "Traductions inserees : $added  (deja presentes : $skipped)"

# --- code-mods : rendre le francais selectionnable ---
if ($ui -notmatch 'icon:"language_fr",lang:"fr"') {
    $anchor = ',icon:"language_en",lang:"en"}]'
    if ($ui.Contains($anchor)) { $ui = $ui.Replace($anchor, ',icon:"language_en",lang:"en"},{title:"Français",icon:"language_fr",lang:"fr"}]'); Info "Langue FR enregistree." }
    else { Warn "Ancre 'langue' non trouvee (voir CODE-MODS.md)." }
}
$mCss = [regex]::Match($ui,'#language \.language_en_(\w+)\{background-position:-36px -26px\}')
if ($mCss.Success -and ($ui -notmatch '\.language_fr_\w+\{background-position')) {
    $ui = $ui.Replace($mCss.Value, $mCss.Value + ('#language .language_fr_{0}{{background-position:-36px -52px}}' -f $mCss.Groups[1].Value))
    Info "Drapeau FR ajoute."
}

# --- ecrire ui.js (UTF-8 sans BOM) ---
[System.IO.File]::WriteAllText($uiPath, $ui, (New-Object System.Text.UTF8Encoding($false)))

# --- copier les fichiers de locale systeme ---
if (-not (Test-Path $localeDir)) { New-Item -ItemType Directory -Path $localeDir -Force | Out-Null }
foreach($f in @('fr.json','app-menu-fr.json')){
    $src = Join-Path $Here ("locale\" + $f)
    if (Test-Path $src) {
        $dst = Join-Path $localeDir $f
        if ((Test-Path $dst) -and -not (Test-Path "$dst.bak")) { Copy-Item $dst "$dst.bak" -Force }
        Copy-Item $src $dst -Force
        Info "Locale copiee : $f"
    }
}

# --- module SMT / DFM (smt-ui.js) : DESACTIVE dans l'installeur (trop lent en PowerShell) ---
# Pour traduire le module SMT, utiliser le script node (rapide) :
#   node smt\apply-french-smt.mjs "C:\Program Files\easyeda-pro\resources\app\assets\smt-ui\<VERSION>\smt-ui.js"
$smtRoot = Join-Path $EasyEdaDir "resources\app\assets\smt-ui"
$smtFr   = Join-Path $Here "smt\smt-fr.json"
if ($false -and (Test-Path $smtRoot) -and (Test-Path $smtFr)) {
    $smtVer  = Get-ChildItem $smtRoot -Directory | Sort-Object Name -Descending | Select-Object -First 1
    $smtPath = if ($smtVer) { Join-Path $smtVer.FullName "smt-ui.js" } else { $null }
    if ($smtPath -and (Test-Path $smtPath)) {
        $smt = [System.IO.File]::ReadAllText($smtPath, [System.Text.Encoding]::UTF8)
        if ($smt.Contains('fr:{common:Rnt.fr}')) {
            Info "Module SMT/DFM deja en francais."
        } else {
            $rs = $smt.IndexOf('Rnt={')
            if ($rs -lt 0) { Warn "Module SMT : table Rnt introuvable, ignore." }
            else {
                $i = $rs + 4; $d = 0; $end = -1; $inStr = $false
                while ($i -lt $smt.Length) {
                    $c = $smt[$i]
                    if ($inStr) { if ($c -eq '\') { $i += 2; continue }; if ($c -eq '"') { $inStr = $false }; $i++; continue }
                    if ($c -eq '"') { $inStr = $true; $i++; continue }
                    if ($c -eq '{') { $d++ } elseif ($c -eq '}') { $d--; if ($d -eq 0) { $end = $i; break } }
                    $i++
                }
                if ($end -lt 0) { Warn "Module SMT : analyse de Rnt impossible, ignore." }
                else {
                    if (-not (Test-Path "$smtPath.en.bak")) { Copy-Item $smtPath "$smtPath.en.bak" -Force }
                    $sb2 = New-Object System.Text.StringBuilder
                    [void]$sb2.Append(',fr:{'); $firstK = $true
                    foreach ($line in [System.IO.File]::ReadAllLines($smtFr)) {
                        $m = $rx.Match($line)
                        if (-not $m.Success) { continue }
                        $k = JsonUnescape $m.Groups[1].Value
                        $v = Enc (JsonUnescape $m.Groups[2].Value)
                        if (-not $firstK) { [void]$sb2.Append(',') }
                        [void]$sb2.Append($k + ':"' + $v + '"'); $firstK = $false
                    }
                    [void]$sb2.Append('}')
                    $smt = $smt.Substring(0, $end) + $sb2.ToString() + $smt.Substring($end)
                    $smt = $smt.Replace('en:{common:Rnt.en}}', 'en:{common:Rnt.en},fr:{common:Rnt.fr}}')
                    [System.IO.File]::WriteAllText($smtPath, $smt, (New-Object System.Text.UTF8Encoding($false)))
                    Info "Module SMT/DFM traduit (smt-ui.js)."
                }
            }
        }
    }
}

Write-Host ""
Write-Host "============================================" -ForegroundColor Cyan
Info  "  Termine ! Redemarre EasyEDA Pro,"
Info  "  puis choisis 'Francais' (menu langue, en haut a droite)."
Write-Host "  Revenir a l'anglais :  .\install.ps1 -Uninstall" -ForegroundColor DarkGray
Write-Host "============================================" -ForegroundColor Cyan

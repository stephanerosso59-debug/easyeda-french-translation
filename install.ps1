# ============================================================
#  EasyEDA Pro - Traduction FRANCAISE - lanceur
#  Ce script ne fait que lancer :  node install.mjs
#
#  Usage (PowerShell EN ADMINISTRATEUR, dans ce dossier) :
#      Set-ExecutionPolicy Bypass -Scope Process -Force
#      .\install.ps1
#  Chemin EasyEDA personnalise :  .\install.ps1 -EasyEdaDir "D:\...\easyeda-pro"
#  Revenir a l'anglais         :  .\install.ps1 -Uninstall
#
#  (Equivalent direct, sans ce script :  node install.mjs )
# ============================================================
param(
    [string]$EasyEdaDir = "C:\Program Files\easyeda-pro",
    [switch]$Uninstall
)
$Here = Split-Path -Parent $MyInvocation.MyCommand.Path

Write-Host "============================================" -ForegroundColor Cyan
Write-Host "  EasyEDA Pro - Traduction francaise" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan

# --- admin (requis pour ecrire dans Program Files) ---
$isAdmin = ([Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]"Administrator")
if (-not $isAdmin) {
    Write-Host "ERREUR : lance ce script EN ADMINISTRATEUR." -ForegroundColor Red
    Write-Host "(Clic droit sur Windows PowerShell -> Executer en tant qu'administrateur)" -ForegroundColor Red
    exit 1
}

# --- Node.js requis ---
$node = Get-Command node -ErrorAction SilentlyContinue
if (-not $node) {
    Write-Host "ERREUR : Node.js est requis." -ForegroundColor Red
    Write-Host "Installe-le depuis https://nodejs.org (bouton LTS), puis relance ce script." -ForegroundColor Red
    exit 1
}

# --- lancer l'installeur node ---
$mjs = Join-Path $Here "install.mjs"
if (-not (Test-Path $mjs)) { Write-Host "ERREUR : install.mjs introuvable a cote de ce script." -ForegroundColor Red; exit 1 }

if ($Uninstall) {
    & node "$mjs" "$EasyEdaDir" --uninstall
} else {
    & node "$mjs" "$EasyEdaDir"
}

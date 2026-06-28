# Script de traduction automatique BOM Interactive EasyEDA
# Usage: .\translate_bom.ps1 -InputFile "chemin\vers\InteractiveBOM.html"
# Le fichier traduit est sauvegardé à côté avec le suffixe _FR

param(
    [Parameter(Mandatory=$true)]
    [string]$InputFile
)

$content = Get-Content -Path $InputFile -Raw -Encoding UTF8

# Dictionnaire de traductions en -> fr
$translations = @{
    'value:"View"' = 'value:"Vue"'
    'value:"Tools"' = 'value:"Outils"'
    'value:"Export"' = 'value:"Exporter"'
    'value:"Zoom In"' = 'value:"Zoom +"'
    'value:"Zoom Out"' = 'value:"Zoom -"'
    'value:"Fit Selection View"' = 'value:"Adapter Vue Selection"'
    'value:"Fit All In Window"' = 'value:"Tout Afficher"'
    'value:"PCB Editor"' = 'value:"Editeur PCB"'
    'value:"JLCPCB SMT Part Selection Tool..."' = 'value:"Outil Selection SMT JLCPCB..."'
    'value:"Soldering Assistance Tool..."' = 'value:"Outil Assistance Soudure..."'
    'value:"Bill of Materials(BOM)"' = 'value:"Nomenclature (BOM)"'
    'value:"Image"' = 'value:"Image"'
    'value:"3D File"' = 'value:"Fichier 3D"'
    'value:"Back to Editor"' = 'value:"Retour Editeur"'
    'value:"Rotate Left"' = 'value:"Rotation Gauche"'
    'value:"Rotate Right"' = 'value:"Rotation Droite"'
    'value:"Flip Board"' = 'value:"Retourner PCB"'
    'value:"Top"' = 'value:"Dessus"'
    'value:"Bottom"' = 'value:"Dessous"'
    'value:"Coordinate"' = 'value:"Coordonnees"'
    'value:"Combined Designators"' = 'value:"Reperes Combines"'
    'value:"Uncombined Designators"' = 'value:"Reperes Non Combines"'
    'value:"Match Successfully"' = 'value:"Associe"'
    'value:"Match Incomplete"' = 'value:"Association Incomplete"'
    'value:"Find All"' = 'value:"Rechercher Tout"'
    'value:"Find Designator"' = 'value:"Rechercher Repere"'
    'value:"Layer"' = 'value:"Couche"'
    'value:"Designator"' = 'value:"Repere"'
    'value:"Designator(Top)"' = 'value:"Repere (Dessus)"'
    'value:"Designator(Bottom)"' = 'value:"Repere (Dessous)"'
    'value:"Device Name"' = 'value:"Nom Composant"'
    'value:"Footprint"' = 'value:"Empreinte"'
    'value:"Board"' = 'value:"PCB"'
    'value:"Attribute"' = 'value:"Attribut"'
    'value:"Basic Part"' = 'value:"Composant de Base"'
    'value:"Cancel"' = 'value:"Annuler"'
    'value:"Component Model"' = 'value:"Modele Composant"'
    'value:"Confirm"' = 'value:"Confirmer"'
    'value:"Data Sheet"' = 'value:"Fiche Technique"'
    'value:"Delete matching results"' = 'value:"Supprimer resultats association"'
    'value:"Description"' = 'value:"Description"'
    'value:"Details"' = 'value:"Details"'
    'value:"Device number after matching"' = 'value:"Numero composant apres association"'
    'value:"Display Mode"' = 'value:"Mode Affichage"'
    'value:"Export 3D File "' = 'value:"Exporter Fichier 3D "'
    'value:"Export Bill of Materials(BOM) "' = 'value:"Exporter Nomenclature (BOM) "'
    'value:"Export Image "' = 'value:"Exporter Image "'
    'value:"Export Offline Html "' = 'value:"Exporter HTML Hors Ligne "'
    'value:"Extented Part"' = 'value:"Composant Etendu"'
    'value:"File Name"' = 'value:"Nom Fichier"'
    'value:"File Type"' = 'value:"Type Fichier"'
    'value:"Hide Soldered"' = 'value:"Masquer Soudes"'
    'value:"JLC Part Class"' = 'value:"Classe JLC"'
    'value:"JLCPCB Matched Footprint"' = 'value:"Empreinte Associee JLCPCB"'
    'value:"JLCPCB Part Class"' = 'value:"Classe JLCPCB"'
    'value:"LCSC Part Name"' = 'value:"Nom Composant LCSC"'
    'value:"Loading 3D Model"' = 'value:"Chargement Modele 3D"'
    'value:"Matching"' = 'value:"Association"'
    'value:"Object"' = 'value:"Objet"'
    'value:"Offline Html"' = 'value:"HTML Hors Ligne"'
    'value:"Only Show Soldered"' = 'value:"Afficher Seulement Soudes"'
    'value:"Operate"' = 'value:"Operer"'
    'value:"Quantity"' = 'value:"Quantite"'
    'value:"Rated Voltage"' = 'value:"Tension Nominale"'
    'value:"Replace"' = 'value:"Remplacer"'
    'value:"Search All"' = 'value:"Rechercher Tout"'
    'value:"Search Tag"' = 'value:"Rechercher Tag"'
    'value:"Show All Components"' = 'value:"Afficher Tous les Composants"'
    'value:"Soldered"' = 'value:"Soude"'
    'value:"Supplier Footprint"' = 'value:"Empreinte Fournisseur"'
    'value:"Supplier Part"' = 'value:"Reference Fournisseur"'
    'value:"Tips"' = 'value:"Conseils"'
    'value:"Tolerance"' = 'value:"Tolerance"'
    'value:"Url"' = 'value:"URL"'
    'value:"Value"' = 'value:"Valeur"'
    'value:"Warning"' = 'value:"Avertissement"'
    'value:"next page"' = 'value:"page suivante"'
    'value:"previous"' = 'value:"precedent"'
    'value:"use"' = 'value:"utiliser"'
    'value:" Yes"' = 'value:" Oui"'
    'value:" No"' = 'value:" Non"'
}

$count = 0
foreach ($key in $translations.Keys) {
    if ($content -like "*$key*") {
        $content = $content -replace [regex]::Escape($key), $translations[$key]
        $count++
    }
}

# Sauvegarder le fichier traduit
$outputFile = [System.IO.Path]::ChangeExtension($InputFile, "") + "_FR.html"
$content | Set-Content -Path $outputFile -Encoding UTF8
Write-Host "Traduit: $count termes"
Write-Host "Fichier sauvegarde: $outputFile"

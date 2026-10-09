# Sube cada carpeta de proyecto a GitHub como repo privado (Windows).
# Uso: powershell -ExecutionPolicy Bypass -File subir-proyectos.ps1 C:\ruta\a\mis\proyectos
param([string]$Base = (Get-Location).Path)
$Owner = "blopapa7-ux"

if (-not (Get-Command gh -ErrorAction SilentlyContinue)) {
  Write-Host "Instalando GitHub CLI..."
  winget install --id GitHub.cli -e --accept-source-agreements --accept-package-agreements
  Write-Host "Cerra y volve a abrir PowerShell, y ejecuta este script de nuevo."
  exit 1
}
gh auth status 2>$null
if ($LASTEXITCODE -ne 0) { gh auth login --web --git-protocol https }

Get-ChildItem -Path $Base -Directory | Where-Object { $_.Name -ne "node_modules" } | ForEach-Object {
  $name = $_.Name
  Write-Host "== $name"
  Push-Location $_.FullName
  if (-not (Test-Path .git)) { git init -q -b main }
  if (-not (Test-Path .gitignore)) { "node_modules/`n.env`n.DS_Store" | Out-File .gitignore -Encoding utf8 }
  git add -A
  git commit -qm "Sincronizacion desde local" 2>$null
  git remote get-url origin 2>$null
  if ($LASTEXITCODE -eq 0) { git push -u origin HEAD }
  else { gh repo create "$Owner/$name" --private --source=. --push }
  Pop-Location
}
Write-Host "Listo. Pasale a Emily esta lista de repos:"
gh repo list $Owner --limit 100 --json name -q ".[].name"

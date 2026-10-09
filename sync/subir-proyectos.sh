#!/usr/bin/env bash
# Sube cada carpeta de proyecto a GitHub como repo privado (Mac / Linux).
# Uso: bash subir-proyectos.sh /ruta/a/mis/proyectos
set -u
BASE="${1:-$PWD}"
OWNER="blopapa7-ux"

if ! command -v gh >/dev/null 2>&1; then
  echo "Falta la herramienta 'gh'. Instalala:"
  echo "  Mac:   brew install gh"
  echo "  Linux: https://github.com/cli/cli#installation"
  exit 1
fi
gh auth status >/dev/null 2>&1 || gh auth login --web --git-protocol https

cd "$BASE" || exit 1
for d in */ ; do
  name="${d%/}"
  [ "$name" = "node_modules" ] && continue
  echo "== $name"
  (
    cd "$name" || exit
    [ -d .git ] || git init -q -b main
    [ -f .gitignore ] || printf "node_modules/\n.env\n.DS_Store\n" > .gitignore
    git add -A && git commit -qm "Sincronización desde local" 2>/dev/null
    if git remote get-url origin >/dev/null 2>&1; then
      git push -u origin HEAD
    else
      gh repo create "$OWNER/$name" --private --source=. --push
    fi
  )
done
echo "Listo. Pasale a Emily esta lista de repos:"
gh repo list "$OWNER" --limit 100 --json name -q '.[].name'

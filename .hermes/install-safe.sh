#!/usr/bin/env bash
set -euo pipefail

SRC_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SRC_HERMES="$SRC_DIR/.hermes"
DEST_HERMES="${HERMES_HOME:-$HOME/.hermes}"
STAMP="$(date +%Y%m%d-%H%M%S)"

mkdir -p "$DEST_HERMES"

echo "Installing Slatecamp Hermes Pack into: $DEST_HERMES"
echo "Existing critical files will not be overwritten."

copy_file_safe() {
  local src="$1"
  local dest="$2"
  mkdir -p "$(dirname "$dest")"
  if [ -e "$dest" ]; then
    cp "$src" "$dest.slatecamp-pack-$STAMP"
    echo "kept existing: $dest"
    echo "  wrote candidate: $dest.slatecamp-pack-$STAMP"
  else
    cp "$src" "$dest"
    echo "wrote: $dest"
  fi
}

copy_tree_no_clobber() {
  local src="$1"
  local dest="$2"
  mkdir -p "$dest"
  (cd "$src" && find . -type d -exec mkdir -p "$dest/{}" \;)
  (cd "$src" && find . -type f | while read -r rel; do
    local target="$dest/$rel"
    mkdir -p "$(dirname "$target")"
    if [ -e "$target" ]; then
      cp "$src/$rel" "$target.slatecamp-pack-$STAMP"
      echo "kept existing: $target"
      echo "  wrote candidate: $target.slatecamp-pack-$STAMP"
    else
      cp "$src/$rel" "$target"
      echo "wrote: $target"
    fi
  done)
}

copy_file_safe "$SRC_HERMES/SOUL.md" "$DEST_HERMES/SOUL.md"
copy_file_safe "$SRC_HERMES/config.yaml" "$DEST_HERMES/config.yaml"
copy_file_safe "$SRC_HERMES/.env.example" "$DEST_HERMES/.env.example"
copy_file_safe "$SRC_HERMES/.gitignore" "$DEST_HERMES/.gitignore"
copy_file_safe "$SRC_HERMES/README.md" "$DEST_HERMES/README.md"
copy_file_safe "$SRC_HERMES/INSTALL.md" "$DEST_HERMES/INSTALL.md"
copy_file_safe "$SRC_HERMES/MANIFEST.md" "$DEST_HERMES/MANIFEST.md"

copy_tree_no_clobber "$SRC_HERMES/memories" "$DEST_HERMES/memories"
copy_tree_no_clobber "$SRC_HERMES/docs" "$DEST_HERMES/docs"
copy_tree_no_clobber "$SRC_HERMES/prompts" "$DEST_HERMES/prompts"
copy_tree_no_clobber "$SRC_HERMES/templates" "$DEST_HERMES/templates"
copy_tree_no_clobber "$SRC_HERMES/checklists" "$DEST_HERMES/checklists"
copy_tree_no_clobber "$SRC_HERMES/guardrails" "$DEST_HERMES/guardrails"
copy_tree_no_clobber "$SRC_HERMES/skills" "$DEST_HERMES/skills"
copy_tree_no_clobber "$SRC_HERMES/project-context" "$DEST_HERMES/project-context"
copy_tree_no_clobber "$SRC_HERMES/cron" "$DEST_HERMES/cron"
copy_tree_no_clobber "$SRC_HERMES/maintenance" "$DEST_HERMES/maintenance"

chmod 700 "$DEST_HERMES" 2>/dev/null || true
chmod 600 "$DEST_HERMES/config.yaml" "$DEST_HERMES/SOUL.md" 2>/dev/null || true

echo "Done. Run: hermes doctor"
echo "For Slatecamp project context, copy: $DEST_HERMES/project-context/slatecamp/.hermes.md into the Slatecamp repo root."

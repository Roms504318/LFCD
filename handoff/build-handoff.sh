#!/usr/bin/env bash
# Build the hand-off zip for the LFCD site team.
#
# Uses an ALLOWLIST: only the site pages, css/, js/, data/ and assets/ are copied,
# plus the hand-off README/CLAUDE.md. Source/reference documents in the repo root
# (pitch docs, board decks, assessor PDFs, etc.) are never included.
#
# Usage:  bash handoff/build-handoff.sh            -> dist/LFCD-site-handoff.zip
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
NAME="LFCD-website"
OUT_DIR="$ROOT/dist"
STAGE="$(mktemp -d)"
trap 'rm -rf "$STAGE"' EXIT

PKG="$STAGE/$NAME"
mkdir -p "$PKG"

cd "$ROOT"
# Site files (tracked in git only, so stray local files never slip in)
git ls-files -- ':(top,glob)*.html' ':(glob)css/**' ':(glob)js/**' ':(glob)data/**' ':(glob)assets/**' \
  | while IFS= read -r f; do
      mkdir -p "$PKG/$(dirname "$f")"
      cp "$f" "$PKG/$f"
    done

# Hand-off docs
cp handoff/README.md "$PKG/README.md"
cp handoff/CLAUDE.md "$PKG/CLAUDE.md"
cp README.md        "$PKG/TECHNICAL-NOTES.md"

# Safety check: nothing sensitive or out-of-place made it in.
bad="$(cd "$PKG" && find . -type f \( -iname '*jason*' -o -iname '*pitch*' -o -iname '*.docx' -o -iname '*.doc' \
        -o -iname '.env*' -o -iname '*.key' -o -iname '*.pem' \) -print)"
stray_pdf="$(cd "$PKG" && find . -type f -iname '*.pdf' ! -path './assets/docs/*' -print)"
if [[ -n "$bad$stray_pdf" ]]; then
  echo "Refusing to build: unexpected files in package:" >&2
  printf '%s\n' $bad $stray_pdf >&2
  exit 1
fi

mkdir -p "$OUT_DIR"
rm -f "$OUT_DIR/LFCD-site-handoff.zip"
(cd "$STAGE" && zip -qr "$OUT_DIR/LFCD-site-handoff.zip" "$NAME")
echo "Built $OUT_DIR/LFCD-site-handoff.zip"
(cd "$STAGE" && find "$NAME" -type f | sort)

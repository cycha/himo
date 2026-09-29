#!/bin/sh
# Copies the built SPA into /out, a host directory served by the shared edge
# Caddy on the VPS (/opt/edge). Runs once per deploy, then exits.
set -eu

SRC=/app/dist
DST=/out
GRACE_DAYS=14

mkdir -p "$DST/assets"

# Hashed assets first, so the new index.html never references a missing file.
cp -a "$SRC/assets/." "$DST/assets/"

# Everything else except index.html.
find "$SRC" -mindepth 1 -maxdepth 1 ! -name assets ! -name index.html \
  -exec cp -a {} "$DST/" \;

# index.html last, swapped in atomically so no request sees a half-written file.
cp -a "$SRC/index.html" "$DST/.index.html.tmp"
mv -f "$DST/.index.html.tmp" "$DST/index.html"

# Drop assets from previous builds once past the grace period: tabs still
# running an old index.html keep working until then.
find "$DST/assets" -type f -mtime +"$GRACE_DAYS" | while read -r f; do
  [ -e "$SRC/assets/${f#"$DST"/assets/}" ] || rm -f "$f"
done

echo "himo-client: synced $(find "$SRC" -type f | wc -l) files to $DST"

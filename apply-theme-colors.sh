#!/usr/bin/env bash
# Remaps the old neon-green palette literals hardcoded across src/ to the new
# "Petroleum & Mint" palette. Safe to re-run (idempotent) — after the first run
# there is nothing left to match. Run from the repo root:  bash apply-theme-colors.sh
#
# src/index.css is intentionally skipped: it is replaced wholesale by the new
# index.css from this package.
set -euo pipefail
cd "$(dirname "$0")"
[ -d src ] || { echo "Run this from the repo root (the folder that contains src/)"; exit 1; }

# Mapping (old -> new):
#   #00ff6e neon green -> #00e8b4 mint        #00cc58 neon dim   -> #00b58c mint dim
#   #00a850 neon deep  -> #007a62 mint deep   #1a6b3a leaf       -> #0a6b5a
#   #16a34a light green-> #00a385 mid mint    #22c55e green      -> #00c9a0
#   #050d08 bg -> #041319   #091410 card -> #08181e   #0e1f16 raised -> #0d2229
#   #142b1e border -> #153139   #c8e6cc text -> #e6f0f3   #507a58 muted -> #86a3ad
#   muted greens #2a7a4a #15803d #1a4d2e #4a7a2a #2a6a4a -> petroleum teals
#   old dark-green fills (#0d3d1f #091f12 #0d2518 #0c2618 #052e16) -> petroleum teal fills
FILES=$(grep -rlE "." src --include=*.ts --include=*.tsx | grep -v '^src/index.css$')

# old value  ->  new value            (hex alpha suffixes like #00ff6e22 keep working)
sed -i -E \
  -e 's/#00ff6e/#00e8b4/Ig' \
  -e 's/#00cc58/#00b58c/Ig' \
  -e 's/#00a850/#007a62/Ig' \
  -e 's/#1a6b3a/#0a6b5a/Ig' \
  -e 's/#16a34a/#00a385/Ig' \
  -e 's/#22c55e/#00c9a0/Ig' \
  -e 's/rgba\(\s*22,\s*163,\s*74,/rgba(0,163,133,/g' \
  -e 's/rgba\(\s*0,\s*255,\s*110,/rgba(0,232,180,/g' \
  -e 's/#050d08/#041319/Ig' \
  -e 's/#091410/#08181e/Ig' \
  -e 's/#0e1f16/#0d2229/Ig' \
  -e 's/#142b1e/#153139/Ig' \
  -e 's/#0d3d1f/#0a3a3a/Ig' -e 's/#091f12/#0b2a2b/Ig' -e 's/#0d2518/#0c2a2c/Ig' \
  -e 's/#0c2618/#0c2a2c/Ig' -e 's/#052e16/#04332c/Ig' \
  -e 's/#c8e6cc/#e6f0f3/Ig' \
  -e 's/#2a7a4a/#1d6b62/Ig' -e 's/#15803d/#007a62/Ig' -e 's/#1a4d2e/#1b4a4d/Ig' \
  -e 's/#4a7a2a/#3b7d75/Ig' -e 's/#2a6a4a/#2a6a66/Ig' \
  -e 's/#507a58/#86a3ad/Ig' \
  $FILES

echo "Done. Leftover old-palette literals:"
grep -rnEi "#00ff6e|#00cc58|#16a34a|#22c55e|#050d08|#091410|#c8e6cc" src --include=*.ts --include=*.tsx | grep -v '^src/index.css' || echo "  none"

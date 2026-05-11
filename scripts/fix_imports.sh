#!/bin/bash
# IQRA Import Fixer - بسم الله
# Removes .ts extensions from imports and normalizes aliases.

DIRECTORY="/Applications/iqra/src"

echo "🔍 Starting Batch Import Fix..."

# 1. Remove .ts and .js extensions from imports
# Pattern: from '.../file.ts' or from ".../file.ts"
find "$DIRECTORY" -type f -name "*.ts" -o -name "*.tsx" | xargs sed -i '' -E "s/from ['\"](.+)\.(ts|js)['\"]/from '\1'/g"

# 2. Normalize #iqra-core to #core (if preferred, or just keep aliases consistent)
# find "$DIRECTORY" -type f -name "*.ts" | xargs sed -i '' "s/#iqra-core/#core/g"

# 3. Fix explicit paths that should be aliases
# (Example: ../../../lib/iqra/03-memory/memory -> #memory/memory)
# This is complex for sed, but we can do common ones.
find "$DIRECTORY" -type f -name "*.ts" | xargs sed -i '' "s|\.\./\.\./\.\./\./lib/iqra/03-memory/memory|#memory/memory|g"
find "$DIRECTORY" -type f -name "*.ts" | xargs sed -i '' "s|\.\./\./lib/iqra/01-core/brain|#core/brain|g"

echo "✅ Import Fix Complete."

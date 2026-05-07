#!/bin/bash
# poor_repomix.sh - Refined version to avoid binaries and massive files

OUTPUT_FILE="repomix-output.txt"
rm -f "$OUTPUT_FILE"
echo "Generating $OUTPUT_FILE..."
echo "Codebase Image Generated on $(date)" > "$OUTPUT_FILE"
echo "=========================================" >> "$OUTPUT_FILE"

# List of directories to process
DIRS=("src" "lib" "iqra-core" "scripts" "agents" "schema" "orchestrator" "services" "knowledge" "iqra-core")

# Files to ignore (patterns)
# - Exclude common binaries, build artifacts, and very large files
EXCLUDES=(
    "*.png" "*.jpg" "*.jpeg" "*.gif" "*.ico" "*.svg" "*.pdf"
    "*.exe" "*.bin" "*.o" "*.a" "*.so" "*.dylib"
    "node_modules" ".git" "dist" "docs-out" "bin"
    "package-lock.json" "yarn.lock" "pnpm-lock.yaml"
    "*.tsbuildinfo" "*.map"
)

# Build the find command
IGNORE_ARGS=""
for pattern in "${EXCLUDES[@]}"; do
    IGNORE_ARGS="$IGNORE_ARGS -not -name '$pattern' -not -path '*/$pattern/*'"
done

for dir in "${DIRS[@]}"; do
    if [ -d "$dir" ]; then
        echo "Processing $dir..."
        # Only process text-like files
        find "$dir" -type f $IGNORE_ARGS -size -1M | while read -r file; do
            # Additional check to skip binaries using 'file' command if available
            if file "$file" | grep -q "text"; then
                echo "==== [FILE: $file] ====" >> "$OUTPUT_FILE"
                cat "$file" >> "$OUTPUT_FILE"
                echo -e "\n==== [END OF FILE: $file] ====\n" >> "$OUTPUT_FILE"
            fi
        done
    fi
done

# Processing root files
echo "Processing root files..."
find . -maxdepth 1 -type f $IGNORE_ARGS -size -1M | while read -r file; do
    if file "$file" | grep -q "text"; then
        echo "==== [FILE: $file] ====" >> "$OUTPUT_FILE"
        cat "$file" >> "$OUTPUT_FILE"
        echo -e "\n==== [END OF FILE: $file] ====\n" >> "$OUTPUT_FILE"
    fi
done

echo "Done. Output saved to $OUTPUT_FILE"

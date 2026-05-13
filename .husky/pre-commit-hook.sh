#!/usr/bin/env sh
# 🧬 IQRA Pre-commit Hook — التحقق قبل كل commit

set -e  # Exit on any error

echo "🧬 [PRE-COMMIT] Running IQRA checks..."

# Run E2E tests
echo "🧪 [TEST] Running E2E tests..."
npm run test:e2e
if [ $? -ne 0 ]; then
    echo "❌ [PRE-COMMIT] E2E tests failed. Commit blocked."
    exit 1
fi

# Check for forbidden patterns in staged files
echo "🛡️ [SECURITY] Checking for forbidden patterns..."
STAGED_FILES=$(git diff --cached --name-only --diff-filter=AM)

for file in $STAGED_FILES; do
    if [[ "$file" == *.ts || "$file" == *.js || "$file" == *.tsx || "$file" == *.jsx ]]; then
        # Check for forbidden patterns
        if git show :"$file" | grep -q -E "(hack|crack|exploit|bypass|inject|steal|leak)"; then
            echo "❌ [PRE-COMMIT] Forbidden patterns detected in $file. Commit blocked."
            exit 1
        fi
    fi
done

# Check for mock data
echo "🚫 [MOCK] Checking for mock data..."
if git diff --cached --name-only | xargs grep -l "mock\|fake\|test.*data" 2>/dev/null; then
    echo "❌ [PRE-COMMIT] Mock data detected. Commit blocked."
    exit 1
fi

# Check for version numbers in files
echo "📋 [VERSION] Checking for version numbers..."
if git diff --cached --name-only | xargs grep -l "v0\.[0-9]" 2>/dev/null; then
    echo "✅ [PRE-COMMIT] Version numbers found in files."
fi

# Run TypeScript check
echo "📝 [TYPESCRIPT] Type checking..."
npm run type-check
if [ $? -ne 0 ]; then
    echo "❌ [PRE-COMMIT] TypeScript errors found. Commit blocked."
    exit 1
fi

echo "✅ [PRE-COMMIT] All checks passed. Commit allowed."

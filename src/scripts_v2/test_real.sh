#!/bin/bash
# 🚀 IQRA Real Test Runner
# النية: تشغيل اختبارات السلامة الحقيقية مع تحميل البيئة
# المرجع: "وَقُلِ اعْمَلُوا فَسَيَرَى اللَّهُ عَمَلَكُمْ" — التوبة: 105

# Load .env if exists
if [ -f .env ]; then
  export $(grep -v '^#' .env | xargs)
fi

echo "🧪 Starting Real E2E Integrity Test..."
npx tsx tests/e2e/topology_reward.test.ts

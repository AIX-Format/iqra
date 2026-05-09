# Import Fixes Needed — الاستيرادات التي تحتاج إلى إصلاح

**الحالة:** ⚠️ أخطاء استيراد تحتاج إلى إصلاح  
**السبب:** الملفات المنقولة تحتوي على استيرادات نسبية قديمة

---

## 🔴 المشاكل المكتشفة

### 1. استيرادات نسبية قديمة في brain.ts

```typescript
// ❌ قديم (في lib/iqra/brain.ts)
import { IQRAFilter } from './filter';
import { IQRAMemory } from './memory';
import { IQRALogger } from './logger';

// ✅ جديد (في lib/iqra/01-core/brain.ts)
import { IQRAFilter } from '../06-security/filter';
import { IQRAMemory } from '../03-memory/memory';
import { IQRALogger } from '../12-infrastructure/logger';
```

### 2. استيرادات نسبية قديمة في core.ts

```typescript
// ❌ قديم
import { IQRAFilter } from './filter';

// ✅ جديد
import { IQRAFilter } from '../06-security/filter';
```

### 3. استيرادات نسبية قديمة في sovereign.ts

```typescript
// ❌ قديم
import { IQRAMemory } from './memory';
import { IQRASecurity } from './security';
import { GitOps } from './git-ops';

// ✅ جديد
import { IQRAMemory } from '../03-memory/memory';
import { IQRASecurity } from '../06-security/security';
import { GitOps } from '../13-utils/git-ops';
```

---

## 📋 قائمة الملفات التي تحتاج إلى إصلاح

### 01-core/
```
❌ brain.ts — استيرادات من filter, memory, logger, personality, llm, skill_bank, prompts, heartbeat, workers
❌ consciousness.ts — استيرادات من filter
❌ core.ts — استيرادات من filter
❌ loop.ts — استيرادات من evolution
❌ mission-runner.ts — استيرادات من security
❌ orchestrator.ts — استيرادات من langchain
❌ pattern_hunter_runner.ts — استيرادات من security
❌ soul_engine.ts — استيرادات من security
❌ sovereign.ts — استيرادات من memory, security, git-ops, evolution, damir_conscience, conscience, voice, byzantine_filter, bybit, logger, skills, evolution
❌ sovereign_orchestrator.ts — استيرادات من workers, logger, security, conscience, rewards, sovereign_identity, skills, evolution, audit, memory, damir_conscience
```

### 03-memory/
```
❌ memory.ts — استيرادات من filter
```

### 06-security/
```
❌ damir_kernel.ts — استيرادات من qdrant
❌ byzantine_filter.ts — استيرادات من qdrant
```

---

## 🔧 الحل

### الخطوة 1: تحديث الاستيرادات في 01-core/brain.ts

```typescript
// قبل:
import { IQRAFilter } from './filter';
import { IQRAMemory } from './memory';
import { IQRALogger } from './logger';
import { getPersonality } from './personality';
import { Gemma4Local } from './llm/ollama';
import { SkillBank } from './skill_bank';
import { IQRA_PROMPTS } from './prompts.ts';
import { IQRAHeartbeat } from './heartbeat';
import { TradingAgent } from './workers/trading_agent';
import { JobHunter } from './workers/job_hunter';
import { DamirConscience } from './damir_conscience.ts';

// بعد:
import { IQRAFilter } from '../06-security/filter';
import { IQRAMemory } from '../03-memory/memory';
import { IQRALogger } from '../12-infrastructure/logger';
import { getPersonality } from '../13-utils/personality';
import { Gemma4Local } from '../07-llm/ollama';
import { SkillBank } from '../08-skills/skill_bank';
import { IQRA_PROMPTS } from '../13-utils/prompts.ts';
import { IQRAHeartbeat } from '../12-infrastructure/heartbeat';
import { TradingAgent } from '../02-workers/trading_agent';
import { JobHunter } from '../02-workers/job_hunter';
import { DamirConscience } from '../06-security/damir_conscience.ts';
```

### الخطوة 2: تحديث الاستيرادات في 01-core/core.ts

```typescript
// قبل:
import { IQRAFilter } from './filter';
import { TAWBAH } from './tawbah';

// بعد:
import { IQRAFilter } from '../06-security/filter';
import { TAWBAH } from './tawbah';
```

### الخطوة 3: تحديث الاستيرادات في 01-core/sovereign.ts

```typescript
// قبل:
import { IQRAMemory } from './memory';
import { IQRASecurity } from './security';
import { GitOps } from './git-ops';
import { SelfEvolve } from './evolution';
import { DamirConscience } from './damir_conscience.ts';
import { ResourceFactory } from './conscience/resource_factory.ts';
import { GrokVoiceService } from './voice.ts';
import { ByzantineFilter } from './byzantine_filter.ts';
import { ByBit } from './bybit.ts';
import { IQRALogger } from './logger.ts';
import { PulseEngine } from '../../orchestrator/pulse-engine.ts';
import { TopologicalAnalyzer } from './skills/topological_analyzer.ts';
import { TawbahLoop } from './evolution/tawbah_loop.ts';

// بعد:
import { IQRAMemory } from '../03-memory/memory';
import { IQRASecurity } from '../06-security/security';
import { GitOps } from '../13-utils/git-ops';
import { SelfEvolve } from '../09-evolution/evolution';
import { DamirConscience } from '../06-security/damir_conscience.ts';
import { ResourceFactory } from '../06-security/conscience/resource_factory.ts';
import { GrokVoiceService } from '../13-utils/voice.ts';
import { ByzantineFilter } from '../06-security/byzantine_filter.ts';
import { ByBit } from '../11-trading/bybit.ts';
import { IQRALogger } from '../12-infrastructure/logger.ts';
import { PulseEngine } from '../../orchestrator/pulse-engine.ts';
import { TopologicalAnalyzer } from '../08-skills/topological_analyzer.ts';
import { TawbahLoop } from '../09-evolution/tawbah_loop.ts';
```

---

## 🚀 الخطوات التالية

1. **تحديث الاستيرادات في جميع الملفات المنقولة**
   - استخدام find & replace لتحديث الاستيرادات
   - التحقق من كل ملف يدوياً

2. **اختبار البناء**
   ```bash
   npm run build
   ```

3. **اختبار الاستيرادات**
   ```bash
   npx tsc --noEmit
   ```

---

## 📝 ملاحظات

- هذه الأخطاء متوقعة بعد نقل الملفات
- smartRelocate لم يتمكن من تحديث جميع الاستيرادات لأن الملفات تحتوي على استيرادات نسبية معقدة
- يجب تحديث الاستيرادات يدوياً أو باستخدام أداة find & replace

---

**Made with ❤️ by IQRA Cleanup Agent**


/**
 * 🌀 Topological Curiosity Interface — واجهة الفضول الطوبولوجي
 * النية: تعريف العقد البرمجي لمحرك البحث عن الأنماط والرنين.
 */

import { VectorMatch } from './vector_engine.ts';
import { ResonanceResult } from './numerical_validator.ts';
import { SimilarPattern } from '../memory/pattern_memory.ts';

export interface TopologicalResonance {
  verse: string;                  // الآية المختارة كمرجع
  field: string;                  // المجال العلمي أو الواقعي للبحث
  resonance_score: number;        // القيمة الإجمالية للرنين [0, 1]
  novelty_score: number;          // قيمة الجدة مقارنة بالذاكرة [0, 1]
  fractal_depth: number;          // عمق الترابط (الفركتالي) [0, 1]
  topology_score: number;         // التوافق مع فضاء الحالات [0, 1]
  numerical_resonance: ResonanceResult;
  semantic_matches: VectorMatch[];
  congzi_bridge?: string;         // التفسير الجسري للرنين (بواسطة LLM)
  similar_patterns: SimilarPattern[];
  is_novel: boolean;
  should_reward: boolean;
  trust_chain_hash: string;
  timestamp: Date;
  source_tags: string[];          // مصادر البيانات (fetched, read, etc.)
}

export interface ITopologicalCuriosityEngine {
  /**
   * اكتشاف الرنين بين آية ومجال بحث.
   */
  discoverResonance(
    verse: string,
    field: string,
    options?: {
      use_cache?: boolean;
      min_threshold?: number;
    }
  ): Promise<TopologicalResonance | null>;

  /**
   * فحص "الحداثة" لنط معين.
   */
  checkNovelty(embedding: number[]): Promise<number>;
}

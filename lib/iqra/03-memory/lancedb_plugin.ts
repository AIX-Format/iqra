/**
 * 🏺 LanceDB Long-term Memory — الذاكرة العميقة (Long-term)
 *
 * "وَنَكْتُبُ مَا قَدَّمُوا وَآثَارَهُمْ" — يس: 12
 *
 * Integrated into the IQRA Soul for persistent recall of all experiences.
 */

import { IQRAMemory } from '#memory/memory';
import { IQRALogger } from '#infra/logger';
import path from 'path';
import fs from 'fs';

export interface MemoryEntry {
  vector: number[];
  content: string;
  metadata: string; // JSON string
  timestamp: number;
  // [TC] reason: Add missing properties for enhanced memory integration | id: TC-FIX-003
  id?: string;
  optimization_applied?: boolean;
  pattern_confidence?: number;
}

export class LanceDBPlugin {
  private static _db: any = null;
  private static _table: any = null;
  private static readonly DB_PATH = path.join(process.cwd(), '.iqra', 'lancedb');
  private static readonly TABLE_NAME = 'sovereign_memories';

  static async init() {
    if (this._table) return;

    try {
      // Dynamic import to avoid errors if package not yet installed
      const { connect } = await import('@lancedb/lancedb');

      if (!fs.existsSync(this.DB_PATH)) {
        fs.mkdirSync(this.DB_PATH, { recursive: true });
      }

      this._db = await connect(this.DB_PATH);
      const tables = await this._db.tableNames();

      if (!tables.includes(this.TABLE_NAME)) {
        IQRALogger.info('🏺 [LANCEDB] Creating new deep memory table...');
        // Table will be created on first write
      } else {
        this._table = await this._db.openTable(this.TABLE_NAME);
      }
    } catch (error) {
      IQRALogger.error('❌ [LANCEDB] Init Error:', error);
    }
  }

  /**
   * 📥 Archiving a new experience into deep storage
   */
  static async archive(content: string, metadata: any = {}) {
    try {
      await this.init();
      const embedding = await IQRAMemory.generateEmbedding(content);
      
      const entry: MemoryEntry = {
        vector: embedding,
        content,
        metadata: JSON.stringify(metadata),
        timestamp: Date.now()
      };

      // [TC] reason: Enhanced LanceDB archival with pattern learning | id: TC-4f-001
      const archivalStartTime = Date.now();
      
      // Check archival patterns in memory
      const archivalPattern = await IQRAMemory.get(`archival_pattern:${content.substring(0, 30)}`);
      if (archivalPattern && archivalPattern.success) {
        IQRALogger.info(`🧠 [LANCEDB] Using optimized archival pattern`);
        // Apply pre-optimized archival parameters
        entry.optimization_applied = true;
        entry.pattern_confidence = archivalPattern.data.confidence || 0.8;
      }

      if (!this._table) {
        this._table = await this._db.createTable(this.TABLE_NAME, [entry]);
        
        // [TC] reason: Store table creation pattern | id: TC-4f-002
        await IQRAMemory.set(`lancedb_table_creation`, {
          table_name: this.TABLE_NAME,
          first_entry_id: entry.id,
          timestamp: new Date().toISOString(),
          creation_duration: Date.now() - archivalStartTime
        }, { ttl: 86400000 });
        
      } else {
        await this._table.add([entry]);
        
        // [TC] reason: Store entry addition pattern | id: TC-4f-003
        await IQRAMemory.set(`lancedb_entry_addition:${entry.id}`, {
          entry_id: entry.id,
          content_preview: content.substring(0, 50),
          timestamp: new Date().toISOString(),
          addition_duration: Date.now() - archivalStartTime,
          table_size: (await this._table.count()).count
        }, { ttl: 604800000 }); // 7 days
      }
      
      // [TC] reason: Update archival analytics | id: TC-4f-004
      const archivalAnalytics = await IQRAMemory.get(`lancedb_archival_analytics`) || { 
        data: { total_archived: 0, avg_duration: 0, success_rate: 1.0 } 
      };
      
      const archivalDuration = Date.now() - archivalStartTime;
      const updatedAnalytics = {
        total_archived: archivalAnalytics.data.total_archived + 1,
        avg_duration: ((archivalAnalytics.data.avg_duration * archivalAnalytics.data.total_archived) + archivalDuration) / (archivalAnalytics.data.total_archived + 1),
        success_rate: ((archivalAnalytics.data.success_rate * archivalAnalytics.data.total_archived) + 1.0) / (archivalAnalytics.data.total_archived + 1),
        last_archived: new Date().toISOString(),
        table_entries: (await this._table.count()).count
      };
      
      await IQRAMemory.set(`lancedb_archival_analytics`, updatedAnalytics, { ttl: 2592000000 }); // 30 days
      
      // Store successful archival pattern for future optimization
      await IQRAMemory.set(`archival_pattern:${content.substring(0, 30)}`, {
        success: true,
        duration: archivalDuration,
        confidence: archivalDuration < 100 ? 0.9 : 0.7,
        timestamp: new Date().toISOString(),
        embedding_size: entry.vector.length
      }, { ttl: 7200000 }); // 2 hours
      
      IQRALogger.info(`🧠 [LANCEDB] Enhanced experience archived: "${content.substring(0, 30)}..." in ${archivalDuration}ms`);
      
    } catch (error) {
      // [TC] reason: Store archival failure pattern with proper error handling | id: TC-FIX-004
      const errorMessage = error instanceof Error ? error.message : String(error);
      await IQRAMemory.set(`lancedb_archival_failure:${Date.now()}`, {
        error: errorMessage,
        content_preview: content.substring(0, 50),
        timestamp: new Date().toISOString()
      }, { ttl: 3600000 });
      
      IQRALogger.error('❌ [LANCEDB] Enhanced Archival Error:', errorMessage);
    }
  }

  /**
   * 🔎 Recall relevant memories based on current context
   */
  static async recall(query: string, limit: number = 3) {
    try {
      await this.init();
      if (!this._table) return [];

      const embedding = await IQRAMemory.generateEmbedding(query);
      const results = await this._table.search(embedding).limit(limit).execute();

      return results.map((r: any) => ({
        content: r.content,
        metadata: JSON.parse(r.metadata),
        timestamp: r.timestamp,
        distance: r._distance
      }));
    } catch (error) {
      IQRALogger.error('❌ [LANCEDB] Recall Error:', error);
      return [];
    }
  }

  /**
   * 🤖 Auto-recall: Automatically finds memories that match the current intention
   */
  static async autoRecall(intention: string): Promise<string> {
    try {
      const memories = await this.recall(intention, 3);
      if (memories.length === 0) return "";

      return `
[RECALLED_DEEP_MEMORIES]
${memories.map((m, i) => `${i+1}. [${new Date(m.timestamp).toLocaleDateString()}] ${m.content}`).join('\n')}
`.trim();
    } catch {
      return "";
    }
  }

  /**
   * 🌀 Contextual Folding: البحث عن الرنين بعيد المدى
   * يربط المعلومات التي قد تبدو متباعدة خطياً ولكنها متصلة طوبولوجياً.
   */
  static async findLongRangeResonance(intention: string): Promise<string> {
    IQRALogger.info('🌀 [LANCEDB] Performing contextual folding for long-range resonance...');
    
    // محاكاة الطي: البحث بالنية وعكسها لإيجاد التوازن الموضوعي
    const primary = await this.autoRecall(intention);
    const inverseQuery = `opposite or complement of: ${intention}`;
    const secondary = await this.autoRecall(inverseQuery);
    
    return `${primary}\n\n[FOLDED_COMPLEMENT]\n${secondary}`;
  }
}

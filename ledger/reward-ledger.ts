/**
 * 🌙 IQRA Reward Ledger — سجل الثواب
 * النية: تسجيل كل مكافأة مُتحقق منها في سجل واحد موحد
 * المرجع: "وَمَن يَعْمَلْ مِثْقَالَ ذَرَّةٍ خَيْرًا يَرَهُ" — الزلزلة: 7
 *
 * ══════════════════════════════════════════════════════════════
 * SINGLE SOURCE OF TRUTH — مصدر حقيقة واحد
 * ══════════════════════════════════════════════════════════════
 * السجل الوحيد: iqra-core/data/reward_ledger.jsonl
 * كلا المسارين (mission-runner و topological-loop) يكتبان هنا.
 * ledger/rewards.jsonl القديم محذوف — لا تستخدمه.
 * ══════════════════════════════════════════════════════════════
 */

import fs from 'fs';
import path from 'path';
import { createHash } from 'crypto';
import { RewardEntry, RewardVector } from '#rewards/types';

export class RewardLedger {
  /**
   * المسار الوحيد الموحد — لا يتغير.
   * [read] من iqra-core/data/reward_ledger.jsonl
   */
  static readonly LEDGER_PATH = path.join(
    process.cwd(),
    'iqra-core',
    'data',
    'reward_ledger.jsonl'
  );

  // ── Hash Computation ─────────────────────────────────────────────────────────
  /**
   * Compute SHA-256 hash of entry content (excluding prev_hash and entry_hash)
   * [TC] reason: add prev_hash chain for ledger integrity verification | id: TC-reward-ledger-integrity
   */
  private static _computeEntryHash(entry: Omit<RewardEntry, 'prev_hash' | 'entry_hash'>): string {
    const content = JSON.stringify(entry, Object.keys(entry).sort());
    return createHash('sha256').update(content).digest('hex');
  }

  // ── Append ──────────────────────────────────────────────────────────────────
  /**
   * يُضيف مدخلة جديدة إلى السجل.
   * يرفض أي مدخلة بدون mission_id أو بمكافأة سالبة.
   * Includes prev_hash chain for integrity verification.
   */
  static async append(entry: RewardEntry): Promise<void> {
    this._validateEntry(entry);

    // Get last entry's hash for chain
    const all = await this.getAll();
    const prevHash = all.length > 0 ? all[all.length - 1].entry_hash : null;

    // Compute hash of this entry (without prev_hash/entry_hash fields)
    const entryForHash = { ...entry, prev_hash: null, entry_hash: '' } as any;
    const entryHash = this._computeEntryHash(entryForHash);

    const line =
      JSON.stringify({
        ...entry,
        ledger_id: `rew_${Date.now()}_${Math.random().toString(36).substring(7)}`,
        recorded_at: new Date().toISOString(),
        prev_hash: prevHash,
        entry_hash: entryHash,
      }) + '\n';

    const dir = path.dirname(this.LEDGER_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    try {
      fs.appendFileSync(this.LEDGER_PATH, line, 'utf-8');
    } catch (err) {
      console.error('❌ [LEDGER] Failed to append entry:', err);
      throw new Error(`Ledger write failed: ${(err as Error).message}`);
    }
  }

  // ── Read All ─────────────────────────────────────────────────────────────────
  static async getAll(): Promise<RewardEntry[]> {
    if (!fs.existsSync(this.LEDGER_PATH)) return [];

    try {
      const content = fs.readFileSync(this.LEDGER_PATH, 'utf-8');
      return content
        .trim()
        .split('\n')
        .filter(Boolean)
        .map(line => JSON.parse(line) as RewardEntry);
    } catch (err) {
      console.error('❌ [LEDGER] Failed to read ledger:', err);
      return [];
    }
  }

  // ── Read Recent ──────────────────────────────────────────────────────────────
  /**
   * يُرجع آخر N مدخلة من السجل.
   */
  static async getRecent(count: number): Promise<RewardEntry[]> {
    const all = await this.getAll();
    return all.slice(-count);
  }

  // ── Stats ────────────────────────────────────────────────────────────────────
  static async getStats(): Promise<{
    total_entries: number;
    total_reward: number;
    avg_reward: number;
    max_reward: number;
  }> {
    const all = await this.getAll();
    if (all.length === 0) {
      return { total_entries: 0, total_reward: 0, avg_reward: 0, max_reward: 0 };
    }
    const rewards = all.map(e => e.total_reward);
    const total = rewards.reduce((a, b) => a + b, 0);
    return {
      total_entries: all.length,
      total_reward: total,
      avg_reward: total / all.length,
      max_reward: Math.max(...rewards),
    };
  }

  // ── Validate ─────────────────────────────────────────────────────────────────
  private static _validateEntry(entry: RewardEntry): void {
    if (!entry.mission_id || typeof entry.mission_id !== 'string') {
      throw new Error('LEDGER_ERR: mission_id is required and must be a string');
    }
    if (!entry.worker_id || typeof entry.worker_id !== 'string') {
      throw new Error('LEDGER_ERR: worker_id is required and must be a string');
    }
    if (typeof entry.total_reward !== 'number' || isNaN(entry.total_reward)) {
      throw new Error('LEDGER_ERR: total_reward must be a valid number');
    }
    if (entry.total_reward < 0) {
      throw new Error(`LEDGER_ERR: negative reward rejected (${entry.total_reward})`);
    }
    if (!entry.validation_status) {
      throw new Error('LEDGER_ERR: validation_status is required');
    }
  }

  // ── Verify Integrity ───────────────────────────────────────────────────────
  /**
   * Verifies the integrity of the ledger by checking the hash chain
   * [TC] reason: add prev_hash chain for ledger integrity verification | id: TC-reward-ledger-integrity
   */
  static async verifyIntegrity(): Promise<{
    valid: boolean;
    total_entries: number;
    broken_chain_at: number | null;
    message: string;
  }> {
    const all = await this.getAll();
    
    if (all.length === 0) {
      return { valid: true, total_entries: 0, broken_chain_at: null, message: 'Ledger is empty' };
    }

    for (let i = 0; i < all.length; i++) {
      const entry = all[i];
      
      // Check prev_hash matches previous entry's entry_hash
      if (i === 0) {
        if (entry.prev_hash !== null) {
          return { 
            valid: false, 
            total_entries: all.length, 
            broken_chain_at: i, 
            message: `First entry has non-null prev_hash: ${entry.prev_hash}` 
          };
        }
      } else {
        const prevEntry = all[i - 1];
        if (entry.prev_hash !== prevEntry.entry_hash) {
          return { 
            valid: false, 
            total_entries: all.length, 
            broken_chain_at: i, 
            message: `Chain broken at entry ${i}: prev_hash mismatch` 
          };
        }
      }

      // Verify entry_hash is correct
      const entryForHash = { ...entry, prev_hash: null, entry_hash: '' } as any;
      const computedHash = this._computeEntryHash(entryForHash);
      if (entry.entry_hash !== computedHash) {
        return { 
          valid: false, 
          total_entries: all.length, 
          broken_chain_at: i, 
          message: `Entry ${i} hash mismatch: corrupted or tampered` 
        };
      }
    }

    return { 
      valid: true, 
      total_entries: all.length, 
      broken_chain_at: null, 
      message: 'Ledger integrity verified' 
    };
  }
}

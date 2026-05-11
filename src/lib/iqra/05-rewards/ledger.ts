// بسم الله الرحمن الرحيم

/**
 * 📒 RewardLedger — سجل المكافآت
 *
 * "وَكُلَّ شَيْءٍ أَحْصَيْنَاهُ فِي إِمَامٍ مُّبِينٍ" — يس: 12
 *
 * يُخزّن كل مكافأة في JSONL (append-only) + SQLite للاستعلام السريع.
 * يحتفظ بكل PathKeys المستخدمة لفحص المسار البكر.
 */

import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { IQRALogger } from '#infra/logger';
import { appendToTrustChain } from '#security/security';
import type {
  RewardEntry, PathKey, RewardSummary, DiscoveryLevel,
} from './types';

// ── Constants ─────────────────────────────────────────────────────────────────

let STORAGE_DIR = path.join(process.cwd(), '.iqra', 'data');
let LEDGER_PATH = path.join(STORAGE_DIR, 'reward_ledger.jsonl');
let PATHS_PATH  = path.join(STORAGE_DIR, 'path_registry.json');

// ── RewardLedger ──────────────────────────────────────────────────────────────

export class RewardLedger {
  /** سجل PathKeys في الذاكرة (hot cache) */
  private static _pathRegistry: Map<PathKey, number> = new Map();
  private static _registryLoaded = false;

  /**
   * يُغيّر مجلد التخزين (يُستخدم في الاختبارات الحقيقية)
   */
  static setStorageDir(newDir: string): void {
    STORAGE_DIR = newDir;
    LEDGER_PATH = path.join(STORAGE_DIR, 'reward_ledger.jsonl');
    PATHS_PATH  = path.join(STORAGE_DIR, 'path_registry.json');
    this._registryLoaded = false; // إعادة التحميل من المجلد الجديد
  }

  // ── Path Registry ─────────────────────────────────────────────────────────

  /**
   * يُحمّل سجل المسارات من الملف
   */
  private static _loadRegistry(): void {
    if (this._registryLoaded) return;
    try {
      if (fs.existsSync(PATHS_PATH)) {
        const raw = fs.readFileSync(PATHS_PATH, 'utf-8');
        const data = JSON.parse(raw) as Record<string, number>;
        this._pathRegistry = new Map(Object.entries(data));
      }
    } catch {
      this._pathRegistry = new Map();
    }
    this._registryLoaded = true;
  }

  /**
   * يحفظ سجل المسارات
   */
  private static _saveRegistry(): void {
    try {
      const dir = path.dirname(PATHS_PATH);
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      const data = Object.fromEntries(this._pathRegistry);
      fs.writeFileSync(PATHS_PATH, JSON.stringify(data, null, 2), 'utf-8');
    } catch (e) {
      IQRALogger.warn(`⚠️ [LEDGER] Failed to save path registry: ${(e as Error).message}`);
    }
  }

  /**
   * يُرجع عدد مرات استخدام مسار معين
   */
  static getPathUseCount(pathKey: PathKey): number {
    this._loadRegistry();
    return this._pathRegistry.get(pathKey) ?? 0;
  }

  /**
   * يُسجّل استخدام مسار جديد
   */
  static recordPathKey(pathKey: PathKey): void {
    this._loadRegistry();
    const current = this._pathRegistry.get(pathKey) ?? 0;
    this._pathRegistry.set(pathKey, current + 1);
    this._saveRegistry();
  }

  /**
   * يُرجع كل المسارات المسجّلة
   */
  static getAllPathKeys(): Map<PathKey, number> {
    this._loadRegistry();
    return new Map(this._pathRegistry);
  }

  /**
   * عدد المسارات الفريدة
   */
  static get uniquePathCount(): number {
    this._loadRegistry();
    return this._pathRegistry.size;
  }

  // ── Integrity Chain ───────────────────────────────────────────────────────

  /**
   * يحسب بصمة السجل لضمان عدم التلاعب
   */
  private static _calculateHash(entry: Partial<RewardEntry>): string {
    const data = JSON.stringify({
      mission_id: entry.mission_id,
      worker_id: entry.worker_id,
      total_reward: entry.total_reward,
      recorded_at: entry.recorded_at,
      prev_hash: entry.prev_hash,
    });
    return crypto.createHash('sha256').update(data).digest('hex');
  }

  /**
   * يحصل على آخر بصمة مسجلة في الدفتر
   */
  private static _getLastHash(): string | undefined {
    const recent = this.getRecent(1);
    return recent.length > 0 ? recent[0].hash : undefined;
  }

  /**
   * يتحقق من صحة سجل معين
   */
  static validateEntry(entry: RewardEntry, prevHash?: string): boolean {
    if (entry.prev_hash !== prevHash) return false;
    const calculated = this._calculateHash(entry);
    return entry.hash === calculated;
  }

  /**
   * يتحقق من سلامة الدفتر بالكامل
   */
  static async validateChain(): Promise<{ valid: boolean; error_at?: string; total_entries: number; broken_chain_at?: number; message: string }> {
    try {
      if (!fs.existsSync(LEDGER_PATH)) return { valid: true, total_entries: 0, message: 'Ledger verified' };
      const lines = fs.readFileSync(LEDGER_PATH, 'utf-8')
        .split('\n').filter(l => l.trim().length > 0);

      let prevHash: string | undefined;
      let count = 0;
      for (const line of lines) {
        const entry = JSON.parse(line) as RewardEntry;
        if (!this.validateEntry(entry, prevHash)) {
          return { 
            valid: false, 
            error_at: entry.ledger_id, 
            broken_chain_at: count,
            total_entries: lines.length,
            message: `Chain broken at entry ${count}` 
          };
        }
        prevHash = entry.hash;
        count++;
      }
      return { valid: true, total_entries: count, message: 'Ledger integrity verified' };
    } catch (e) {
      return { valid: false, message: (e as Error).message, total_entries: 0 };
    }
  }

  // ── Ledger Write ──────────────────────────────────────────────────────────

  /**
   * يُسجّل مكافأة جديدة في JSONL مع ربطها بالسلسلة
   */
  static async record(entry: Omit<RewardEntry, 'ledger_id' | 'recorded_at' | 'hash' | 'prev_hash'>): Promise<string> {
    // Validation
    if (!entry.mission_id) throw new Error('LEDGER_ERR: mission_id');
    if (entry.total_reward < 0) throw new Error('LEDGER_ERR: negative reward');
    if (!entry.worker_id) throw new Error('LEDGER_ERR: worker_id');
    if (!entry.validation_status) throw new Error('LEDGER_ERR: validation_status');

    const ledgerId = `rew_${Date.now()}_${crypto.randomBytes(3).toString('hex')}`;
    const recordedAt = new Date().toISOString();
    const prevHash = this._getLastHash();

    const partial: Partial<RewardEntry> = {
      ...entry,
      ledger_id: ledgerId,
      recorded_at: recordedAt,
      prev_hash: prevHash,
    };

    const hash = this._calculateHash(partial);
    const full: RewardEntry = { ...partial, hash } as RewardEntry;

    // كتابة في JSONL (append-only)
    try {
      const dir = path.dirname(LEDGER_PATH);
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      fs.appendFileSync(LEDGER_PATH, JSON.stringify(full) + '\n', 'utf-8');
    } catch (e) {
      IQRALogger.error('❌ [LEDGER] Write failed:', e);
      throw e;
    }

    // تسجيل PathKey إذا وُجد
    if (entry.path_key) {
      this.recordPathKey(entry.path_key);
    }

    appendToTrustChain(
      'REWARD:RECORD',
      ledgerId,
      `mission=${entry.mission_id} total=${entry.total_reward.toFixed(3)} ` +
      `pristine=${entry.pristine_multiplier_applied} level=${entry.discovery_level}`,
      entry.confidence
    );

    IQRALogger.info(
      `🏆 [LEDGER] Recorded: ${ledgerId} | ` +
      `total=${entry.total_reward.toFixed(3)} | ` +
      `${entry.pristine_multiplier_applied ? `🌟 PRISTINE ×${entry.multiplier_value}` : `×${entry.multiplier_value}`}`
    );

    return ledgerId;
  }

  // ── Ledger Read ───────────────────────────────────────────────────────────

  /**
   * يقرأ كل المكافآت
   */
  static getAll(): RewardEntry[] {
    try {
      if (!fs.existsSync(LEDGER_PATH)) return [];
      const lines = fs.readFileSync(LEDGER_PATH, 'utf-8')
        .split('\n')
        .filter(l => l.trim().length > 0);
      return lines.map(l => JSON.parse(l) as RewardEntry);
    } catch {
      return [];
    }
  }

  /**
   * يقرأ آخر N مكافآت
   */
  static getRecent(count: number = 10): RewardEntry[] {
    const all = this.getAll();
    return all.slice(-count).reverse();
  }

  /**
   * يُرجع ملخص المكافآت
   */
  static getSummary(): RewardSummary {
    try {
      if (!fs.existsSync(LEDGER_PATH)) {
        return {
          total_entries: 0, total_reward: 0, avg_reward: 0,
          pristine_paths: 0, repeated_paths: 0,
          by_level: { seed: 0, branch: 0, tree: 0, resonance: 0, revelation: 0 },
        };
      }

      const lines = fs.readFileSync(LEDGER_PATH, 'utf-8')
        .split('\n').filter(l => l.trim().length > 0);

      const entries = lines.map(l => JSON.parse(l) as RewardEntry);
      const totalReward = entries.reduce((s, e) => s + e.total_reward, 0);
      const pristine = entries.filter(e => e.pristine_multiplier_applied).length;

      const byLevel: Record<DiscoveryLevel, number> = {
        seed: 0, branch: 0, tree: 0, resonance: 0, revelation: 0,
      };
      for (const e of entries) {
        byLevel[e.discovery_level] = (byLevel[e.discovery_level] ?? 0) + 1;
      }

      // أكثر مسار استخداماً
      this._loadRegistry();
      let topPath: PathKey | undefined;
      let topCount = 0;
      for (const [k, v] of this._pathRegistry) {
        if (v > topCount) { topCount = v; topPath = k; }
      }

      return {
        total_entries: entries.length,
        total_reward: totalReward,
        avg_reward: entries.length > 0 ? totalReward / entries.length : 0,
        pristine_paths: pristine,
        repeated_paths: entries.length - pristine,
        by_level: byLevel,
        top_path_key: topPath,
      };
    } catch {
      return {
        total_entries: 0, total_reward: 0, avg_reward: 0,
        pristine_paths: 0, repeated_paths: 0,
        by_level: { seed: 0, branch: 0, tree: 0, resonance: 0, revelation: 0 },
      };
    }
  }

  /**
   * استعلام متقدم مع فلاتر
   */
  static async queryWithFilters(filters: {
    worker_id?: string;
    mission_id?: string;
    path_multiplier?: number;
    min_reward?: number;
    max_reward?: number;
    date_from?: string;
    date_to?: string;
  }): Promise<RewardEntry[]> {
    try {
      if (!fs.existsSync(LEDGER_PATH)) return [];
      const lines = fs.readFileSync(LEDGER_PATH, 'utf-8')
        .split('\n').filter(l => l.trim().length > 0);
      
      const all = lines.map(l => JSON.parse(l) as RewardEntry);
      
      return all.filter(entry => {
        if (filters.worker_id && entry.worker_id !== filters.worker_id) return false;
        if (filters.mission_id && entry.mission_id !== filters.mission_id) return false;
        if (filters.path_multiplier && entry.path_multiplier !== filters.path_multiplier) return false;
        if (filters.min_reward && entry.total_reward < filters.min_reward) return false;
        if (filters.max_reward && entry.total_reward > filters.max_reward) return false;
        if (filters.date_from && new Date(entry.recorded_at) < new Date(filters.date_from)) return false;
        if (filters.date_to && new Date(entry.recorded_at) > new Date(filters.date_to)) return false;
        
        return true;
      });
    } catch {
      return [];
    }
  }

  /**
   * إعادة ضبط سجل المسارات (للاختبارات)
   */
  static resetPathRegistry(): void {
    this._pathRegistry = new Map();
    this._registryLoaded = true;
    try {
      if (fs.existsSync(PATHS_PATH)) fs.unlinkSync(PATHS_PATH);
    } catch { /* ignore */ }
  }
}

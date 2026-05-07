// بسم الله الرحمن الرحيم

/**
 * 🌉 ObsidianBridge — جسر Obsidian الطوبولوجي
 *
 * "وَعَلَّمَ آدَمَ الْأَسْمَاءَ كُلَّهَا" — البقرة: 31
 *
 * ══════════════════════════════════════════════════════════════
 * كل اكتشاف قرآني في IQRA يُكتب تلقائياً في Obsidian vault
 * مع links طوبولوجية بين الآيات والمفاهيم.
 *
 * الهيكل في Obsidian:
 *   IQRA/
 *   ├── discoveries/     ← اكتشافات IQRA
 *   ├── quran/           ← الآيات والسور
 *   ├── patterns/        ← الأنماط العددية
 *   └── topology/        ← الروابط الطوبولوجية
 *
 * يعمل عبر:
 *   1. Obsidian Local REST API (plugin مجاني)
 *   2. ملفات Markdown مباشرة (fallback)
 * ══════════════════════════════════════════════════════════════
 */

import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { IQRALogger } from '../logger.ts';
import { appendToTrustChain } from '../security.ts';

// ── Constants ─────────────────────────────────────────────────────────────────

const OBSIDIAN_BASE_URL = process.env.OBSIDIAN_BASE_URL ?? 'http://localhost:27123';
const OBSIDIAN_API_KEY  = process.env.OBSIDIAN_API_KEY ?? '';
const VAULT_PATH        = process.env.OBSIDIAN_VAULT_PATH ?? '';
const IQRA_VAULT_DIR    = 'IQRA';

// ── Types ─────────────────────────────────────────────────────────────────────

export interface DiscoveryNote {
  /** عنوان الاكتشاف */
  title: string;
  /** الآية المرجعية */
  verse_ref: string;
  /** النص العربي */
  arabic: string;
  /** مجال الاكتشاف */
  field: string;
  /** درجة الرنين */
  resonance: number;
  /** الروابط الطوبولوجية */
  links: string[];
  /** الدروس المستخلصة */
  insights: string[];
  /** معرّف المهمة */
  mission_id: string;
  /** وقت الاكتشاف */
  timestamp: number;
  /** هل تحتوي على بصمة قرآنية؟ */
  quran_signature?: boolean;
  /** إنتروبي Shannon */
  shannon_hel?: number;
}

export interface TopologyLink {
  from: string;  // verse_ref
  to: string;    // verse_ref أو مفهوم
  type: 'numerical' | 'semantic' | 'thematic' | 'resonance';
  strength: number; // 0.0 – 1.0
}

// ── ObsidianBridge ────────────────────────────────────────────────────────────

export class ObsidianBridge {
  private static _available: boolean | null = null;

  // ── Availability ──────────────────────────────────────────────────────────

  static async isAvailable(): Promise<boolean> {
    if (this._available !== null) return this._available;
    if (!process.env.IQRA_OBSIDIAN || process.env.IQRA_OBSIDIAN !== 'true') {
      this._available = false;
      return false;
    }

    try {
      const controller = new AbortController();
      setTimeout(() => controller.abort(), 2000);
      const res = await fetch(`${OBSIDIAN_BASE_URL}/`, {
        headers: { Authorization: `Bearer ${OBSIDIAN_API_KEY}` },
        signal: controller.signal,
      });
      this._available = res.ok;
    } catch {
      this._available = false;
    }

    IQRALogger.info(`🌉 [OBSIDIAN] Available: ${this._available}`);
    return this._available;
  }

  // ── Write Discovery ───────────────────────────────────────────────────────

  /**
   * يكتب اكتشافاً قرآنياً في Obsidian
   *
   * الصيغة:
   *   IQRA/discoveries/YYYY-MM-DD_verse_field.md
   *
   * يحتوي على:
   *   - frontmatter YAML (للبحث والفلترة)
   *   - نص الآية
   *   - الاكتشاف
   *   - [[links]] طوبولوجية
   */
  static async writeDiscovery(discovery: DiscoveryNote): Promise<string | null> {
    const content = this._buildNoteContent(discovery);
    const filename = this._buildFilename(discovery);
    const notePath = `${IQRA_VAULT_DIR}/discoveries/${filename}`;

    // محاولة Obsidian REST API أولاً
    if (await this.isAvailable()) {
      try {
        const res = await fetch(`${OBSIDIAN_BASE_URL}/vault/${notePath}`, {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${OBSIDIAN_API_KEY}`,
            'Content-Type': 'text/markdown',
          },
          body: content,
        });

        if (res.ok) {
          IQRALogger.info(`📝 [OBSIDIAN] Written: ${notePath}`);
          appendToTrustChain('OBSIDIAN:WRITE', discovery.verse_ref, notePath, discovery.resonance);
          return notePath;
        }
      } catch (e) {
        IQRALogger.warn(`⚠️ [OBSIDIAN] API failed, using file fallback: ${(e as Error).message}`);
      }
    }

    // Fallback: كتابة مباشرة في الملفات
    if (VAULT_PATH) {
      return this._writeToFile(notePath, content);
    }

    // Fallback أخير: كتابة في .iqra/obsidian/
    return this._writeToLocalCache(filename, content);
  }

  /**
   * يكتب رابطاً طوبولوجياً بين آيتين أو مفهومين
   */
  static async writeTopologyLink(link: TopologyLink): Promise<void> {
    const content = `---
type: topology_link
from: "[[${link.from}]]"
to: "[[${link.to}]]"
link_type: ${link.type}
strength: ${link.strength}
created: ${new Date().toISOString()}
---

# رابط طوبولوجي: ${link.from} ↔ ${link.to}

**النوع**: ${link.type}
**القوة**: ${(link.strength * 100).toFixed(0)}%

## الوصف
هذا الرابط يُمثّل علاقة ${link.type} بين [[${link.from}]] و [[${link.to}]].
`;

    const filename = `${link.from.replace(':', '_')}_${link.to.replace(':', '_')}_${link.type}.md`;
    const notePath = `${IQRA_VAULT_DIR}/topology/${filename}`;

    if (await this.isAvailable()) {
      try {
        await fetch(`${OBSIDIAN_BASE_URL}/vault/${notePath}`, {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${OBSIDIAN_API_KEY}`,
            'Content-Type': 'text/markdown',
          },
          body: content,
        });
      } catch { /* ignore */ }
    }

    this._writeToLocalCache(filename, content);
  }

  /**
   * يبحث في vault عن اكتشافات مشابهة
   */
  static async searchDiscoveries(query: string, limit: number = 7): Promise<string[]> {
    if (!await this.isAvailable()) {
      return this._searchLocalCache(query, limit);
    }

    try {
      const res = await fetch(
        `${OBSIDIAN_BASE_URL}/search/simple/?query=${encodeURIComponent(query)}&contextLength=100`,
        { headers: { Authorization: `Bearer ${OBSIDIAN_API_KEY}` } }
      );

      if (res.ok) {
        const data = await res.json() as any[];
        return data.slice(0, limit).map(r => r.filename ?? '');
      }
    } catch { /* fallback */ }

    return this._searchLocalCache(query, limit);
  }

  // ── Private: Content Builder ──────────────────────────────────────────────

  private static _buildNoteContent(d: DiscoveryNote): string {
    const date = new Date(d.timestamp).toISOString().split('T')[0];
    const linksStr = d.links.map(l => `[[${l}]]`).join(', ');

    return `---
title: "${d.title}"
verse: "${d.verse_ref}"
field: "${d.field}"
resonance: ${d.resonance.toFixed(3)}
mission_id: "${d.mission_id}"
date: ${date}
tags: [iqra, discovery, ${d.field.replace(/\s/g, '_')}]
quran_signature: ${d.quran_signature ?? false}
shannon_hel: ${d.shannon_hel?.toFixed(4) ?? 'null'}
---

# ${d.title}

> **الآية**: ${d.verse_ref}
> **الرنين**: ${(d.resonance * 100).toFixed(1)}%

## النص القرآني
${d.arabic}

## المجال
${d.field}

## الاكتشافات
${d.insights.map(i => `- ${i}`).join('\n')}

## الروابط الطوبولوجية
${linksStr || 'لا روابط بعد'}

## المصدر
- **المهمة**: ${d.mission_id}
- **التاريخ**: ${date}
- **IQRA SoulEngine v2**

---
*"سَنُرِيهِمْ آيَاتِنَا فِي الْآفَاقِ وَفِي أَنفُسِهِمْ" — فصلت: 53*
`;
  }

  private static _buildFilename(d: DiscoveryNote): string {
    const date = new Date(d.timestamp).toISOString().split('T')[0];
    const safe = d.verse_ref.replace(':', '_');
    const field = d.field.replace(/\s/g, '_').slice(0, 20);
    return `${date}_${safe}_${field}.md`;
  }

  // ── Private: File Fallbacks ───────────────────────────────────────────────

  private static _writeToFile(notePath: string, content: string): string | null {
    try {
      const fullPath = path.join(VAULT_PATH, notePath);
      const dir = path.dirname(fullPath);
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(fullPath, content, 'utf-8');
      IQRALogger.info(`📝 [OBSIDIAN] File written: ${fullPath}`);
      return notePath;
    } catch (e) {
      IQRALogger.error('❌ [OBSIDIAN] File write failed:', e);
      return null;
    }
  }

  private static _writeToLocalCache(filename: string, content: string): string | null {
    try {
      const cacheDir = path.join(process.cwd(), '.iqra', 'obsidian');
      if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir, { recursive: true });
      const fullPath = path.join(cacheDir, filename);
      fs.writeFileSync(fullPath, content, 'utf-8');
      IQRALogger.info(`📝 [OBSIDIAN] Cached: ${fullPath}`);
      return fullPath;
    } catch (e) {
      IQRALogger.error('❌ [OBSIDIAN] Cache write failed:', e);
      return null;
    }
  }

  private static _searchLocalCache(query: string, limit: number): string[] {
    try {
      const cacheDir = path.join(process.cwd(), '.iqra', 'obsidian');
      if (!fs.existsSync(cacheDir)) return [];

      const files = fs.readdirSync(cacheDir).filter(f => f.endsWith('.md'));
      const results: string[] = [];

      for (const file of files) {
        const content = fs.readFileSync(path.join(cacheDir, file), 'utf-8');
        if (content.toLowerCase().includes(query.toLowerCase())) {
          results.push(file);
          if (results.length >= limit) break;
        }
      }

      return results;
    } catch {
      return [];
    }
  }
}

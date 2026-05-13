// أعوذ بالله من الشيطان الرجيم
// بسم الله الرحمن الرحيم

import { QURAN_VERSES, QuranVerse } from './constants';
import { ArabicAnalyzer } from './analyzer';

export interface TopologyNode {
  id: string;
  data: QuranVerse;
  links: Map<string, number>; // targetId -> weight
}

export class SmartTopology {
  private nodes: Map<string, TopologyNode> = new Map();
  private analyzer: ArabicAnalyzer;

  constructor(analyzer: ArabicAnalyzer) {
    this.analyzer = analyzer;
    this.buildGraph();
  }

  private buildGraph() {
    // 1. إنشاء العقد
    for (const [vid, verse] of Object.entries(QURAN_VERSES)) {
      this.nodes.set(vid, {
        id: vid,
        data: verse,
        links: new Map()
      });
    }

    // 2. بناء الحواف بناءً على الجذور اللغوية المشتركة والثيمات
    const vids = Array.from(this.nodes.keys());
    for (let i = 0; i < vids.length; i++) {
      for (let j = i + 1; j < vids.length; j++) {
        const vid1 = vids[i];
        const vid2 = vids[j];
        const v1 = this.nodes.get(vid1)!.data;
        const v2 = this.nodes.get(vid2)!.data;

        // تحليل الجذور
        const roots1 = this.analyzer.extractRoots(v1.text);
        const roots2 = this.analyzer.extractRoots(v2.text);
        const commonRoots = roots1.filter(r => roots2.includes(r));

        // تحليل الثيمات
        const commonThemes = v1.themes.filter(t => v2.themes.includes(t));

        if (commonRoots.length > 0 || commonThemes.length > 0) {
          // وزن الحافة: الجذور لها ثقل أكبر (2x) من الثيمات
          const weight = (commonRoots.length * 2) + commonThemes.length;
          this.nodes.get(vid1)!.links.set(vid2, weight);
          this.nodes.get(vid2)!.links.set(vid1, weight);
        }
      }
    }
  }

  /**
   * تحليل المركزية (الدرجة)
   */
  public analyzeCentrality(topN: number = 5): { id: string; score: number }[] {
    const scores: { id: string; score: number }[] = [];

    for (const [id, node] of this.nodes) {
      scores.push({ id, score: node.links.size });
    }

    return scores.sort((a, b) => b.score - a.score).slice(0, topN);
  }

  /**
   * البحث عن أقصر مسار (BFS بوزن)
   */
  public findPath(startVid: string, endVid: string): string[] | null {
    if (!this.nodes.has(startVid) || !this.nodes.has(endVid)) return null;

    const queue: string[] = [startVid];
    const visited = new Set<string>([startVid]);
    const parent = new Map<string, string | null>();
    parent.set(startVid, null);

    while (queue.length > 0) {
      const current = queue.shift()!;
      if (current === endVid) {
        // بناء المسار
        const path: string[] = [];
        let curr: string | null = endVid;
        while (curr !== null) {
          path.unshift(curr);
          curr = parent.get(curr)!;
        }
        return path;
      }

      const node = this.nodes.get(current)!;
      for (const [neighbor, _] of node.links) {
        if (!visited.has(neighbor)) {
          visited.add(neighbor);
          parent.set(neighbor, current);
          queue.push(neighbor);
        }
      }
    }

    return null;
  }

  /**
   * حساب أرقام بيتي (Betti Numbers) للرسم البياني الحالي
   */
  public calculateBettiNumbers(): { b0: number; b1: number } {
    const v = this.nodes.size;
    let e = 0;
    const visited = new Set<string>();
    let components = 0;

    // حساب عدد الحواف (بدون تكرار)
    for (const [id, node] of this.nodes) {
      e += node.links.size;
    }
    e = e / 2;

    // حساب المكونات المتصلة (b0) باستخدام BFS
    const seen = new Set<string>();
    for (const id of this.nodes.keys()) {
      if (!seen.has(id)) {
        components++;
        const queue = [id];
        seen.add(id);
        while (queue.length > 0) {
          const curr = queue.shift()!;
          const node = this.nodes.get(curr)!;
          for (const neighbor of node.links.keys()) {
            if (!seen.has(neighbor)) {
              seen.add(neighbor);
              queue.push(neighbor);
            }
          }
        }
      }
    }

    // b1 = E - V + b0 (للرسم البياني)
    const b1 = e - v + components;

    return { b0: components, b1: Math.max(0, b1) };
  }

  /**
   * حساب أرقام بيتي اللغوية (Linguistic Betti)
   * يركز فقط على الروابط القوية (الجذور)
   */
  public calculateLinguisticBettiNumbers(): { lb0: number; lb1: number } {
    // تصفية للحواف التي وزنها > 1 (مما يعني وجود جذور مشتركة)
    const filtered = this.filterByWeight(2);
    const betti = filtered.calculateBettiNumbers();
    return { lb0: betti.b0, lb1: betti.b1 };
  }

  /**
   * تصفية الرسم البياني بناءً على عتبة التشابه (Filtration)
   */
  public filterByWeight(threshold: number): SmartTopology {
    const filtered = new SmartTopology(this.analyzer);
    filtered.nodes = new Map();

    // نسخ العقد
    for (const [id, node] of this.nodes) {
      filtered.nodes.set(id, {
        id,
        data: node.data,
        links: new Map()
      });
    }

    // تصفية الحواف
    for (const [id1, node] of this.nodes) {
      for (const [id2, weight] of node.links) {
        if (weight >= threshold) {
          filtered.nodes.get(id1)!.links.set(id2, weight);
        }
      }
    }

    return filtered;
  }
}

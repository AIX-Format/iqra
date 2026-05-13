// أعوذ بالله من الشيطان الرجيم
// بسم الله الرحمن الرحيم

import { ARABIC_ROOTS, ARABIC_PREFIXES, ARABIC_SUFFIXES, QURAN_VERSES } from './constants';

export class ArabicAnalyzer {
  private wordFreq: Map<string, number> = new Map();

  constructor() {
    this.initializeFrequencies();
  }

  private initializeFrequencies() {
    for (const verse of Object.values(QURAN_VERSES)) {
      const tokens = this.tokenize(verse.text);
      for (const token of tokens) {
        const root = this.getRoot(token) || token;
        this.wordFreq.set(root, (this.wordFreq.get(root) || 0) + 1);
      }
    }
  }

  /**
   * تنظيف النص من التشكيل
   */
  public removeDiacritics(text: string): string {
    const diacriticsRegex = /[\u064B-\u065F]/g;
    return text.replace(diacriticsRegex, "");
  }

  /**
   * تقسيم النص إلى كلمات
   */
  public tokenize(text: string): string[] {
    const clean = this.removeDiacritics(text);
    return clean.split(/\s+/).filter(w => w.length > 2);
  }

  /**
   * استخراج الجذور من النص (Extract all unique roots)
   */
  public extractRoots(text: string): string[] {
    const tokens = this.tokenize(text);
    const roots = new Set<string>();
    for (const token of tokens) {
      const root = this.getRoot(token);
      if (root) roots.add(root);
    }
    return Array.from(roots);
  }

  /**
   * استخراج الجذر (Logic to find the 3-letter semantic core)
   */
  public getRoot(word: string): string | null {
    const cleanWord = this.removeDiacritics(word);

    // 1. Direct dictionary check
    for (const [root, _] of Object.entries(ARABIC_ROOTS)) {
      if (cleanWord === root || cleanWord.includes(root)) return root;
    }

    // 2. Aggressive Stemming (removing prefixes/suffixes)
    let stem = cleanWord;

    // Remove prefixes iteratively
    let foundPrefix = true;
    while (foundPrefix && stem.length > 3) {
      foundPrefix = false;
      for (const pref of ARABIC_PREFIXES) {
        if (stem.startsWith(pref)) {
          stem = stem.substring(pref.length);
          foundPrefix = true;
          break;
        }
      }
    }

    // Remove suffixes iteratively
    let foundSuffix = true;
    while (foundSuffix && stem.length > 3) {
      foundSuffix = false;
      for (const suff of ARABIC_SUFFIXES) {
        if (stem.endsWith(suff)) {
          stem = stem.substring(0, stem.length - suff.length);
          foundSuffix = true;
          break;
        }
      }
    }

    // Return stem if it looks like a valid root (3 letters)
    return stem.length === 3 ? stem : null;
  }

  /**
   * حساب التماسك الدلالي (Jaccard Similarity)
   */
  public semanticCoherence(list1: string[], list2: string[]): number {
    const set1 = new Set(list1);
    const set2 = new Set(list2);
    const intersection = new Set([...set1].filter(x => set2.has(x)));
    const union = new Set([...set1, ...set2]);
    return union.size === 0 ? 0 : intersection.size / union.size;
  }

  /**
   * حساب PMI (Pointwise Mutual Information) لتمييز الترابط الحقيقي
   */
  public calculatePMI(word1: string, word2: string, cooc: number, total: number): number {
    const p1 = (this.wordFreq.get(word1) || 1) / total;
    const p2 = (this.wordFreq.get(word2) || 1) / total;
    const pCooc = cooc / total;
    return Math.log(pCooc / (p1 * p2));
  }

  /**
   * حساب TF-IDF تقريبي لوزن أهمية الكلمات في الآية
   */
  public calculateTFIDF(word: string, verseText: string, corpusSize: number = 6236): number {
    const tokens = this.tokenize(verseText);
    const tf = tokens.filter(t => t === word).length / tokens.length;
    const df = this.wordFreq.get(word) || 1;
    const idf = Math.log(corpusSize / df);
    return tf * idf;
  }

  /**
   * بناء شبكة الكلمات (Word Network) لآية معينة مع أوزان PMI
   */
  public buildWordNetwork(text: string): Map<string, Array<{ neighbor: string, weight: number }>> {
    const words = this.tokenize(text);
    const network = new Map<string, Array<{ neighbor: string, weight: number }>>();
    const totalWords = Array.from(this.wordFreq.values()).reduce((a, b) => a + b, 0);

    for (let i = 0; i < words.length; i++) {
      const w1 = this.getRoot(words[i]) || words[i];
      const neighbors = [];

      // Look ahead and behind for co-occurrence within a window of 2
      for (let j = Math.max(0, i - 2); j <= Math.min(words.length - 1, i + 2); j++) {
        if (i === j) continue;
        const w2 = this.getRoot(words[j]) || words[j];

        // Simple co-occurrence for now, but we can scale by PMI
        const pmi = this.calculatePMI(w1, w2, 1, totalWords); // cooc=1 in this local context
        neighbors.push({ neighbor: w2, weight: Math.max(0.1, pmi) });
      }
      network.set(w1, neighbors);
    }

    return network;
  }
}

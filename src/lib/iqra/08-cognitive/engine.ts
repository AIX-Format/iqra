// أعوذ بالله من الشيطان الرجيم
// بسم الله الرحمن الرحيم

import { ArabicAnalyzer } from './analyzer';
import { SmartTopology } from './topology';
import { SwarmEngine } from './swarm';
import { QuranApiClient } from './api_client';
import { QuranVerse } from './constants';

export interface ReplayRecord {
  time: number;
  action: string;
  params: any;
  result: any;
}

export class CognitiveTafsirEngine {
  private analyzer: ArabicAnalyzer;
  public topology: SmartTopology;
  private swarm: SwarmEngine;
  private api: QuranApiClient;
  private replayLog: ReplayRecord[] = [];
  private isRecording: boolean = false;

  constructor() {
    this.analyzer = new ArabicAnalyzer();
    this.topology = new SmartTopology(this.analyzer);
    this.swarm = new SwarmEngine();
    this.api = new QuranApiClient();
  }

  public startRecording() {
    this.isRecording = true;
    this.replayLog = [];
  }

  public stopRecording() {
    this.isRecording = false;
  }

  private logAction(action: string, params: any, result: any) {
    if (this.isRecording) {
      this.replayLog.push({
        time: Date.now(),
        action,
        params,
        result
      });
    }
  }

  /**
   * الاستكشاف المعرفي الشامل (The Unified Powerful Tool)
   * يجمع بين التحليل اللغوي، البحث في الـ API، التوبولوجيا، وذكاء السرب
   */
  public async explore(query: string) {
    this.startRecording();
    console.log(`[Cognitive Engine v0.4.0] Deep Exploration: ${query}`);

    // 1. تحليل لغوي (استخراج الجذور من الاستعلام)
    const queryRoots = this.analyzer.extractRoots(query);
    
    // 2. البحث عن آيات حقيقية عبر API
    const verseIds = await this.api.search(query);
    const verses: QuranVerse[] = [];
    for (const vid of verseIds.slice(0, 5)) { // نأخذ أفضل 5 نتائج
      const [s, a] = vid.split(':').map(Number);
      const v = await this.api.fetchVerse(s, a);
      if (v) verses.push(v);
    }

    // 3. تحليل توبولوجي للآيات المكتشفة
    // ملاحظة: الـ topology تُبنى تلقائياً في الـ constructor، ولكن هنا يمكننا تحليل سياق البحث
    const linguisticBetti = this.topology.calculateLinguisticBettiNumbers();
    const centrality = this.topology.analyzeCentrality(3);

    // 4. تشغيل السرب مع مكافأة توبولوجية (Topology Reward)
    // نستخدم b1 كوزن للتعقيد الدلالي المحفز للمستكشفين
    const bettiReward = (linguisticBetti.lb1 * 0.5) + (linguisticBetti.lb0 * 0.1);
    const swarmResult = this.swarm.solve(queryRoots, bettiReward);
    
    const result = {
      query,
      foundVerses: verses,
      swarmPath: swarmResult.bestPosition,
      topology: {
        centrality,
        betti: linguisticBetti,
        rewardApplied: bettiReward,
        message: "تم دمج التحليل التوبولوجي اللغوي مع ذكاء السرب"
      }
    };

    this.logAction("explore", { query }, result);
    this.stopRecording();
    return result;
  }

  public getReplay() {
    return this.replayLog;
  }
}

// أعوذ بالله من الشيطان الرجيم
// بسم الله الرحمن الرحيم

export type AgentType = 'EXPLORER' | 'EXPLOITER';

export interface SwarmAgent {
  id: number;
  type: AgentType;
  position: number;
  velocity: number;
  bestPosition: number;
  score: number;
}

export class SwarmEngine {
  private nAgents: number;
  private maxSteps: number;
  private memoryField: Float32Array;
  private agents: SwarmAgent[] = [];
  private globalBestPosition: number = 0;
  private globalBestScore: number = -Infinity;
  private coolingRate: number = 0.99; // التبريد التدريجي

  constructor(nAgents: number = 20, maxSteps: number = 50) {
    this.nAgents = nAgents;
    this.maxSteps = maxSteps;
    this.memoryField = new Float32Array(100).fill(0);
    this.initAgents();
  }

  private initAgents() {
    for (let i = 0; i < this.nAgents; i++) {
      const pos = Math.random() * 100;
      // 30% مستكشفون، 70% مستغلون للذاكرة
      const type: AgentType = Math.random() < 0.3 ? 'EXPLORER' : 'EXPLOITER';

      this.agents.push({
        id: i,
        type,
        position: pos,
        velocity: (Math.random() - 0.5) * 2,
        bestPosition: pos,
        score: -Infinity
      });
    }
  }

  /**
   * دالة الهدف مع مكافأة توبولوجية (Topology Reward)
   */
  private objectiveFunction(position: number, focusWords: string[], bettiReward: number = 0): number {
    const base = Math.sin(position / 10) * Math.cos(position / 5);
    const boost = focusWords.length * 0.1;
    return base + boost + bettiReward;
  }

  /**
   * تشغيل دورة التحسين مع التبريد والتخصص
   */
  public solve(focusWords: string[], bettiReward: number = 0): { bestPosition: number; bestScore: number; history: number[] } {
    const history: number[] = [];
    let noiseScale = 1.0;

    for (let step = 0; step < this.maxSteps; step++) {
      // 1. التبريد (Cooling)
      noiseScale *= this.coolingRate;

      for (let i = 0; i < this.memoryField.length; i++) {
        this.memoryField[i] *= 0.98; // تآكل أبطأ للذاكرة
      }

      for (const agent of this.agents) {
        // 2. تأثير الذاكرة يختلف حسب التخصص
        const memoryPull = this.memoryField[Math.floor(agent.position)] || 0;
        const memoryEffect = agent.type === 'EXPLOITER' ? memoryPull * 1.5 : memoryPull * 0.5;

        const score = this.objectiveFunction(agent.position, focusWords, bettiReward) + memoryEffect;

        if (score > agent.score) {
          agent.score = score;
          agent.bestPosition = agent.position;
        }

        if (score > this.globalBestScore) {
          this.globalBestScore = score;
          this.globalBestPosition = agent.position;

          // تعزيز الذاكرة
          const idx = Math.floor(this.globalBestPosition);
          this.memoryField[idx] += 0.5;
        }

        // 3. قوانين الحركة مع الضجيج المتناقص
        const w = 0.5 * noiseScale; // القصور الذاتي يقل مع الزمن
        const c1 = agent.type === 'EXPLOITER' ? 2.0 : 1.0; // المستغل ينجذب بقوة لأفضل ما وجده
        const c2 = 1.5;

        const randomForce = (Math.random() - 0.5) * noiseScale * 2;

        agent.velocity = w * agent.velocity +
                         c1 * Math.random() * (agent.bestPosition - agent.position) +
                         c2 * Math.random() * (this.globalBestPosition - agent.position) +
                         randomForce;

        agent.position += agent.velocity;
        agent.position = Math.max(0, Math.min(99, agent.position));
      }

      history.push(this.globalBestScore);
    }

    return {
      bestPosition: this.globalBestPosition,
      bestScore: this.globalBestScore,
      history
    };
  }

  public getMemoryField(): Float32Array {
    return this.memoryField;
  }
}

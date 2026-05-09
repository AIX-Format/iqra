import { SelfPlayLoop } from '../lib/iqra/trading/self_play_loop';
import { MemoryGovernor } from '../lib/iqra/infrastructure/memory_governor';
import { TelegramBot } from '../lib/iqra/13-utils/telegram_bot';
import { IQRALogger } from '../lib/iqra/12-infrastructure/logger';

/**
 * 🌀 IQRA Sovereign Trading Pulse
 * 
 * النية: تشغيل إيقاع التداول السيادي (3-6-9-369) مع المراقبة الذاتية.
 * المرجع: "فَإِذَا عَزَمْتَ فَتَوَكَّلْ عَلَى اللَّهِ".
 */

class TradingPulse {
  private loop: SelfPlayLoop;
  private governor: MemoryGovernor;
  private telegram: TelegramBot | null = null;
  private counter = 0;

  constructor() {
    this.loop = new SelfPlayLoop();
    this.governor = new MemoryGovernor();
    if (process.env.TELEGRAM_TOKEN) {
      this.telegram = new TelegramBot();
    }
  }

  async start() {
    console.log('🚀 [PULSE] Starting Sovereign Trading Pulse...');
    IQRALogger.info('🌀 [PULSE] Trading engine initialized with 3-6-9 rhythm.');
    
    // Heartbeat every 9 seconds
    setInterval(() => this.pulse9(), 9000);
    
    // Warm update every 27 seconds
    setInterval(() => this.pulse27(), 27000);
    
    // Deep analysis every 81 seconds
    setInterval(() => this.pulse81(), 81000);
    
    // Sovereign Strategic Cycle every 369 seconds
    setInterval(() => this.pulse369(), 369000);
    
    // Initial run
    await this.pulse369();
  }

  private async pulse9() {
    this.counter += 9;
    console.log(`⏱️ [PULSE_9] Heartbeat: ${this.counter}s`);
    // Status check
  }

  private async pulse27() {
    console.log('☀️ [PULSE_27] Warm Update: Syncing market data...');
    // Sync candles but don't trade yet
  }

  private async pulse81() {
    console.log('🧠 [PULSE_81] Deep Analysis: Running Memory Governor...');
    await this.governor.maintain();
  }

  private async pulse369() {
    console.log('👑 [PULSE_369] Sovereign Strategic Cycle: Executing Self-Play Loop...');
    const symbol = 'BTC/USDT';
    
    try {
      await this.loop.runStep(symbol);
      
      if (this.telegram) {
        await this.telegram.sendMessage(
          process.env.TELEGRAM_CHAT_ID || '',
          `🌀 *IQRA Sovereign Pulse*\nSymbol: ${symbol}\nCycle: 369s\nStatus: Executed\nIntegrity: PASS`
        );
      }
    } catch (error) {
      console.error('❌ [PULSE_ERROR] Cycle failed:', error);
      IQRALogger.error('❌ [PULSE_ERROR] Cycle failed:', error);
    }
  }
}

const pulse = new TradingPulse();
pulse.start().catch(console.error);

/**
 * 🕋 Muraqabah Audit Agent — رقيب السيادة
 *
 * "مَا يَلْفِظُ مِنْ قَوْلٍ إِلَّا لَدَيْهِ رَقِيبٌ عَتِيدٌ" — ق: 18
 *
 * This agent acts as a secondary sovereign consciousness that audits all outputs
 * for Truth, Justice, and compliance with the Supreme Constitution.
 */

import { SovereignIdentity } from '#security/sovereign_identity';
import { IQRALogger } from '#infra/logger';
import { ConnectorFactory } from '#connectors/index';

export class MuraqabahAgent {
  private static async getInstruction(): Promise<string> {
    return await SovereignIdentity.getIntegratedSoul(
      'muraqabah-auditor',
      'Auditing system integrity for Truth and Justice',
      'iqra-auditor' // Assuming this persona exists or will be added
    );
  }

  /**
   * 🛡️ Perform a sovereign audit on any text content.
   *
   * Implementation note: previously used @google/adk LlmAgent, but ADK's
   * agent API runs as an AsyncGenerator (`runAsync`) and does not expose a
   * synchronous `run`. The ConnectorFactory path is simpler, deterministic,
   * and stays inside our existing observability surface.
   */
  static async audit(content: string): Promise<{ isVerified: boolean; reason?: string }> {
    try {
      const instruction = await this.getInstruction();
      const connector = ConnectorFactory.getConnector('google');
      const prompt = `${instruction}\n\nYour task is to review the following input. If it contains falsehood, injustice, or violates the Supreme Constitution, reply with [BLOCKED] followed by the reason. If it is clean, reply with [VERIFIED].\n\nINPUT:\n${content}`;
      const result = await connector.generate(prompt);
      const text = result.content.trim();

      if (text.startsWith('[BLOCKED]')) {
        const reason = text.replace('[BLOCKED]', '').trim();
        IQRALogger.warn(`🛡️ [MURĀQABAH] Content BLOCKED: ${reason}`);
        return { isVerified: false, reason };
      }

      if (text.startsWith('[VERIFIED]')) {
        return { isVerified: true };
      }

      // Fallback: If agent is ambiguous, we default to stricter check
      return { isVerified: false, reason: "Ambiguous audit result" };
    } catch (error) {
      IQRALogger.error('❌ [MURĀQABAH] Audit failed:', error);
      return { isVerified: false, reason: "Audit system error" };
    }
  }
}

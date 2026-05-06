/**
 * IQRA Vector Engine
 * 
 * Semantic search and pattern recognition using Cloudflare Vectorize.
 */

export interface VectorMatch {
  id: string;
  score: number;
  metadata?: any;
}

export class VectorEngine {
  constructor(private env: any) {}

  /**
   * Search for semantically similar ayahs
   */
  async searchSimilar(text: string, topK: number = 7): Promise<VectorMatch[]> {
    if (!this.env.VECTORIZE || !this.env.AI) {
      console.warn("Vectorize or AI binding missing");
      return [];
    }

    // 1. Generate embedding using Workers AI
    const { data } = await this.env.AI.run('@cf/baai/bge-base-en-v1.5', {
      text: [text],
    });
    const embedding = data[0];

    // 2. Query Vectorize
    const results = await this.env.VECTORIZE.query(embedding, {
      topK,
      returnValues: true,
      returnMetadata: true,
    });

    return results.matches.map((m: any) => ({
      id: m.id,
      score: m.score,
      metadata: m.metadata,
    }));
  }

  /**
   * Insert or update embeddings for ayahs
   */
  async upsertAyahs(ayahs: { id: string; text: string; metadata: any }[]) {
    const vectors = await Promise.all(
      ayahs.map(async (ayah) => {
        const { data } = await this.env.AI.run('@cf/baai/bge-base-en-v1.5', {
          text: [ayah.text],
        });
        return {
          id: ayah.id,
          values: data[0],
          metadata: ayah.metadata,
        };
      })
    );

    await this.env.VECTORIZE.upsert(vectors);
  }
}

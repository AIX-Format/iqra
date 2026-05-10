/**
 * 🧠 Advanced Embeddings — تضمينات متقدمة لمطابقة الأنماط
 * 
 * WHY: Creates advanced embeddings for Quranic pattern matching using
 * multi-dimensional representations, semantic analysis, and topological
 * features. Essential for intelligent pattern recognition and similarity.
 */

export interface PatternEmbedding {
  id: string;
  vector: number[];
  dimension: number;
  metadata: {
    patternType: string;
    quranicContext?: string;
    topologicalFeatures?: number[];
    numericalSignature?: number[];
    semanticTags?: string[];
    timestamp: number;
  };
  similarity: {
    cosine: number;
    euclidean: number;
    manhattan: number;
    topological: number;
    numerical?: number;
    semantic?: number;
    structural?: number;
  };
}

export interface EmbeddingConfig {
  dimensions: number;
  includeTopological: boolean;
  includeNumerical: boolean;
  includeSemantic: boolean;
  weightDistribution: {
    topological: number;
    numerical: number;
    semantic: number;
    structural: number;
  };
}

export interface SimilarityResult {
  patternId: string;
  similarity: number;
  confidence: number;
  matchType: 'exact' | 'partial' | 'semantic' | 'topological' | 'numerical';
  details: {
    topologicalSimilarity: number;
    numericalSimilarity: number;
    semanticSimilarity: number;
    structuralSimilarity: number;
  };
}

export class AdvancedEmbeddings {
  private readonly defaultConfig: EmbeddingConfig = {
    dimensions: 256,
    includeTopological: true,
    includeNumerical: true,
    includeSemantic: true,
    weightDistribution: {
      topological: 0.3,
      numerical: 0.3,
      semantic: 0.2,
      structural: 0.2
    }
  };

  private embeddingCache: Map<string, PatternEmbedding> = new Map();
  private semanticVocabulary: Map<string, number[]> = new Map();

  constructor(private config: Partial<EmbeddingConfig> = {}) {
    this.config = { ...this.defaultConfig, ...config };
    this.initializeSemanticVocabulary();
  }

  /**
   * Create embedding for a Quranic pattern
   */
  createEmbedding(
    patternId: string,
    data: {
      points?: number[][];
      numericalData?: number[];
      text?: string;
      topologicalFeatures?: number[];
      metadata?: Record<string, any>;
    }
  ): PatternEmbedding {
    const vector = this.generateEmbeddingVector(data);
    const metadata = this.generateMetadata(patternId, data);
    const similarity = this.calculateSelfSimilarity(vector);

    const embedding: PatternEmbedding = {
      id: patternId,
      vector,
      dimension: vector.length,
      metadata,
      similarity
    };

    // Cache the embedding
    this.embeddingCache.set(patternId, embedding);
    
    return embedding;
  }

  /**
   * Generate multi-dimensional embedding vector
   */
  private generateEmbeddingVector(data: any): number[] {
    const vector: number[] = [];
    const config = this.config as EmbeddingConfig;
    
    // Topological features
    if (config.includeTopological && data.points) {
      const topoFeatures = this.extractTopologicalFeatures(data.points);
      vector.push(...this.normalizeVector(topoFeatures, 64));
    }
    
    // Numerical features
    if (config.includeNumerical && data.numericalData) {
      const numFeatures = this.extractNumericalFeatures(data.numericalData);
      vector.push(...this.normalizeVector(numFeatures, 64));
    }
    
    // Semantic features
    if (config.includeSemantic && data.text) {
      const semFeatures = this.extractSemanticFeatures(data.text);
      vector.push(...this.normalizeVector(semFeatures, 64));
    }
    
    // Structural features
    const structFeatures = this.extractStructuralFeatures(data);
    vector.push(...this.normalizeVector(structFeatures, 64));
    
    // Pad or truncate to target dimension
    return this.adjustVectorDimension(vector, config.dimensions);
  }

  /**
   * Extract topological features from point cloud
   */
  private extractTopologicalFeatures(points: number[][]): number[] {
    const features: number[] = [];
    
    // Basic geometric features
    const centroid = this.calculateCentroid(points);
    features.push(...centroid);
    
    // Distance statistics
    const distances = this.calculatePairwiseDistances(points);
    features.push(
      Math.min(...distances),
      Math.max(...distances),
      this.mean(distances),
      this.standardDeviation(distances)
    );
    
    // Angular features
    const angles = this.calculateAngles(points);
    features.push(
      this.mean(angles),
      this.standardDeviation(angles)
    );
    
    // Convex hull features
    const hullArea = this.calculateConvexHullArea(points);
    const hullPerimeter = this.calculateConvexHullPerimeter(points);
    features.push(hullArea, hullPerimeter, hullArea / (hullPerimeter || 1));
    
    // Persistence-based features (simplified)
    const persistenceFeatures = this.calculatePersistenceFeatures(points);
    features.push(...persistenceFeatures);
    
    return features;
  }

  /**
   * Extract numerical features
   */
  private extractNumericalFeatures(data: number[]): number[] {
    const features: number[] = [];
    
    // Basic statistics
    features.push(
      Math.min(...data),
      Math.max(...data),
      this.mean(data),
      this.median(data),
      this.standardDeviation(data),
      this.skewness(data),
      this.kurtosis(data)
    );
    
    // Digital root analysis
    const digitalRoots = data.map(n => this.calculateDigitalRoot(Math.abs(n)));
    const drHistogram = this.histogram(digitalRoots, 9);
    features.push(...drHistogram);
    
    // Prime number analysis
    const primeCount = data.filter(n => this.isPrime(Math.abs(n))).length;
    features.push(primeCount / data.length);
    
    // Fibonacci analysis
    const fibCount = data.filter(n => this.isFibonacci(Math.abs(n))).length;
    features.push(fibCount / data.length);
    
    // Sacred number analysis (7, 19, 3, 6, 9)
    const sacredNumbers = [7, 19, 3, 6, 9];
    sacredNumbers.forEach(num => {
      const count = data.filter(n => this.isRelatedToSacredNumber(Math.abs(n), num)).length;
      features.push(count / data.length);
    });
    
    return features;
  }

  /**
   * Extract semantic features from text
   */
  private extractSemanticFeatures(text: string): number[] {
    const features: number[] = [];
    
    // Tokenize and clean
    const tokens = this.tokenize(text.toLowerCase());
    
    // TF-IDF like features (simplified)
    const tfidf = this.calculateTFIDF(tokens);
    features.push(...tfidf);
    
    // Quranic-specific features
    const quranicFeatures = this.extractQuranicFeatures(tokens);
    features.push(...quranicFeatures);
    
    // Semantic embeddings (simplified word2vec-like)
    const semanticVector = this.calculateSemanticVector(tokens);
    features.push(...semanticVector);
    
    return features;
  }

  /**
   * Extract structural features
   */
  private extractStructuralFeatures(data: any): number[] {
    const features: number[] = [];
    
    // Data structure properties
    if (data.points) {
      features.push(data.points.length);
      features.push(data.points[0]?.length || 0); // Dimension
    }
    
    if (data.numericalData) {
      features.push(data.numericalData.length);
    }
    
    if (data.text) {
      features.push(data.text.length);
      features.push(data.text.split(/\s+/).length); // Word count
    }
    
    // Metadata features
    if (data.metadata) {
      features.push(Object.keys(data.metadata).length);
    }
    
    return features;
  }

  /**
   * Find similar patterns
   */
  findSimilarPatterns(
    queryEmbedding: PatternEmbedding,
    threshold: number = 0.7,
    maxResults: number = 10
  ): SimilarityResult[] {
    const results: SimilarityResult[] = [];
    
    for (const [id, embedding] of this.embeddingCache.entries()) {
      if (id === queryEmbedding.id) continue;
      
      const similarity = this.calculateSimilarity(queryEmbedding, embedding);
      
      if (similarity.cosine >= threshold) {
        results.push({
          patternId: id,
          similarity: similarity.cosine,
          confidence: this.calculateConfidence(similarity),
          matchType: this.determineMatchType(similarity),
          details: {
            topologicalSimilarity: similarity.topological,
            numericalSimilarity: similarity.numerical || 0,
            semanticSimilarity: similarity.semantic || 0,
            structuralSimilarity: similarity.structural || 0
          }
        });
      }
    }
    
    return results
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, maxResults);
  }

  /**
   * Calculate similarity between two embeddings
   */
  private calculateSimilarity(
    emb1: PatternEmbedding,
    emb2: PatternEmbedding
  ): PatternEmbedding['similarity'] {
    const cosine = this.cosineSimilarity(emb1.vector, emb2.vector);
    const euclidean = this.euclideanDistance(emb1.vector, emb2.vector);
    const manhattan = this.manhattanDistance(emb1.vector, emb2.vector);
    
    // Component-wise similarities
    const topological = this.calculateComponentSimilarity(
      emb1.metadata.topologicalFeatures || [],
      emb2.metadata.topologicalFeatures || []
    );
    
    const numerical = this.calculateComponentSimilarity(
      emb1.metadata.numericalSignature || [],
      emb2.metadata.numericalSignature || []
    );
    
    const semantic = this.calculateSemanticSimilarity(
      emb1.metadata.semanticTags || [],
      emb2.metadata.semanticTags || []
    );
    
    const structural = this.calculateStructuralSimilarity(emb1, emb2);
    
    return {
      cosine,
      euclidean,
      manhattan,
      topological,
      numerical,
      semantic,
      structural
    };
  }

  /**
   * Helper methods
   */
  private calculateCentroid(points: number[][]): number[] {
    const dim = points[0]?.length || 2;
    const centroid = new Array(dim).fill(0);
    
    points.forEach(point => {
      point.forEach((coord, i) => {
        centroid[i] += coord;
      });
    });
    
    return centroid.map(coord => coord / points.length);
  }

  private calculatePairwiseDistances(points: number[][]): number[] {
    const distances: number[] = [];
    
    for (let i = 0; i < points.length; i++) {
      for (let j = i + 1; j < points.length; j++) {
        distances.push(this.euclideanDistance(points[i], points[j]));
      }
    }
    
    return distances;
  }

  private calculateAngles(points: number[][]): number[] {
    const angles: number[] = [];
    
    for (let i = 1; i < points.length - 1; i++) {
      const v1 = this.subtract(points[i - 1], points[i]);
      const v2 = this.subtract(points[i + 1], points[i]);
      const angle = this.angleBetween(v1, v2);
      angles.push(angle);
    }
    
    return angles;
  }

  private calculateConvexHullArea(points: number[][]): number {
    // Simplified convex hull area calculation
    // In practice, would use Graham scan or similar algorithm
    return this.polygonArea(points);
  }

  private calculateConvexHullPerimeter(points: number[][]): number {
    // Simplified perimeter calculation
    let perimeter = 0;
    for (let i = 0; i < points.length; i++) {
      const next = (i + 1) % points.length;
      perimeter += this.euclideanDistance(points[i], points[next]);
    }
    return perimeter;
  }

  private calculatePersistenceFeatures(points: number[][]): number[] {
    // Simplified persistence features
    // In practice, would compute actual persistent homology
    return [
      points.length / 100, // Normalized point count
      this.calculatePairwiseDistances(points).length / 1000, // Normalized edge count
      0.5, // Placeholder for H0 features
      0.3, // Placeholder for H1 features
      0.1  // Placeholder for H2 features
    ];
  }

  private mean(arr: number[]): number {
    return arr.reduce((sum, val) => sum + val, 0) / arr.length;
  }

  private median(arr: number[]): number {
    const sorted = [...arr].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    return sorted.length % 2 === 0 
      ? (sorted[mid - 1] + sorted[mid]) / 2 
      : sorted[mid];
  }

  private standardDeviation(arr: number[]): number {
    const mean = this.mean(arr);
    const variance = arr.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / arr.length;
    return Math.sqrt(variance);
  }

  private skewness(arr: number[]): number {
    const mean = this.mean(arr);
    const std = this.standardDeviation(arr);
    const n = arr.length;
    const sum = arr.reduce((acc, val) => acc + Math.pow((val - mean) / std, 3), 0);
    return (n / ((n - 1) * (n - 2))) * sum;
  }

  private kurtosis(arr: number[]): number {
    const mean = this.mean(arr);
    const std = this.standardDeviation(arr);
    const n = arr.length;
    const sum = arr.reduce((acc, val) => acc + Math.pow((val - mean) / std, 4), 0);
    return ((n * (n + 1)) / ((n - 1) * (n - 2) * (n - 3))) * sum - (3 * (n - 1) * (n - 1)) / ((n - 2) * (n - 3));
  }

  private histogram(arr: number[], bins: number): number[] {
    const hist = new Array(bins).fill(0);
    const min = Math.min(...arr);
    const max = Math.max(...arr);
    const range = max - min || 1;
    
    arr.forEach(val => {
      const bin = Math.min(Math.floor(((val - min) / range) * bins), bins - 1);
      hist[bin]++;
    });
    
    return hist.map(count => count / arr.length);
  }

  private calculateDigitalRoot(num: number): number {
    if (num === 0) return 0;
    let n = num;
    while (n >= 10) {
      n = Math.floor(n / 10) + (n % 10);
    }
    return n;
  }

  private isPrime(num: number): boolean {
    if (num <= 1) return false;
    if (num <= 3) return true;
    if (num % 2 === 0 || num % 3 === 0) return false;
    
    for (let i = 5; i * i <= num; i += 6) {
      if (num % i === 0 || num % (i + 2) === 0) return false;
    }
    return true;
  }

  private isFibonacci(num: number): boolean {
    if (num < 0) return false;
    const test1 = 5 * num * num + 4;
    const test2 = 5 * num * num - 4;
    return this.isPerfectSquare(test1) || this.isPerfectSquare(test2);
  }

  private isPerfectSquare(num: number): boolean {
    const sqrt = Math.sqrt(num);
    return sqrt === Math.floor(sqrt);
  }

  private isRelatedToSacredNumber(num: number, sacred: number): boolean {
    return num === sacred || 
           num % sacred === 0 || 
           this.calculateDigitalRoot(num) === this.calculateDigitalRoot(sacred);
  }

  private tokenize(text: string): string[] {
    return text.split(/\s+/).filter(token => token.length > 0);
  }

  private calculateTFIDF(tokens: string[]): number[] {
    // Simplified TF-IDF calculation
    const tfidf: number[] = [];
    const vocabSize = 100; // Simplified vocabulary size
    
    for (let i = 0; i < vocabSize; i++) {
      tfidf.push(Math.random()); // Placeholder
    }
    
    return tfidf;
  }

  private extractQuranicFeatures(tokens: string[]): number[] {
    const quranicTerms = ['allah', 'rahman', 'rahim', 'bismillah', 'alhamdulillah', 'subhanallah'];
    return quranicTerms.map(term => tokens.includes(term) ? 1 : 0);
  }

  private calculateSemanticVector(tokens: string[]): number[] {
    // Simplified semantic vector calculation
    const vectorSize = 50;
    const vector = new Array(vectorSize).fill(0);
    
    tokens.forEach(token => {
      const tokenVector = this.semanticVocabulary.get(token);
      if (tokenVector) {
        tokenVector.forEach((val, i) => {
          vector[i] += val;
        });
      }
    });
    
    return this.normalizeVector(vector, vectorSize);
  }

  private initializeSemanticVocabulary(): void {
    // Initialize with some basic semantic vectors
    const basicTerms = ['allah', 'quran', 'verse', 'prayer', 'faith'];
    basicTerms.forEach(term => {
      const vector = new Array(50).fill(0).map(() => Math.random() - 0.5);
      this.semanticVocabulary.set(term, vector);
    });
  }

  private normalizeVector(vector: number[], targetSize: number): number[] {
    // Normalize and resize vector
    const normalized = vector.map(val => val / (Math.max(...vector.map(Math.abs)) || 1));
    
    if (normalized.length > targetSize) {
      return normalized.slice(0, targetSize);
    } else if (normalized.length < targetSize) {
      return [...normalized, ...new Array(targetSize - normalized.length).fill(0)];
    }
    
    return normalized;
  }

  private adjustVectorDimension(vector: number[], targetDim: number): number[] {
    if (vector.length === targetDim) return vector;
    if (vector.length > targetDim) return vector.slice(0, targetDim);
    
    return [...vector, ...new Array(targetDim - vector.length).fill(0)];
  }

  private generateMetadata(patternId: string, data: any): PatternEmbedding['metadata'] {
    return {
      patternType: data.metadata?.patternType || 'unknown',
      quranicContext: data.metadata?.quranicContext,
      topologicalFeatures: data.points ? this.extractTopologicalFeatures(data.points) : undefined,
      numericalSignature: data.numericalData ? this.extractNumericalFeatures(data.numericalData) : undefined,
      semanticTags: data.text ? this.tokenize(data.text.toLowerCase()) : undefined,
      timestamp: Date.now()
    };
  }

  private calculateSelfSimilarity(vector: number[]): PatternEmbedding['similarity'] {
    return {
      cosine: 1.0,
      euclidean: 0.0,
      manhattan: 0.0,
      topological: 1.0
    };
  }

  private cosineSimilarity(vec1: number[], vec2: number[]): number {
    const dotProduct = vec1.reduce((sum, val, i) => sum + val * vec2[i], 0);
    const norm1 = Math.sqrt(vec1.reduce((sum, val) => sum + val * val, 0));
    const norm2 = Math.sqrt(vec2.reduce((sum, val) => sum + val * val, 0));
    return norm1 && norm2 ? dotProduct / (norm1 * norm2) : 0;
  }

  private euclideanDistance(vec1: number[], vec2: number[]): number {
    return Math.sqrt(vec1.reduce((sum, val, i) => sum + Math.pow(val - vec2[i], 2), 0));
  }

  private manhattanDistance(vec1: number[], vec2: number[]): number {
    return vec1.reduce((sum, val, i) => sum + Math.abs(val - vec2[i]), 0);
  }

  private calculateComponentSimilarity(comp1: number[], comp2: number[]): number {
    if (comp1.length === 0 || comp2.length === 0) return 0;
    const minLength = Math.min(comp1.length, comp2.length);
    const sliced1 = comp1.slice(0, minLength);
    const sliced2 = comp2.slice(0, minLength);
    return this.cosineSimilarity(sliced1, sliced2);
  }

  private calculateSemanticSimilarity(tags1: string[], tags2: string[]): number {
    if (tags1.length === 0 || tags2.length === 0) return 0;
    const set1 = new Set(tags1);
    const set2 = new Set(tags2);
    const intersection = new Set([...set1].filter(tag => set2.has(tag)));
    const union = new Set([...set1, ...set2]);
    return intersection.size / union.size;
  }

  private calculateStructuralSimilarity(emb1: PatternEmbedding, emb2: PatternEmbedding): number {
    const similarity = this.calculateSimilarity(emb1, emb2);
    return (similarity.cosine + similarity.euclidean + similarity.manhattan) / 3;
  }

  private calculateConfidence(similarity: PatternEmbedding['similarity']): number {
    const weights = { topological: 0.4, numerical: 0.3, semantic: 0.2, structural: 0.1 };
    return (
      similarity.topological * weights.topological +
      (similarity.numerical || 0) * weights.numerical +
      (similarity.semantic || 0) * weights.semantic +
      (similarity.structural || 0) * weights.structural
    );
  }

  private determineMatchType(similarity: PatternEmbedding['similarity']): SimilarityResult['matchType'] {
    if (similarity.cosine > 0.9) return 'exact';
    if (similarity.topological > 0.8) return 'topological';
    if (similarity.numerical && similarity.numerical > 0.8) return 'numerical';
    if (similarity.semantic && similarity.semantic > 0.8) return 'semantic';
    return 'partial';
  }

  private subtract(v1: number[], v2: number[]): number[] {
    return v1.map((val, i) => val - v2[i]);
  }

  private angleBetween(v1: number[], v2: number[]): number {
    const dot = v1.reduce((sum, val, i) => sum + val * v2[i], 0);
    const norm1 = Math.sqrt(v1.reduce((sum, val) => sum + val * val, 0));
    const norm2 = Math.sqrt(v2.reduce((sum, val) => sum + val * val, 0));
    return Math.acos(dot / (norm1 * norm2));
  }

  private polygonArea(points: number[][]): number {
    let area = 0;
    for (let i = 0; i < points.length; i++) {
      const j = (i + 1) % points.length;
      area += points[i][0] * points[j][1];
      area -= points[j][0] * points[i][1];
    }
    return Math.abs(area / 2);
  }
}